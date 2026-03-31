'use client';

import { useState, useEffect, useCallback } from 'react';

/** Checks if Web Share API Level 2 (file sharing) is available */
function checkCanShareFiles(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) {
    return false;
  }
  try {
    const testFile = new File([''], 'test.png', { type: 'image/png' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

export function useShareImage() {
  const [canShare, setCanShare] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setCanShare(checkCanShareFiles());
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const shareImage = useCallback(async (imageUrl: string, filename = 'neksti_studio.png') => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const ext = blob.type.includes('webp') ? 'webp' : blob.type.includes('jpeg') ? 'jpg' : 'png';
      const file = new File([blob], filename.replace(/\.\w+$/, `.${ext}`), { type: blob.type });

      await navigator.share({
        files: [file],
        title: 'Neksti Studio',
        text: 'Foto gerada com IA no Neksti Studio',
      });
    } catch (err: any) {
      // User cancelled share — not an error
      if (err?.name === 'AbortError') return;
      setToast('Use o botão de download para salvar a imagem.');
    } finally {
      setIsSharing(false);
    }
  }, [isSharing]);

  const dismissToast = useCallback(() => setToast(null), []);

  return { canShare, isSharing, shareImage, toast, dismissToast };
}
