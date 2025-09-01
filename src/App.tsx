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

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Scissors,
  Users,
  Settings,
  CheckCircle,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  Instagram,
  MessageCircle,
} from "lucide-react";
import BookingCalendar from "./components/BookingCalendar";
import ServiceSelection from "./components/ServiceSelection";
import BarberSelection from "./components/BarberSelection";
import ClientForm from "./components/ClientForm";
import { AdminPanelSimpleUpdated } from "./components/AdminPanelSimpleUpdated";
import BookingConfirmation from "./components/BookingConfirmation";
import LandingPage from "./components/LandingPage";
import { TestMVPHooks } from "./components/TestMVPHooks";
import { BookingSystemMVP } from "./components/BookingSystemMVP";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import { useReservasMVP } from "./hooks/useReservasMVP";
import { useUsuarios } from "./hooks/useUsuarios";
import { Booking, Service, TimeSlot } from "./types/booking";

function AppContent() {
  const { addToast } = useToast();
  const [currentView, setCurrentView] = useState<
    "landing" | "booking" | "admin" | "test" | "mvp"
  >("test");
  const [bookingStep, setBookingStep] = useState<
    "barbero" | "calendar" | "service" | "form" | "confirmation"
  >("barbero");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ HOOKS MVP PARA SISTEMA COMPLETO
  const { createReserva, loading: isCreatingReserva } = useReservasMVP();
  const { crearUsuario } = useUsuarios();

  // 🛠️ DEBUG: Verificar datos de Supabase
  console.log("🔍 App.tsx - Sistema MVP:", {
    isCreatingReserva,
    selectedBarberId,
    selectedServices: selectedServices.length,
  });

  // Los datos ahora vienen de useReservasMVP (implementar cuando se necesite mostrar reservas)
  const transformedBookings: any[] = []; // Por ahora vacío, se implementará cuando migremos el admin

  // ✅ CREAR RESERVA MVP COMPLETA
  const handleBookingComplete = async (booking: Booking) => {
    try {
      console.log("💾 Creando reserva MVP:", booking);

      // 1. Crear/buscar usuario
      const usuarioData = {
        nombre: booking.client.name,
        telefono: booking.client.phone,
        email: booking.client.email,
        rol: "cliente" as const,
      };

      const usuario = await crearUsuario(usuarioData);
      if (!usuario) {
        addToast("Error al crear el usuario", "error");
        return;
      }

      // 2. Crear reserva con servicios
      const reservaData = {
        usuario_id: usuario.id_usuario,
        barbero_id: selectedBarberId,
        fecha: booking.date,
        hora_inicio: booking.time,
        estado: "confirmada" as const,
        notas: booking.client.notes || "",
        servicios: selectedServices.map((service) => ({
          servicio_id: service.id,
          precio_acordado: service.price,
        })),
      };

      const success = await createReserva(reservaData);

      if (success) {
        setCurrentBooking(booking);
        setBookingStep("confirmation");
        addToast("¡Reserva creada exitosamente en el sistema MVP!", "success");
      } else {
        addToast("Error al crear la reserva. Inténtalo de nuevo.", "error");
      }
    } catch (error) {
      console.error("Error creando reserva MVP:", error);
      addToast("Error al crear la reserva. Inténtalo de nuevo.", "error");
    }
  };

  const handleNewBooking = () => {
    setBookingStep("barbero");
    setSelectedDate("");
    setSelectedTime(null);
    setSelectedServices([]);
    setSelectedBarberId("");
    setCurrentBooking(null);
  };

  // ✅ CANCELAR RESERVA MVP (TODO: Implementar cuando se migre el admin)
  const handleBookingCancel = async (bookingId: string) => {
    console.log("🗑️ Cancelar reserva MVP (pendiente):", bookingId);
    addToast("Funcionalidad de cancelación pendiente de migración", "info");
  };

  const startBookingProcess = () => {
    setCurrentView("booking");
    setBookingStep("barbero");
    setSelectedDate("");
    setSelectedTime(null);
    setSelectedServices([]);
    setSelectedBarberId("");
    setCurrentBooking(null);
  };

  const goToLanding = () => {
    setCurrentView("landing");
    setMobileMenuOpen(false);
  };

  const goToBooking = () => {
    setCurrentView("booking");
    setMobileMenuOpen(false);
  };

  const goToAdmin = () => {
    setCurrentView("admin");
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div
              className="flex cursor-pointer items-center space-x-3"
              onClick={goToLanding}
            >
              <div className="rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 p-3">
                <Scissors className="h-8 w-8 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Michael The Barber
                </h1>
                <p className="text-sm text-gray-400">Studios</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden space-x-1 md:flex">
              <button
                onClick={goToLanding}
                className={`flex items-center space-x-2 rounded-lg px-6 py-3 font-semibold transition-all duration-300 ${
                  currentView === "landing"
                    ? "scale-105 transform bg-yellow-500 text-black shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span>Inicio</span>
              </button>
              <button
                onClick={goToBooking}
                className={`flex items-center space-x-2 rounded-lg px-6 py-3 font-semibold transition-all duration-300 ${
                  currentView === "booking"
                    ? "scale-105 transform bg-yellow-500 text-black shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Reservas</span>
              </button>
              <button
                onClick={goToAdmin}
                className={`flex items-center space-x-2 rounded-lg px-6 py-3 font-semibold transition-all duration-300 ${
                  currentView === "admin"
                    ? "scale-105 transform bg-yellow-500 text-black shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Admin</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="absolute left-0 right-0 top-full border-b border-gray-800 bg-black/95 backdrop-blur-sm md:hidden">
              <div className="space-y-2 px-4 py-4">
                <button
                  onClick={goToLanding}
                  className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition-all duration-300 ${
                    currentView === "landing"
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  Inicio
                </button>
                <button
                  onClick={goToBooking}
                  className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition-all duration-300 ${
                    currentView === "booking"
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  Reservas
                </button>
                <button
                  onClick={() => setCurrentView("admin")}
                  className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition-all duration-300 ${
                    currentView === "admin"
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => setCurrentView("mvp")}
                  className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition-all duration-300 ${
                    currentView === "mvp"
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  Sistema MVP
                </button>
                <button
                  onClick={() => setCurrentView("test")}
                  className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition-all duration-300 ${
                    currentView === "test"
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  Test Hooks
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="min-h-screen">
        {currentView === "test" && <TestMVPHooks />}
        {currentView === "mvp" && <BookingSystemMVP />}

        {currentView === "landing" && (
          <LandingPage onStartBooking={startBookingProcess} />
        )}

        {currentView === "booking" && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {/* Progress Steps */}
              <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center space-x-3 ${
                      bookingStep === "barbero"
                        ? "text-yellow-500"
                        : [
                            "calendar",
                            "service",
                            "form",
                            "confirmation",
                          ].includes(bookingStep)
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        bookingStep === "barbero"
                          ? "border-yellow-500 bg-yellow-500/20"
                          : [
                              "calendar",
                              "service",
                              "form",
                              "confirmation",
                            ].includes(bookingStep)
                          ? "border-green-500 bg-green-500/20"
                          : "border-gray-500"
                      }`}
                    >
                      {["calendar", "service", "form", "confirmation"].includes(
                        bookingStep
                      ) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </div>
                    <span className="font-semibold">Barbero</span>
                  </div>

                  <div className="mx-4 h-px flex-1 bg-gray-600"></div>

                  <div
                    className={`flex items-center space-x-3 ${
                      bookingStep === "calendar"
                        ? "text-yellow-500"
                        : ["service", "form", "confirmation"].includes(
                            bookingStep
                          )
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        bookingStep === "calendar"
                          ? "border-yellow-500 bg-yellow-500/20"
                          : ["service", "form", "confirmation"].includes(
                              bookingStep
                            )
                          ? "border-green-500 bg-green-500/20"
                          : "border-gray-500"
                      }`}
                    >
                      {["service", "form", "confirmation"].includes(
                        bookingStep
                      ) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Calendar className="h-5 w-5" />
                      )}
                    </div>
                    <span className="font-semibold">Fecha y Hora</span>
                  </div>

                  <div className="mx-4 h-px flex-1 bg-gray-600"></div>

                  <div
                    className={`flex items-center space-x-3 ${
                      bookingStep === "service"
                        ? "text-yellow-500"
                        : ["form", "confirmation"].includes(bookingStep)
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        bookingStep === "service"
                          ? "border-yellow-500 bg-yellow-500/20"
                          : ["form", "confirmation"].includes(bookingStep)
                          ? "border-green-500 bg-green-500/20"
                          : "border-gray-500"
                      }`}
                    >
                      {["form", "confirmation"].includes(bookingStep) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Scissors className="h-5 w-5" />
                      )}
                    </div>
                    <span className="font-semibold">Servicios</span>
                  </div>

                  <div className="mx-4 h-px flex-1 bg-gray-600"></div>

                  <div
                    className={`flex items-center space-x-3 ${
                      bookingStep === "form"
                        ? "text-yellow-500"
                        : bookingStep === "confirmation"
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        bookingStep === "form"
                          ? "border-yellow-500 bg-yellow-500/20"
                          : bookingStep === "confirmation"
                          ? "border-green-500 bg-green-500/20"
                          : "border-gray-500"
                      }`}
                    >
                      {bookingStep === "confirmation" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </div>
                    <span className="font-semibold">Datos</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              {bookingStep === "barbero" && (
                <BarberSelection
                  selectedBarberId={selectedBarberId}
                  onBarberSelect={setSelectedBarberId}
                  onNext={() => setBookingStep("calendar")}
                />
              )}

              {bookingStep === "calendar" && (
                <BookingCalendar
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  bookings={transformedBookings}
                  selectedBarberId={selectedBarberId}
                  onDateSelect={setSelectedDate}
                  onTimeSelect={setSelectedTime}
                  onNext={() => setBookingStep("service")}
                />
              )}

              {bookingStep === "service" && (
                <ServiceSelection
                  selectedServices={selectedServices}
                  onServicesChange={setSelectedServices}
                  onBack={() => setBookingStep("calendar")}
                  onNext={() => setBookingStep("form")}
                />
              )}

              {bookingStep === "form" && (
                <ClientForm
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedServices={selectedServices}
                  onBack={() => setBookingStep("service")}
                  onSubmit={handleBookingComplete}
                  isSubmitting={isCreatingReserva}
                />
              )}

              {bookingStep === "confirmation" && currentBooking && (
                <BookingConfirmation
                  booking={currentBooking}
                  onNewBooking={handleNewBooking}
                />
              )}
            </div>
          </div>
        )}

        {currentView === "admin" && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <AdminPanelSimpleUpdated
              bookings={transformedBookings}
              onCancelBooking={handleBookingCancel}
            />
          </div>
        )}
      </main>

      {/* Footer - Only show on landing page */}
      {currentView === "landing" && (
        <footer className="border-t border-gray-800 bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {/* Logo and Description */}
              <div className="md:col-span-2">
                <div className="mb-4 flex items-center space-x-3">
                  <div className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 p-2">
                    <Scissors className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Michael The Barber
                    </h3>
                    <p className="text-sm text-gray-400">Studios</p>
                  </div>
                </div>
                <p className="mb-4 text-gray-400">
                  Servicios de barbería y formación de alto estándar en
                  Coquimbo. Donde tu estilo encuentra precisión.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/michael.the.barber_studios/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 transition-colors hover:text-yellow-500"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a
                    href="https://wa.me/56912345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 transition-colors hover:text-yellow-500"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </a>
                </div>
              </div>

              {/* Contact Info */}
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
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
