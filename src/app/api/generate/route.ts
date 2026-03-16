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

    // 1. Upload da imagem original para o Supabase
    const fileName = `${Date.now()}_original_${file.name.replace(/\s/g, '_')}`;
    await supabaseAdmin.storage.from('uploads').upload(fileName, fileBuffer, { contentType: file.type });
    const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;

    // 2. Construção do Prompt (Lógica do prompt-builder)
    const finalPrompt = buildEnglishPrompt(niche, selections);

    // 3. Autenticação Google Cloud
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

    /** * CONFIGURAÇÃO DO MODELO DE ALTA QUALIDADE (IMAGEN 4.1 PLUS)
     * Local: us-central1 é a região mais estável para modelos 'Plus'
     * Endpoint: Usa ':predict' para modelos de imagem de alta fidelidade
     */
    const location = 'us-central1';
    const modelId = 'imagen-4.1-plus-001';
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`;

    // 4. Chamada à API (Estrutura de instâncias e parâmetros para Imagen)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: finalPrompt,
            image: {
              bytesBase64Encoded: base64Image,
              mimeType: file.type
            }
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: selections.format || "1:1", // Usa o formato escolhido no Passo 5
          personGeneration: "allow_all", // Essencial para modelos como Helena, Zara, etc.
          safetySetting: "block_few",
          enhancement: true // Ativa upscaling e refinamento de texturas
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API Imagen 4.1: ${JSON.stringify(errorData)}`);
    }

    const aiData = await response.json();

    // 5. Extração da Imagem (O Imagen retorna em predictions[0].bytesBase64Encoded)
    const generatedBase64 = aiData.predictions?.[0]?.bytesBase64Encoded;

    if (!generatedBase64) {
      console.error("Resposta completa da IA:", JSON.stringify(aiData));
      throw new Error("A IA não retornou imagem.");
    }

    // 6. Salvar imagem gerada (compositions)
    const generatedBuffer = Buffer.from(generatedBase64, 'base64');
    const genFileName = `ai_${Date.now()}.png`;
    await supabaseAdmin.storage.from('compositions').upload(genFileName, generatedBuffer, { contentType: 'image/png' });
    const generatedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/compositions/${genFileName}`;

    // 7. Registrar a geração no Banco de Dados
    await supabaseAdmin.from('generations').insert({
      niche,
      original_image_url: originalUrl,
      generated_image_url: generatedUrl,
      prompt: finalPrompt,
      selections
    });

    return NextResponse.json({ url: generatedUrl });

  } catch (error: any) {
    console.error("Falha na geração de imagem:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}