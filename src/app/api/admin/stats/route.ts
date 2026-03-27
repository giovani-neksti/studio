import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/admin';

export async function GET(req: Request) {
  try {
    // Auth: verify JWT and check admin email
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, credits, total_generations, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch recent generations (last 50)
    const { data: generations, error: genError } = await supabaseAdmin
      .from('generations')
      .select('id, niche, created_at, original_image_url, generated_image_url')
      .order('created_at', { ascending: false })
      .limit(50);

    if (genError) throw genError;

    // Aggregate stats
    const totalUsers = profiles?.length ?? 0;
    const totalCredits = profiles?.reduce((sum, p) => sum + (p.credits || 0), 0) ?? 0;
    const totalGenerations = profiles?.reduce((sum, p) => sum + (p.total_generations || 0), 0) ?? 0;

    // Users registered today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const newUsersToday = profiles?.filter(p => new Date(p.created_at) >= todayStart).length ?? 0;

    // Users registered this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const newUsersMonth = profiles?.filter(p => new Date(p.created_at) >= monthStart).length ?? 0;

    // Generations today
    const generationsToday = generations?.filter(g => new Date(g.created_at) >= todayStart).length ?? 0;

    // Active users (generated at least once)
    const activeUsers = profiles?.filter(p => p.total_generations > 0).length ?? 0;

    // Users with 0 credits
    const usersNoCredits = profiles?.filter(p => p.credits === 0).length ?? 0;

    // Fetch recent error logs (last 100)
    const { data: errorLogs } = await supabaseAdmin
      .from('error_logs')
      .select('id, message, source, url, user_id, created_at, stack')
      .order('created_at', { ascending: false })
      .limit(100);

    // Errors today
    const errorsToday = errorLogs?.filter(e => new Date(e.created_at) >= todayStart).length ?? 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCredits,
        totalGenerations,
        newUsersToday,
        newUsersMonth,
        generationsToday,
        activeUsers,
        usersNoCredits,
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
