'use client';

import { useEffect } from 'react';
import { Check, X, Zap } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  userId?: string;
}

export function PricingModal({ isOpen, onOpenChange, userEmail, userId }: PricingModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  const plans = [
    {
      name: 'Essentials',
      price: '400',
      credits: '200',
      perCredit: 'R$ 2,00',
      description: 'Ideal para validar produtos com imagens profissionais.',
      features: ['200 fotos mensais', 'Acesso a todos os nichos', 'Formatos sociais', 'R$ 2,00 por foto'],
      popular: false,
      stripeUrl: 'https://buy.stripe.com/28E9AL0NDck7aiDcRJ6Ri07',
    },
    {
      name: 'Professional',
      price: '600',
      credits: '400',
      perCredit: 'R$ 1,50',
      description: 'O dobro de fotos por uma fração do preço. O favorito.',
      features: ['400 fotos mensais', 'Acesso a todos os nichos', 'Formatos sociais', 'Prioridade na fila de geração', 'R$ 1,50 por foto'],
      popular: true,
      stripeUrl: 'https://buy.stripe.com/cNi6oz67Xbg34YjeZR6Ri06',
    },
    {
      name: 'Premium',
      price: '1.000',
      credits: '1.000',
      perCredit: 'R$ 1,00',
      description: 'Para alto volume de postagens e franqueados.',
      features: ['1.000 fotos mensais', 'Suporte dedicado via WhatsApp', 'Acesso a todos os nichos', 'Acesso Antecipado a Modelos', 'R$ 1,00 por foto'],
      popular: false,
      stripeUrl: 'https://buy.stripe.com/28E5kv0ND83R3Ufg3V6Ri08',
    }
  ];

  const buildStripeUrl = (baseUrl: string) => {
    const params = new URLSearchParams();
    if (userEmail) params.set('prefilled_email', userEmail);
    if (userId) params.set('client_reference_id', userId);
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  return (
    /* M3 Full-screen Dialog (mobile) / Dialog (desktop) */
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-[var(--on-surface)]/32 p-0 md:p-10"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-dialog-title"
        className="bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-t-[var(--shape-extra-large)] md:rounded-[var(--shape-extra-large)] w-full max-w-5xl relative flex flex-col overflow-y-auto max-h-[92dvh] md:max-h-[90vh] elevation-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* M3 Close — Icon Button */}
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-[var(--on-surface-variant)] hover:text-[var(--foreground)] bg-[var(--surface-container-highest)] rounded-[var(--shape-full)] w-10 h-10 flex items-center justify-center transition-colors duration-[var(--duration-short4)] z-10"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="px-6 md:px-8 py-10 md:py-12 text-center border-b border-[var(--outline-variant)]/20">
          <h2 id="pricing-dialog-title" className="font-serif md3-headline-medium font-bold text-[var(--foreground)] mb-3">Escale as vendas da sua loja</h2>
          <p className="text-[var(--on-surface-variant)] md3-body-large max-w-2xl mx-auto">
            Faça upgrade para gerar muito mais composições em alta qualidade por uma fração do preço de um estúdio fotográfico.
          </p>
        </div>

        {/* Plans Grid — M3 Cards */}
        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[var(--shape-extra-large)] border p-5 md:p-6 transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)]
                  ${plan.popular
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 md:scale-[1.02] elevation-2'
                    : 'border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)]'}`}
              >
                {/* M3 Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--primary)] text-[var(--on-primary)] md3-label-small uppercase tracking-wider py-1 px-3 rounded-[var(--shape-full)] flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Campeão de Vendas
                  </div>
                )}

                <h3 className={`md3-title-large font-semibold mb-1.5 ${plan.popular ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{plan.name}</h3>
                <p className="text-[var(--on-surface-variant)] md3-body-small mb-5 min-h-[40px]">{plan.description}</p>

                <div className="mb-2">
                  <span className="text-3xl font-bold text-[var(--foreground)]">R$ {plan.price}</span>
                  <span className="text-[var(--outline)] md3-body-medium"> /mês</span>
                </div>

                {/* Credits highlight — M3 Tonal Surface */}
                <div className="bg-[var(--secondary-container)] rounded-[var(--shape-medium)] p-3 text-center mb-5">
                  <span className="md3-label-large text-[var(--on-secondary-container)]">{plan.credits}</span>
                  <span className="text-[var(--on-secondary-container)]/70 md3-body-small"> fotos mensais</span>
                  <div className="md3-label-small text-[var(--primary)] mt-1">
                    ({plan.perCredit} a foto)
                  </div>
                </div>

                <div className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 md3-body-small text-[var(--on-surface-variant)]">
                      <div className={`w-4 h-4 mt-0.5 shrink-0 rounded-[var(--shape-full)] flex items-center justify-center ${plan.popular ? 'bg-[var(--primary)]/15 text-[var(--primary)]' : 'bg-green-500/15 text-green-500'}`}>
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* M3 Filled / Outlined Button */}
                <button
                  onClick={() => window.open(buildStripeUrl(plan.stripeUrl), '_blank')}
                  className={`w-full h-12 rounded-[var(--shape-full)] md3-label-large transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] state-layer m3-touch-target
                    ${plan.popular
                      ? 'm3-btn-filled'
                      : 'm3-btn-outlined'}`}
                >
                  Assinar {plan.name}
                </button>
              </div>
            ))}
          </div>

          {/* Credits Extra — M3 Outlined Card */}
          <div className="mt-10 max-w-2xl mx-auto border border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)] rounded-[var(--shape-large)] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="md3-title-small text-[var(--foreground)]">Créditos Avulsos</h4>
              <p className="text-[var(--on-surface-variant)] md3-body-small">Acabou a cota do mês? Compre unidades avulsas.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="md3-title-small text-[var(--foreground)]">R$ 3,00</div>
                <div className="md3-label-small text-[var(--outline)]">por foto</div>
              </div>
              <button
                className="m3-btn-outlined h-12 px-6 md3-label-large m3-touch-target"
                onClick={() => alert('Redirecionando para Stripe - Avulsos')}
              >
                Comprar Avulso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
