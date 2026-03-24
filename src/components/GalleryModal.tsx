'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Maximize2, Image as ImageIcon } from 'lucide-react';

interface GalleryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  niche: string;
  images: string[]; // NOVO: Recebe as imagens reais
}

export function GalleryModal({ isOpen, onOpenChange, niche, images }: GalleryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90dvh] bg-[var(--background)] border border-white/[0.06] p-0 gap-0 overflow-hidden text-[var(--foreground)] rounded-t-[2rem] md:rounded-2xl">
        <DialogHeader className="p-5 md:p-6 pb-3 md:pb-4 border-b border-white/[0.06] bg-[var(--card)]/60 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Minhas Criações
                <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                  {images.length} imagens
                </span>
              </DialogTitle>
              <p className="text-[var(--muted-foreground)] text-sm mt-1">
                Histórico de renderizações geradas nesta sessão
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[65vh] p-6">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 py-20">
              <ImageIcon className="w-16 h-16 mb-4 text-[var(--muted-foreground)] opacity-50" />
              <p className="text-lg font-medium">Nenhuma imagem gerada ainda.</p>
              <p className="text-sm mt-1">As suas criações de IA aparecerão aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-black/20 border border-white/[0.06] active:scale-[0.97] transition-transform"
                >
                  <img
                    src={url}
                    alt={`Criação IA ${i}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Ações ao passar o rato */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button
                      onClick={() => window.open(url, '_blank')}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-[0.93]"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(url, '_blank')}
                      className="w-10 h-10 rounded-full bg-[var(--primary)] hover:brightness-110 text-[var(--primary-foreground)] flex items-center justify-center transition-all active:scale-[0.93] shadow-[0_0_15px_var(--primary)]"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Data real de hoje */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white/80 text-[10px] backdrop-blur-sm pointer-events-none">
                    {new Date().toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="h-6" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}