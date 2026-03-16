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

    if (!file || !selectionsStr) return NextResponse.json({ error: 'Faltam arquivos ou seleções.' }, { status: 400 });

    const selections = JSON.parse(selectionsStr);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = fileBuffer.toString('base64');

    // 1. Upload original
    const fileName = `${Date.now()}_original_${file.name.replace(/\s/g, '_')}`;
    await supabaseAdmin.storage.from('uploads').upload(fileName, fileBuffer, { contentType: file.type });
    const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;

    // 2. Prompt (Lógica do prompt-builder que você validou)
    const finalPrompt = buildEnglishPrompt(niche, selections);

    // 3. Autenticação e Endpoint Mestre
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

    // MODELO FLAGSHIP: Gemini 3 Pro Image (Garante Proporção e Fidelidade)
    // Usando a versão v1beta1 para garantir acesso ao modelo Preview
    const location = 'us-central1';
    const modelId = 'gemini-3-pro-image-preview';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

    // 4. Chamada Multimodal (Integração Produto + IA)
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
          responseModalities: ["IMAGE"], // Fundamental para modelos Gemini de Imagem
          candidateCount: 1,
          temperature: 0.8,
          // Ajuste fino de fidelidade ao prompt e ao produto
          guidanceScale: 20.0
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API Flagship: ${JSON.stringify(errorData)}`);
    }

    const aiData = await response.json();
    const generatedPart = aiData.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const generatedBase64 = generatedPart?.inlineData?.data;

    if (!generatedBase64) throw new Error("O modelo Pro não retornou imagem.");

    // 5. Salvar resultado (compositions)
    const generatedBuffer = Buffer.from(generatedBase64, 'base64');
    const genFileName = `ai_pro_${Date.now()}.png`;
    await supabaseAdmin.storage.from('compositions').upload(genFileName, generatedBuffer, { contentType: 'image/png' });
    const generatedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/compositions/${genFileName}`;

    // 6. Registro completo
    await supabaseAdmin.from('generations').insert({
      niche,
      original_image_url: originalUrl,
      generated_image_url: generatedUrl,
      prompt: finalPrompt,
      selections
    });

    return NextResponse.json({ url: generatedUrl });

  } catch (error: any) {
    console.error("Falha no Modelo Flagship:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}