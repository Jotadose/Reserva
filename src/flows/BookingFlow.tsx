// src/flows/BookingFlow.tsx
// QUÉ HACE: Orquesta todo el flujo de reserva desde el store
// BENEFICIO: Componente inteligente que maneja la navegación entre pasos

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAppStore } from "../store/appStore";

// Componentes del flujo de reserva
import BookingCalendar from "../components/BookingCalendar";
import ServiceSelection from "../components/ServiceSelection";
import ClientForm from "../components/ClientForm";
import BookingConfirmation from "../components/BookingConfirmation";

const BookingFlow: React.FC = () => {
  const navigate = useNavigate();
  const {
    bookingStep,
    setBookingStep,
    selectedDate,
    selectedTime,
    selectedServices,
    setDate,
    setTime,
    setServices,
    resetBookingProcess,
  } = useAppStore();

  // Funciones de navegación entre pasos
  const goToNextStep = () => {
    switch (bookingStep) {
      case "calendar":
        if (selectedDate && selectedTime) {
          setBookingStep("service");
        }
        break;
      case "service":
        if (selectedServices.length > 0) {
          setBookingStep("form");
        }
        break;
      case "form":
        // La transición a confirmation se maneja en el store cuando se crea la reserva
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (bookingStep) {
      case "service":
        setBookingStep("calendar");
        break;
      case "form":
        setBookingStep("service");
        break;
      case "confirmation":
        setBookingStep("form");
        break;
    }
  };

  const handleBackToHome = () => {
    resetBookingProcess();
    navigate("/");
  };

  // Progress indicator
  const getStepNumber = () => {
    switch (bookingStep) {
      case "calendar":
        return 1;
      case "service":
        return 2;
      case "form":
        return 3;
      case "confirmation":
        return 4;
      default:
        return 1;
    }
  };

  const renderStep = () => {
    switch (bookingStep) {
      case "calendar":
        return (
          <BookingCalendar
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedServices={selectedServices}
            onDateSelect={setDate}
            onTimeSelect={setTime}
            onNext={goToNextStep}
          />
        );

      case "service":
        return (
          <ServiceSelection
            selectedServices={selectedServices}
            onServicesChange={setServices}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );

      case "form":
        return <ClientForm onBack={goToPreviousStep} />;

      case "confirmation":
        return (
          <BookingConfirmation
            onStartNewBooking={() => {
              resetBookingProcess();
              setBookingStep("calendar");
            }}
            onBackToHome={handleBackToHome}
          />
        );

      default:
        return null;
    }
  };

  const stepNames = ["Fecha y Hora", "Servicios", "Datos", "Confirmación"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with back button and progress */}
        <div className="mb-8">
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver al inicio</span>
          </button>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-white">Nueva Reserva</h1>
              <span className="text-gray-400">Paso {getStepNumber()} de 4</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getStepNumber() / 4) * 100}%` }}
              />
            </div>

            {/* Step Names */}
            <div className="flex justify-between text-sm">
              {stepNames.map((name, index) => (
                <span
                  key={name}
                  className={`${
                    index + 1 <= getStepNumber()
                      ? "text-yellow-500 font-medium"
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
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h3 className="text-white font-medium mb-2">Debug Info:</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Step: {bookingStep}</p>
              <p>Date: {selectedDate || "No seleccionada"}</p>
              <p>Time: {selectedTime?.time || "No seleccionada"}</p>
              <p>Services: {selectedServices.length} seleccionados</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
