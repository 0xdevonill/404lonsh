import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-void text-zinc-200 grid place-items-center p-6">
        <div className="glass pixel-corners p-8 max-w-md text-center space-y-4">
          <p className="font-display text-2xl font-bold">Page failed to paint</p>
          <p className="text-xs text-zinc-500">Reload this screen. Coins saved in this browser stay put.</p>
          <button type="button" onClick={() => window.location.reload()} className="btn-neon">
            Reload
          </button>
        </div>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
