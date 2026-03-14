'use client';

import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Download, Share2, ZoomIn, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewCardProps {
  isGenerating: boolean;
  imageUrl: string | null;
  selections: Record<string, string>;
  niche: string;
  onGenerate: () => void;
  livePrompt?: string; // <-- AQUI ESTÁ A MÁGICA
}

const placeholderMessages = [
  'Sua imagem de alta conversão aparecerá aqui',
  'Configure as opções na barra lateral e clique em Gerar',
];

export function ImagePreviewCard({
  isGenerating,
  imageUrl,
  selections,
  niche,
  onGenerate,
  livePrompt,
}: ImagePreviewCardProps) {
  const [dots, setDots] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (imageUrl) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [imageUrl]);

  const format = selections.format || '1:1 Quadrado';
  const aspectClass = format.includes('9:16')
    ? 'aspect-[9/16]'
    : format.includes('16:9')
      ? 'aspect-[16/9]'
      : format.includes('4:5')
        ? 'aspect-[4/5]'
        : 'aspect-square';

  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full gap-6 px-8 py-6 min-h-0">
      <div
        className={`relative group ${aspectClass} max-h-[65vh] w-auto overflow-hidden rounded-2xl 
          border border-[var(--border)] bg-[var(--card)] 
          shadow-2xl transition-all duration-500`}
        style={{
          maxWidth: format.includes('16:9') ? '100%' : format.includes('9:16') ? '320px' : '480px',
          boxShadow: imageUrl ? `0 0 60px var(--niche-glow, rgba(255,255,255,0.05))` : undefined,
        }}
      >
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--card)]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)]/5 to-transparent animate-pulse" />
            <div className="w-16 h-16 rounded-full border-2 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
            <div className="text-center">
              <p className="text-[var(--foreground)] font-medium">Gerando imagem{dots}</p>
              <p className="text-[var(--muted-foreground)] text-sm mt-1">Processando com IA de alta fidelidade</p>
            </div>
            <div className="w-48 h-1 rounded-full bg-[var(--border)] overflow-hidden">
              <div className="h-full bg-[var(--primary)] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        ) : imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Imagem gerada por IA" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              <Button size="sm" variant="secondary" className="gap-1.5"><ZoomIn className="w-3.5 h-3.5" />Ver</Button>
              <Button size="sm" variant="secondary" className="gap-1.5"><Download className="w-3.5 h-3.5" />Baixar</Button>
              <Button size="sm" variant="secondary" className="gap-1.5"><Share2 className="w-3.5 h-3.5" />Compartilhar</Button>
            </div>
            {showSuccess && (
              <div className="absolute top-3 left-3 right-3 flex items-center gap-2 bg-green-500/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Imagem gerada com sucesso!</span>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ border: '1.5px dashed var(--primary)', opacity: 0.5 }}>
              <Sparkles className="w-8 h-8" style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', opacity: 0.6 }} className="font-medium text-base">{placeholderMessages[0]}</p>
              <p style={{ color: 'var(--muted-foreground)', opacity: 0.9 }} className="text-sm mt-1">{placeholderMessages[1]}</p>
            </div>
          </div>
        )}
      </div>

      {/* CAIXA DO PROMPT EM TEMPO REAL */}
      {livePrompt && Object.keys(selections).length > 0 && (
        <div className="w-full max-w-[480px] bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-left shadow-sm mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">Prompt em Tempo Real (Inglês)</p>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] font-mono leading-relaxed break-words">
            {livePrompt}
          </p>
        </div>
      )}

      {imageUrl && (
        <div className="flex gap-3 mt-2">
          <Button variant="outline" size="sm" onClick={onGenerate} className="gap-2 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]">
            <RefreshCw className="w-4 h-4" /> Regenerar
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const link = document.createElement('a'); link.href = imageUrl; link.download = `studio-ai-${niche}.jpg`; link.click();
          }} className="gap-2 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]">
            <Download className="w-4 h-4" /> Baixar HD
          </Button>
          <ShareDialog imageUrl={imageUrl} niche={niche} />
        </div>
      )}
    </div>
  );
}

function ShareDialog({ imageUrl, niche }: { imageUrl: string; niche: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button variant="default" size="sm" onClick={() => setIsOpen(true)} className="gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 shadow-lg shadow-[var(--primary)]/20">
        <Share2 className="w-4 h-4" /> Compartilhar
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">Compartilhar Imagem</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">Mostre sua nova composição ao mundo.</p>
            <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl mb-6 border border-[var(--border)]" />
            <div className="flex gap-2">
              <input type="text" readOnly value={imageUrl} className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 text-xs text-[var(--muted-foreground)] focus:outline-none" />
              <Button onClick={handleCopy} variant="secondary" className="shrink-0 text-xs">
                {copied ? <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" /> : 'Copiar Link'}
                {copied ? 'Copiado' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}