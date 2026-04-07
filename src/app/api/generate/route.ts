import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleAuth } from 'google-auth-library';
import { buildEnglishPrompt } from '@/lib/prompt-builder';
import { sendCreditsExhaustedEmail } from '@/lib/resend';
import sharp from 'sharp';

export const maxDuration = 120; // 2 min máx — com imagens otimizadas, IA responde em <60s
export const dynamic = 'force-dynamic';

// ── Rate Limiter (in-memory, per-user) ──
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 10; // max 10 gerações por minuto

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Limpa entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60_000);

// ── Helpers ──
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function isRetryableError(msg: string): boolean {
  // Non-retryable: bad request, auth, permission, not found, safety
  if (/\[VertexAI (400|401|403|404|422)\]/.test(msg)) return false;
  if (msg.includes('SAFETY')) return false;
  // Retryable: rate limit, server errors, timeout, network
  if (/\[VertexAI (429|500|502|503)\]/.test(msg)) return true;
  if (msg.includes('Timeout') || msg.includes('Erro de rede')) return true;
  return true; // unknown errors default to retryable
}

// ── Model Cascade — tenta modelos rápidos primeiro, fallback para mais lentos ──
interface ModelConfig {
  modelId: string;
  location: string;
  timeoutMs: number;
  retryTimeoutMs: number;
  maxRetries: number;
  label: string;
}

const MODEL_CASCADE: ModelConfig[] = [
  // Flash: 2 tentativas (45s + backoff + 30s ≈ 76s max)
  { modelId: 'gemini-2.0-flash-exp', location: 'us-central1', timeoutMs: 45_000, retryTimeoutMs: 30_000, maxRetries: 1, label: 'Flash' },
  // Pro: 1 tentativa (usa tempo restante)
  { modelId: 'gemini-3-pro-image-preview', location: 'global', timeoutMs: 90_000, retryTimeoutMs: 0, maxRetries: 0, label: 'Pro' },
];

