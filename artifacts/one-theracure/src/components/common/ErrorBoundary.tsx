import React from "react";

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
    console.error("ErrorBoundary caught an error", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  handleResetDemo = () => {
    try {
      window.localStorage.removeItem("one-theracure-demo-v1");
    } catch {
      // ignore — privacy mode etc.
    }
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    window.location.href = `${base}/persona`;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
          <div className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold font-playfair text-foreground">Something went sideways</h1>
              <p className="text-sm text-muted-foreground">
                An unexpected error interrupted the demo. You can reload to retry, or reset the demo to wipe local state and start fresh from the persona picker.
              </p>
            </div>
            {this.state.error?.message && (
              <pre className="text-[11px] bg-muted/50 border border-border rounded-md p-3 overflow-auto max-h-32 text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition"
              >
                Reload
              </button>
              <button
                onClick={this.handleResetDemo}
                className="inline-flex items-center rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-95 transition"
              >
                Reset Demo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
