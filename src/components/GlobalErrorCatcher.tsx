'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/reportError';

export function GlobalErrorCatcher() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      reportError(e.error ?? e.message, 'window.onerror');
    };

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
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
