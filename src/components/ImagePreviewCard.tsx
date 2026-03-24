'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col items-center justify-start flex-1 w-full h-full gap-4 md:gap-6 px-4 py-3 md:px-8 md:py-6 overflow-y-auto no-scrollbar min-h-0 pb-20 md:pb-6">

      {/* IMAGE / LOADING */}
      <div className={`relative group ${aspectClass} w-full max-w-[500px] h-full max-h-[50vh] md:max-h-[65vh] shrink-0 overflow-hidden rounded-3xl border border-white/[0.06] bg-[var(--card)] shadow-2xl transition-all duration-500 mx-auto`}>
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 md:gap-6 bg-[var(--card)]/90 backdrop-blur-xl z-10 px-8 text-center">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-[3px] border-[var(--primary)]/15 border-t-[var(--primary)] animate-spin" />
              <Sparkles className="absolute w-5 h-5 md:w-6 md:h-6 text-[var(--primary)] animate-pulse" />
            </div>

            <div className="h-10 flex items-center justify-center">
              <p className="text-[13px] md:text-sm font-semibold text-[var(--foreground)] transition-opacity duration-500">
                {loadingMessages[messageIndex]}{dots}
              </p>
            </div>

            <div className="w-full max-w-[220px] h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] via-purple-500 to-[var(--primary)] animate-shimmer transition-all duration-1000 ease-out"
                style={{ width: `${((messageIndex + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Resultado IA" className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center opacity-40">
            <div className="p-5 rounded-full bg-[var(--primary)]/5 mb-2 animate-float">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-[var(--primary)]" />
            </div>
            <p className="text-[13px] md:text-sm font-medium tracking-wide">Aguardando seleções...</p>
          </div>
        )}
      </div>

      {/* LIVE PROMPT — Desktop only */}
      {livePrompt && Object.keys(selections).length > 0 && (
        <div className="hidden md:block w-full max-w-[480px] bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-left shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">Prompt ao Vivo</p>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] font-mono leading-relaxed break-words">{livePrompt}</p>
        </div>
      )}

      {/* ACTION BUTTONS */}
      {imageUrl && (
        <div className="flex gap-2.5 md:gap-3 shrink-0 mb-4 md:mb-8 mt-1 w-full max-w-[500px]">
          <Button variant="outline" size="sm" onClick={onGenerate} className="flex-1 gap-2 border-white/[0.08] bg-white/[0.03] hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-[var(--primary-foreground)] text-[13px] md:text-sm h-12 rounded-2xl transition-all duration-200 active:scale-[0.97]">
            <RefreshCw className="w-4 h-4" /> Regenerar
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(imageUrl)} className="flex-1 gap-2 border-white/[0.08] bg-white/[0.03] hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-[var(--primary-foreground)] text-[13px] md:text-sm h-12 rounded-2xl transition-all duration-200 active:scale-[0.97]">
            <Download className="w-4 h-4" /> Baixar HD
          </Button>
        </div>
      )}
    </div>
  );
}