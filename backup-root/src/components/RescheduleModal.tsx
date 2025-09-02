import React, { useState } from "react";
import { Calendar, Clock, AlertCircle, X } from "lucide-react";
import { Booking } from "../types/booking";
import { useBookingActions } from "../hooks/useBookingActions";
import { LoadingSpinner } from "./common/LoadingSpinner";

interface RescheduleModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  booking,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { rescheduleBooking, loading } = useBookingActions(onUpdate);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newDate) {
      newErrors.date = "La nueva fecha es requerida";
    } else {
      const selectedDate = new Date(newDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "La fecha no puede ser anterior a hoy";
      }
    }

    if (!newTime) {
      newErrors.time = "La nueva hora es requerida";
    }

    if (!reason.trim()) {
      newErrors.reason = "El motivo del reagendamiento es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await rescheduleBooking(booking.id, newDate, newTime, reason);
      onClose();
      // Reset form
      setNewDate("");
      setNewTime("");
      setReason("");
      setErrors({});
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      setErrors({ submit: "Error al reagendar la cita" });
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reagendar Cita</h2>
            <p className="text-sm text-gray-600">Cliente: {booking.client.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Appointment Info */}
        <div className="border-b border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-2 text-sm font-medium text-gray-900">Cita Actual</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(booking.date).toLocaleDateString("es-CO")}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{booking.time}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="new-date" className="mb-1 block text-sm font-medium text-gray-700">
                Nueva Fecha *
              </label>
              <input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="new-time" className="mb-1 block text-sm font-medium text-gray-700">
                Nueva Hora *
              </label>
              <select
                id="new-time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.time ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccionar hora</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
            </div>

            <div>
              <label
                htmlFor="reschedule-reason"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Motivo del Reagendamiento *
              </label>
              <textarea
                id="reschedule-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.reason ? "border-red-500" : "border-gray-300"
                }`}
                rows={3}
                placeholder="Describe el motivo del reagendamiento..."
              />
              {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
            </div>

            {/* Warning */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Importante:</p>
                  <p>El cliente será notificado automáticamente sobre el cambio de fecha y hora.</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading["reschedule"]}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading["reschedule"] ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Reagendando...</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  <span>Reagendar Cita</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
