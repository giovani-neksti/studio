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

    if (!file || !selectionsStr) return NextResponse.json({ error: 'Faltam dados.' }, { status: 400 });

    const selections = JSON.parse(selectionsStr);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = fileBuffer.toString('base64');

    // 1. Upload original para histórico
    const fileName = `${Date.now()}_original_${file.name.replace(/\s/g, '_')}`;
    await supabaseAdmin.storage.from('uploads').upload(fileName, fileBuffer, { contentType: file.type });
    const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;

    // 2. Prompt Refinado para Proporção e Integração (Ancoragem na orelha)
    const rawPrompt = buildEnglishPrompt(niche, selections);
    // Adicionamos comandos técnicos para forçar a escala e a luz correta
    const finalPrompt = `${rawPrompt}. The product is a small earring, perfectly scaled and realistically attached to the human earlobe, consistent studio lighting, realistic shadows, high resolution photography.`;

    // 3. Autenticação Google
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const accessToken = await auth.getAccessToken();
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/imagen-3.0-capability-001:predict`;

    // 4. Chamada REST com o modo "product-image" (Modo GA para recontextualização)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{
          prompt: finalPrompt,
          image: {
            bytesBase64Encoded: base64Image,
            mimeType: file.type
          }
        }],
        parameters: {
          sampleCount: 1,
          editMode: "product-image", // Valor em string minúscula exigido pelo REST
          addWatermark: false,
          personGeneration: "allow_all"
        }
      })
    });

    const aiData = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(aiData));

    const generatedBase64 = aiData.predictions?.[0]?.bytesBase64Encoded || aiData.predictions?.[0];
    if (!generatedBase64) throw new Error("A IA não retornou a imagem.");

    // 5. Salvar resultado final
    const generatedBuffer = Buffer.from(generatedBase64, 'base64');
    const genFileName = `ai_${Date.now()}.png`;
    await supabaseAdmin.storage.from('compositions').upload(genFileName, generatedBuffer, { contentType: 'image/png' });
    const generatedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/compositions/${genFileName}`;

    await supabaseAdmin.from('generations').insert({
      niche, original_image_url: originalUrl, generated_image_url: generatedUrl, prompt: finalPrompt, selections
    });

    return NextResponse.json({ url: generatedUrl });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Erro na IA: ' + error.message }, { status: 500 });
  }
}