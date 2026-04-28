import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { userId, tokens } = await req.json();

    if (!userId || typeof tokens !== 'number') {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ tokens })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao atualizar tokens:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !adminUser || !isAdmin(adminUser.email)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });
    }

    // 1. Deletar do banco de dados (profiles)
    // As gerações devem ter ON DELETE CASCADE ou ser tratadas. 
    // Para simplificar aqui, vamos apenas deletar o perfil.
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (dbError) throw dbError;

    // 2. Deletar do Supabase Auth
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    // Note: se o usuário não existir no Auth (ex: já deletado), ignoramos o erro
    if (authDeleteError && !authDeleteError.message.includes('User not found')) {
      console.warn('Erro ao deletar do Auth:', authDeleteError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
