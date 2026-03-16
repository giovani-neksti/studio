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

    // 1. Upload original
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    await supabaseAdmin.storage.from('uploads').upload(fileName, fileBuffer, { contentType: file.type });
    const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;

    // 2. Prompt
    const finalPrompt = buildEnglishPrompt(niche, selections);

    // 3. Google Auth
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const accessToken = await auth.getAccessToken();
    // MODELO CORRETO PARA EDIÇÃO (CAPABILITY)
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_PROJECT_ID}/locations/us-central1/publishers/google/models/imagen-3.0-capability-001:predict`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{
          prompt: finalPrompt,
          image: { bytesBase64Encoded: base64Image } // A chave correta aqui é 'image' para Imagen 3
        }],
        parameters: {
          sampleCount: 1,
          editMode: "outpainting", // Essencial para mudar o fundo
          maskImageConfig: {
            maskMode: "MASK_MODE_BACKGROUND" // COMANDO CHAVE: IA detecta o produto e troca o fundo
          }
        }
      })
    });

    const aiData = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(aiData));

    const generatedBase64 = aiData.predictions?.[0]?.bytesBase64Encoded || aiData.predictions?.[0];
    const generatedBuffer = Buffer.from(generatedBase64, 'base64');
    const genFileName = `ai_${Date.now()}.png`;

    await supabaseAdmin.storage.from('compositions').upload(genFileName, generatedBuffer, { contentType: 'image/png' });
    const generatedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/compositions/${genFileName}`;

    await supabaseAdmin.from('generations').insert({
      niche, original_image_url: originalUrl, generated_image_url: generatedUrl, prompt: finalPrompt, selections
    });

    return NextResponse.json({ url: generatedUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Erro: ' + error.message }, { status: 500 });
  }
}