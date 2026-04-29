import React from "react";
import { logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You could report to a monitoring service here
    logger.error("ErrorBoundary caught an error", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4 text-center">
            <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">An unexpected error occurred. Please try again.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={this.handleRetry} className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm shadow hover:opacity-90 transition">Reload</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
