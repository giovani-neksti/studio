'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Download, RefreshCw } from 'lucide-react';

interface ImagePreviewCardProps {
  isGenerating: boolean;
  imageUrl: string | null;
  selections: Record<string, string>;
  niche: string;
  onGenerate: () => void;
  livePrompt?: string;
}

const loadingMessages = [
  "Analisando formato e escala da peça...",
  "Ajustando luzes de estúdio (Rim Lighting)...",
  "Calculando refrações e caustics (Ray-Tracing)...",
  "Renderizando texturas e materiais 8K...",
  "Integrando sombras orgânicas no cenário...",
  "Aplicando assinatura visual e refinamentos finais..."
];

export function ImagePreviewCard({ isGenerating, imageUrl, selections, niche, onGenerate, livePrompt }: ImagePreviewCardProps) {
  const [dots, setDots] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) {
      setMessageIndex(0);
      return;
    }
    const messageInterval = setInterval(() => {
      setMessageIndex((prevIndex) =>
        prevIndex < loadingMessages.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 4000);
    return () => clearInterval(messageInterval);
  }, [isGenerating]);

  const format = selections.format || '1:1';
  const aspectClass = format.includes('9:16') ? 'aspect-[9/16]' : format.includes('4:5') ? 'aspect-[4/5]' : 'aspect-square';

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full h-full gap-4 md:gap-5 px-4 py-3 md:px-8 md:py-5 overflow-y-auto no-scrollbar min-h-0 pb-24 md:pb-6">

      {/* IMAGE / LOADING — M3 Card */}
      <div className={`relative ${aspectClass} w-full max-w-[500px] h-full max-h-[50vh] md:max-h-[65vh] shrink-0 overflow-hidden rounded-[var(--shape-extra-large)] border border-[var(--outline-variant)]/20 bg-[var(--surface-container-low)]/60 backdrop-blur-sm transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] mx-auto`}>
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[var(--surface-container-low)] z-10 px-8 text-center">
            {/* M3 Circular Progress Indicator */}
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-[3px] border-[var(--surface-container-highest)] border-t-[var(--primary)] animate-spin" />
              <Sparkles className="absolute w-5 h-5 text-[var(--primary)]" />
            </div>

            <div className="h-10 flex items-center justify-center">
              <p className="md3-body-medium text-[var(--foreground)]">
                {loadingMessages[messageIndex]}{dots}
              </p>
            </div>

            {/* M3 Linear Progress Indicator */}
            <div className="w-full max-w-[220px] h-1 bg-[var(--surface-container-highest)] rounded-[var(--shape-full)] overflow-hidden">
              <div
                className="h-full rounded-[var(--shape-full)] bg-[var(--primary)] transition-all duration-1000 ease-out"
                style={{ width: `${((messageIndex + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Resultado IA" className="w-full h-full object-cover animate-scale-in" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-transparent">
            <div className="w-14 h-14 rounded-[var(--shape-extra-large)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-[var(--primary)]/60" />
            </div>
            <p className="text-[var(--on-surface-variant)]/60 md3-body-medium max-w-[240px] leading-relaxed">
              Configure as opções e gere sua imagem profissional.
            </p>
          </div>
        )}
      </div>

      {/* LIVE PROMPT — M3 Outlined Card, Desktop only */}
      {livePrompt && Object.keys(selections).length > 0 && (
        <div className="hidden md:block w-full max-w-[480px] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 rounded-[var(--shape-medium)] p-4 text-left shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
            <p className="md3-label-small text-[var(--primary)] uppercase tracking-wider">Prompt ao Vivo</p>
          </div>
          <p className="md3-body-small text-[var(--on-surface-variant)] font-mono leading-relaxed break-words">{livePrompt}</p>
        </div>
      )}

      {/* ACTION BUTTONS — M3 Outlined + Filled */}
      {imageUrl && (
        <div className="flex gap-3 shrink-0 mb-4 md:mb-8 mt-1 w-full max-w-[500px]">
          <button
            onClick={onGenerate}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[var(--shape-full)] border border-[var(--outline)]/40 text-[var(--foreground)] md3-label-large transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] hover:bg-[var(--on-surface-variant)]/8"
          >
            <RefreshCw className="w-4 h-4" /> Regenerar
          </button>
          <button
            onClick={() => window.open(imageUrl)}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-large transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] hover:elevation-1 state-layer"
          >
            <Download className="w-4 h-4" /> Baixar HD
          </button>
        </div>
      )}
    </div>
  );
}
