import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/admin';

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) return null;
  return user;
}

// PATCH — toggle showcase on/off for a generation
export async function PATCH(req: Request) {
  try {
    const user = await verifyAdmin(req);
    if (!user) return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });

    const { generationId, showcase } = await req.json();

    if (!generationId || typeof showcase !== 'boolean') {
      return NextResponse.json({ error: 'generationId e showcase (boolean) são obrigatórios.' }, { status: 400 });
    }

    // If enabling, check current showcase count
    if (showcase) {
      const { count } = await supabaseAdmin
        .from('generations')
        .select('id', { count: 'exact', head: true })
        .eq('showcase', true);

      if ((count ?? 0) >= 20) {
        return NextResponse.json(
          { error: 'Limite de 20 imagens no showcase atingido. Remova uma antes de adicionar.' },
          { status: 400 }
        );
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('generations')
      .update({ showcase })
      .eq('id', generationId);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, generationId, showcase });
  } catch (error: any) {
    console.error('Showcase toggle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
