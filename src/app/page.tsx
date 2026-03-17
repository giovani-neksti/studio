'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Lock, Mail, ArrowRight, UserPlus } from 'lucide-react';

const portals = [
  {
    niche: 'jewelry',
    label: 'Joalheria',
    // ÍCONE GIGANTE NO QUADRANTE
    icon: <img src="/logo.png" alt="Logo joIAs" className="h-20 md:h-24 w-auto object-contain" />,
    description: 'Crie imagens de luxo para joias, colares, anéis e pulseiras',
    gradient: 'from-yellow-900/30 via-amber-900/20 to-transparent',
    border: 'hover:border-yellow-500/60',
    activeBorder: 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]',
    accent: '#D4AF37',
    accentHover: 'hover:shadow-yellow-500/20',
    badge: 'LUXO',
    badgeBg: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30',
    enabled: true, // Portal Ativo
  },
  {
    niche: 'clothing',
    label: 'Moda & Roupas',
    icon: <span className="text-5xl">👗</span>,
    description: 'Produza editoriais limpos e modernos para sua coleção',
    gradient: 'from-gray-100/80 via-gray-200/40 to-transparent',
    border: 'border-white/5',
    activeBorder: '',
    accent: '#ffffff',
    accentHover: '',
    badge: 'EM BREVE',
    badgeBg: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
    enabled: false, // Portal Inativo
  },
  {
    niche: 'shoes',
    label: 'Calçados',
    icon: <span className="text-5xl">👟</span>,
    description: 'Imagens urbanas de alto impacto para tênis, botas e mais',
    gradient: 'from-gray-900/30 via-gray-800/20 to-transparent',
    border: 'border-white/5',
    activeBorder: '',
    accent: '#888888',
    accentHover: '',
    badge: 'EM BREVE',
    badgeBg: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
    enabled: false, // Portal Inativo
  },
];

const mockUsers = {
  'joias@studio.ai': { password: '123', niche: 'jewelry' }
};

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNicheSelect = (niche: string, isEnabled: boolean) => {
    if (!isEnabled) return;
    setSelectedNiche(niche);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    const user = mockUsers[email as keyof typeof mockUsers];

    if (!user || user.password !== password) {
      setError('E-mail ou senha incorretos.');
      setIsLoading(false);
      return;
    }

    if (user.niche !== selectedNiche) {
      const portalNames: Record<string, string> = {
        jewelry: 'Joalheria',
        clothing: 'Moda',
        shoes: 'Calçados',
      };
      setError(`Credenciais inválidas para este portal. Sua conta pertence ao portal ${portalNames[user.niche]}.`);
      setIsLoading(false);
      return;
    }

    router.push(`/studio?niche=${selectedNiche}`);
  };

  const selectedPortalDef = portals.find(p => p.niche === selectedNiche);

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center relative overflow-hidden py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div
        className={`relative z-10 w-full max-w-5xl mx-auto px-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
      >
        <div className="text-center mb-12">

          {/* LOGO DO TOPO AINDA MAIOR */}
          <div className="flex justify-center mb-8">
            <img
              src="/logo.png"
              alt="Logo joIAs"
              className="h-24 md:h-32 w-auto object-contain"
            />
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight mb-4">
            Studio{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">AI</span>
            </span>
          </h1>

          <p className="text-white/40 text-lg max-w-md mx-auto leading-relaxed">
            Selecione seu portal para acessar a plataforma de fotografia assistida por IA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {portals.map((portal, index) => {
            const isSelected = selectedNiche === portal.niche;
            const isDimmed = selectedNiche && !isSelected;

            const blockedClass = !portal.enabled ? 'grayscale opacity-50 cursor-not-allowed' : '';

            return (
              <button
                key={portal.niche}
                onClick={() => handleNicheSelect(portal.niche, portal.enabled)}
                onMouseEnter={() => portal.enabled && setHoveredIndex(index)}
                onMouseLeave={() => portal.enabled && setHoveredIndex(null)}
                disabled={!portal.enabled}
                className={`group relative text-left rounded-2xl border bg-black backdrop-blur-sm p-8 
                  transition-all duration-300 overflow-hidden
                  ${isSelected ? portal.activeBorder : portal.border} 
                  ${isDimmed ? 'opacity-40 scale-[0.98]' : portal.enabled ? 'hover:shadow-2xl hover:-translate-y-1' : ''}
                  ${blockedClass}
                `}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} transition-opacity duration-300
                    ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                />

                <div className="relative z-10">
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider mb-6 ${portal.badgeBg}`}>
                    {portal.badge}
                  </div>

                  <div className={`mb-5 block transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {portal.icon}
                  </div>

                  <h2 className="text-white text-xl font-bold mb-2 transition-colors">
                    {portal.label}
                  </h2>
                  <p className="text-white/40 text-sm leading-relaxed mb-6">{portal.description}</p>

                  <div
                    className="flex items-center gap-2 text-sm font-semibold transition-all duration-200"
                    style={{ color: isSelected || hoveredIndex === index ? portal.accent : 'rgba(255,255,255,0.4)' }}
                  >
                    <span>
                      {!portal.enabled ? 'Lançamento em Breve' : isSelected ? 'Portal Selecionado' : 'Selecionar Portal'}
                    </span>
                    {portal.enabled && (
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'translate-x-2' : 'group-hover:translate-x-1'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div
          className={`max-w-md mx-auto transition-all duration-500 overflow-hidden ${selectedNiche ? 'opacity-100 translate-y-0 h-auto mb-12' : 'opacity-0 translate-y-8 h-0 mb-0'
            }`}
        >
          {selectedPortalDef && (
            <div className="bg-black border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Acesso — {selectedPortalDef.label}</h3>
                <p className="text-white/40 text-sm">Insira suas credenciais corporativas</p>
                <div className="mt-3 text-xs text-white/30 font-mono">
                  Mock: joias@studio.ai (senha: 123)
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      type="email"
                      placeholder="E-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-black border-white/10 text-white placeholder:text-white/20 pl-11 h-12 rounded-xl focus-visible:ring-1"
                      style={{ '--ring': selectedPortalDef.accent } as React.CSSProperties}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      type="password"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-black border-white/10 text-white placeholder:text-white/20 pl-11 h-12 rounded-xl focus-visible:ring-1"
                      style={{ '--ring': selectedPortalDef.accent } as React.CSSProperties}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold rounded-xl text-black transition-all hover:opacity-90"
                    style={{ backgroundColor: selectedPortalDef.accent }}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        Entrar no Portal <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-12 text-white/50 hover:text-white hover:bg-white/5 rounded-xl"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Conta Comercial
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-white/20 text-xs tracking-widest font-mono uppercase">
            Powered by Neksti · studio.neksti.com.br
          </p>
        </div>
      </div>
    </div>
  );
}