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
    proxy: {
      '/api': {
        target: 'https://reserva-imfi1r7az-jotadoses-projects.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
