import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleAuth } from 'google-auth-library';
import { buildEnglishPrompt, getAspectRatioInfo } from '@/lib/prompt-builder';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // NOVO: Pegar TODOS os arquivos enviados (suporta 1, 2, 3 ou mais)
    const files = formData.getAll('files') as File[];
    const selectionsStr = formData.get('selections') as string;
    const niche = formData.get('niche') as string;

    if (!files || files.length === 0 || !selectionsStr) {
      return NextResponse.json({ error: 'Faltam arquivos ou seleções.' }, { status: 400 });
    }

    const selections = JSON.parse(selectionsStr);

    // 1. Upload original para o Supabase (grava apenas o primeiro na base de dados para referência visual)
    const firstFileBuffer = Buffer.from(await files[0].arrayBuffer());
    const fileName = `${Date.now()}_original_${files[0].name.replace(/\s/g, '_')}`;
    await supabaseAdmin.storage.from('uploads').upload(fileName, firstFileBuffer, { contentType: files[0].type });
    const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;

    // 2. Construção do Prompt Inteligente (que agora entende o Plural e Múltiplas Peças)
    const finalPrompt = buildEnglishPrompt(niche, selections);
    const { geminiRatio } = getAspectRatioInfo(selections.format || '1:1');

    // NOVO: Prepara a matriz de imagens para a IA "ver" todas as peças juntas!
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

    // 4. Autenticação Vertex AI
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

    const accessToken = await auth.getAccessToken();
    const projectId = process.env.GOOGLE_PROJECT_ID;

    const location = 'global';
    const modelId = 'gemini-3-pro-image-preview';
    const endpoint = `https://aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

    // 4. Chamada Multimodal (Enviando as N imagens simultaneamente)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: parts // <-- Todas as imagens e o texto entram aqui num array só
          }
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
          candidateCount: 1,
          temperature: 0.7,
          aspectRatio: geminiRatio
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API Nano Banana Pro: ${JSON.stringify(errorData)}`);
    }

    const aiData = await response.json();
    const generatedPart = aiData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const generatedBase64 = generatedPart?.inlineData?.data;

    if (!generatedBase64) throw new Error("A IA Pro não retornou a imagem. Verifique os filtros de segurança.");

    // 5. Salvar imagem gerada
    const generatedBuffer = Buffer.from(generatedBase64, 'base64');
    const genFileName = `ai_pro_${Date.now()}.png`;
    await supabaseAdmin.storage.from('compositions').upload(genFileName, generatedBuffer, { contentType: 'image/png' });
    const generatedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/compositions/${genFileName}`;

    // 6. Registro no banco de dados
    await supabaseAdmin.from('generations').insert({
      niche,
      original_image_url: originalUrl,
      generated_image_url: generatedUrl,
      prompt: finalPrompt,
      selections
    });

    return NextResponse.json({ url: generatedUrl });

  } catch (error: any) {
    console.error("Falha Crítica no motor Pro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}