// ── Vertex AI fetch (single attempt per model — cascade substitui retries) ──
async function callVertexAI(
  endpoint: string,
  accessToken: string | null | undefined,
  body: object,
  timeoutMs: number
): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (response.ok) {
      return await response.json();
    }

    // Parse error from Vertex AI
    let errorBody: any;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: await response.text().catch(() => 'Resposta ilegível') };
    }

    const status = response.status;
    const errorMsg = errorBody?.error?.message || errorBody?.message || JSON.stringify(errorBody);
    throw new Error(`[VertexAI ${status}] ${errorMsg}`);
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Timeout (${Math.round(timeoutMs / 1000)}s)`);
    }
    if (err.message?.startsWith('[VertexAI')) throw err;
    throw new Error(`Erro de rede: ${err.message}`);
  }
}

export async function POST(req: Request) {
  let creditDeducted = false;
  let userId: string | null = null;
  const t0 = Date.now();
  const lap = (label: string) => console.log(`[Generate] ${label}: ${Date.now() - t0}ms`);

  try {
    // ── 0. Autenticação — verificar JWT do usuário ──
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Sessão expirada. Faça login novamente.' }, { status: 401 });
    }

    userId = user.id;

    // ── Rate limit por usuário ──
    if (isRateLimited(user.id)) {
      return NextResponse.json(
        { error: 'Muitas gerações em pouco tempo. Aguarde um momento.' },
        { status: 429 }
      );
    }

    // ── Deduzir 1 crédito (atômico) ──
    const { data: newCredits, error: creditError } = await supabaseAdmin
      .rpc('decrement_credit', { user_id: user.id });

    if (creditError) {
      return NextResponse.json(
        { error: 'Sem créditos disponíveis. Faça upgrade do seu plano.' },
        { status: 403 }
      );
    }

    creditDeducted = true;

    // If credits just hit 0, notify user by email
    if (newCredits === 0 && user.email) {
      sendCreditsExhaustedEmail(user.email).catch(() => {});
    }

    lap('auth+credits');

    // ── 1. Parse FormData ──
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err: any) {
      console.error('[Generate] Erro ao parsear FormData:', err.message);
      return NextResponse.json(
        { error: 'Erro ao processar o upload. A imagem pode ser grande demais para a conexão.' },
        { status: 400 }
      );
    }

    const files = formData.getAll('files') as File[];
    const selectionsStr = formData.get('selections') as string;
    const niche = formData.get('niche') as string;

    if (!files || files.length === 0 || !selectionsStr) {
      return NextResponse.json({ error: 'Faltam arquivos ou seleções.' }, { status: 400 });
    }

    // Validate files: max 5 files, images only
    const MAX_FILES = 5;
    const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Máximo de ${MAX_FILES} arquivos por geração.` }, { status: 400 });
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json({ error: `Formato não suportado: ${file.type}. Use JPG, PNG ou WebP.` }, { status: 400 });
      }
    }

    const selections = JSON.parse(selectionsStr);

    lap('formData parsed');

    // ── 2. Read all file buffers once ──
    const fileBuffers: Buffer[] = [];
    for (const file of files) {
      fileBuffers.push(Buffer.from(await file.arrayBuffer()));
    }

    // ── 3. Upload original para Supabase (fire-and-forget, não bloqueia a IA) ──
    // Roda em paralelo com otimização + auth — economiza ~2-5s
    const originalUploadPromise = (async (): Promise<string> => {
      const originalWebp = await sharp(fileBuffers[0]).webp({ quality: 75 }).toBuffer();
      const fileName = `${Date.now()}_original.webp`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('uploads')
        .upload(fileName, originalWebp, { contentType: 'image/webp' });

      if (uploadError) {
        console.error('[Generate] Erro no upload Supabase:', uploadError);
        return '';
      }
      lap('original uploaded (parallel)');
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;
    })();

    // ── 4. Otimizar imagens para a IA (resize agressivo + JPEG comprimido) ──
    // Gemini entende o produto com 768px — reduz payload base64 em ~50% vs 1024px
    const AI_MAX_SIZE = 768;
    const aiBuffers: Buffer[] = [];
    for (const buf of fileBuffers) {
      const optimized = await sharp(buf)
        .resize(AI_MAX_SIZE, AI_MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 60 })
        .toBuffer();
      aiBuffers.push(optimized);
    }

    lap(`images optimized for AI (${aiBuffers.map(b => (b.length/1024).toFixed(0)+'KB').join(', ')})`);

    // ── 5. Construção do Prompt ──
    const finalPrompt = buildEnglishPrompt(niche, selections);

    // Prepara a matriz de imagens otimizadas para a IA
    const parts: any[] = [{ text: finalPrompt }];
    for (const aiBuf of aiBuffers) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: aiBuf.toString('base64')
        }
      });
    }

    lap('prompt built');

    // ── 6. Autenticação Vertex AI ──
    let accessToken: string | null | undefined;
    try {
      const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
      const privateKey = rawKey.startsWith('"') && rawKey.endsWith('"')
        ? rawKey.substring(1, rawKey.length - 1).replace(/\\n/g, '\n')
        : rawKey.replace(/\\n/g, '\n');

      const auth = new GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: privateKey,
        },
        projectId: process.env.GOOGLE_PROJECT_ID,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });

      accessToken = await auth.getAccessToken();
    } catch (err: any) {
      console.error('[Generate] Falha na autenticação Google:', err.message);
      return NextResponse.json(
        { error: 'Erro de autenticação com o serviço de IA. Contate o suporte.' },
        { status: 500 }
      );
    }

    const projectId = process.env.GOOGLE_PROJECT_ID!;

    lap('vertex auth');

    // ── 5. Cascade: tenta modelos em ordem de velocidade ──
    const requestBody = {
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        candidateCount: 1,
        temperature: 0.4
      }
    };

    let aiData: any = null;
    let usedModel = '';
    const TIME_BUDGET_MS = 100_000; // não iniciar tentativa se >100s elapsed (maxDuration=120s)

    for (const model of MODEL_CASCADE) {
      if (Date.now() - t0 > TIME_BUDGET_MS) {
        console.warn(`[Generate] Budget de tempo esgotado (${Date.now() - t0}ms). Parando cascade.`);
        break;
      }

      const host = model.location === 'global'
        ? 'aiplatform.googleapis.com'
        : `${model.location}-aiplatform.googleapis.com`;
      const endpoint = `https://${host}/v1beta1/projects/${projectId}/locations/${model.location}/publishers/google/models/${model.modelId}:generateContent`;

      for (let attempt = 0; attempt <= model.maxRetries; attempt++) {
        if (attempt > 0 && Date.now() - t0 > TIME_BUDGET_MS) break;

        const timeout = attempt === 0 ? model.timeoutMs : model.retryTimeoutMs;

        try {
          lap(`tentando ${model.label} (attempt ${attempt + 1}/${model.maxRetries + 1})`);
          aiData = await callVertexAI(endpoint, accessToken, requestBody, timeout);

          // Verifica se retornou imagem
          const hasImage = aiData.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData);
          if (hasImage) {
            usedModel = model.label;
            lap(`${model.label} respondeu com imagem`);
            break;
          }

          // Modelo respondeu mas sem imagem — safety block não faz retry
          const reason = aiData.candidates?.[0]?.finishReason || 'sem motivo';
          console.warn(`[Generate] ${model.label} respondeu sem imagem (${reason}).`);
          aiData = null;
          break; // sem imagem = próximo modelo
        } catch (err: any) {
          console.warn(`[Generate] ${model.label} attempt ${attempt + 1} falhou: ${err.message}`);
          aiData = null;

          if (!isRetryableError(err.message) || attempt >= model.maxRetries) break;

          // Backoff exponencial: 1s, 2s
          const backoffMs = 1000 * Math.pow(2, attempt);
          lap(`backoff ${backoffMs}ms antes de retry`);
          await sleep(backoffMs);
        }
      }

      if (aiData) break; // sucesso — sai do cascade
    }

    if (!aiData) {
      // Reembolsar crédito — geração falhou completamente
      if (creditDeducted && userId) {
        try {
          await supabaseAdmin.rpc('refund_credit', { user_id: userId });
          creditDeducted = false;
          console.log(`[Generate] Crédito reembolsado para ${userId}`);
        } catch (refundErr: any) {
          console.error(`[Generate] Falha ao reembolsar crédito: ${refundErr.message}`);
        }
      }
      return NextResponse.json(
        { error: 'A IA está instável no momento. Seu crédito foi devolvido — tente novamente!', refunded: true },
        { status: 502 }
      );
    }

    lap('vertex AI responded (' + usedModel + ')');

    const generatedPart = aiData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const generatedBase64 = generatedPart?.inlineData?.data;

    if (!generatedBase64) {
      // Reembolsar crédito — IA não gerou imagem
      if (creditDeducted && userId) {
        try {
          await supabaseAdmin.rpc('refund_credit', { user_id: userId });
          creditDeducted = false;
          console.log(`[Generate] Crédito reembolsado (sem imagem) para ${userId}`);
        } catch (e: any) { console.error(`[Generate] Falha refund: ${e.message}`); }
      }

      const blockReason = aiData.candidates?.[0]?.finishReason;
      const safetyRatings = aiData.candidates?.[0]?.safetyRatings;
      console.error('[Generate] IA não retornou imagem. finishReason:', blockReason, 'safety:', JSON.stringify(safetyRatings));

      if (blockReason === 'SAFETY') {
        return NextResponse.json(
          { error: 'A IA bloqueou esta imagem por filtros de segurança. Tente com outra foto.', refunded: true },
          { status: 422 }
        );
      }

      return NextResponse.json(
        { error: 'A IA não gerou a imagem desta vez. Seu crédito foi devolvido — tente novamente!', refunded: true },
        { status: 422 }
      );
    }

    // ── Extract usage metadata and calculate real cost ──
    const usageMetadata = aiData.usageMetadata || {};
    const inputTokens = usageMetadata.promptTokenCount || 0;
    const outputTokens = usageMetadata.candidatesTokenCount || 0;

    const inputCostUsd = (inputTokens / 1_000_000) * 1.25;
    const outputImageCostUsd = 0.04;
    const totalCostUsd = inputCostUsd + outputImageCostUsd;

    // ── 6. Salvar imagem gerada (comprimida para WebP) ──
    let generatedUrl: string;
    try {
      const generatedBuffer = Buffer.from(generatedBase64, 'base64');
      const optimizedBuffer = await sharp(generatedBuffer).webp({ quality: 82 }).toBuffer();
      const genFileName = `ai_pro_${Date.now()}.webp`;
      const { error: saveError } = await supabaseAdmin.storage
        .from('compositions')
        .upload(genFileName, optimizedBuffer, { contentType: 'image/webp' });

      if (saveError) {
        console.error('[Generate] Erro ao salvar composição:', saveError);
        throw new Error(saveError.message);
      }

      generatedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/compositions/${genFileName}`;
    } catch (err: any) {
      console.error('[Generate] Falha ao salvar imagem gerada:', err.message);
      return NextResponse.json(
        { error: 'Imagem gerada com sucesso, mas houve erro ao salvar. Tente novamente.' },
        { status: 500 }
      );
    }

    lap('generated image saved');

    // ── 7. Registro no banco de dados ──
    // Aguarda o upload original que rodou em paralelo
    const originalUrl = await originalUploadPromise;

    const { error: dbError } = await supabaseAdmin.from('generations').insert({
      user_id: user.id,
      niche,
      original_image_url: originalUrl || '',
      generated_image_url: generatedUrl,
      prompt: finalPrompt,
      selections,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: parseFloat(totalCostUsd.toFixed(6)),
    });

    if (dbError) {
      // Non-fatal: image was generated and saved, just log the DB error
      console.error('[Generate] Erro ao registrar no banco:', dbError);
    }

    lap(`DONE (${usedModel}) — total`);
    return NextResponse.json({ url: generatedUrl });

  } catch (error: any) {
    console.error("[Generate] Erro:", error.message);

    // Reembolsar crédito se foi cobrado mas a geração não completou
    let refunded = false;
    if (creditDeducted && userId) {
      try {
        await supabaseAdmin.rpc('refund_credit', { user_id: userId });
        refunded = true;
        console.log(`[Generate] Crédito reembolsado (catch) para ${userId}`);
      } catch (e: any) { console.error(`[Generate] Falha refund (catch): ${e.message}`); }
    }

    const userMessage = error.message?.startsWith('[VertexAI')
      ? 'Erro no serviço de IA. Tente novamente em alguns instantes.'
      : error.message || 'Erro inesperado. Tente novamente.';

    return NextResponse.json({
      error: refunded ? `${userMessage} Seu crédito foi devolvido.` : userMessage,
      refunded,
    }, { status: 500 });
  }
}
