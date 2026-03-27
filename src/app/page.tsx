'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, Camera, Zap, ShieldCheck, ArrowRight, Star, Play, Gem, Shirt, Footprints } from 'lucide-react';
import { NeuralBackground } from '@/components/NeuralBackground';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/20 overflow-x-hidden">

      {/* Neural network animated background */}
      <NeuralBackground />

      {/* ── M3 Top App Bar — Small ── */}
      <nav className="h-16 flex items-center justify-between px-4 md:px-6 fixed top-0 w-full z-50 bg-[var(--surface-container-low)]/80 backdrop-blur-lg border-b border-[var(--outline-variant)]/20">
        <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
          <img src="/logo_neksti.png" alt="Neksti" className="h-8 md:h-9 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
        </div>
        <button
          onClick={() => router.push('/auth')}
          className="h-10 px-6 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-large transition-all duration-[var(--duration-medium2)] hover:shadow-lg hover:elevation-2 active:scale-[0.98] state-layer"
        >
          Entrar no Estúdio
        </button>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-28 pb-16 md:pt-44 md:pb-28 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* M3 Assist Chip */}
          <div className="animate-fade-up inline-flex items-center gap-2 h-8 px-4 rounded-[var(--shape-small)] bg-[var(--surface-container-high)]/80 backdrop-blur-sm border border-[var(--outline-variant)]/40 text-[var(--on-surface-variant)] md3-label-medium mb-8">
            <Star className="w-3.5 h-3.5 text-[var(--primary)] fill-[var(--primary)]" />
            <span>Redefinindo a Fotografia Digital</span>
          </div>

          <h1 className="animate-fade-up stagger-1 font-serif text-[clamp(2.5rem,7vw,4.5rem)] font-bold tracking-tight mb-6 max-w-4xl leading-[1.08]">
            Transforme Fotos de Celular em{' '}
            <span className="text-gradient">Estúdio Profissional</span>
          </h1>

          <p className="animate-fade-up stagger-2 text-[var(--on-surface-variant)] md3-body-large md:text-xl max-w-2xl mb-10 leading-relaxed">
            A primeira plataforma de IA brasileira focada em compor cenários de luxo para joias, moda e calçados em segundos.
          </p>

          {/* M3 Button Group — Filled + Tonal */}
          <div className="animate-fade-up stagger-3 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.push('/auth')}
              className="h-14 px-8 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-large flex items-center justify-center gap-3 transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] hover:elevation-2 active:scale-[0.98] state-layer group"
            >
              Começar Agora <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-[var(--duration-short4)]" />
            </button>
            <button
              className="h-14 px-8 rounded-[var(--shape-full)] bg-[var(--secondary-container)]/80 backdrop-blur-sm text-[var(--on-secondary-container)] md3-label-large transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] hover:elevation-1 active:scale-[0.98] state-layer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Ver Demonstração
            </button>
          </div>

          {/* M3 Suggestion Chips — Niche indicators */}
          <div className="animate-fade-up stagger-4 mt-14 flex flex-wrap justify-center gap-2">
            {[
              { icon: <Gem className="w-3.5 h-3.5" />, label: 'Joalheria' },
              { icon: <Shirt className="w-3.5 h-3.5" />, label: 'Moda' },
              { icon: <Footprints className="w-3.5 h-3.5" />, label: 'Calçados' },
            ].map((chip) => (
              <div
                key={chip.label}
                className="inline-flex items-center gap-2 h-8 px-4 rounded-[var(--shape-small)] border border-[var(--outline-variant)]/40 text-[var(--on-surface-variant)] md3-label-medium transition-colors duration-[var(--duration-short4)] hover:bg-[var(--surface-container-high)]/60 backdrop-blur-sm"
              >
                {chip.icon}
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section — M3 Filled Cards ── */}
      <section className="py-16 md:py-24 bg-[var(--surface-container-lowest)]/90 backdrop-blur-sm relative px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 animate-fade-up">Como funciona</h2>
            <p className="text-[var(--on-surface-variant)] md3-body-large max-w-xl mx-auto animate-fade-up stagger-1">
              Três passos simples para transformar suas fotos de produto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                icon: <Camera className="w-6 h-6" />,
                step: '01',
                title: 'Envie a Foto',
                description: 'Tire uma foto com seu celular. Sem câmeras profissionais, sem estúdios — só o produto e a IA.'
              },
              {
                icon: <Zap className="w-6 h-6" />,
                step: '02',
                title: 'Compose o Cenário',
                description: 'Escolha fundos, expositor, iluminação e adereços. A IA gera o prompt perfeito para você.'
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                step: '03',
                title: 'Resultado Premium',
                description: 'Em 15 segundos, sua foto estará pronta para e-commerce, redes sociais e catálogos profissionais.'
              }
            ].map((feature, idx) => (
              <div
                key={feature.step}
                className={`animate-fade-up stagger-${idx + 1} group p-6 md:p-8 rounded-[var(--shape-extra-large)] bg-[var(--surface-container)]/80 backdrop-blur-sm border border-[var(--outline-variant)]/20 transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] hover:bg-[var(--surface-container-high)] hover:elevation-1`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-[var(--shape-large)] bg-[var(--primary-container)] flex items-center justify-center text-[var(--on-primary-container)] group-hover:scale-105 transition-transform duration-[var(--duration-medium2)]">
                    {feature.icon}
                  </div>
                  <span className="md3-label-small text-[var(--outline)]">{feature.step}</span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[var(--on-surface-variant)] md3-body-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner — M3 Filled Card ── */}
      <section className="py-16 md:py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto rounded-[var(--shape-extra-large)] bg-[var(--primary-container)] p-10 md:p-16 text-center relative overflow-hidden elevation-2">
          <div className="absolute inset-0 bg-[var(--primary)]/[0.04] pointer-events-none" />
          <h2 className="font-serif text-3xl md:text-[2.75rem] font-bold mb-6 text-[var(--on-primary-container)] leading-tight relative z-10">
            Pronto para elevar sua marca?
          </h2>
          <p className="text-[var(--on-primary-container)]/80 md3-body-large mb-10 max-w-lg mx-auto relative z-10">
            Junte-se a milhares de empreendedores que já economizam tempo e dinheiro com o Neksti Studio.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="relative z-10 h-14 px-10 rounded-[var(--shape-full)] bg-[var(--on-primary-container)] text-[var(--primary-container)] md3-label-large transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] hover:elevation-3 active:scale-[0.98] state-layer"
          >
            Começar Grátis
          </button>
        </div>
      </section>

      {/* ── Footer — M3 Surface Container ── */}
      <footer className="py-10 border-t border-[var(--outline-variant)]/20 px-6 bg-[var(--surface-container-lowest)]/90 backdrop-blur-sm relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[var(--shape-small)] bg-[var(--primary)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[var(--on-primary)]" />
            </div>
            <span className="font-serif text-base font-bold">Neksti Studio</span>
          </div>
          <div className="flex gap-6 text-[var(--on-surface-variant)] md3-body-medium">
            <a href="/termos" className="hover:text-[var(--primary)] transition-colors duration-[var(--duration-short4)]">Termos</a>
            <a href="/privacidade" className="hover:text-[var(--primary)] transition-colors duration-[var(--duration-short4)]">Privacidade</a>
            <a href="#" className="hover:text-[var(--primary)] transition-colors duration-[var(--duration-short4)]">Contato</a>
          </div>
          <p className="text-[var(--outline)] md3-body-small">
            © 2026 Neksti. Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}
