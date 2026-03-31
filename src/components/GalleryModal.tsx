'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Maximize2, Image as ImageIcon, Share2 } from 'lucide-react';
import { useShareImage } from '@/hooks/useShareImage';
import { ShareToast } from './ShareToast';

interface GalleryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  niche: string;
  images: string[];
  themeClass?: string;
}

export function GalleryModal({ isOpen, onOpenChange, niche, images, themeClass }: GalleryModalProps) {
  const { canShare, shareImage, toast, dismissToast } = useShareImage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${themeClass || ''} max-w-5xl max-h-[90dvh] bg-[var(--surface-container)] border border-[var(--outline-variant)]/20 p-0 gap-0 overflow-hidden text-[var(--foreground)] rounded-t-[var(--shape-extra-large)] md:rounded-[var(--shape-extra-large)]`}>
        {/* M3 Dialog Header */}
        <DialogHeader className="p-5 md:p-6 pb-3 md:pb-4 border-b border-[var(--outline-variant)]/20 bg-[var(--surface-container-high)]">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="md3-headline-small font-semibold flex items-center gap-2">
                Minhas Criações
                {/* M3 Badge */}
                <span className="px-2.5 py-0.5 rounded-[var(--shape-full)] bg-[var(--primary)]/10 text-[var(--primary)] md3-label-small">
                  {images.length} imagens
                </span>
              </DialogTitle>
              <p className="text-[var(--on-surface-variant)] md3-body-medium mt-1">
                Histórico de renderizações geradas nesta sessão
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[65vh] p-5 md:p-6">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-[var(--shape-extra-large)] bg-[var(--surface-container-highest)] flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-[var(--on-surface-variant)] opacity-50" />
              </div>
              <p className="md3-title-medium text-[var(--on-surface-variant)]">Nenhuma imagem gerada ainda.</p>
              <p className="md3-body-medium mt-1 text-[var(--outline)]">As suas criações de IA aparecerão aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="group relative aspect-square rounded-[var(--shape-large)] overflow-hidden bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/20"
                >
                  <img
                    src={url}
                    alt={`Criação IA ${i}`}
                    className="w-full h-full object-cover transition-transform duration-[var(--duration-medium2)] ease-[var(--easing-standard)] group-hover:scale-105"
                  />

                  {/* Hover Overlay — M3 Scrim */}
                  <div className="absolute inset-0 bg-[var(--on-surface)]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-short4)] flex items-center justify-center gap-3">
                    <button
                      onClick={() => window.open(url, '_blank')}
                      className="w-10 h-10 rounded-[var(--shape-full)] bg-[var(--surface-container-highest)] text-[var(--foreground)] flex items-center justify-center transition-colors hover:bg-[var(--surface-bright)]"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(url, '_blank')}
                      className="w-10 h-10 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center transition-opacity hover:opacity-90 state-layer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {canShare && (
                      <button
                        onClick={() => shareImage(url, `neksti_${i}.png`)}
                        className="w-10 h-10 rounded-[var(--shape-full)] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center transition-opacity hover:opacity-90"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Date label */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-[var(--shape-extra-small)] bg-[var(--surface-container)]/90 text-[var(--foreground)]/80 md3-label-small pointer-events-none">
                    {new Date().toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="h-6" />
        </ScrollArea>
      </DialogContent>
      <ShareToast message={toast} onDismiss={dismissToast} />
    </Dialog>
  );
}
