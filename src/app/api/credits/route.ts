import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/credits?userId=xxx — retorna tokens do usuário
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });
    }

    // Try to get existing profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('tokens')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist — auto-create with 15 tokens (3 gens * 5 tokens)
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const email = userData?.user?.email || '';

      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({ id: userId, email, tokens: 15, total_generations: 0 })
        .select('tokens')
        .single();

      if (insertError) {
        console.error('Erro ao criar perfil:', insertError);
        return NextResponse.json({ credits: 15 });
      }

      return NextResponse.json({ credits: newProfile.tokens });
    }

    if (error) throw error;

    return NextResponse.json({ credits: data.tokens });
  } catch (error: any) {
    console.error('Erro ao buscar tokens:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/credits — dedução manual de tokens se necessário
export async function POST(req: Request) {
  try {
    const { userId, amount = 1 } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });
    }

    // Chamada ao novo RPC deduct_tokens
    const { data, error } = await supabaseAdmin.rpc('deduct_tokens', {
      user_id: userId,
      amount_to_deduct: amount,
    });

    if (error) throw error;

    return NextResponse.json({ credits: data });
  } catch (error: any) {
    console.error('Erro ao deduzir tokens:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
