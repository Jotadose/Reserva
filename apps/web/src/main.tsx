import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App.tsx"; // Versión original
import AppYerko from "./AppYerko.tsx"; // Versión personalizada para Yerko
import "./index.css";
import "./styles/mobile-improvements.css";
import "./styles/mobile-ux.css";

// Configuración para cambiar entre versiones
const APP_MODE = import.meta.env.VITE_APP_MODE || 'original'

// Seleccionar qué aplicación renderizar
const AppToRender = APP_MODE === 'individual' ? AppYerko : App

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppToRender />
    </QueryClientProvider>
  </StrictMode>
);

// Log para debugging
console.log(`🚀 Iniciando aplicación en modo: ${APP_MODE}`);
console.log(`📱 Componente renderizado: ${APP_MODE === 'individual' ? 'AppYerko (Plan Individual)' : 'App (Versión Original)'}`);
