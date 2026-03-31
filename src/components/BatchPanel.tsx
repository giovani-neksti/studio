'use client';

import { useState, useRef } from 'react';
import { Upload, X, Sparkles, Download, Check, AlertCircle, Loader2, Layers, Share2 } from 'lucide-react';
import { useShareImage } from '@/hooks/useShareImage';
import { ShareToast } from './ShareToast';

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  generatedUrl: string | null;
  status: 'idle' | 'generating' | 'done' | 'error';
  error?: string;
}

interface BatchPanelProps {
  selections: Record<string, any>;
  niche: string;
  accessToken: string;
  credits: number | null;
  isAdmin: boolean;
  onCreditSpent: () => void;
}

const MAX_BATCH = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export function BatchPanel({ selections, niche, accessToken, credits, isAdmin, onCreditSpent }: BatchPanelProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canShare, shareImage, toast, dismissToast } = useShareImage();

  const processImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1024;
        let w = img.width, h = img.height;
        if (w > h && w > MAX_SIZE) { h = Math.round(h * MAX_SIZE / w); w = MAX_SIZE; }
        else if (h > MAX_SIZE) { w = Math.round(w * MAX_SIZE / h); h = MAX_SIZE; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], 'product.jpg', { type: 'image/jpeg' }) : file),
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const toAdd: BatchItem[] = [];
    for (const file of Array.from(fileList)) {
      if (items.length + toAdd.length >= MAX_BATCH) break;
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      toAdd.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        generatedUrl: null,
        status: 'idle',
      });
    }
    if (toAdd.length > 0) setItems((prev) => [...prev, ...toAdd]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const pendingCount = items.filter((i) => i.status === 'idle' || i.status === 'error').length;
  const doneCount = items.filter((i) => i.status === 'done').length;
  const canGenerate = !isRunning && pendingCount > 0 && (isAdmin || (credits ?? 0) >= pendingCount);
  const notEnoughCredits = !isAdmin && items.length > 0 && pendingCount > (credits ?? 0);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsRunning(true);

    const cleanSelections = { ...selections };
    Object.keys(cleanSelections)
      .filter((k) => k.startsWith('upload_'))
      .forEach((k) => delete cleanSelections[k]);

    const pending = items.filter((i) => i.status === 'idle' || i.status === 'error');

    for (const item of pending) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'generating', error: undefined } : i))
      );

      try {
        const processedFile = await processImage(item.file);
        const formData = new FormData();
        formData.append('niche', niche);
        formData.append('files', processedFile);
        formData.append('selections', JSON.stringify(cleanSelections));

        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao gerar');

        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'done', generatedUrl: data.url } : i))
        );
        onCreditSpent();
      } catch (err: any) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'error', error: err.message } : i
          )
        );
      }
    }

    setIsRunning(false);
  };

  const downloadImage = async (url: string, idx: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `neksti_batch_${idx + 1}.webp`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  const downloadAll = async () => {
    const done = items.filter((i) => i.status === 'done' && i.generatedUrl);
    for (let i = 0; i < done.length; i++) {
      await downloadImage(done[i].generatedUrl!, i);
      if (i < done.length - 1) await new Promise((r) => setTimeout(r, 350));
    }
  };

  const currentlyGeneratingIndex = items.findIndex((i) => i.status === 'generating');

  return (
    <div className="flex flex-col items-center flex-1 w-full h-full gap-4 px-4 py-4 md:px-8 md:py-5 overflow-y-auto no-scrollbar min-h-0 pb-24 md:pb-6">

      {/* Header row */}
      <div className="w-full max-w-[600px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[var(--shape-large)] bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
            <Layers className="w-4.5 h-4.5 text-[var(--primary)]" aria-hidden="true" />
          </div>
          <div>
            <p className="md3-title-small font-semibold text-[var(--foreground)]">Geração em Batch</p>
            <p className="md3-label-small text-[var(--on-surface-variant)]">
              {items.length === 0
                ? `Adicione até ${MAX_BATCH} produtos`
                : `${doneCount} de ${items.length} geradas`}
            </p>
          </div>
        </div>

        {doneCount > 1 && (
          <button
            onClick={downloadAll}
            aria-label="Baixar todas as imagens geradas"
            className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--shape-full)] border border-[var(--outline)]/40 text-[var(--foreground)] md3-label-medium hover:bg-[var(--on-surface-variant)]/8 transition-colors duration-[var(--duration-short4)]"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Baixar Todas
          </button>
        )}
      </div>

      {/* Upload zone — shown when no items */}
      {items.length === 0 && (
        <button
          type="button"
          aria-label="Selecionar imagens de produtos para geração em batch"
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-[600px] border-2 border-dashed border-[var(--outline-variant)]/40 rounded-[var(--shape-extra-large)] flex flex-col items-center justify-center gap-5 py-16 px-8 cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-all duration-[var(--duration-medium1)] text-center shrink-0"
        >
          <div className="w-16 h-16 rounded-[var(--shape-extra-large)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
            <Upload className="w-7 h-7 text-[var(--primary)]/70" aria-hidden="true" />
          </div>
          <div>
            <p className="md3-title-small text-[var(--foreground)] mb-1.5">
              Selecione até {MAX_BATCH} produtos
            </p>
            <p className="md3-body-small text-[var(--on-surface-variant)] max-w-xs leading-relaxed">
              Clique para escolher várias fotos.<br />
              As configurações do painel lateral serão aplicadas a todas.
            </p>
          </div>
        </button>
      )}

      {/* Image grid */}
      {items.length > 0 && (
        <div
          className="w-full max-w-[600px] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 shrink-0"
          role="list"
          aria-label="Produtos no batch"
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              role="listitem"
              className="relative aspect-square rounded-[var(--shape-large)] overflow-hidden bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/20"
            >
              {/* Thumbnail / result */}
              <img
                src={item.generatedUrl ?? item.previewUrl}
                alt={item.generatedUrl ? `Resultado gerado ${idx + 1}` : `Produto ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Generating overlay */}
              {item.status === 'generating' && (
                <div className="absolute inset-0 bg-[var(--surface-container)]/85 flex flex-col items-center justify-center gap-1.5" aria-label={`Gerando produto ${idx + 1}`}>
                  <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" aria-hidden="true" />
                  <span className="md3-label-small text-[var(--primary)]">Gerando...</span>
                </div>
              )}

              {/* Done badge */}
              {item.status === 'done' && (
                <div className="absolute bottom-1.5 left-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center" aria-label="Gerado com sucesso">
                  <Check className="w-3 h-3 text-white" aria-hidden="true" />
                </div>
              )}

              {/* Error overlay */}
              {item.status === 'error' && (
                <div className="absolute inset-0 bg-[var(--error-container)]/90 flex flex-col items-center justify-center gap-1 p-2 text-center" aria-label={`Erro no produto ${idx + 1}: ${item.error}`}>
                  <AlertCircle className="w-5 h-5 text-[var(--error)]" aria-hidden="true" />
                  <p className="md3-label-small text-[var(--on-error-container)] line-clamp-2">{item.error}</p>
                </div>
              )}

              {/* Remove button — idle only */}
              {item.status === 'idle' && !isRunning && (
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remover produto ${idx + 1}`}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[var(--surface-container-highest)]/90 text-[var(--on-surface)] flex items-center justify-center hover:bg-[var(--error)] hover:text-[var(--on-error)] transition-colors duration-[var(--duration-short4)]"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}

              {/* Action buttons — done only */}
              {item.status === 'done' && item.generatedUrl && (
                <div className="absolute top-1 right-1 flex gap-1">
                  {canShare && (
                    <button
                      onClick={() => shareImage(item.generatedUrl!, `neksti_batch_${idx + 1}.png`)}
                      aria-label={`Compartilhar imagem ${idx + 1}`}
                      className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    onClick={() => downloadImage(item.generatedUrl!, idx)}
                    aria-label={`Baixar imagem gerada ${idx + 1}`}
                    className="w-7 h-7 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add more slot */}
          {items.length < MAX_BATCH && !isRunning && (
            <button
              type="button"
              aria-label="Adicionar mais imagens ao batch"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-[var(--shape-large)] border-2 border-dashed border-[var(--outline-variant)]/30 flex flex-col items-center justify-center gap-1 hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-all duration-[var(--duration-short4)] text-[var(--on-surface-variant)]"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span className="md3-label-small">Adicionar</span>
            </button>
          )}
        </div>
      )}

      {/* Progress bar */}
      {isRunning && items.length > 0 && (
        <div className="w-full max-w-[600px] shrink-0">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-valuenow={doneCount}
            aria-label={`Progresso: ${doneCount} de ${items.length} imagens geradas`}
            className="w-full h-1.5 bg-[var(--surface-container-highest)] rounded-[var(--shape-full)] overflow-hidden"
          >
            <div
              className="h-full bg-[var(--primary)] rounded-[var(--shape-full)] transition-all duration-700 ease-out"
              style={{ width: `${(doneCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Generate / status button */}
      {items.length > 0 && (
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          aria-label={
            isRunning
              ? `Gerando imagem ${currentlyGeneratingIndex + 1} de ${items.length}`
              : pendingCount > 0
              ? `Gerar ${pendingCount} ${pendingCount === 1 ? 'imagem' : 'imagens'} usando ${pendingCount} ${pendingCount === 1 ? 'crédito' : 'créditos'}`
              : 'Todas as imagens foram geradas'
          }
          className="w-full max-w-[600px] h-12 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-large flex items-center justify-center gap-2.5 transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] disabled:opacity-[0.38] disabled:cursor-not-allowed hover:elevation-1 state-layer shrink-0"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>
                Gerando {currentlyGeneratingIndex + 1} de {items.length}...
              </span>
            </>
          ) : pendingCount > 0 ? (
            <>
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span>
                Gerar {pendingCount} {pendingCount === 1 ? 'imagem' : 'imagens'} · {pendingCount}{' '}
                {pendingCount === 1 ? 'crédito' : 'créditos'}
              </span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" aria-hidden="true" />
              <span>Todas geradas!</span>
            </>
          )}
        </button>
      )}

      {/* Not enough credits warning */}
      {notEnoughCredits && (
        <p role="alert" className="w-full max-w-[600px] text-center md3-body-small text-[var(--error)] shrink-0">
          Créditos insuficientes: você tem {credits ?? 0} mas precisa de {pendingCount}.
        </p>
      )}

      <ShareToast message={toast} onDismiss={dismissToast} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
