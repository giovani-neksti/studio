import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/credits?userId=xxx — retorna créditos do usuário
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
      .select('credits')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist — auto-create with 3 credits
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const email = userData?.user?.email || '';

      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({ id: userId, email, credits: 3, total_generations: 0 })
        .select('credits')
        .single();

      if (insertError) {
        console.error('Erro ao criar perfil:', insertError);
        return NextResponse.json({ credits: 3 });
      }

      return NextResponse.json({ credits: newProfile.credits });
    }

    if (error) throw error;

    return NextResponse.json({ credits: data.credits });
  } catch (error: any) {
    console.error('Erro ao buscar créditos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/credits — decrementa 1 crédito após geração
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });
    }

    // Atomic decrement: só decrementa se credits > 0
    const { data, error } = await supabaseAdmin.rpc('decrement_credit', {
      user_id: userId,
    });

    if (error) throw error;

    return NextResponse.json({ credits: data });
  } catch (error: any) {
    console.error('Erro ao decrementar crédito:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
