import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",   // keep it simple for local dev
    port: 8081,          // frontend dev server port (different from backend 8080)
    watch: {
      usePolling: true,  // Fix for WSL2 /mnt/c or D: drive file watching
    },
    // Proxy API requests to the Spring Boot backend
    proxy: {
      // Forward any call starting with /api to backend on port 8080
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep path as-is
      },
      // Forward auth endpoints too
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
