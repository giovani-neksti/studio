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

    // 1. Fetch ALL profiles for full stats and trends
    let { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, tokens, credits, total_generations, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Handle fallback mapping for credits -> tokens
    const processedProfiles = (profiles || []).map(p => ({
      ...p,
      tokens: p.tokens !== undefined ? p.tokens : (p.credits ?? 0)
    }));

    // 2. Fetch more generations for meaningful trends (last 500)
    let { data: generations, error: genError } = await supabaseAdmin
      .from('generations')
      .select('id, niche, created_at, original_image_url, generated_image_url, showcase, output_tokens')
      .order('created_at', { ascending: false })
      .limit(500);

    if (genError) throw genError;

    // 3. Aggregate Stats
    const totalUsers = processedProfiles.length;
    const totalTokens = processedProfiles.reduce((sum, p) => sum + (p.tokens || 0), 0);
    const totalGenerations = processedProfiles.reduce((sum, p) => sum + (p.total_generations || 0), 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const registrationsToday = processedProfiles.filter(p => new Date(p.created_at) >= todayStart).length;
    const generationsToday = (generations || []).filter(g => new Date(g.created_at) >= todayStart).length;
    const activeUsers = processedProfiles.filter(p => p.total_generations > 0).length;
    const usersNoTokens = processedProfiles.filter(p => p.tokens <= 0).length;

    // 4. Calculate Trends (Last 14 days)
    const trends: Record<string, { registrations: number; generations: number }> = {};
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last14Days.forEach(date => {
      trends[date] = { registrations: 0, generations: 0 };
    });

    processedProfiles.forEach(p => {
      const date = new Date(p.created_at).toISOString().split('T')[0];
      if (trends[date]) trends[date].registrations++;
    });

    (generations || []).forEach(g => {
      const date = new Date(g.created_at).toISOString().split('T')[0];
      if (trends[date]) trends[date].generations++;
    });

    const trendData = last14Days.map(date => ({
      date,
      ...trends[date]
    }));

    // 5. Niche Distribution
    const nicheCount: Record<string, number> = {};
    (generations || []).forEach(g => {
      const n = g.niche || 'jewelry';
      nicheCount[n] = (nicheCount[n] || 0) + 1;
    });

    const nicheData = Object.entries(nicheCount).map(([name, value]) => ({ name, value }));

    // 6. Fetch error logs
    const { data: errorLogs } = await supabaseAdmin
      .from('error_logs')
      .select('id, message, source, url, user_id, created_at, stack')
      .order('created_at', { ascending: false })
      .limit(100);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const registrationsMonth = processedProfiles.filter(p => new Date(p.created_at) >= monthStart).length;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCredits: totalTokens,
        totalGenerations,
        newUsersToday: registrationsToday,
        newUsersMonth: registrationsMonth,
        generationsToday,
        activeUsers,
        usersNoCredits: usersNoTokens,
        totalErrors: errorLogs?.length ?? 0,
      },
      trends: trendData,
      nicheData,
      users: processedProfiles.slice(0, 100), // Return only first 100 for list
      recentGenerations: (generations || []).slice(0, 50), // Return only last 50 for list
      errorLogs: errorLogs ?? [],
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
