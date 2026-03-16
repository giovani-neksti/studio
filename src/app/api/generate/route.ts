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

    // 1. Upload original para o Supabase
    const fileName = `${Date.now()}_original_${file.name.replace(/\s/g, '_')}`;
    await supabaseAdmin.storage.from('uploads').upload(fileName, fileBuffer, { contentType: file.type });
    const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;

    // 2. Construção do Prompt (Lógica oficial do seu prompt-builder)
    const finalPrompt = buildEnglishPrompt(niche, selections);

    // 3. Autenticação Vertex AI
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

    /** * O MODELO "FODÃO": Gemini 3 Pro Image (Nano Banana Pro)
     * Local: Modelos Preview exigem a localização 'global' para evitar erros 404.
     * Endpoint: v1beta1 é necessário para acessar os recursos de imagem da série 3.
     */
    const location = 'global';
    const modelId = 'gemini-3-pro-image-preview';
    const endpoint = `https://aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

    // 4. Chamada Multimodal (Mantendo sua estrutura estável)
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
          responseModalities: ["IMAGE"], // Comando mestre do motor de imagem
          candidateCount: 1,
          temperature: 0.7
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

    // 5. Salvar imagem gerada (compositions)
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