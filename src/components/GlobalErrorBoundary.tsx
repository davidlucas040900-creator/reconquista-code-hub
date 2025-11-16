import React from 'react';
import { Button } from '@/components/ui/button';

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[GlobalErrorBoundary] Caught error:', error, info);
  }

  hardRefresh = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch (e) {
      console.warn('Hard refresh cleanup failed', e);
    } finally {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h1 className="mb-2 text-2xl font-bold">Ocorreu um erro</h1>
            <p className="mb-4 text-muted-foreground">Se vires ecrã preto, tenta forçar uma atualização.</p>
            <pre className="mb-4 max-h-32 overflow-auto rounded bg-muted p-3 text-xs text-muted-foreground">
              {this.state.error?.message}
            </pre>
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} variant="default">Recarregar</Button>
              <Button onClick={this.hardRefresh} variant="secondary">Forçar Atualização</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
