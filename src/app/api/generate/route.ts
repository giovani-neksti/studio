import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleAuth } from 'google-auth-library';
import { buildEnglishPrompt } from '@/lib/prompt-builder';

function getMasterPrompt(niche: string) {
  const technicalFocus = niche === 'jewelry' ? 'Macro lens 100mm, extreme close-up, sharp focus on jewelry details' : 'Professional 50mm lenses, fashion editorial style';

  return `REGRA DE PRESERVAÇÃO ABSOLUTA: A IA está expressamente proibida de alterar, distorcer, redesenhar ou modificar o design, as cores, as pedras ou as proporções do produto original na imagem de referência. O produto original deve ser mantido 100% fiel e inalterável como foco central.
DIRETRIZES TÉCNICAS E REALISMO: Fotografia publicitária de alto nível em 8k, texturas hiper-realistas, iluminação de estúdio profissional com softboxes e ray tracing avançado para reflexos realistas em superfícies metálicas e tecidos. Profundidade de campo cinematográfica (${technicalFocus}).`;
}

function getVertexAspectRatio(formatId: string): string {
  const formatMap: Record<string, string> = {
    'square': '1:1',
    'portrait': '4:5',
    'story': '9:16',
    'landscape': '16:9',
  };
  return formatMap[formatId] || '1:1';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File;
    const selectionsStr = formData.get('selections') as string;
    const niche = formData.get('niche') as string;

    if (!file || !selectionsStr) {
      return NextResponse.json({ error: 'Faltam arquivos ou seleções no payload.' }, { status: 400 });
    }

    const selections = JSON.parse(selectionsStr);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}_original_${file.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError);
      return NextResponse.json({ error: 'Falha no upload da imagem original para o bucket.' }, { status: 500 });
    }

    const originalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${fileName}`;
    const base64Image = fileBuffer.toString('base64');

    const masterPrompt = getMasterPrompt(niche);
    const englishScenePrompt = buildEnglishPrompt(niche, selections);
    const finalPrompt = `${masterPrompt}\n\nSCENE DESCRIPTION:\n${englishScenePrompt}`;
    const vertexAspectRatio = getVertexAspectRatio(selections.format);

    let generatedBase64 = null;

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

      const accessToken = await auth.getAccessToken();
      const projectId = process.env.GOOGLE_PROJECT_ID;
      const location = 'us-central1';

      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-capability-001:predict`;

      // Injetando a imagem em base64 no payload do Vertex AI!
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: finalPrompt,
              image: {
                bytesBase64Encoded: base64Image
              }
            }
          ],
          parameters: {
            sampleCount: 1,
            editConfig: { editMode: "product-placement" }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vertex AI Error Response:', errorText);
        throw new Error("A Vertex AI rejeitou a requisição: " + errorText);
      } else {
        const aiData = await response.json();

        generatedBase64 =
          (typeof aiData.predictions?.[0] === 'string' ? aiData.predictions[0] : null) ||
          aiData.predictions?.[0]?.bytesBase64Encoded ||
          aiData.predictions?.[0]?.bytesBase64;

        if (!generatedBase64) {
          throw new Error("Não encontrei base64 no aiData. Estrutura recebida: " + JSON.stringify(aiData).substring(0, 200));
        }
      }

    } catch (aiError: any) {
      console.error("Falha na execução do Vertex AI Pipeline:", aiError);
      return NextResponse.json({ error: 'Serviço de IA Indisponível: ' + aiError.message }, { status: 502 });
    }

    if (!generatedBase64) {
      return NextResponse.json({ error: 'A Inteligência Artificial não retornou a imagem base64.' }, { status: 500 });
    }

    const generatedBuffer = Buffer.from(generatedBase64, 'base64');
    const generatedFileName = `ai_${Date.now()}_${file.name.replace(/\s/g, '_')}`;

    const { error: genUploadError } = await supabaseAdmin.storage
      .from('compositions')
      .upload(generatedFileName, generatedBuffer, {
        contentType: 'image/png',
      });

    if (genUploadError) {
      console.error('Generated Upload Error no Supabase:', genUploadError);
      return NextResponse.json({ error: 'Falha ao salvar a imagem gerada.' }, { status: 500 });
    }

    const generatedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/compositions/${generatedFileName}`;

    const { error: dbError } = await supabaseAdmin.from('generations').insert({
      niche: niche,
      original_image_url: originalUrl,
      generated_image_url: generatedUrl,
      prompt: finalPrompt,
      selections: selections
    });

    if (dbError) {
      console.error("Supabase Database Insert Error:", dbError);
    }

    return NextResponse.json({ url: generatedUrl });

  } catch (error) {
    console.error('Server Action Error API:', error);
    return NextResponse.json({ error: 'Internal server error na rota de geração' }, { status: 500 });
  }
}