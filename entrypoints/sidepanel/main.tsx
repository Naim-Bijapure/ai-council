import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: "sans-serif" }}>
          <h2>Something went wrong</h2>
          <p style={{ color: "#b42318", fontSize: 13 }}>{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            style={{ marginTop: 10, padding: "6px 12px", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
