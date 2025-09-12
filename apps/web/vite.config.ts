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
    include: ["react", "react-dom"],
  },
  build: {
    // Optimizaciones de bundle
    target: 'esnext',
    minify: 'esbuild',
    // Code splitting optimizado
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks separados
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react']
        },
        // Optimizar nombres de chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    // Configuración de chunks
    chunkSizeWarningLimit: 1000,
    // Tree shaking mejorado
    sourcemap: false,
  },
  // Proxy /api during vite dev to the local CommonJS dev server (api/dev-server.cjs)
  server: {
    proxy: {
      '/api': {
        target: 'https://reserva-mauve.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
