'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Gem, Shirt, Footprints, Sparkles } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface ShowcaseItem {
  id: string;
  before: string;
  after: string;
  niche: string;
}

const NICHE_ICONS: Record<string, React.ReactNode> = {
  joalheria: <Gem className="w-3.5 h-3.5" />,
  moda: <Shirt className="w-3.5 h-3.5" />,
  calcados: <Footprints className="w-3.5 h-3.5" />,
};

const NICHE_LABELS: Record<string, string> = {
  joalheria: 'Joalheria',
  moda: 'Moda',
  calcados: 'Calçados',
};

const AUTO_PLAY_MS = 6000;

export function ShowcaseCarousel() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch showcase items
  useEffect(() => {
    let cancelled = false;
    fetch('/api/showcase')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.items?.length) {
          setItems(data.items);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Poll for new items every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/showcase')
        .then((r) => r.json())
        .then((data) => {
          if (data.items?.length) setItems(data.items);
        })
        .catch(() => {});
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Auto-play
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % items.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + items.length) % items.length);
  }, [items.length]);

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % items.length);
  }, [items.length]);

  // Don't render section if no items
  if (!loading && items.length === 0) return null;

  const item = items[current];
  const nicheKey = item?.niche?.toLowerCase() || '';

  return (
    <section className="py-16 md:py-24 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 h-8 px-4 rounded-[var(--shape-small)] bg-[var(--surface-container-high)]/80 backdrop-blur-sm border border-[var(--outline-variant)]/40 text-[var(--on-surface-variant)] md3-label-medium mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] fill-[var(--primary)]" />
            <span>Resultados Reais</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 animate-fade-up">
            Antes & Depois
          </h2>
          <p className="text-[var(--on-surface-variant)] md3-body-large max-w-xl mx-auto animate-fade-up stagger-1">
            Veja transformações reais feitas por nossos usuários. Arraste o slider para comparar.
          </p>
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full border-[3px] border-[var(--outline-variant)] border-t-[var(--primary)] animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Slider area */}
            <div className="w-full max-w-lg mx-auto relative">
              {/* Navigation arrows — desktop */}
              {items.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-[var(--shape-full)] bg-[var(--surface-container-high)]/80 backdrop-blur-sm border border-[var(--outline-variant)]/30 text-[var(--on-surface-variant)] transition-all hover:bg-[var(--surface-container-highest)] hover:elevation-1 active:scale-95"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-[var(--shape-full)] bg-[var(--surface-container-high)]/80 backdrop-blur-sm border border-[var(--outline-variant)]/30 text-[var(--on-surface-variant)] transition-all hover:bg-[var(--surface-container-highest)] hover:elevation-1 active:scale-95"
                    aria-label="Próximo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* The slider itself */}
              {item && (
                <BeforeAfterSlider
                  key={item.id}
                  before={item.before}
                  after={item.after}
                  alt={NICHE_LABELS[nicheKey] || 'Produto'}
                />
              )}

              {/* Niche badge */}
              {item && NICHE_LABELS[nicheKey] && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--shape-small)] bg-black/60 backdrop-blur-sm text-white text-xs font-medium pointer-events-none">
                  {NICHE_ICONS[nicheKey]}
                  <span>{NICHE_LABELS[nicheKey]}</span>
                </div>
              )}
            </div>

            {/* Mobile nav + dots */}
            {items.length > 1 && (
              <div className="flex items-center gap-4">
                {/* Mobile arrows */}
                <button
                  onClick={goPrev}
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-[var(--shape-full)] bg-[var(--surface-container-high)]/80 border border-[var(--outline-variant)]/30 text-[var(--on-surface-variant)] active:scale-95"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Dots */}
                <div className="flex gap-1.5">
                  {items.slice(0, 10).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === current
                          ? 'w-6 bg-[var(--primary)]'
                          : 'w-2 bg-[var(--outline-variant)]/60 hover:bg-[var(--outline-variant)]'
                      }`}
                      aria-label={`Ir para exemplo ${i + 1}`}
                    />
                  ))}
                  {items.length > 10 && (
                    <span className="text-[var(--outline)] text-xs self-center ml-1">+{items.length - 10}</span>
                  )}
                </div>

                {/* Mobile arrows */}
                <button
                  onClick={goNext}
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-[var(--shape-full)] bg-[var(--surface-container-high)]/80 border border-[var(--outline-variant)]/30 text-[var(--on-surface-variant)] active:scale-95"
                  aria-label="Próximo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Counter */}
            <p className="md3-body-small text-[var(--outline)]">
              {current + 1} de {items.length} transformações
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
