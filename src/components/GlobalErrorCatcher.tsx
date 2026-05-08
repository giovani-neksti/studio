'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/reportError';

export function GlobalErrorCatcher() {
  useEffect(() => {
    const isChunkError = (msg: string) =>
      msg.includes('Loading chunk') ||
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Failed to load') ||
      msg.includes('ChunkLoadError');

    const tryChunkReload = () => {
      const lastReload = sessionStorage.getItem('chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('chunk_reload', now.toString());
        window.location.reload();
        return true;
      }
      return false;
    };

    const onError = (e: ErrorEvent) => {
      const msg = e.error?.message || e.message || '';
      if (isChunkError(msg) && tryChunkReload()) return;
      reportError(e.error ?? e.message, 'window.onerror');
    };

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const msg = e.reason?.message || String(e.reason) || '';
      if (isChunkError(msg) && tryChunkReload()) return;
      reportError(e.reason, 'unhandled-rejection');
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
