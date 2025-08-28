import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
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
import ClientForm from "./components/ClientForm";
import { AdminPanelEnhanced } from "./components/AdminPanelEnhanced";
import BookingConfirmation from "./components/BookingConfirmation";
import LandingPage from "./components/LandingPage";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import SupabaseProvider from "./providers/SupabaseProvider";
import { useBookingsSupabase } from "./hooks/useBookingsSupabase";
import { Booking, Service, TimeSlot } from "./types/booking";

function AppContent() {
  const { addToast } = useToast();
  
  // Estados de la aplicación
  const [currentView, setCurrentView] = useState<"landing" | "booking" | "admin">("landing");
  const [bookingStep, setBookingStep] = useState<"calendar" | "service" | "form" | "confirmation">(
    "calendar",
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // Hook de Supabase para reservas
  const { 
    bookings, 
    loading: isLoadingBookings, 
    createBooking,
    stats 
  } = useBookingsSupabase();

  // Función para crear nueva reserva
  const handleCreateBooking = async (clientData: {
    name: string;
    phone: string;
    email: string;
    notes?: string;
  }) => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      addToast({
        type: "error",
        title: "Error",
        message: "Faltan datos requeridos para la reserva",
      });
      return;
    }

    setIsCreatingBooking(true);

    try {
      const bookingData = {
        client: clientData,
        date: selectedDate,
        time: selectedTime.time,
        services: selectedServices.map(service => ({
          id: service.id,
          name: service.name,
          price: service.price,
          duration: service.duration
        })),
        notes: clientData.notes
      };

      const newBooking = await createBooking(bookingData);

      // Transformar al formato del frontend para mostrar en confirmación
      const frontendBooking: Booking = {
        id: newBooking.id,
        date: selectedDate,
        time: selectedTime.time,
        status: 'confirmed',
        duration: selectedServices.reduce((sum, s) => sum + s.duration, 0),
        client: clientData,
        services: selectedServices,
        total: selectedServices.reduce((sum, s) => sum + s.price, 0),
        notes: clientData.notes
      };

      setCurrentBooking(frontendBooking);
      setBookingStep("confirmation");

      addToast({
        type: "success",
        title: "¡Reserva confirmada!",
        message: `Cita agendada para ${clientData.name}`,
      });

    } catch (error) {
      console.error("Error creating booking:", error);
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudo crear la reserva",
      });
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Función para resetear el flujo de reserva
  const resetBookingFlow = () => {
    setBookingStep("calendar");
    setSelectedDate("");
    setSelectedTime(null);
    setSelectedServices([]);
    setCurrentBooking(null);
  };

  // Función para finalizar reserva y volver al inicio
  const finishBooking = () => {
    resetBookingFlow();
    setCurrentView("landing");
  };

  // Funciones de navegación
  const goToBookingCalendar = () => {
    setCurrentView("booking");
    setBookingStep("calendar");
    setMobileMenuOpen(false);
  };

  const goToAdmin = () => {
    setCurrentView("admin");
    setMobileMenuOpen(false);
  };

  const goToLanding = () => {
    setCurrentView("landing");
    setMobileMenuOpen(false);
  };

  // Navegación entre pasos
  const goToServiceSelection = () => {
    if (selectedDate && selectedTime) {
      setBookingStep("service");
    }
  };

  const goToForm = () => {
    if (selectedServices.length > 0) {
      setBookingStep("form");
    }
  };

  const goBackToCalendar = () => {
    setBookingStep("calendar");
  };

  const goBackToServices = () => {
    setBookingStep("service");
  };

  // Función para obtener horarios ocupados
  const getOccupiedSlots = (date: string) => {
    return bookings
      .filter((booking) => booking.date === date && booking.status !== "cancelled")
      .map((booking) => booking.time);
  };

  // Renderizado principal
  const renderMainContent = () => {
    if (currentView === "landing") {
      return <LandingPage onStartBooking={goToBookingCalendar} />;
    }

    if (currentView === "admin") {
      return <AdminPanelEnhanced bookings={bookings} />;
    }

    if (currentView === "booking") {
      switch (bookingStep) {
        case "calendar":
          return (
            <BookingCalendar
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
              onNext={goToServiceSelection}
              occupiedSlots={getOccupiedSlots}
            />
          );
        case "service":
          return (
            <ServiceSelection
              selectedServices={selectedServices}
              onServicesChange={setSelectedServices}
              onNext={goToForm}
              onBack={goBackToCalendar}
            />
          );
        case "form":
          return (
            <ClientForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedServices={selectedServices}
              onSubmit={handleCreateBooking}
              onBack={goBackToServices}
              isLoading={isCreatingBooking}
            />
          );
        case "confirmation":
          return (
            <BookingConfirmation 
              booking={currentBooking} 
              onFinish={finishBooking} 
            />
          );
        default:
          return null;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={goToLanding}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Barber Studio</h1>
                <p className="text-xs text-gray-500">Premium Experience</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={goToLanding}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "landing"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Scissors className="h-4 w-4" />
                <span>Inicio</span>
              </button>

              <button
                onClick={goToBookingCalendar}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "booking"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Reservar</span>
              </button>

              <button
                onClick={goToAdmin}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "admin"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Panel Admin</span>
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg border-t border-gray-200 z-30">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={goToLanding}
                className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentView === "landing"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Scissors className="h-5 w-5" />
                <span>Inicio</span>
              </button>

              <button
                onClick={goToBookingCalendar}
                className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentView === "booking"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Reservar Cita</span>
              </button>

              <button
                onClick={goToAdmin}
                className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  currentView === "admin"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Panel Administrativo</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${mobileMenuOpen ? "mt-0" : ""}`}>
        {renderMainContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo y descripción */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Barber Studio Premium</h3>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Experiencia premium en cortes y cuidado masculino. Reserva tu cita y vive la
                diferencia de un servicio profesional.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  href="https://wa.me/573001234567"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <MessageCircle className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Información de contacto */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">Calle 123 #45-67, Bogotá</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">+57 300 123 4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">info@barberstudio.com</span>
                </div>
              </div>
            </div>

            {/* Horarios */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Horarios</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Lun - Vie:</span>
                  <span>9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado:</span>
                  <span>9:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo:</span>
                  <span>10:00 - 15:00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Barber Studio Premium. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Componente principal con providers
function App() {
  return (
    <SupabaseProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </SupabaseProvider>
  );
}

export default App;
