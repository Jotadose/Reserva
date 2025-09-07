/**
 * APLICACIÓN PRINCIPAL - Sistema de Reservas para Barbería
 *
 * Este es el componente raíz que maneja:
 * - Autenticación de administrador
 * - Estados principales de la aplicación (landing, reservas, admin)
 * - Integración con Supabase para datos
 * - Gestión de reservas completa
 *
 * Diseñado para ser simple, funcional y escalable
 * Comentarios en español para facilitar mantenimiento
 */

import React, { useState } from "react";
import {
  Scissors,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { AdminPanelAdvanced } from "./components/AdminPanelAdvanced";
import LandingPage from "./components/LandingPage";
import { ToastProvider } from "./contexts/ToastContext";
import { NotificationProvider } from "./hooks/useNotifications";
import BookingFlow from "./flows/BookingFlow";
import { useAppStore } from "./store/appStore";
import { AuthProvider } from "./hooks/useAuth";

function AppContent() {
  const [currentView, setCurrentView] = useState<
    "landing" | "booking" | "admin"
  >("landing");
  // Booking state migrado a Zustand (BookingFlow maneja pasos)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ HOOKS MVP PARA SISTEMA COMPLETO
  const { startBookingProcess: startFlowInStore } = useAppStore();

  // Los datos ahora vienen de useReservasMVP (implementar cuando se necesite mostrar reservas)
  const transformedBookings: any[] = []; // Por ahora vacío, se implementará cuando migremos el admin

  // ✅ CREAR RESERVA MVP COMPLETA
  const startBookingProcess = () => {
    setCurrentView("booking");
    // Inicializa flujo global
    startFlowInStore();
  };

  const goToAdmin = () => {
    setCurrentView("admin");
  };

  const goToLanding = () => {
    setCurrentView("landing");
  };

  // El flujo completo ahora lo maneja <BookingFlow /> usando el store global

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Navbar - Mobile First Design */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Optimized for mobile */}
            <div className="flex-shrink-0">
              <button
                onClick={goToLanding}
                className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-white hover:text-yellow-400 transition-colors duration-200 p-2 -m-2 rounded-lg hover:bg-gray-800/50"
              >
                <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                <span className="hidden xs:inline sm:inline">Michael The Barber</span>
                <span className="xs:hidden sm:hidden">MTB</span>
              </button>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4">
              <button
                onClick={goToLanding}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentView === "landing"
                    ? "bg-yellow-500 text-black shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/70"
                }`}
              >
                Inicio
              </button>
              <button
                onClick={startBookingProcess}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentView === "booking"
                    ? "bg-yellow-500 text-black shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/70"
                }`}
              >
                Reserva
              </button>
              <button
                onClick={goToAdmin}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentView === "admin"
                    ? "bg-yellow-500 text-black shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/70"
                }`}
              >
                Admin
              </button>
            </div>

            {/* Mobile menu button - Improved touch target */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative p-3 -m-1 text-gray-400 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - Improved design and animations */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-black/98 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => {
                  goToLanding();
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                  currentView === "landing"
                    ? "bg-yellow-500 text-black shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/70"
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => {
                  startBookingProcess();
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                  currentView === "booking"
                    ? "bg-yellow-500 text-black shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/70"
                }`}
              >
                Reserva
              </button>
              <button
                onClick={() => {
                  goToAdmin();
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                  currentView === "admin"
                    ? "bg-yellow-500 text-black shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/70"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content - Add padding-top to compensate for fixed navbar */}
      <main className="flex-1 pt-16">
        {currentView === "landing" && (
          <LandingPage onStartBooking={startBookingProcess} />
        )}

        {currentView === "booking" && <BookingFlow />}

        {currentView === "admin" && <AdminPanelAdvanced />}
      </main>

      {/* Footer */}
      {currentView === "landing" && (
        <footer className="bg-gray-900 py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* About */}
              <div>
                <h4 className="mb-4 text-lg font-semibold text-white">
                  Michael The Barber
                </h4>
                <p className="text-gray-400">
                  Barbería de estilo clásico con un toque moderno. Ofrecemos
                  cortes de cabello, arreglo de barba y más servicios para el
                  caballero contemporáneo.
                </p>
                <div className="mt-4 flex space-x-4">
                  <button
                    type="button"
                    className="text-gray-400 transition-colors hover:text-yellow-500"
                    aria-label="Instagram"
                  >
                    {/* Reemplaza por el nuevo icono si la librería lo provee, si no, usa MessageCircle */}
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 transition-colors hover:text-yellow-500"
                    aria-label="Contacto"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="mb-4 text-lg font-semibold text-white">
                  Contacto
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <MapPin className="h-5 w-5" />
                    <span>Lago Blanco 1585, Coquimbo</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Phone className="h-5 w-5" />
                    <span>+56 9 1234 5678</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Mail className="h-5 w-5" />
                    <span>info@michaelthebarber.cl</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="mb-4 text-lg font-semibold text-white">
                  Enlaces
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={startBookingProcess}
                    className="block text-gray-400 transition-colors hover:text-yellow-500"
                  >
                    Reservar Cita
                  </button>
                  <button
                    onClick={goToAdmin}
                    className="block text-gray-400 transition-colors hover:text-yellow-500"
                  >
                    Panel Admin
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
              <p>
                &copy; 2025 Michael The Barber Studios. Todos los derechos
                reservados.
              </p>
              <p className="mt-2 text-sm">
                ✂️ Diseñado por Juan Emilio Elgueda Lillo — Para la barbería que
                marca estilo en Coquimbo.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
