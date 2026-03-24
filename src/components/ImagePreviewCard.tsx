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
    <div className="flex flex-col items-center justify-start flex-1 w-full h-full gap-4 md:gap-6 px-4 py-2 md:px-8 md:py-6 overflow-y-auto min-h-0">

      {/* IMAGEM / LOADING RESPONSIVOS */}
      <div className={`relative group ${aspectClass} w-full max-w-[500px] h-full max-h-[45vh] md:max-h-[65vh] shrink-0 overflow-hidden rounded-3xl md:rounded-[2rem] border border-[var(--border)]/50 bg-[var(--card)] shadow-2xl transition-all duration-500 hover:shadow-3xl mx-auto`}>
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-6 bg-[var(--card)]/80 backdrop-blur-md z-10 px-6 md:px-8 text-center animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-[3px] border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
              <Sparkles className="absolute w-5 h-5 md:w-6 md:h-6 text-[var(--primary)] animate-pulse shadow-sm" />
            </div>

            <div className="h-10 md:h-12 flex items-center justify-center">
              <p className="text-xs md:text-sm font-semibold text-[var(--foreground)] animate-pulse transition-opacity duration-300 drop-shadow-md">
                {loadingMessages[messageIndex]}{dots}
              </p>
            </div>

            <div className="w-full max-w-[200px] h-1.5 bg-[var(--border)] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[var(--primary)] to-purple-500 transition-all duration-1000 ease-out"
                style={{ width: `${((messageIndex + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Resultado IA" className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 md:gap-4 p-6 md:p-8 text-center opacity-50 transition-opacity duration-300 hover:opacity-70 group-hover:scale-105">
            <div className="p-4 md:p-5 rounded-full bg-[var(--primary)]/5 mb-2 animate-pulse">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-[var(--primary)]" />
            </div>
            <p className="text-[13px] md:text-sm font-medium tracking-wide">Aguardando seleções...</p>
          </div>
        )}
      </div>

      {/* PAINEL DE PROMPT OCULTO NO MOBILE PARA POUPAR ESPAÇO, VISÍVEL NO DESKTOP */}
      {livePrompt && Object.keys(selections).length > 0 && (
        <div className="hidden md:block w-full max-w-[480px] bg-black/40 border border-[var(--border)] rounded-xl p-4 text-left shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">Prompt em Tempo Real (Inglês)</p>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] font-mono leading-relaxed break-words">{livePrompt}</p>
        </div>
      )}

      {/* BOTÕES DE AÇÃO */}
      {imageUrl && (
        <div className="flex gap-2.5 md:gap-3 shrink-0 mb-4 md:mb-8 mt-2 w-full max-w-[500px]">
          <Button variant="outline" size="sm" onClick={onGenerate} className="flex-1 gap-2 border-[var(--border)] hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-[var(--primary-foreground)] text-[13px] md:text-sm h-11 md:h-12 rounded-xl transition-all active:scale-95 shadow-sm">
            <RefreshCw className="w-4 h-4" /> Regenerar
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(imageUrl)} className="flex-1 gap-2 border-[var(--border)] hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-[var(--primary-foreground)] text-[13px] md:text-sm h-11 md:h-12 rounded-xl transition-all active:scale-95 shadow-sm">
            <Download className="w-4 h-4" /> Baixar HD
          </Button>
        </div>
      )}
    </div>
  );
}