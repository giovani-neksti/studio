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

    // Fetch all payments
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (paymentsError) throw paymentsError;

    // Fetch all profiles with usage data
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, credits, total_generations, created_at')
      .order('total_generations', { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch total generation count and real costs from generations table
    const { count: totalGenCount } = await supabaseAdmin
      .from('generations')
      .select('id', { count: 'exact', head: true });

    // Fetch all generations with cost data for accurate cost tracking
    const { data: allGenerations } = await supabaseAdmin
      .from('generations')
      .select('id, cost_usd, input_tokens, output_tokens, created_at, user_id');

    const generationsList = allGenerations ?? [];

    // Date boundaries
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // === REVENUE ===
    const allPayments = payments ?? [];
    const revenueTotal = allPayments.reduce((s, p) => s + p.amount_cents, 0);
    const revenueMonth = allPayments
      .filter(p => new Date(p.created_at) >= monthStart)
      .reduce((s, p) => s + p.amount_cents, 0);
    const revenueToday = allPayments
      .filter(p => new Date(p.created_at) >= todayStart)
      .reduce((s, p) => s + p.amount_cents, 0);

    // Plan breakdown
    const planCounts: Record<string, { count: number; revenue: number }> = {};
    for (const p of allPayments) {
      if (!planCounts[p.plan]) planCounts[p.plan] = { count: 0, revenue: 0 };
      planCounts[p.plan].count++;
      planCounts[p.plan].revenue += p.amount_cents;
    }

    // === REAL COST FROM VERTEX AI ===
    const totalCostUsd = generationsList.reduce((s, g) => s + (g.cost_usd || 0), 0);
    const monthCostUsd = generationsList
      .filter(g => new Date(g.created_at) >= monthStart)
      .reduce((s, g) => s + (g.cost_usd || 0), 0);
    const todayCostUsd = generationsList
      .filter(g => new Date(g.created_at) >= todayStart)
      .reduce((s, g) => s + (g.cost_usd || 0), 0);
    const totalInputTokens = generationsList.reduce((s, g) => s + (g.input_tokens || 0), 0);
    const totalOutputTokens = generationsList.reduce((s, g) => s + (g.output_tokens || 0), 0);

    // Per-user cost breakdown
    const userCosts: Record<string, { costUsd: number; generations: number }> = {};
    for (const g of generationsList) {
      if (!g.user_id) continue;
      if (!userCosts[g.user_id]) userCosts[g.user_id] = { costUsd: 0, generations: 0 };
      userCosts[g.user_id].costUsd += g.cost_usd || 0;
      userCosts[g.user_id].generations++;
    }

    // Monthly cost trend
    const monthlyCost: { month: string; costUsd: number; generations: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const mGens = generationsList.filter(g => {
        const gd = new Date(g.created_at);
        return gd >= d && gd < nextMonth;
      });
      monthlyCost.push({
        month: label,
        costUsd: mGens.reduce((s, g) => s + (g.cost_usd || 0), 0),
        generations: mGens.length,
      });
    }

    // === USAGE / COST ===
    const allProfiles = profiles ?? [];
    const totalGenerations = totalGenCount ?? allProfiles.reduce((s, p) => s + p.total_generations, 0);
    const totalCreditsRemaining = allProfiles.reduce((s, p) => s + p.credits, 0);

    // Per-user financial breakdown
    const userPayments: Record<string, { revenue: number; credits: number; plans: string[] }> = {};
    for (const p of allPayments) {
      const uid = p.user_id || p.email;
      if (!userPayments[uid]) userPayments[uid] = { revenue: 0, credits: 0, plans: [] };
      userPayments[uid].revenue += p.amount_cents;
      userPayments[uid].credits += p.credits;
      if (!userPayments[uid].plans.includes(p.plan)) userPayments[uid].plans.push(p.plan);
    }

    const userBreakdown = allProfiles.map(profile => {
      const payData = userPayments[profile.id] || { revenue: 0, credits: 0, plans: [] };
      const costData = userCosts[profile.id] || { costUsd: 0, generations: 0 };
      return {
        id: profile.id,
        email: profile.email,
        revenue: payData.revenue,
        creditsPurchased: payData.credits,
        creditsRemaining: profile.credits,
        totalGenerations: profile.total_generations,
        plans: payData.plans,
        createdAt: profile.created_at,
        costUsd: costData.costUsd,
      };
    });

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue: { month: string; revenue: number; generations: number; payments: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      const mRevenue = allPayments
        .filter(p => {
          const pd = new Date(p.created_at);
          return pd >= d && pd < nextMonth;
        })
        .reduce((s, p) => s + p.amount_cents, 0);

      const mPayments = allPayments
        .filter(p => {
          const pd = new Date(p.created_at);
          return pd >= d && pd < nextMonth;
        }).length;

      monthlyRevenue.push({ month: label, revenue: mRevenue, generations: 0, payments: mPayments });
    }

    return NextResponse.json({
      revenue: {
        total: revenueTotal,
        month: revenueMonth,
        today: revenueToday,
        planBreakdown: planCounts,
        monthlyTrend: monthlyRevenue,
      },
      cost: {
        totalUsd: totalCostUsd,
        monthUsd: monthCostUsd,
        todayUsd: todayCostUsd,
        totalInputTokens,
        totalOutputTokens,
        avgCostPerGenUsd: totalGenerations > 0 ? totalCostUsd / totalGenerations : 0,
        monthlyCostTrend: monthlyCost,
      },
      usage: {
        totalGenerations,
        totalCreditsRemaining,
        totalCreditsPurchased: allPayments.reduce((s, p) => s + p.credits, 0),
        freeCreditsUsed: Math.max(0, totalGenerations - allPayments.reduce((s, p) => s + p.credits, 0)),
      },
      payments: allPayments,
      userBreakdown: userBreakdown.filter(u => u.revenue > 0 || u.totalGenerations > 0),
    });
  } catch (error: any) {
    console.error('Admin financeiro error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
