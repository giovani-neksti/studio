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

    const selections = JSON.parse(selectionsStr);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = fileBuffer.toString('base64');

    // 1. Upload original
    const fileName = `${Date.now()}_original_${file.name.replace(/\s/g, '_')}`;
    await supabaseAdmin.storage.from('uploads').upload(fileName, fileBuffer, { contentType: file.type });
    const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;

    // 2. Prompt (O mesmo que você usou no Nano Banana)
    const finalPrompt = buildEnglishPrompt(niche, selections);

    // 3. Auth Google
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

    // USANDO O MODELO DO NANO BANANA 2 NO VERTEX AI
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-3-flash-image:predict`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{
          prompt: finalPrompt,
          // O Gemini 3 Flash Image aceita a imagem como uma entrada de "contexto"
          image: {
            bytesBase64Encoded: base64Image,
            mimeType: file.type
          }
        }],
        parameters: {
          sampleCount: 1,
          // Ativa o modo de composição de alta fidelidade
          compositionMode: "PRODUCT_INTEGRATION",
          addWatermark: false,
          guidanceScale: 15.0 // Aumenta a obediência ao prompt (importante para o texto "Teste")
        }
      })
    });

    const aiData = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(aiData));

    const generatedBase64 = aiData.predictions?.[0]?.bytesBase64Encoded || aiData.predictions?.[0];

    // 4. Salvar resultado
    const genFileName = `ai_${Date.now()}.png`;
    await supabaseAdmin.storage.from('compositions').upload(genFileName, Buffer.from(generatedBase64, 'base64'), { contentType: 'image/png' });
    const generatedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/compositions/${genFileName}`;

    await supabaseAdmin.from('generations').insert({
      niche, original_image_url: originalUrl, generated_image_url: generatedUrl, prompt: finalPrompt, selections
    });

    return NextResponse.json({ url: generatedUrl });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro no motor Nano Banana: ' + error.message }, { status: 500 });
  }
}