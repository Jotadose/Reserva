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
import AdminPanel from "./components/AdminPanel";
import BookingConfirmation from "./components/BookingConfirmation";
import LandingPage from "./components/LandingPage";
import { Booking, Service, TimeSlot } from "./types/booking";

function App() {
  const [currentView, setCurrentView] = useState<
    "landing" | "booking" | "admin"
  >("landing");
  const [bookingStep, setBookingStep] = useState<
    "calendar" | "service" | "form" | "confirmation"
  >("calendar");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  // Función para cargar reservas desde la API
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    }
  };

  // Cargar reservas al montar
  useEffect(() => {
    fetchBookings();
  }, []);


  const handleBookingComplete = async (booking: Booking) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: booking.client.name,
          phone: booking.client.phone,
          email: booking.client.email,
          date: booking.date,
          time: booking.time,
          services: booking.services,
        }),
      });
      if (res.ok) {
        await fetchBookings(); // Refresca reservas desde la API
        const saved = await res.json();
        setCurrentBooking({ ...booking, id: saved.id });
        setBookingStep("confirmation");
      } else {
        alert("Error al guardar la reserva. Intenta nuevamente.");
      }
    } catch {
      alert("Error de conexión con el servidor.");
    }
  };

  const handleNewBooking = () => {
    setBookingStep("calendar");
    setSelectedDate("");
    setSelectedTime(null);
    setSelectedServices([]);
    setCurrentBooking(null);
  };


  const handleBookingCancel = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchBookings(); // Refresca reservas desde la API
      } else {
        alert("No se pudo cancelar la reserva.");
      }
    } catch {
      alert("Error de conexión al cancelar.");
    }
  };

  const startBookingProcess = () => {
    setCurrentView("booking");
    setBookingStep("calendar");
    setSelectedDate("");
    setSelectedTime(null);
    setSelectedServices([]);
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
      <header className="bg-black/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={goToLanding}
            >
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-xl">
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
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={goToLanding}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentView === "landing"
                    ? "bg-yellow-500 text-black shadow-lg transform scale-105"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>Inicio</span>
              </button>
              <button
                onClick={goToBooking}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentView === "booking"
                    ? "bg-yellow-500 text-black shadow-lg transform scale-105"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Reservas</span>
              </button>
              <button
                onClick={goToAdmin}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentView === "admin"
                    ? "bg-yellow-500 text-black shadow-lg transform scale-105"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Admin</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
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
            <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-gray-800">
              <div className="px-4 py-4 space-y-2">
                <button
                  onClick={goToLanding}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    currentView === "landing"
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  Inicio
                </button>
                <button
                  onClick={goToBooking}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    currentView === "booking"
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  Reservas
                </button>
                <button
                  onClick={goToAdmin}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    currentView === "admin"
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="min-h-screen">
        {currentView === "landing" && (
          <LandingPage onStartBooking={startBookingProcess} />
        )}

        {currentView === "booking" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              {/* Progress Steps */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
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

                  <div className="h-px bg-gray-600 flex-1 mx-4"></div>

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
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
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

                  <div className="h-px bg-gray-600 flex-1 mx-4"></div>

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
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
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
              {bookingStep === "calendar" && (
                <BookingCalendar
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  bookings={bookings}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminPanel
              bookings={bookings}
              onCancelBooking={handleBookingCancel}
            />
          </div>
        )}
      </main>

      {/* Footer - Only show on landing page */}
      {currentView === "landing" && (
        <footer className="bg-gray-900 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo and Description */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-2 rounded-lg">
                    <Scissors className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Michael The Barber
                    </h3>
                    <p className="text-sm text-gray-400">Studios</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  Servicios de barbería y formación de alto estándar en
                  Coquimbo. Donde tu estilo encuentra precisión.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/michael.the.barber_studios/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a
                    href="https://wa.me/56912345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </a>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
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
                <h4 className="text-lg font-semibold text-white mb-4">
                  Enlaces
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={startBookingProcess}
                    className="block text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    Reservar Cita
                  </button>
                  <button
                    onClick={goToAdmin}
                    className="block text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    Panel Admin
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>
                &copy; 2025 Michael The Barber Studios. Todos los derechos
                reservados.
              </p>
              <p className="text-sm mt-2">
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

export default App;
