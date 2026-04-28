'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin';
import {
  ArrowLeft,
  Users,
  ImageIcon,
  CreditCard,
  TrendingUp,
  Loader2,
  Search,
  ShieldCheck,
  UserPlus,
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Share2,
  DollarSign,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Settings2,
  Star,
  Eye,
  Gem,
} from 'lucide-react';
import { useShareImage } from '@/hooks/useShareImage';
import { ShareToast } from '@/components/ShareToast';

interface Stats {
  totalUsers: number;
  totalCredits: number;
  totalGenerations: number;
  newUsersToday: number;
  newUsersMonth: number;
  generationsToday: number;
  activeUsers: number;
  usersNoCredits: number;
  errorsToday: number;
  totalErrors: number;
}

interface ErrorLog {
  id: string;
  message: string;
  source: string;
  url: string | null;
  user_id: string | null;
  created_at: string;
  stack: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  tokens: number;
  total_generations: number;
  created_at: string;
  updated_at: string;
}

interface Generation {
  id: string;
  niche: string;
  created_at: string;
  original_image_url: string;
  generated_image_url: string;
  showcase?: boolean;
  output_tokens?: number;
}

interface FinanceiroData {
  revenue: {
    total: number;
    month: number;
    today: number;
    planBreakdown: Record<string, { count: number; revenue: number }>;
    monthlyTrend: { month: string; revenue: number; payments: number }[];
  };
  cost: {
    totalUsd: number;
    monthUsd: number;
    todayUsd: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    avgCostPerGenUsd: number;
    monthlyCostTrend: { month: string; costUsd: number; generations: number }[];
  };
  usage: {
    totalGenerations: number;
    totalCreditsRemaining: number;
    totalCreditsPurchased: number;
    freeCreditsUsed: number;
  };
  payments: Array<{
    id: string;
    user_id: string;
    email: string;
    stripe_session_id: string;
    amount_cents: number;
    credits: number;
    plan: string;
    created_at: string;
  }>;
  userBreakdown: Array<{
    id: string;
    email: string;
    revenue: number;
    creditsPurchased: number;
    creditsRemaining: number;
    totalGenerations: number;
    plans: string[];
    createdAt: string;
    costUsd: number;
  }>;
}

type Tab = 'overview' | 'users' | 'generations' | 'errors' | 'api' | 'financeiro';

interface RouteTest {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  needsAuth: boolean;
  safe: boolean; // safe to test without side effects
}

interface RouteResult {
  status: number;
  ok: boolean;
  ms: number;
  body: string;
  testedAt: string;
}

