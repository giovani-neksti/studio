'use client';

import { Component, type ReactNode } from 'react';
import { reportError } from '@/lib/reportError';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Detect chunk load failures (common after new deploys) and auto-reload
    const isChunkError =
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Failed to load') ||
      error?.name === 'ChunkLoadError';

    if (isChunkError) {
      // Prevent infinite reload loops
      const lastReload = sessionStorage.getItem('chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('chunk_reload', now.toString());
        window.location.reload();
        return;
      }
    }

    reportError(error, 'error-boundary');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-[var(--background)] text-[var(--foreground)] p-6">
          <h2 className="font-serif text-xl font-bold">Algo deu errado</h2>
          <p className="text-[var(--on-surface-variant)] md3-body-medium text-center max-w-md">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="h-10 px-6 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-large"
          >
            Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
