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
