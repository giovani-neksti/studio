'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Download, Maximize2, Image as ImageIcon, ChevronLeft, ChevronRight, Calendar, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface Generation {
  id: string;
  niche: string;
  original_image_url: string;
  generated_image_url: string;
  created_at: string;
}

export default function GeracoesPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toggle: toggleTheme, isDark } = useTheme();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!session?.access_token) return;

    setLoading(true);
    fetch(`/api/generations?page=${page}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    })
      .then(res => res.json())
      .then(data => {
        setGenerations(data.generations || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      })
      .catch(() => setGenerations([]))
      .finally(() => setLoading(false));
  }, [session?.access_token, page]);

  const downloadImage = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 rounded-full border-[3px] border-[var(--outline-variant)] border-t-[var(--primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className={`theme-jewelry${isDark ? '' : ' light'} min-h-[100dvh] bg-[var(--background)]`}>
      {/* Header */}
      <header className="sticky top-0 z-40 h-16 flex items-center gap-3 px-4 md:px-6 bg-[var(--surface-container)] border-b border-[var(--outline-variant)]/20">
        <button
          onClick={() => router.push('/studio')}
          className="flex items-center justify-center w-10 h-10 rounded-[var(--shape-full)] hover:bg-[var(--on-surface-variant)]/8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--on-surface)]" />
        </button>
        <div className="flex-1">
          <h1 className="md3-title-large font-semibold text-[var(--on-surface)]">Minhas Gerações</h1>
          <p className="md3-label-small text-[var(--on-surface-variant)]">
            {loading ? 'Carregando...' : `${total} ${total === 1 ? 'imagem' : 'imagens'} geradas`}
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-[var(--shape-full)] text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8 transition-colors"
          title={isDark ? 'Modo claro' : 'Modo escuro'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => router.push('/studio')}
          className="flex items-center gap-2 h-9 px-4 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-medium hover:elevation-1 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Geração</span>
        </button>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 rounded-full border-[3px] border-[var(--outline-variant)] border-t-[var(--primary)] animate-spin" />
            <p className="mt-4 md3-body-medium text-[var(--on-surface-variant)]">Carregando suas gerações...</p>
          </div>
        ) : generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-[var(--shape-extra-large)] bg-[var(--surface-container-highest)] flex items-center justify-center mb-5">
              <ImageIcon className="w-10 h-10 text-[var(--on-surface-variant)] opacity-50" />
            </div>
            <h2 className="md3-headline-small text-[var(--on-surface)] mb-2">Nenhuma geração ainda</h2>
            <p className="md3-body-medium text-[var(--on-surface-variant)] max-w-md">
              Suas imagens geradas com IA aparecerão aqui. Vá ao estúdio para criar sua primeira foto profissional!
            </p>
            <button
              onClick={() => router.push('/studio')}
              className="mt-6 flex items-center gap-2 h-10 px-6 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-large hover:elevation-1 transition-all"
            >
              <Sparkles className="w-4 h-4" />Ir para o Estúdio
            </button>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="group relative aspect-square rounded-[var(--shape-large)] overflow-hidden bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/20"
                >
                  <img
                    src={gen.generated_image_url}
                    alt="Geração IA"
                    className="w-full h-full object-cover transition-transform duration-[var(--duration-medium2)] ease-[var(--easing-standard)] group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-[var(--on-surface)]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-short4)] flex items-center justify-center gap-3">
                    <button
                      onClick={() => setSelectedImage(gen.generated_image_url)}
                      className="w-10 h-10 rounded-[var(--shape-full)] bg-[var(--surface-container-highest)] text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--surface-bright)] transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadImage(gen.generated_image_url, `neksti_${gen.id}.png`)}
                      className="w-10 h-10 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-[var(--shape-extra-small)] bg-[var(--surface-container)]/90 md3-label-small text-[var(--on-surface-variant)]">
                    <Calendar className="w-3 h-3" />
                    {new Date(gen.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8 mb-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 h-10 px-4 rounded-[var(--shape-full)] bg-[var(--surface-container-high)] text-[var(--on-surface)] md3-label-medium disabled:opacity-38 hover:bg-[var(--surface-container-highest)] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />Anterior
                </button>
                <span className="md3-label-medium text-[var(--on-surface-variant)]">
                  {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 h-10 px-4 rounded-[var(--shape-full)] bg-[var(--surface-container-high)] text-[var(--on-surface)] md3-label-medium disabled:opacity-38 hover:bg-[var(--surface-container-highest)] transition-colors"
                >
                  Próxima<ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Visualização"
              className="max-w-full max-h-[85vh] object-contain rounded-[var(--shape-large)]"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => downloadImage(selectedImage, `neksti_${Date.now()}.png`)}
                className="w-10 h-10 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-10 h-10 rounded-[var(--shape-full)] bg-[var(--surface-container)] text-[var(--on-surface)] flex items-center justify-center hover:bg-[var(--surface-container-high)] transition-colors"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
