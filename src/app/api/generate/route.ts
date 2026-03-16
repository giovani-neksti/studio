import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleAuth } from 'google-auth-library';
import { buildEnglishPrompt } from '@/lib/prompt-builder';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const selectionsStr = formData.get('selections') as string;
    const niche = formData.get('niche') as string;

    if (!file || !selectionsStr) {
      return NextResponse.json({ error: 'Faltam arquivos ou seleções.' }, { status: 400 });
    }

    const selections = JSON.parse(selectionsStr);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = fileBuffer.toString('base64');

    // 1. Upload original para histórico
    const fileName = `${Date.now()}_original_${file.name.replace(/\s/g, '_')}`;
    await supabaseAdmin.storage.from('uploads').upload(fileName, fileBuffer, { contentType: file.type });
    const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;

    // 2. Prompt (Lógica do prompt-builder)
    const finalPrompt = buildEnglishPrompt(niche, selections);

    // 3. Autenticação e Configuração do Endpoint
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const accessToken = await auth.getAccessToken();
    const projectId = process.env.GOOGLE_PROJECT_ID;

    // CORREÇÃO CRÍTICA: Local 'global' e versão 'v1beta1' para modelos Preview
    const location = 'global';
    const modelId = 'gemini-3.1-flash-image-preview';
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/us-central1/publishers/google/models/${modelId}:generateContent`;

    // 4. Chamada Multimodal (Nano Banana 2)
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
            parts: [
              { text: finalPrompt },
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["IMAGE"], // Ativa a geração de imagem no Gemini
          candidateCount: 1,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro API Vertex:", errorData);
      // Fallback para o modelo estável se o 3.1 ainda estiver com acesso restrito no seu projeto
      throw new Error(`Erro na API Nano Banana: ${JSON.stringify(errorData)}`);
    }

    const aiData = await response.json();

    // Extração da imagem da estrutura multimodal do Gemini
    const generatedPart = aiData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const generatedBase64 = generatedPart?.inlineData?.data;

    if (!generatedBase64) throw new Error("A IA não retornou a imagem base64.");

    // 5. Salvar resultado (compositions)
    const generatedBuffer = Buffer.from(generatedBase64, 'base64');
    const genFileName = `ai_${Date.now()}.png`;
    await supabaseAdmin.storage.from('compositions').upload(genFileName, generatedBuffer, { contentType: 'image/png' });
    const generatedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/compositions/${genFileName}`;

    await supabaseAdmin.from('generations').insert({
      niche,
      original_image_url: originalUrl,
      generated_image_url: generatedUrl,
      prompt: finalPrompt,
      selections
    });

    return NextResponse.json({ url: generatedUrl });

  } catch (error: any) {
    console.error("Falha no Pipeline Nano Banana:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}