const API_ROUTES: RouteTest[] = [
  { id: 'showcase', method: 'GET', path: '/api/showcase', description: 'Showcase público (antes/depois)', needsAuth: false, safe: true },
  { id: 'admin-stats', method: 'GET', path: '/api/admin/stats', description: 'Estatísticas do painel admin', needsAuth: true, safe: true },
  { id: 'credits-get', method: 'GET', path: '/api/credits', description: 'Consultar créditos do usuário', needsAuth: false, safe: true },
  { id: 'generations', method: 'GET', path: '/api/generations', description: 'Listar gerações do usuário', needsAuth: true, safe: true },
  { id: 'financeiro', method: 'GET', path: '/api/admin/financeiro', description: 'Dados financeiros (receita, custo, margem)', needsAuth: true, safe: true },
  { id: 'errors-post', method: 'POST', path: '/api/errors', description: 'Registrar erro (log)', needsAuth: false, safe: true },
  { id: 'admin-login', method: 'POST', path: '/api/admin-login', description: 'Bypass login admin', needsAuth: false, safe: false },
  { id: 'generate', method: 'POST', path: '/api/generate', description: 'Gerar imagem com IA (consome crédito)', needsAuth: true, safe: false },
  { id: 'stripe-webhook', method: 'POST', path: '/api/webhooks/stripe', description: 'Webhook do Stripe (pagamentos)', needsAuth: false, safe: false },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [routeResults, setRouteResults] = useState<Record<string, RouteResult>>({});
  const [testingRoute, setTestingRoute] = useState<string | null>(null);
  const [financeiro, setFinanceiro] = useState<FinanceiroData | null>(null);
  const [finLoading, setFinLoading] = useState(false);
  const [usdToBrl, setUsdToBrl] = useState(5.70); // Câmbio USD→BRL
  const [togglingShowcase, setTogglingShowcase] = useState<string | null>(null);
  const [showcaseFilter, setShowcaseFilter] = useState<'all' | 'showcase' | 'not_showcase'>('all');
  const { canShare, shareImage, toast, dismissToast } = useShareImage();

  const showcaseCount = generations.filter(g => g.showcase).length;

  const toggleShowcase = async (genId: string, currentValue: boolean) => {
    if (!session?.access_token) return;
    setTogglingShowcase(genId);
    try {
      const res = await fetch('/api/admin/showcase', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ generationId: genId, showcase: !currentValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setGenerations(prev => prev.map(g => g.id === genId ? { ...g, showcase: !currentValue } : g));
      } else {
        alert(data.error || 'Erro ao atualizar showcase');
      }
    } catch {
      alert('Erro de rede');
    } finally {
      setTogglingShowcase(null);
    }
  };

  // Auth gate
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin(user.email))) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  // Fetch data
  useEffect(() => {
    if (!session?.access_token || !user || !isAdmin(user.email)) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('Erro ao carregar dados');
        const data = await res.json();
        setStats(data.stats);
        setUsers(data.users);
        setGenerations(data.recentGenerations);
        setErrorLogs(data.errorLogs);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, user]);

  // Fetch financeiro data when tab is selected
  useEffect(() => {
    if (tab !== 'financeiro' || !session?.access_token || financeiro) return;
    setFinLoading(true);
    fetch('/api/admin/financeiro', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setFinanceiro(data);
      })
      .catch(() => {})
      .finally(() => setFinLoading(false));
  }, [tab, session?.access_token, financeiro]);

  const refreshFinanceiro = () => {
    if (!session?.access_token) return;
    setFinanceiro(null);
    setFinLoading(true);
    fetch('/api/admin/financeiro', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setFinanceiro(data);
      })
      .catch(() => {})
      .finally(() => setFinLoading(false));
  };

  const testRoute = async (route: RouteTest) => {
    if (testingRoute) return;
    setTestingRoute(route.id);

    const start = performance.now();
    try {
      const headers: Record<string, string> = {};
      if (route.needsAuth && session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      let url = route.path;
      let fetchOpts: RequestInit = { method: route.method, headers };

      // Custom payloads for safe POST tests
      if (route.id === 'errors-post') {
        headers['Content-Type'] = 'application/json';
        fetchOpts.body = JSON.stringify({ message: '[Admin Test] Ping de teste do painel', source: 'admin-panel-test' });
      }

      // Append userId for credits GET
      if (route.id === 'credits-get' && user) {
        url += `?userId=${user.id}`;
      }

      const res = await fetch(url, fetchOpts);
      const ms = Math.round(performance.now() - start);
      let body: string;
      try {
        const json = await res.json();
        body = JSON.stringify(json, null, 2);
      } catch {
        body = await res.text().catch(() => '(sem corpo)');
      }

      setRouteResults((prev) => ({
        ...prev,
        [route.id]: {
          status: res.status,
          ok: res.ok,
          ms,
          body: body.slice(0, 3000),
          testedAt: new Date().toLocaleTimeString('pt-BR'),
        },
      }));
    } catch (err: any) {
      const ms = Math.round(performance.now() - start);
      setRouteResults((prev) => ({
        ...prev,
        [route.id]: {
          status: 0,
          ok: false,
          ms,
          body: `Erro de rede: ${err.message}`,
          testedAt: new Date().toLocaleTimeString('pt-BR'),
        },
      }));
    } finally {
      setTestingRoute(null);
    }
  };

  const testAllSafe = async () => {
    const safeRoutes = API_ROUTES.filter((r) => r.safe);
    for (const route of safeRoutes) {
      await testRoute(route);
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!user || !isAdmin(user.email)) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const statCards = stats
    ? [
        { label: 'Usuários Total', value: stats.totalUsers, icon: Users, color: 'var(--primary)' },
        { label: 'Gerações Total', value: stats.totalGenerations, icon: ImageIcon, color: 'var(--tertiary, #7c5cbf)' },
        { label: 'Créditos em Circulação', value: stats.totalCredits, icon: CreditCard, color: 'var(--secondary, #625b71)' },
        { label: 'Novos Hoje', value: stats.newUsersToday, icon: UserPlus, color: '#2e7d32' },
        { label: 'Novos no Mês', value: stats.newUsersMonth, icon: TrendingUp, color: '#1565c0' },
        { label: 'Gerações Hoje', value: stats.generationsToday, icon: ImageIcon, color: '#e65100' },
        { label: 'Usuários Ativos', value: stats.activeUsers, icon: ShieldCheck, color: '#2e7d32' },
        { label: 'Sem Créditos', value: stats.usersNoCredits, icon: AlertTriangle, color: '#c62828' },
        { label: 'Erros Hoje', value: stats.errorsToday, icon: Bug, color: '#d32f2f' },
        { label: 'Erros (últimos 100)', value: stats.totalErrors, icon: Bug, color: '#b71c1c' },
      ]
    : [];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Visão Geral' },
    { key: 'users', label: 'Usuários' },
    { key: 'generations', label: 'Gerações' },
    { key: 'errors', label: 'Erros' },
    { key: 'api', label: 'API Routes' },
    { key: 'financeiro', label: 'Financeiro' },
  ];

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      {/* Top Bar */}
      <nav className="h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 bg-[var(--surface-container-low)]/80 backdrop-blur-lg border-b border-[var(--outline-variant)]/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/studio')}
            className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-serif text-lg font-bold">Painel Admin</span>
          </div>
        </div>
        <span className="md3-label-medium text-[var(--on-surface-variant)]">{user.email}</span>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {error && (
          <div className="mb-6 p-4 rounded-[var(--shape-medium)] bg-[var(--error-container)] text-[var(--on-error-container)] md3-body-medium">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[var(--outline-variant)]/20">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 md3-label-large transition-colors relative
                ${tab === t.key
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--on-surface-variant)] hover:text-[var(--foreground)]'
                }`}
            >
              {t.label}
              {tab === t.key && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--primary)] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {tab === 'overview' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className="p-4 md:p-5 rounded-[var(--shape-large)] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="md3-label-medium text-[var(--on-surface-variant)]">{card.label}</span>
                      <card.icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                    <span className="text-2xl md:text-3xl font-bold" style={{ color: card.color }}>
                      {card.value.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Users Tab */}
            {tab === 'users' && (
              <div>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]/60" />
                  <input
                    type="text"
                    placeholder="Buscar por email ou ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-96 h-10 pl-10 pr-4 rounded-[var(--shape-full)] border border-[var(--outline)]/40 bg-[var(--surface-container-low)] text-[var(--foreground)] md3-body-medium outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30 transition-all"
                  />
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-[var(--shape-large)] border border-[var(--outline-variant)]/20">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[var(--surface-container-high)] border-b border-[var(--outline-variant)]/20">
                        <th className="text-left px-4 py-3 md3-label-medium text-[var(--on-surface-variant)]">Email</th>
                        <th className="text-center px-4 py-3 md3-label-medium text-[var(--on-surface-variant)]">Tokens</th>
                        <th className="text-center px-4 py-3 md3-label-medium text-[var(--on-surface-variant)]">Gerações</th>
                        <th className="text-left px-4 py-3 md3-label-medium text-[var(--on-surface-variant)] hidden md:table-cell">Cadastro</th>
                        <th className="text-left px-4 py-3 md3-label-medium text-[var(--on-surface-variant)] hidden lg:table-cell">Última Atividade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-[var(--outline-variant)]/10 hover:bg-[var(--surface-container-high)]/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="md3-body-medium text-[var(--foreground)]">{u.email || '—'}</div>
                            <div className="md3-label-small text-[var(--outline)] font-mono">{u.id.slice(0, 8)}...</div>
                          </td>
                          <td className="text-center px-4 py-3">
                            <span
                              className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-[var(--shape-full)] md3-label-medium
                                ${u.tokens <= 0
                                  ? 'bg-[var(--error-container)] text-[var(--on-error-container)]'
                                  : 'bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                                }`}
                            >
                              {u.tokens}
                            </span>
                          </td>
                          <td className="text-center px-4 py-3 md3-body-medium text-[var(--on-surface-variant)]">
                            {u.total_generations}
                          </td>
                          <td className="px-4 py-3 md3-body-small text-[var(--on-surface-variant)] hidden md:table-cell">
                            {formatDate(u.created_at)}
                          </td>
                          <td className="px-4 py-3 md3-body-small text-[var(--on-surface-variant)] hidden lg:table-cell">
                            {formatDate(u.updated_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-[var(--on-surface-variant)] md3-body-medium">
                      Nenhum usuário encontrado.
                    </div>
                  )}
                </div>

                <div className="mt-3 md3-label-small text-[var(--outline)]">
                  {filteredUsers.length} de {users.length} usuários
                </div>
              </div>
            )}

            {/* Errors Tab */}
            {tab === 'errors' && (
              <div>
                <p className="md3-label-medium text-[var(--on-surface-variant)] mb-4">
                  Últimos 100 erros registrados
                </p>
                <div className="space-y-2">
                  {errorLogs.map((e) => (
                    <div
                      key={e.id}
                      className="rounded-[var(--shape-large)] border border-[var(--outline-variant)]/20 bg-[var(--surface-container)] overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedError(expandedError === e.id ? null : e.id)}
                        className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-[var(--surface-container-high)]/50 transition-colors"
                      >
                        <Bug className="w-4 h-4 text-[#d32f2f] mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="md3-body-medium text-[var(--foreground)] truncate">
                            {e.message}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="md3-label-small text-[var(--outline)]">
                              {formatDate(e.created_at)}
                            </span>
                            {e.source && (
                              <span className="md3-label-small px-1.5 py-0.5 rounded bg-[var(--secondary-container)] text-[var(--on-secondary-container)]">
                                {e.source}
                              </span>
                            )}
                            {e.user_id && (
                              <span className="md3-label-small text-[var(--outline)] font-mono">
                                user: {e.user_id.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                        {e.stack ? (
                          expandedError === e.id
                            ? <ChevronUp className="w-4 h-4 text-[var(--on-surface-variant)] shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-[var(--on-surface-variant)] shrink-0" />
                        ) : null}
                      </button>
                      {expandedError === e.id && e.stack && (
                        <div className="px-4 pb-3">
                          {e.url && (
                            <div className="mb-2 md3-label-small text-[var(--outline)]">
                              URL: {e.url}
                            </div>
                          )}
                          <pre className="text-xs p-3 rounded-[var(--shape-medium)] bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)] overflow-x-auto whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                            {e.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {errorLogs.length === 0 && (
                  <div className="text-center py-10 text-[var(--on-surface-variant)] md3-body-medium">
                    Nenhum erro registrado.
                  </div>
                )}
              </div>
            )}

            {/* Generations Tab */}
            {tab === 'generations' && (
              <div>
                {/* Header with showcase counter and filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <p className="md3-label-medium text-[var(--on-surface-variant)]">
                      Últimas 50 gerações
                    </p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${showcaseCount >= 20 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20'}`}>
                      <Star className="w-3 h-3" />
                      {showcaseCount}/20 no Showcase
                    </span>
                  </div>
                  <div className="flex gap-1 bg-[var(--surface-container-highest)]/50 rounded-[var(--shape-small)] p-0.5">
                    {([['all', 'Todas'], ['showcase', 'Showcase'], ['not_showcase', 'Sem showcase']] as const).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setShowcaseFilter(key)}
                        className={`px-3 py-1.5 rounded-[var(--shape-small)] text-xs font-medium transition-all ${showcaseFilter === key ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--on-surface-variant)] hover:text-[var(--foreground)]'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-2.5 p-3 mb-4 rounded-[var(--shape-medium)] bg-[var(--primary)]/5 border border-[var(--primary)]/15">
                  <Eye className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                  <p className="md3-label-small text-[var(--on-surface-variant)]">
                    Clique na estrela para selecionar até <strong>20 imagens</strong> que aparecerão no carrossel da landing page. Enquanto nenhuma for selecionada, as 20 mais recentes serão exibidas automaticamente.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generations
                    .filter(g => {
                      if (showcaseFilter === 'showcase') return g.showcase;
                      if (showcaseFilter === 'not_showcase') return !g.showcase;
                      return true;
                    })
                    .map((g) => (
                    <div
                      key={g.id}
                      className={`rounded-[var(--shape-large)] border overflow-hidden transition-all ${g.showcase ? 'border-amber-500/40 bg-[var(--surface-container)] ring-1 ring-amber-500/20' : 'border-[var(--outline-variant)]/20 bg-[var(--surface-container)]'}`}
                    >
                      <div className="flex h-40 relative">
                        <div className="w-1/2 relative">
                          <img
                            src={g.original_image_url}
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 md3-label-small bg-black/60 text-white px-1.5 py-0.5 rounded">
                            Original
                          </span>
                        </div>
                        <div className="w-1/2 relative">
                          <img
                            src={g.generated_image_url}
                            alt="Gerada"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 md3-label-small bg-black/60 text-white px-1.5 py-0.5 rounded">
                            IA
                          </span>
                        </div>
                        {/* Showcase star toggle */}
                        <button
                          onClick={() => toggleShowcase(g.id, !!g.showcase)}
                          disabled={togglingShowcase === g.id}
                          className={`absolute top-2 right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${
                            g.showcase
                              ? 'bg-amber-500 text-white hover:bg-amber-600'
                              : 'bg-black/50 text-white/70 hover:bg-black/70 hover:text-amber-400'
                          } ${togglingShowcase === g.id ? 'opacity-50 cursor-wait' : ''}`}
                          title={g.showcase ? 'Remover do showcase' : 'Adicionar ao showcase'}
                        >
                          {togglingShowcase === g.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Star className={`w-4 h-4 ${g.showcase ? 'fill-current' : ''}`} />
                          )}
                        </button>
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="md3-label-medium text-[var(--on-surface-variant)] capitalize">
                            {g.niche || '—'}
                          </span>
                          {g.showcase && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              SHOWCASE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {canShare && (
                            <button
                              onClick={() => shareImage(g.generated_image_url, `neksti_${g.id}.png`)}
                              aria-label="Compartilhar imagem"
                              className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="flex flex-col items-end gap-1">
                            <span className="md3-label-small text-[var(--outline)]">
                              {formatDate(g.created_at)}
                            </span>
                            {g.output_tokens && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                                <Gem className="w-2.5 h-2.5" /> {g.output_tokens}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {generations.length === 0 && (
                  <div className="text-center py-10 text-[var(--on-surface-variant)] md3-body-medium">
                    Nenhuma geração encontrada.
                  </div>
                )}
              </div>
            )}

            {/* Financeiro Tab */}
            {tab === 'financeiro' && (
              <div>
                {finLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                  </div>
                ) : financeiro ? (() => {
                  const rev = financeiro.revenue;
                  const usg = financeiro.usage;
                  const cst = financeiro.cost;

                  // Real cost in BRL cents
                  const totalCostBrlCents = Math.round(cst.totalUsd * usdToBrl * 100);
                  const monthCostBrlCents = Math.round(cst.monthUsd * usdToBrl * 100);
                  const todayCostBrlCents = Math.round(cst.todayUsd * usdToBrl * 100);
                  const marginCents = rev.total - totalCostBrlCents;
                  const marginPercent = rev.total > 0 ? ((marginCents / rev.total) * 100).toFixed(1) : '0';

                  const fmtBRL = (cents: number) =>
                    `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  const fmtUSD = (usd: number) =>
                    `$ ${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

                  return (
                    <>
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div>
                          <h2 className="md3-title-medium font-semibold text-[var(--foreground)] flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
                            Painel Financeiro
                          </h2>
                          <p className="md3-body-small text-[var(--on-surface-variant)] mt-1">
                            Receita × Custo Real (Vertex AI) × Margem
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 h-10 px-3 rounded-[var(--shape-full)] border border-[var(--outline)]/40 bg-[var(--surface-container-low)]">
                            <Settings2 className="w-3.5 h-3.5 text-[var(--on-surface-variant)]" />
                            <span className="md3-label-small text-[var(--on-surface-variant)] whitespace-nowrap">USD→BRL:</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={usdToBrl}
                              onChange={e => setUsdToBrl(parseFloat(e.target.value) || 0)}
                              className="w-16 bg-transparent text-[var(--foreground)] md3-label-medium outline-none text-center"
                            />
                          </div>
                          <button
                            onClick={refreshFinanceiro}
                            className="flex items-center gap-2 h-10 px-4 rounded-[var(--shape-full)] border border-[var(--outline)]/40 text-[var(--foreground)] md3-label-medium hover:bg-[var(--on-surface-variant)]/8 transition-all"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Atualizar
                          </button>
                        </div>
                      </div>

                      {/* KPI Cards Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                        {/* Receita Total */}
                        <div className="p-4 md:p-5 rounded-[var(--shape-large)] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="md3-label-medium text-[var(--on-surface-variant)]">Receita Total</span>
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className="text-2xl md:text-3xl font-bold text-emerald-500">{fmtBRL(rev.total)}</span>
                          <p className="md3-label-small text-[var(--on-surface-variant)] mt-1">
                            {financeiro.payments.length} pagamentos
                          </p>
                        </div>

                        {/* Custo Real Vertex AI */}
                        <div className="p-4 md:p-5 rounded-[var(--shape-large)] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="md3-label-medium text-[var(--on-surface-variant)]">Custo Real (API)</span>
                            <TrendingUp className="w-4 h-4 text-amber-500" />
                          </div>
                          <span className="text-2xl md:text-3xl font-bold text-amber-500">{fmtBRL(totalCostBrlCents)}</span>
                          <p className="md3-label-small text-[var(--on-surface-variant)] mt-1">
                            {fmtUSD(cst.totalUsd)} USD
                          </p>
                        </div>

                        {/* Margem */}
                        <div className="p-4 md:p-5 rounded-[var(--shape-large)] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="md3-label-medium text-[var(--on-surface-variant)]">Margem</span>
                            {marginCents > 0 ? (
                              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                            ) : marginCents < 0 ? (
                              <ArrowDownRight className="w-4 h-4 text-red-500" />
                            ) : (
                              <Minus className="w-4 h-4 text-[var(--on-surface-variant)]" />
                            )}
                          </div>
                          <span className={`text-2xl md:text-3xl font-bold ${marginCents >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {fmtBRL(marginCents)}
                          </span>
                          <p className="md3-label-small text-[var(--on-surface-variant)] mt-1">
                            {marginPercent}% de margem
                          </p>
                        </div>

                        {/* Custo Mês */}
                        <div className="p-4 md:p-5 rounded-[var(--shape-large)] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="md3-label-medium text-[var(--on-surface-variant)]">Custo no Mês</span>
                            <CreditCard className="w-4 h-4 text-[var(--primary)]" />
                          </div>
                          <span className="text-2xl md:text-3xl font-bold text-[var(--primary)]">{fmtBRL(monthCostBrlCents)}</span>
                          <p className="md3-label-small text-[var(--on-surface-variant)] mt-1">
                            Hoje: {fmtBRL(todayCostBrlCents)}
                          </p>
                        </div>
                      </div>

                      {/* Second Row: Cost Breakdown + Usage Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Vertex AI Cost Details */}
                        <div className="p-5 rounded-[var(--shape-large)] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20">
                          <h3 className="md3-title-small font-semibold text-[var(--foreground)] flex items-center gap-2 mb-4">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Custos Vertex AI (Gemini)
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Total gerações</span>
                              <span className="md3-title-medium font-bold text-[var(--foreground)]">{usg.totalGenerations.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Custo total (USD)</span>
                              <span className="md3-title-medium font-bold text-amber-500">{fmtUSD(cst.totalUsd)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Custo médio/geração</span>
                              <span className="md3-title-medium font-bold text-amber-500">{fmtUSD(cst.avgCostPerGenUsd)}</span>
                            </div>
                            <hr className="border-[var(--outline-variant)]/20" />
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Tokens de entrada</span>
                              <span className="md3-title-medium font-bold text-[var(--on-surface-variant)]">{cst.totalInputTokens.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Tokens de saída</span>
                              <span className="md3-title-medium font-bold text-[var(--on-surface-variant)]">{cst.totalOutputTokens.toLocaleString('pt-BR')}</span>
                            </div>
                            <hr className="border-[var(--outline-variant)]/20" />
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Custo total (BRL)</span>
                              <span className="md3-title-medium font-bold text-amber-500">{fmtBRL(totalCostBrlCents)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Usage Stats */}
                        <div className="p-5 rounded-[var(--shape-large)] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20">
                          <h3 className="md3-title-small font-semibold text-[var(--foreground)] flex items-center gap-2 mb-4">
                            <PieChart className="w-4 h-4 text-[var(--primary)]" />
                            Receita × Custo
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Créditos comprados</span>
                              <span className="md3-title-medium font-bold text-[var(--foreground)]">{usg.totalCreditsPurchased.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Gerações grátis (3 iniciais)</span>
                              <span className="md3-title-medium font-bold text-[var(--on-surface-variant)]">{usg.freeCreditsUsed.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Créditos restantes</span>
                              <span className="md3-title-medium font-bold text-[var(--primary)]">{usg.totalCreditsRemaining.toLocaleString('pt-BR')}</span>
                            </div>
                            <hr className="border-[var(--outline-variant)]/20" />
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Receita por geração</span>
                              <span className="md3-title-medium font-bold text-emerald-500">
                                {usg.totalGenerations > 0
                                  ? fmtBRL(Math.round(rev.total / usg.totalGenerations))
                                  : '—'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Custo real por geração</span>
                              <span className="md3-title-medium font-bold text-amber-500">
                                {usg.totalGenerations > 0
                                  ? fmtBRL(Math.round(totalCostBrlCents / usg.totalGenerations))
                                  : '—'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="md3-body-medium text-[var(--on-surface-variant)]">Margem por geração</span>
                              <span className={`md3-title-medium font-bold ${marginCents >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {usg.totalGenerations > 0
                                  ? fmtBRL(Math.round(marginCents / usg.totalGenerations))
                                  : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Monthly Cost Trend */}
                      {cst.monthlyCostTrend.length > 0 && (
                        <div className="p-5 rounded-[var(--shape-large)] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 mb-6">
                          <h3 className="md3-title-small font-semibold text-[var(--foreground)] flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-amber-500" />
                            Custo Mensal (Vertex AI)
                          </h3>
                          <div className="flex items-end gap-2 h-32">
                            {cst.monthlyCostTrend.map((m) => {
                              const maxCost = Math.max(...cst.monthlyCostTrend.map(t => t.costUsd), 0.01);
                              const height = m.costUsd > 0 ? Math.max((m.costUsd / maxCost) * 100, 4) : 4;
                              const costBrl = Math.round(m.costUsd * usdToBrl * 100);
                              return (
                                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                  <span className="md3-label-small text-[var(--on-surface-variant)] text-center">
                                    {m.costUsd > 0 ? fmtBRL(costBrl) : '—'}
                                  </span>
                                  <div
                                    className={`w-full rounded-t-[var(--shape-small)] transition-all duration-500 ${
                                      m.costUsd > 0 ? 'bg-amber-500' : 'bg-[var(--surface-container-highest)]'
                                    }`}
                                    style={{ height: `${height}%` }}
                                  />
                                  <span className="md3-label-small text-[var(--on-surface-variant)] text-center whitespace-nowrap">
                                    {m.month}
                                  </span>
                                  <span className="md3-label-small text-[var(--outline)] text-center">
                                    {m.generations}x
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Revenue Trend */}
                      {rev.monthlyTrend.length > 0 && (
                        <div className="p-5 rounded-[var(--shape-large)] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 mb-6">
                          <h3 className="md3-title-small font-semibold text-[var(--foreground)] flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-emerald-500" />
                            Receita Mensal
                          </h3>
                          <div className="flex items-end gap-2 h-32">
                            {rev.monthlyTrend.map((m) => {
                              const maxRev = Math.max(...rev.monthlyTrend.map(t => t.revenue), 1);
                              const height = m.revenue > 0 ? Math.max((m.revenue / maxRev) * 100, 4) : 4;
                              return (
                                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                  <span className="md3-label-small text-[var(--on-surface-variant)] text-center">
                                    {m.revenue > 0 ? fmtBRL(m.revenue) : '—'}
                                  </span>
                                  <div
                                    className={`w-full rounded-t-[var(--shape-small)] transition-all duration-500 ${
                                      m.revenue > 0 ? 'bg-emerald-500' : 'bg-[var(--surface-container-highest)]'
                                    }`}
                                    style={{ height: `${height}%` }}
                                  />
                                  <span className="md3-label-small text-[var(--on-surface-variant)] text-center whitespace-nowrap">
                                    {m.month}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Per-User Breakdown */}
                      <div className="rounded-[var(--shape-large)] border border-[var(--outline-variant)]/20 overflow-hidden">
                        <div className="px-4 py-3 bg-[var(--surface-container-high)] border-b border-[var(--outline-variant)]/20">
                          <h3 className="md3-title-small font-semibold text-[var(--foreground)] flex items-center gap-2">
                            <Users className="w-4 h-4 text-[var(--primary)]" />
                            Breakdown por Usuário
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-[var(--surface-container)] border-b border-[var(--outline-variant)]/20">
                                <th className="text-left px-4 py-3 md3-label-medium text-[var(--on-surface-variant)]">Usuário</th>
                                <th className="text-center px-3 py-3 md3-label-medium text-[var(--on-surface-variant)]">Plano</th>
                                <th className="text-right px-3 py-3 md3-label-medium text-emerald-500">Receita</th>
                                <th className="text-center px-3 py-3 md3-label-medium text-[var(--on-surface-variant)]">Gerações</th>
                                <th className="text-right px-3 py-3 md3-label-medium text-amber-500">Custo Real</th>
                                <th className="text-right px-4 py-3 md3-label-medium text-[var(--on-surface-variant)]">Margem</th>
                              </tr>
                            </thead>
                            <tbody>
                              {financeiro.userBreakdown.map((u) => {
                                const uCostBrl = Math.round(u.costUsd * usdToBrl * 100);
                                const uMargin = u.revenue - uCostBrl;
                                return (
                                  <tr key={u.id} className="border-b border-[var(--outline-variant)]/10 hover:bg-[var(--surface-container-high)]/50 transition-colors">
                                    <td className="px-4 py-3">
                                      <div className="md3-body-medium text-[var(--foreground)]">{u.email || '—'}</div>
                                      <div className="md3-label-small text-[var(--outline)]">
                                        {u.creditsRemaining} créditos restantes
                                      </div>
                                    </td>
                                    <td className="text-center px-3 py-3">
                                      {u.plans.length > 0 ? (
                                        <div className="flex flex-wrap justify-center gap-1">
                                          {u.plans.map(p => (
                                            <span key={p} className="px-2 py-0.5 rounded-[var(--shape-full)] bg-[var(--primary)]/10 text-[var(--primary)] md3-label-small">
                                              {p}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="md3-label-small text-[var(--outline)]">Free</span>
                                      )}
                                    </td>
                                    <td className="text-right px-3 py-3 md3-body-medium font-semibold text-emerald-500">
                                      {u.revenue > 0 ? fmtBRL(u.revenue) : '—'}
                                    </td>
                                    <td className="text-center px-3 py-3 md3-body-medium text-[var(--on-surface-variant)]">
                                      {u.totalGenerations}
                                    </td>
                                    <td className="text-right px-3 py-3 md3-body-medium text-amber-500">
                                      {fmtBRL(uCostBrl)}
                                    </td>
                                    <td className="text-right px-4 py-3">
                                      <span className={`md3-body-medium font-semibold ${uMargin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {fmtBRL(uMargin)}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          {financeiro.userBreakdown.length === 0 && (
                            <div className="text-center py-10 text-[var(--on-surface-variant)] md3-body-medium">
                              Nenhum usuário com atividade ou pagamento.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recent Payments */}
                      {financeiro.payments.length > 0 && (
                        <div className="mt-6 rounded-[var(--shape-large)] border border-[var(--outline-variant)]/20 overflow-hidden">
                          <div className="px-4 py-3 bg-[var(--surface-container-high)] border-b border-[var(--outline-variant)]/20">
                            <h3 className="md3-title-small font-semibold text-[var(--foreground)] flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-emerald-500" />
                              Últimos Pagamentos
                            </h3>
                          </div>
                          <div className="divide-y divide-[var(--outline-variant)]/10">
                            {financeiro.payments.slice(0, 20).map((p) => (
                              <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--surface-container-high)]/50 transition-colors">
                                <div>
                                  <div className="md3-body-medium text-[var(--foreground)]">{p.email || '—'}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="px-2 py-0.5 rounded-[var(--shape-full)] bg-[var(--primary)]/10 text-[var(--primary)] md3-label-small">
                                      {p.plan}
                                    </span>
                                    <span className="md3-label-small text-[var(--outline)]">
                                      {p.credits} créditos
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="md3-body-medium font-semibold text-emerald-500">
                                    {fmtBRL(p.amount_cents)}
                                  </div>
                                  <div className="md3-label-small text-[var(--outline)]">
                                    {new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Info Footer */}
                      <div className="mt-6 p-4 rounded-[var(--shape-large)] bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/10">
                        <p className="md3-label-medium text-[var(--on-surface-variant)] mb-2">Sobre os cálculos</p>
                        <div className="md3-body-small text-[var(--on-surface-variant)] space-y-1">
                          <p>• <strong>Custo Real</strong> = rastreado direto da API Vertex AI (tokens de entrada + custo fixo por imagem gerada). Armazenado por geração no banco.</p>
                          <p>• <strong>Conversão</strong> = USD → BRL usando câmbio de R$ {usdToBrl.toFixed(2).replace('.', ',')} (ajustável acima).</p>
                          <p>• <strong>Margem</strong> = Receita (Stripe) − Custo Real (API). Não inclui custos fixos (servidor, domínio, Supabase, etc).</p>
                          <p>• Gerações anteriores ao rastreamento usam custo estimado de $0.04/geração (backfill da migration).</p>
                        </div>
                      </div>
                    </>
                  );
                })() : (
                  <div className="text-center py-10 text-[var(--on-surface-variant)] md3-body-medium">
                    Erro ao carregar dados financeiros. Verifique se a tabela <code>payments</code> existe no Supabase.
                  </div>
                )}
              </div>
            )}

            {/* API Routes Tab */}
            {tab === 'api' && (
              <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="md3-title-medium font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[var(--primary)]" />
                      Monitoramento de API Routes
                    </h2>
                    <p className="md3-body-small text-[var(--on-surface-variant)] mt-1">
                      Teste e valide as rotas em tempo real. Rotas seguras podem ser testadas sem efeitos colaterais.
                    </p>
                  </div>
                  <button
                    onClick={testAllSafe}
                    disabled={!!testingRoute}
                    className="flex items-center gap-2 h-10 px-5 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-large hover:elevation-1 transition-all disabled:opacity-50"
                  >
                    {testingRoute ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Testar Todas (seguras)
                  </button>
                </div>

                {/* Route Cards */}
                <div className="space-y-3">
                  {API_ROUTES.map((route) => {
                    const result = routeResults[route.id];
                    const isTesting = testingRoute === route.id;

                    return (
                      <div
                        key={route.id}
                        className="rounded-[var(--shape-large)] border border-[var(--outline-variant)]/20 bg-[var(--surface-container)] overflow-hidden"
                      >
                        {/* Route Header */}
                        <div className="px-4 py-3 flex items-center gap-3">
                          {/* Method badge */}
                          <span
                            className={`shrink-0 px-2.5 py-1 rounded-[var(--shape-small)] md3-label-medium font-mono font-bold
                              ${route.method === 'GET'
                                ? 'bg-emerald-500/15 text-emerald-600'
                                : 'bg-amber-500/15 text-amber-600'
                              }`}
                          >
                            {route.method}
                          </span>

                          {/* Path + Description */}
                          <div className="flex-1 min-w-0">
                            <p className="md3-body-medium text-[var(--foreground)] font-mono text-sm truncate">
                              {route.path}
                            </p>
                            <p className="md3-label-small text-[var(--on-surface-variant)] mt-0.5">
                              {route.description}
                              {route.needsAuth && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] md3-label-small">
                                  Auth
                                </span>
                              )}
                              {!route.safe && (
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-[var(--error)]/10 text-[var(--error)] md3-label-small">
                                  Side-effect
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Status indicator */}
                          <div className="shrink-0 flex items-center gap-2">
                            {result && (
                              <div className="flex items-center gap-1.5 mr-2">
                                {result.ok ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-[var(--error)]" />
                                )}
                                <span className={`md3-label-medium font-mono ${result.ok ? 'text-emerald-500' : 'text-[var(--error)]'}`}>
                                  {result.status}
                                </span>
                                <div className="flex items-center gap-0.5 text-[var(--on-surface-variant)]">
                                  <Clock className="w-3 h-3" />
                                  <span className="md3-label-small">{result.ms}ms</span>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => testRoute(route)}
                              disabled={!!testingRoute}
                              className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--shape-full)] border border-[var(--outline)]/40 text-[var(--foreground)] md3-label-medium hover:bg-[var(--on-surface-variant)]/8 transition-all disabled:opacity-40"
                            >
                              {isTesting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                              Testar
                            </button>
                          </div>
                        </div>

                        {/* Response body (expandable) */}
                        {result && (
                          <div className="border-t border-[var(--outline-variant)]/10 px-4 py-3 bg-[var(--surface-container-low)]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="md3-label-small text-[var(--outline)]">
                                Resposta — {result.testedAt}
                              </span>
                              <span className={`md3-label-small font-mono px-2 py-0.5 rounded ${
                                result.ok
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-[var(--error)]/10 text-[var(--error)]'
                              }`}>
                                HTTP {result.status} · {result.ms}ms
                              </span>
                            </div>
                            <pre className="text-xs p-3 rounded-[var(--shape-medium)] bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)] overflow-x-auto whitespace-pre-wrap break-words max-h-48 overflow-y-auto font-mono">
                              {result.body}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 p-4 rounded-[var(--shape-large)] bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/10">
                  <p className="md3-label-medium text-[var(--on-surface-variant)] mb-2">Legenda</p>
                  <div className="flex flex-wrap gap-4 md3-label-small text-[var(--on-surface-variant)]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> GET — Leitura segura</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> POST — Escrita/ação</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> 2xx — Sucesso</span>
                    <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-[var(--error)]" /> 4xx/5xx — Erro</span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)]">Auth</span>
                    <span>= Requer autenticação</span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--error)]/10 text-[var(--error)]">Side-effect</span>
                    <span>= Causa efeito colateral</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <ShareToast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
