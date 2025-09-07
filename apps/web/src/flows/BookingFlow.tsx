import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";
import { useToast } from "../contexts/ToastContext";
import { Booking } from "../types/booking";

// Componentes del flujo de reserva
import BookingCalendar from "../components/BookingCalendar";
import BarberSelection from "../components/BarberSelection";
import ServiceSelection from "../components/ServiceSelection";
import ClientForm from "../components/ClientForm";
import BookingConfirmation from "../components/BookingConfirmation";

const BookingFlow: React.FC = () => {
  const { addToast } = useToast();
  const { crearReserva, verificarDisponibilidad } = useReservasMVP();
  const { crearUsuario, buscarPorEmail } = useUsuarios();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    bookingStep,
    setBookingStep,
    selectedDate,
    selectedTime,
    selectedService,
    selectedBarberId,
    currentBooking,
    setDate,
    setTime,
    setService,
    setBarberId,
    resetBookingProcess,
    addBooking,
  } = useAppStore();

  // Funciones de navegación entre pasos
  const goToNextStep = () => {
    switch (bookingStep) {
      case "barber":
        if (selectedBarberId) setBookingStep("services");
        break;
      case "services":
        if (selectedService) setBookingStep("date");
        break;
      case "date":
        if (selectedDate && selectedTime) setBookingStep("form");
        break;
      case "form":
        break; // La creación pasa a confirmation externamente
    }
  };

  const goToPreviousStep = () => {
    switch (bookingStep) {
      case "barber":
        handleBackToHome();
        break;
      case "services":
        setBookingStep("barber");
        break;
      case "date":
        setBookingStep("services");
        break;
      case "form":
        setBookingStep("date");
        break;
      case "confirmation":
        setBookingStep("form");
        break;
    }
  };

  const handleBackToHome = () => {
    // Sin react-router: simplemente resetear y quizá emitir evento futuro
    resetBookingProcess();
    // Nota: navegación a home simplificada al no usar react-router global
  };

  // Handle booking submission

  const buildReservaPayload = (booking: Booking, usuarioId?: string) => {
    // Backend ahora calcula hora_fin, duración y precio total usando el ID del servicio
    if (!booking.service) {
      throw new Error("Servicio no seleccionado para crear la reserva.");
    }
    return {
      id_cliente: usuarioId,
      id_barbero: booking.barberId,
      fecha_reserva: booking.date,
      hora_inicio: booking.time,
      notas_cliente: booking.client.notes || "",
      id_servicio: booking.service.id,
    } as const;
  };

  const ensureUsuario = async (booking: Booking) => {
    let usuario = await buscarPorEmail(booking.client.email);
    if (usuario) {
      console.log("👤 Usuario existente encontrado:", usuario);
      return usuario.id_usuario;
    }
    const usuarioData = {
      nombre: booking.client.name,
      telefono: booking.client.phone,
      email: booking.client.email,
      rol: "cliente" as const,
      activo: true,
    };
    console.log("👤 Creando nuevo usuario:", usuarioData);
    usuario = await crearUsuario(usuarioData as any);
    console.log("✅ Usuario creado:", usuario);
    return usuario?.id_usuario;
  };

  const handleBookingSubmit = async (booking: Booking) => {
    setIsSubmitting(true);
    try {
      console.log("💾 Iniciando proceso de reserva MVP:", booking);

      // 1. Validaciones previas
      if (!selectedBarberId || !booking.date || !booking.time) {
        throw new Error("Faltan datos esenciales (barbero, fecha u hora).");
      }

      // 2. Verificación de disponibilidad en tiempo real
      console.log("🔍 Verificando disponibilidad en tiempo real...");
      if (!booking.service) {
        throw new Error(
          "No se ha seleccionado un servicio para la verificación."
        );
      }
      const { esDisponible, mensaje } = await verificarDisponibilidad({
        id_barbero: selectedBarberId,
        fecha: booking.date,
        hora: booking.time,
        id_servicio: booking.service.id,
      });

      if (!esDisponible) {
        console.warn("⏰ Horario no disponible:", mensaje);
        addToast({
          title: "Horario no disponible",
          message:
            mensaje ||
            "El horario que seleccionaste fue ocupado. Por favor, elige otro.",
          type: "warning",
          duration: 8000,
        });
        // Retroceder al paso de selección de tiempo
        setBookingStep("time");
        return; // Detener el proceso
      }
      console.log("✅ Disponibilidad confirmada.");

      // 3. Asegurar existencia del usuario
      const usuarioId = await ensureUsuario(booking);
      if (!usuarioId) {
        throw new Error("No se pudo obtener o crear el usuario cliente.");
      }

      // 4. Construir y enviar la reserva
      const reservaData = buildReservaPayload(booking, usuarioId);
      console.log("📅 Creando reserva con datos:", reservaData);
      const reservaCreada = await crearReserva(reservaData as any);
      console.log("✅ Reserva creada (API):", reservaCreada);

      // 5. Mapear respuesta de la API al formato del frontend
      const bookingFromApi = mapApiToBooking(reservaCreada, booking);

      // 6. Actualizar estado global y mostrar confirmación
      addBooking(bookingFromApi);
      setBookingStep("confirmation");
      addToast({
        title: "¡Reserva confirmada!",
        message: `Tu cita ha sido agendada para el ${bookingFromApi.date} a las ${bookingFromApi.time}`,
        type: "success",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("❌ Error al crear reserva:", error);
      // Loguear detalles del error
      if (error?.message) console.error("Mensaje:", error.message);
      if (error?.stack) console.error("Stack:", error.stack);
      if (error?.response) console.error("Response:", error.response);

      addToast({
        title: "Error al crear reserva",
        message: error?.message
          ? `Error: ${error.message}`
          : "Ocurrió un problema al procesar tu reserva. Por favor intenta nuevamente.",
        type: "error",
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapApiToBooking = (
    reservaCreada: any,
    originalBooking: Booking
  ): Booking => {
    const mapEstado = (estado: string): Booking["status"] => {
      switch (estado) {
        case "pendiente":
          return "pending";
        case "confirmada":
          return "confirmed";
        case "en_progreso":
          return "in-progress";
        case "completada":
          return "completed";
        case "cancelada":
          return "cancelled";
        case "no_show":
          return "no-show";
        default:
          return "pending";
      }
    };

    return {
      id: reservaCreada.id_reserva,
      date: reservaCreada.fecha_reserva,
      time: reservaCreada.hora_inicio,
      endTime: reservaCreada.hora_fin,
      barberId: reservaCreada.id_barbero,
      service: originalBooking.service, // Mantener los detalles del servicio del frontend
      client: originalBooking.client,
      totalPrice: reservaCreada.precio_total,
      duration: reservaCreada.duracion_minutos,
      status: mapEstado(reservaCreada.estado),
      createdAt: reservaCreada.created_at,
      updatedAt: reservaCreada.updated_at,
    };
  };

  // Progress indicator
  const getStepNumber = () => {
    switch (bookingStep) {
      case "barber":
        return 1;
      case "services":
        return 2;
      case "date":
        return 3;
      case "form":
        return 4;
      case "confirmation":
        return 5;
      default:
        return 1;
    }
  };

  const renderStep = () => {
    switch (bookingStep) {
      case "barber":
        return (
          <BarberSelection
            selectedBarberId={selectedBarberId || ""}
            onBarberSelect={setBarberId}
            onNext={goToNextStep}
          />
        );
      case "services":
        return (
          <ServiceSelection
            selectedService={selectedService}
            onServiceChange={setService}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case "date":
        return (
          <>
            <BookingCalendar
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedService={selectedService}
              selectedBarberId={selectedBarberId || undefined}
              onDateSelect={(d) => {
                setDate(d);
                setTime(null); // Resetea la hora al cambiar de fecha
              }}
              onTimeSelect={(t) => {
                setTime(t); // Solo actualiza la hora, no avanza
              }}
              onNext={goToNextStep}
            />
            {selectedTime && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={goToNextStep}
                  className="rounded-lg bg-yellow-500 px-6 py-2 font-bold text-black transition-colors hover:bg-yellow-400"
                >
                  Continuar
                </button>
              </div>
            )}
          </>
        );
      case "form":
        return (
          <ClientForm
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedService={selectedService}
            selectedBarberId={selectedBarberId || undefined}
            onBack={goToPreviousStep}
            onSubmit={handleBookingSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case "confirmation":
        return currentBooking ? (
          <BookingConfirmation
            booking={currentBooking}
            onNewBooking={() => {
              resetBookingProcess();
              setBookingStep("barber");
            }}
          />
        ) : (
          <div className="text-center text-white">
            <p>Error: No se encontró la información de la reserva.</p>
            <button
              onClick={() => {
                resetBookingProcess();
                setBookingStep("barber");
              }}
              className="mt-4 rounded-lg bg-yellow-500 px-4 py-2 text-black"
            >
              Volver al inicio
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Ya no auto-avanzamos; se requiere pulsar botón Continuar

  const stepNames = [
    "Barbero",
    "Servicios",
    "Fecha y Hora",
    "Datos",
    "Confirmación",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header with back button and progress */}
        <div className="mb-8">
          <button
            onClick={handleBackToHome}
            className="mb-6 flex items-center space-x-2 text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al inicio</span>
          </button>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Nueva Reserva</h1>
              <span className="text-gray-400">Paso {getStepNumber()} de 5</span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 h-2 w-full rounded-full bg-gray-700">
              <div
                className="h-2 rounded-full bg-yellow-500 transition-all duration-300"
                style={{ width: `${(getStepNumber() / 5) * 100}%` }}
              />
            </div>

            {/* Step Names */}
            <div className="flex justify-between text-sm">
              {stepNames.map((name, index) => (
                <span
                  key={name}
                  className={`${
                    index + 1 <= getStepNumber()
                      ? "font-medium text-yellow-500"
                      : "text-gray-500"
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="space-y-6">{renderStep()}</div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
            <h3 className="mb-2 font-medium text-white">Debug Info:</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <p>Step: {bookingStep}</p>
              <p>Date: {selectedDate || "No seleccionada"}</p>
              <p>Time: {selectedTime?.time || "No seleccionada"}</p>
              <p>Service: {selectedService?.name || "No seleccionado"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
