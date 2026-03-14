import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleAuth } from 'google-auth-library';

// 50% METADE DO BANCO DE DADOS - SYSTEM PROMPT MESTRE
function getMasterPrompt(niche: string) {
  const technicalFocus = niche === 'jewelry' ? 'Macro lens 100mm, extreme close-up, sharp focus on jewelry details' : 'Professional 50mm lenses, fashion editorial style';

  return `REGRA DE PRESERVAÇÃO ABSOLUTA: A IA está expressamente proibida de alterar, distorcer, redesenhar ou modificar o design, as cores, as pedras ou as proporções do produto original na imagem de referência. O produto original deve ser mantido 100% fiel e inalterável como foco central.
DIRETRIZES TÉCNICAS E REALISMO: Fotografia publicitária de alto nível em 8k, texturas hiper-realistas, iluminação de estúdio profissional com softboxes e ray tracing avançado para reflexos realistas em superfícies metálicas e tecidos. Profundidade de campo cinematográfica (${technicalFocus}).`;
}

// MAPEAMENTO DE ASPECT RATIO PARA VERTEX AI
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
    
    // We receive multiple entries: 'file', 'selections', 'niche'
    const file = formData.get('file') as File;
    const selectionsStr = formData.get('selections') as string;
    const niche = formData.get('niche') as string;
    
    if (!file || !selectionsStr) {
      return NextResponse.json({ error: 'Faltam arquivos ou seleções no payload.' }, { status: 400 });
    }
    
    const selections = JSON.parse(selectionsStr);
    
    // 1. Upload da imagem original para o Supabase (bucket: uploads)
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
    
    // 2. CONSTRUÇÃO DO PROMPT 50/50
    // METADE 1: BANCO DE DADOS (SYSTEM)
    const masterPrompt = getMasterPrompt(niche);

    // METADE 2: FRONTEND (USER FEATURES)
    const f2_background = selections.background || (selections.solidColor ? `Fundo de cor sólida ${selections.solidColor}` : 'Fundo neutral');
    const f3_display = selections.display || selections.model || 'suporte invisível';
    const f4_text = selections.text ? `Texto visível na imagem: "${selections.text}" na tipografia ${selections.typography || 'elegante'}.` : '';
    
    const userPrompt = `FEATURE 2 (Cenário): ${f2_background}. FEATURE 3 (Expositor/Modelo): O produto inserido sobre ${f3_display}. FEATURE 4 (Texto): ${f4_text}`;
    
    // FUSÃO BLINDADA
    const finalPrompt = `${masterPrompt}\n\nORDENS DIRETAS DO FILTRO DO USUÁRIO:\n${userPrompt}`;
    
    const vertexAspectRatio = getVertexAspectRatio(selections.format);
    
    // 3. Autenticação Vertex AI via google-auth-library
    let generatedBase64 = null;
    
    try {
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
      const location = 'us-central1';
      
      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-fast-generate-001:predict`;

      // Chamada para a Vertex AI
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
            }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: vertexAspectRatio,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vertex AI Error Response:', errorText);
        throw new Error("A Vertex AI rejeitou a requisição: " + errorText);
      } else {
        const aiData = await response.json();
        
        // Vertex AI structural fallback
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

    // 4. Upload da Imagem Gerada ao Supabase (bucket: compositions)
    const generatedBuffer = Buffer.from(generatedBase64, 'base64');
    const generatedFileName = `ai_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    
    const { error: genUploadError } = await supabaseAdmin.storage
      .from('compositions')
      .upload(generatedFileName, generatedBuffer, {
        contentType: 'image/png',
      });
      
    if (genUploadError) {
      console.error('Generated Upload Error no Supabase:', genUploadError);
      return NextResponse.json({ error: 'Falha ao salvar a imagem gerada no bucket de Composições.' }, { status: 500 });
    }
    
    const generatedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/compositions/${generatedFileName}`;

    // 5. Inserir Registro Completo na Tabela (Metadata e Histórico)
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

    // 6. Retorno ao Front-End
    return NextResponse.json({ url: generatedUrl });

  } catch (error) {
    console.error('Server Action Error API:', error);
    return NextResponse.json({ error: 'Internal server error na rota de geração' }, { status: 500 });
  }
}
