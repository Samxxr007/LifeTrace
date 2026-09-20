import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-parchment-100">
          <div className="text-ink-400 mb-4">
            <AlertTriangle className="w-12 h-12 stroke-1" />
          </div>
          <h2 className="font-display text-2xl text-ink-900 mb-3">Something went wrong</h2>
          <p className="font-body text-ink-500 mb-6 max-w-sm">
            Something went wrong while loading this view. Try refreshing.
          </p>
          <Button variant="secondary" onClick={this.handleRetry}>
            Refresh page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
