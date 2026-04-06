import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleAuth } from 'google-auth-library';
import { buildEnglishPrompt } from '@/lib/prompt-builder';
import { sendCreditsExhaustedEmail } from '@/lib/resend';
import sharp from 'sharp';

export const maxDuration = 120; // seconds
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

// ── Vertex AI fetch with retry + timeout ──
async function callVertexAI(
  endpoint: string,
  accessToken: string | null | undefined,
  body: object,
  retries = 2
): Promise<any> {
  const TIMEOUT_MS = 90_000; // 90s per attempt

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

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

      clearTimeout(timeout);

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

      // Don't retry on 4xx (client errors) except 429 (rate limit)
      if (status >= 400 && status < 500 && status !== 429) {
        throw new Error(`[VertexAI ${status}] ${errorMsg}`);
      }

      // Retryable: 429, 500, 502, 503, 504
      if (attempt < retries) {
        const backoff = (attempt + 1) * 2000; // 2s, 4s
        console.warn(`[VertexAI] Tentativa ${attempt + 1} falhou (${status}). Retry em ${backoff}ms...`);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }

      throw new Error(`[VertexAI ${status}] ${errorMsg}`);

    } catch (err: any) {
      clearTimeout(timeout);

      if (err.name === 'AbortError') {
        if (attempt < retries) {
          console.warn(`[VertexAI] Timeout na tentativa ${attempt + 1}. Retrying...`);
          continue;
        }
        throw new Error('A geração demorou demais (timeout). Tente novamente.');
      }

      // If it's already our formatted error, rethrow
      if (err.message?.startsWith('[VertexAI')) throw err;

      // Unknown fetch error — retry
      if (attempt < retries) {
        console.warn(`[VertexAI] Erro na tentativa ${attempt + 1}: ${err.message}. Retrying...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      throw new Error(`Falha na comunicação com a IA: ${err.message}`);
    }
  }
}

export async function POST(req: Request) {
  let creditDeducted = false;
  let userId: string | null = null;

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

    // ── 2. Upload original para o Supabase (comprimido para WebP) ──
    let originalUrl: string;
    try {
      const firstFileBuffer = Buffer.from(await files[0].arrayBuffer());
      const originalWebp = await sharp(firstFileBuffer).webp({ quality: 80 }).toBuffer();
      const fileName = `${Date.now()}_original.webp`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('uploads')
        .upload(fileName, originalWebp, { contentType: 'image/webp' });

      if (uploadError) {
        console.error('[Generate] Erro no upload Supabase:', uploadError);
        throw new Error(uploadError.message);
      }

      originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;
    } catch (err: any) {
      console.error('[Generate] Falha ao salvar imagem original:', err.message);
      return NextResponse.json(
        { error: 'Erro ao salvar a imagem no servidor. Tente novamente.' },
        { status: 500 }
      );
    }

    // ── 3. Construção do Prompt ──
    const finalPrompt = buildEnglishPrompt(niche, selections);

    // Prepara a matriz de imagens para a IA
    const parts: any[] = [{ text: finalPrompt }];
    for (const file of files) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const base64Image = fileBuffer.toString('base64');
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: base64Image
        }
      });
    }

    // ── 4. Autenticação Vertex AI ──
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

    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = 'global';
    const modelId = 'gemini-3-pro-image-preview';
    const endpoint = `https://aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

    // ── 5. Chamada Multimodal com retry ──
    const aiData = await callVertexAI(endpoint, accessToken, {
      contents: [
        {
          role: "user",
          parts: parts
        }
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
        candidateCount: 1,
        temperature: 0.7
      }
    });

    const generatedPart = aiData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const generatedBase64 = generatedPart?.inlineData?.data;

    if (!generatedBase64) {
      // Check if there's a safety block
      const blockReason = aiData.candidates?.[0]?.finishReason;
      const safetyRatings = aiData.candidates?.[0]?.safetyRatings;
      console.error('[Generate] IA não retornou imagem. finishReason:', blockReason, 'safety:', JSON.stringify(safetyRatings));

      if (blockReason === 'SAFETY') {
        return NextResponse.json(
          { error: 'A IA bloqueou esta imagem por filtros de segurança. Tente com outra foto ou configuração.' },
          { status: 422 }
        );
      }

      return NextResponse.json(
        { error: 'A IA não conseguiu gerar a imagem. Tente novamente com outra configuração.' },
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

    // ── 7. Registro no banco de dados ──
    const { error: dbError } = await supabaseAdmin.from('generations').insert({
      user_id: user.id,
      niche,
      original_image_url: originalUrl,
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

    return NextResponse.json({ url: generatedUrl });

  } catch (error: any) {
    console.error("[Generate] Erro:", error.message);

    // Return the specific error message from our improved error handling
    const userMessage = error.message?.startsWith('[VertexAI')
      ? 'Erro no serviço de IA. Tente novamente em alguns instantes.'
      : error.message || 'Erro inesperado. Tente novamente.';

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
