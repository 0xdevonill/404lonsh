import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function spaFallback() {
  return {
    name: "spa-404-fallback",
    apply: "build",
    closeBundle() {
      const dist = path.resolve("dist");
      const indexPath = path.join(dist, "index.html");
      if (!fs.existsSync(indexPath)) return;
      fs.copyFileSync(indexPath, path.join(dist, "404.html"));
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallback()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
