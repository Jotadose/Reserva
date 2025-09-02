import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  // Proxy /api during vite dev to the local CommonJS dev server (api/dev-server.cjs)
  server: {
    // Use DEV_API_PORT env var when set (e.g. in PowerShell: $env:DEV_API_PORT='3001')
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.DEV_API_PORT || "3001"}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
