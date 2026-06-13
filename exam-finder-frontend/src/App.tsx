import { Component, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

// Error Boundary to prevent silent crashes causing black screens
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "sans-serif", color: "white", background: "#111", minHeight: "100vh" }}>
          <h2>Something went wrong</h2>
          <pre style={{ fontSize: 12, opacity: 0.7 }}>{(this.state.error as Error).message}</pre>
          <button onClick={() => { this.setState({ error: null }); window.location.href = "/login"; }}
            style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer", background: "white", color: "black", border: "none", borderRadius: 8 }}>
            Return to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="bottom-center" />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
