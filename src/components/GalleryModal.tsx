'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Maximize2 } from 'lucide-react';
import Image from 'next/image';

interface GalleryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  niche: string;
}

// Fixed mock gallery images for demonstration
const mockGallery = [
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
  'https://images.unsplash.com/photo-1599643477874-dc2e3abff5b6?w=800&q=80',
  'https://images.unsplash.com/photo-1573408301185-9519f94da5de?w=800&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
  'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=800&q=80',
  'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
  'https://images.unsplash.com/photo-1535632787350-cb9ec9a9abcb?w=800&q=80',
  'https://images.unsplash.com/photo-1611591437146-55ce44400e96?w=800&q=80',
  'https://images.unsplash.com/photo-1599643478514-46bfa3321526?w=800&q=80',
];

export function GalleryModal({ isOpen, onOpenChange, niche }: GalleryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-[var(--background)] border border-[var(--border)] p-0 gap-0 overflow-hidden text-[var(--foreground)]">
        <DialogHeader className="p-6 pb-4 border-b border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Minhas Criações
                <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                  {mockGallery.length} imagens
                </span>
              </DialogTitle>
              <p className="text-[var(--muted-foreground)] text-sm mt-1">
                Histórico de renderizações geradas no portal
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[65vh] p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockGallery.map((url, i) => (
              <div 
                key={i} 
                className="group relative aspect-square rounded-xl overflow-hidden bg-black/20 border border-[var(--border)]"
              >
                <img
                  src={url}
                  alt={`Galeria ${i}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-[var(--primary)] hover:brightness-110 text-[var(--primary-foreground)] flex items-center justify-center transition-colors shadow-[0_0_15px_var(--primary)] text-black">
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* Date mock */}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-white/80 text-[10px] backdrop-blur-sm pointer-events-none">
                  {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
          <div className="h-6" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
