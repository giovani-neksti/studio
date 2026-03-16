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

export function ImagePreviewCard({ isGenerating, imageUrl, selections, niche, onGenerate, livePrompt }: ImagePreviewCardProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const format = selections.format || '1:1';
  const aspectClass = format.includes('9:16') ? 'aspect-[9/16]' : format.includes('4:5') ? 'aspect-[4/5]' : 'aspect-square';

  return (
    <div className="flex flex-col items-center justify-start flex-1 w-full h-full gap-6 px-8 py-6 overflow-y-auto min-h-0">
      <div className={`relative group ${aspectClass} max-h-[55vh] shrink-0 w-auto overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl transition-all duration-500`}>
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--card)]">
            <div className="w-16 h-16 rounded-full border-2 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
            <p className="text-sm">Gerando composição{dots}</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Resultado IA" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center opacity-40">
            <Sparkles className="w-10 h-10 text-[var(--primary)]" />
            <p className="text-sm">Aguardando seleções</p>
          </div>
        )}
      </div>

      {/* PAINEL DE PROMPT EM TEMPO REAL */}
      {livePrompt && Object.keys(selections).length > 0 && (
        <div className="w-full max-w-[480px] bg-black/40 border border-[var(--border)] rounded-xl p-4 text-left shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">Prompt em Tempo Real (Inglês)</p>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] font-mono leading-relaxed break-words">{livePrompt}</p>
        </div>
      )}

      {imageUrl && (
        <div className="flex gap-3 shrink-0 mb-8">
          <Button variant="outline" size="sm" onClick={onGenerate} className="gap-2 border-[var(--border)]"><RefreshCw className="w-4 h-4" /> Regenerar</Button>
          <Button variant="outline" size="sm" onClick={() => window.open(imageUrl)} className="gap-2 border-[var(--border)]"><Download className="w-4 h-4" /> Baixar HD</Button>
        </div>
      )}
    </div>
  );
}