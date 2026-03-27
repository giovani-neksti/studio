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
} from 'lucide-react';

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
  credits: number;
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
}

type Tab = 'overview' | 'users' | 'generations' | 'errors';

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
    { key: 'generations', label: 'Gerações Recentes' },
    { key: 'errors', label: 'Erros' },
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
                        <th className="text-center px-4 py-3 md3-label-medium text-[var(--on-surface-variant)]">Créditos</th>
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
                                ${u.credits === 0
                                  ? 'bg-[var(--error-container)] text-[var(--on-error-container)]'
                                  : 'bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                                }`}
                            >
                              {u.credits}
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
                <p className="md3-label-medium text-[var(--on-surface-variant)] mb-4">
                  Últimas 50 gerações
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generations.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-[var(--shape-large)] border border-[var(--outline-variant)]/20 bg-[var(--surface-container)] overflow-hidden"
                    >
                      <div className="flex h-40">
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
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <span className="md3-label-medium text-[var(--on-surface-variant)] capitalize">
                          {g.niche || '—'}
                        </span>
                        <span className="md3-label-small text-[var(--outline)]">
                          {formatDate(g.created_at)}
                        </span>
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
          </>
        )}
      </main>
    </div>
  );
}
