"use client";

import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <main className="app-container" style={{ padding: "3rem 1.2rem" }}>
          <section className="card" style={{ textAlign: "center", padding: "2rem" }}>
            <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
            <p style={{ color: "#4B5563" }}>
              An unexpected error occurred. Try refreshing the page.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload page
            </button>
            {process.env.NODE_ENV === "development" && this.state.error ? (
              <pre
                style={{
                  marginTop: "1rem",
                  padding: "0.8rem",
                  background: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  borderRadius: 8,
                  fontSize: 12,
                  textAlign: "left",
                  overflow: "auto",
                  color: "#B91C1C"
                }}
              >
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            ) : null}
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
