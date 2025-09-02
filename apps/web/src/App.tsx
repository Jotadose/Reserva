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
import AdminDashboardOptimizado from "./components/AdminDashboardOptimizado";
import BookingConfirmation from "./components/BookingConfirmation";
import LandingPage from "./components/LandingPage";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import { NotificationProvider } from "./hooks/useNotifications";
import { useReservasMVP } from "./hooks/useReservasMVP";
import { useUsuarios } from "./hooks/useUsuarios";
import { Booking, Service, TimeSlot } from "./types/booking";
import { AuthProvider } from "./hooks/useAuth";

function AppContent() {
  const { addToast } = useToast();
  const [currentView, setCurrentView] = useState<
    "landing" | "booking" | "admin"
  >("landing");
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
  const { crearReserva, loading: isCreatingReserva } = useReservasMVP();
  const { crearUsuario, buscarPorEmail } = useUsuarios();

  // Los datos ahora vienen de useReservasMVP (implementar cuando se necesite mostrar reservas)
  const transformedBookings: any[] = []; // Por ahora vacío, se implementará cuando migremos el admin

  // ✅ CREAR RESERVA MVP COMPLETA
  const handleBookingComplete = async (booking: Booking) => {
    try {
      console.log("💾 Creando reserva MVP:", booking);

      // 1. Buscar/crear usuario usando los hooks del nivel superior
      let usuario;

      // Primero buscar si el usuario ya existe
      usuario = await buscarPorEmail(booking.client.email);

      if (!usuario) {
        // Si no existe, crear uno nuevo
        const usuarioData = {
          nombre: booking.client.name,
          telefono: booking.client.phone,
          email: booking.client.email,
          activo: true,
        };

        console.log("👤 Creando nuevo usuario:", usuarioData);
        usuario = await crearUsuario(usuarioData);
        console.log("✅ Usuario creado:", usuario);
      } else {
        console.log("👤 Usuario existente encontrado:", usuario);
      }

      // 2. Crear la reserva con el ID del usuario
      const reservaData = {
        clienteId: usuario?.id,
        barberoId: booking.barberId,
        servicioIds: booking.services.map((s) => s.id),
        fecha: booking.date,
        hora: booking.time,
        duracionEstimada: booking.duration,
        estado: "pendiente",
        notas: booking.notes || "",
      };

      console.log("📅 Creando reserva con datos:", reservaData);
      const reservaCreada = await crearReserva(reservaData);
      console.log("✅ Reserva creada:", reservaCreada);

      // 3. Actualizar UI y mostrar confirmación
      setCurrentBooking(booking);
      setBookingStep("confirmation");

      // 4. Mostrar notificación de éxito
      addToast({
        title: "¡Reserva confirmada!",
        message: `Tu cita ha sido agendada para el ${booking.date} a las ${booking.time}`,
        type: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error("❌ Error al crear reserva:", error);
      addToast({
        title: "Error al crear reserva",
        message:
          "Ocurrió un problema al procesar tu reserva. Por favor intenta nuevamente.",
        type: "error",
        duration: 5000,
      });
    }
  };

  const resetBookingProcess = () => {
    setBookingStep("barbero");
    setSelectedDate("");
    setSelectedTime(null);
    setSelectedServices([]);
    setSelectedBarberId("");
    setCurrentBooking(null);
  };

  const startBookingProcess = () => {
    setCurrentView("booking");
    resetBookingProcess();
  };

  const goToAdmin = () => {
    setCurrentView("admin");
  };

  const goToLanding = () => {
    setCurrentView("landing");
  };

  const handleServiceSelect = (services: Service[]) => {
    setSelectedServices(services);
    setBookingStep("form");
  };

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarberId(barberId);
    setBookingStep("calendar");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setBookingStep("service");
  };

  const handleTimeSelect = (time: TimeSlot) => {
    setSelectedTime(time);
    setBookingStep("service");
  };

  const handleClientFormSubmit = (clientData: any) => {
    // Crear objeto de reserva completo
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      barberId: selectedBarberId,
      date: selectedDate,
      time: selectedTime?.time || "",
      duration: selectedServices.reduce((total, s) => total + s.duration, 0),
      services: selectedServices,
      status: "pending",
      client: {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
      },
      notes: clientData.notes,
      total: selectedServices.reduce((total, s) => total + s.price, 0),
      createdAt: new Date().toISOString(),
    };

    handleBookingComplete(booking);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <button
                  onClick={goToLanding}
                  className="flex items-center space-x-2 text-xl font-bold text-gray-900"
                >
                  <Scissors className="h-6 w-6 text-yellow-600" />
                  <span>Michael The Barber</span>
                </button>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              <button
                onClick={goToLanding}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Inicio
              </button>
              <button
                onClick={startBookingProcess}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Reserva
              </button>
              <button
                onClick={goToAdmin}
                className="rounded-md px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Admin
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
              >
                <span className="sr-only">
                  {mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                </span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <button
                onClick={() => {
                  goToLanding();
                  setMobileMenuOpen(false);
                }}
                className="block w-full rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Inicio
              </button>
              <button
                onClick={() => {
                  startBookingProcess();
                  setMobileMenuOpen(false);
                }}
                className="block w-full rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Reserva
              </button>
              <button
                onClick={() => {
                  goToAdmin();
                  setMobileMenuOpen(false);
                }}
                className="block w-full rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100"
              >
                Admin
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === "landing" && (
          <LandingPage onBookNow={startBookingProcess} />
        )}

        {currentView === "booking" && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Reserva tu cita
              </h1>
              <div className="flex items-center space-x-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    bookingStep === "barbero" || bookingStep === "calendar"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  1
                </div>
                <div
                  className={`h-1 w-5 ${
                    bookingStep === "service" || bookingStep === "form"
                      ? "bg-yellow-500"
                      : "bg-gray-200"
                  }`}
                />
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    bookingStep === "service" || bookingStep === "form"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  2
                </div>
                <div
                  className={`h-1 w-5 ${
                    bookingStep === "confirmation"
                      ? "bg-yellow-500"
                      : "bg-gray-200"
                  }`}
                />
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    bookingStep === "confirmation"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  3
                </div>
              </div>
            </div>

            {bookingStep === "barbero" && (
              <BarberSelection onSelect={handleBarberSelect} />
            )}

            {bookingStep === "calendar" && (
              <BookingCalendar
                barberId={selectedBarberId}
                onDateSelect={handleDateSelect}
                onTimeSelect={handleTimeSelect}
              />
            )}

            {bookingStep === "service" && (
              <ServiceSelection
                onSelect={handleServiceSelect}
                barberId={selectedBarberId}
              />
            )}

            {bookingStep === "form" && (
              <ClientForm
                onSubmit={handleClientFormSubmit}
                services={selectedServices}
                date={selectedDate}
                time={selectedTime?.time || ""}
                isLoading={isCreatingReserva}
              />
            )}

            {bookingStep === "confirmation" && currentBooking && (
              <BookingConfirmation
                booking={currentBooking}
                onNewBooking={resetBookingProcess}
              />
            )}
          </div>
        )}

        {currentView === "admin" && <AdminDashboardOptimizado />}
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
                  <a
                    href="#"
                    className="text-gray-400 transition-colors hover:text-yellow-500"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 transition-colors hover:text-yellow-500"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
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
