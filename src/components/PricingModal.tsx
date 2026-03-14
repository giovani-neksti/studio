'use client';

import { CheckCircle2, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingModal({ isOpen, onOpenChange }: PricingModalProps) {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Essentials',
      price: '200',
      credits: '200',
      perCredit: 'R$ 1,00',
      description: 'Ideal para validar produtos com imagens profissionais.',
      features: ['200 fotos mensais', 'Acesso a todos os nichos', 'Formatos sociais', 'R$ 1,00 por foto'],
      popular: false,
    },
    {
      name: 'Professional',
      price: '300',
      credits: '400',
      perCredit: 'R$ 0,75',
      description: 'O dobro de fotos por uma fração do preço. O favorito.',
      features: ['400 fotos mensais', 'Acesso a todos os nichos', 'Formatos sociais', 'Prioridade na fila de geração', 'R$ 0,75 por foto'],
      popular: true,
    },
    {
      name: 'Premium',
      price: '500',
      credits: '1.000',
      perCredit: 'R$ 0,50',
      description: 'Para alto volume de postagens e franqueados.',
      features: ['1.000 fotos mensais', 'Suporte dedicado via WhatsApp', 'Acesso a todos os nichos', 'Acesso Antecipado a Modelos', 'R$ 0,50 por foto'],
      popular: false,
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10" onClick={() => onOpenChange(false)}>
      <div 
        className="bg-[var(--background)] border border-[var(--border)] rounded-2xl w-full max-w-5xl shadow-2xl relative flex flex-col overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--accent)] rounded-full p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 py-10 md:py-14 text-center border-b border-[var(--border)] bg-gradient-to-b from-[var(--primary)]/5 to-transparent">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4 tracking-tight">Escale as vendas da sua loja</h2>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
            Faça upgrade para gerar muito mais composições em alta qualidade por uma fração do preço de um estúdio fotográfico.
          </p>
        </div>

        <div className="p-8 md:p-10">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`relative flex flex-col rounded-2xl border ${plan.popular ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 bg-[var(--primary)]/5 scale-105 shadow-xl' : 'border-[var(--border)] bg-[var(--card)]'} p-8 rounded-2xl transition-all`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Campeão de Vendas
                  </div>
                )}
                
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{plan.name}</h3>
                <p className="text-[var(--muted-foreground)] text-sm mb-6 min-h-[40px]">{plan.description}</p>
                
                <div className="mb-2">
                  <span className="text-4xl font-black text-[var(--foreground)]">R$ {plan.price}</span>
                  <span className="text-[var(--muted-foreground)] text-sm"> /mês</span>
                </div>
                
                <div className="bg-[var(--accent)] rounded-lg p-3 text-center mb-6">
                  <span className="font-bold text-[var(--foreground)]">{plan.credits}</span>
                  <span className="text-[var(--muted-foreground)] text-sm"> fotos mensais</span>
                  <div className="text-[11px] text-[var(--primary)] font-bold uppercase mt-1 tracking-wider">
                    ({plan.perCredit} a foto)
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? 'text-[var(--primary)]' : 'text-green-500'}`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => alert(`Redirecionando para Stripe - Assinatura ${plan.name}`)}
                  className={`w-full font-bold h-12 ${plan.popular ? 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90' : 'bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90'}`}
                >
                  Assinar {plan.name}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-2xl mx-auto border border-[var(--border)] bg-[var(--card)] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-[var(--foreground)] text-lg">Créditos Avulsos</h4>
              <p className="text-[var(--muted-foreground)] text-sm">Acabou a cota do mês? Compre unidades pingadas.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-bold text-[var(--foreground)]">R$ 1,50</div>
                <div className="text-xs text-[var(--muted-foreground)]">por foto</div>
              </div>
              <Button variant="outline" className="border-[var(--border)] hover:bg-[var(--accent)] text-[var(--foreground)]" onClick={() => alert('Redirecionando para Stripe - Avulsos')}>
                Comprar Avulso
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
