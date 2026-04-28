import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/admin';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    // Tenta buscar perfis com a coluna nova 'tokens', se falhar tenta 'credits'
    let { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, tokens, total_generations, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      // Fallback para o sistema antigo de créditos se a migração ainda não foi rodada
      const { data: legacyProfiles, error: legacyError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, credits, total_generations, created_at, updated_at')
        .order('created_at', { ascending: false });
      
      if (legacyError) throw legacyError;
      
      // Mapeia 'credits' para 'tokens' para manter o frontend funcionando
      profiles = (legacyProfiles || []).map(p => ({
        ...p,
        tokens: p.credits
      }));
    }

    // Tenta buscar gerações com a coluna 'output_tokens'
    let { data: generations, error: genError } = await supabaseAdmin
      .from('generations')
      .select('id, niche, created_at, original_image_url, generated_image_url, showcase, output_tokens')
      .order('created_at', { ascending: false })
      .limit(50);

    if (genError) {
      // Fallback se output_tokens não existir
      const { data: legacyGens, error: legacyGenError } = await supabaseAdmin
        .from('generations')
        .select('id, niche, created_at, original_image_url, generated_image_url, showcase')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (legacyGenError) throw legacyGenError;
      generations = (legacyGens || []) as any[];
    }

    // Agregação de estatísticas
    const totalUsers = profiles?.length ?? 0;
    const totalTokens = profiles?.reduce((sum, p) => sum + (p.tokens || 0), 0) ?? 0;
    const totalGenerations = profiles?.reduce((sum, p) => sum + (p.total_generations || 0), 0) ?? 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newUsersToday = profiles?.filter(p => new Date(p.created_at) >= todayStart).length ?? 0;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const newUsersMonth = profiles?.filter(p => new Date(p.created_at) >= monthStart).length ?? 0;

    const generationsToday = generations?.filter(g => new Date(g.created_at) >= todayStart).length ?? 0;
    const activeUsers = profiles?.filter(p => p.total_generations > 0).length ?? 0;
    const usersNoTokens = profiles?.filter(p => (p.tokens || 0) <= 0).length ?? 0;

    const { data: errorLogs } = await supabaseAdmin
      .from('error_logs')
      .select('id, message, source, url, user_id, created_at, stack')
      .order('created_at', { ascending: false })
      .limit(100);

    const errorsToday = errorLogs?.filter(e => new Date(e.created_at) >= todayStart).length ?? 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCredits: totalTokens,
        totalGenerations,
        newUsersToday,
        newUsersMonth,
        generationsToday,
        activeUsers,
        usersNoCredits: usersNoTokens,
        errorsToday,
        totalErrors: errorLogs?.length ?? 0,
      },
      users: profiles ?? [],
      recentGenerations: generations ?? [],
      errorLogs: errorLogs ?? [],
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
