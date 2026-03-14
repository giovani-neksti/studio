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
    icon: '💎',
    description: 'Crie imagens de luxo para joias, colares, anéis e pulseiras',
    gradient: 'from-yellow-900/30 via-amber-900/20 to-transparent',
    border: 'hover:border-yellow-500/60',
    activeBorder: 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]',
    accent: '#D4AF37',
    accentHover: 'hover:shadow-yellow-500/20',
    badge: 'LUXO',
    badgeBg: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30',
  },
  {
    niche: 'clothing',
    label: 'Moda & Roupas',
    icon: '👗',
    description: 'Produza editoriais limpos e modernos para sua coleção',
    gradient: 'from-gray-100/80 via-gray-200/40 to-transparent',
    border: 'hover:border-gray-400',
    activeBorder: 'border-white shadow-[0_0_30px_rgba(255,255,255,0.15)]',
    accent: '#ffffff',
    accentHover: 'hover:shadow-gray-400/20',
    badge: 'EDITORIAL',
    badgeBg: 'bg-gray-500/10 text-gray-300 border border-gray-500/30',
  },
  {
    niche: 'shoes',
    label: 'Calçados',
    icon: '👟',
    description: 'Imagens urbanas de alto impacto para tênis, botas e mais',
    gradient: 'from-orange-900/30 via-red-900/20 to-transparent',
    border: 'hover:border-orange-500/60',
    activeBorder: 'border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]',
    accent: '#FF5722',
    accentHover: 'hover:shadow-orange-500/20',
    badge: 'URBANO',
    badgeBg: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
  },
];

// Mock database
const mockUsers = {
  'joias@studio.ai': { password: '123', niche: 'jewelry' },
  'moda@studio.ai': { password: '123', niche: 'clothing' },
  'sapatos@studio.ai': { password: '123', niche: 'shoes' },
};

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNicheSelect = (niche: string) => {
    setSelectedNiche(niche);
    setError(''); // clear errors when switching
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
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

    // Success
    router.push(`/studio?niche=${selectedNiche}`);
  };

  const selectedPortalDef = portals.find(p => p.niche === selectedNiche);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center relative overflow-hidden py-12">
      {/* Ambient background effects */}
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
        className={`relative z-10 w-full max-w-5xl mx-auto px-6 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-white/30 text-sm font-mono tracking-widest uppercase">neksti.com.br</span>
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

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {portals.map((portal, index) => {
            const isSelected = selectedNiche === portal.niche;
            const isDimmed = selectedNiche && !isSelected;

            return (
              <button
                key={portal.niche}
                onClick={() => handleNicheSelect(portal.niche)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative text-left rounded-2xl border bg-white/[0.03] backdrop-blur-sm p-8 
                  transition-all duration-300 overflow-hidden
                  ${isSelected ? portal.activeBorder : 'border-white/5 ' + portal.border} 
                  ${isDimmed ? 'opacity-40 scale-[0.98]' : 'hover:shadow-2xl hover:-translate-y-1'}
                `}
              >
                {/* Card gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} transition-opacity duration-300
                    ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                />

                <div className="relative z-10">
                  {/* Badge */}
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider mb-6 ${portal.badgeBg}`}>
                    {portal.badge}
                  </div>

                  {/* Icon */}
                  <div className={`text-5xl mb-5 block transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {portal.icon}
                  </div>

                  {/* Text */}
                  <h2 className="text-white text-xl font-bold mb-2 group-hover:text-white transition-colors">
                    {portal.label}
                  </h2>
                  <p className="text-white/40 text-sm leading-relaxed mb-6">{portal.description}</p>

                  <div
                    className="flex items-center gap-2 text-sm font-semibold transition-all duration-200"
                    style={{ color: isSelected || hoveredIndex === index ? portal.accent : 'rgba(255,255,255,0.4)' }}
                  >
                    <span>{isSelected ? 'Portal Selecionado' : 'Selecionar Portal'}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'translate-x-2' : 'group-hover:translate-x-1'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Inline Login Form */}
        <div 
          className={`max-w-md mx-auto transition-all duration-500 overflow-hidden ${
            selectedNiche ? 'opacity-100 translate-y-0 h-auto mb-12' : 'opacity-0 translate-y-8 h-0 mb-0'
          }`}
        >
          {selectedPortalDef && (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Acesso — {selectedPortalDef.label}</h3>
                <p className="text-white/40 text-sm">Insira suas credenciais corporativas</p>
                <div className="mt-3 text-xs text-white/30 font-mono">
                  Mocks: joias@studio.ai | moda@studio.ai | sapatos@studio.ai (senha: 123)
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
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/20 pl-11 h-12 rounded-xl focus-visible:ring-1"
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
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/20 pl-11 h-12 rounded-xl focus-visible:ring-1"
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

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/20 text-xs tracking-widest font-mono uppercase">
            Powered by Neksti · studio.neksti.com.br
          </p>
        </div>
      </div>
    </div>
  );
}
