import React, { useState } from "react";
import { Calendar, User, Save, X } from "lucide-react";
import { Booking, Service } from "../types/booking";
import { useBookingActions } from "../hooks/useBookingActions";
import { LoadingSpinner } from "./common/LoadingSpinner";

interface BookingEditModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  availableServices: Service[];
}

export const BookingEditModal: React.FC<BookingEditModalProps> = ({
  booking,
  isOpen,
  onClose,
  onUpdate,
  availableServices,
}) => {
  const { loading } = useBookingActions(onUpdate);
  const [formData, setFormData] = useState({
    date: booking.date,
    time: booking.time,
    clientName: booking.client.name,
    clientPhone: booking.client.phone,
    clientEmail: booking.client.email,
    clientNotes: booking.client.notes || "",
    selectedServices: booking.services.map((s) => s.id),
    status: booking.status,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = "El nombre es requerido";
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = "El teléfono es requerido";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.clientPhone)) {
      newErrors.clientPhone = "Formato de teléfono inválido";
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = "Formato de email inválido";
    }

    if (!formData.date) {
      newErrors.date = "La fecha es requerida";
    }

    if (!formData.time) {
      newErrors.time = "La hora es requerida";
    }

    if (formData.selectedServices.length === 0) {
      newErrors.services = "Debe seleccionar al menos un servicio";
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
      const selectedServiceObjects = availableServices.filter((s) =>
        formData.selectedServices.includes(s.id),
      );

      const updatedBooking: Booking = {
        ...booking,
        date: formData.date,
        time: formData.time,
        client: {
          name: formData.clientName,
          phone: formData.clientPhone,
          email: formData.clientEmail,
          notes: formData.clientNotes,
        },
        services: selectedServiceObjects,
        totalPrice: selectedServiceObjects.reduce((sum, s) => sum + s.price, 0),
        duration: selectedServiceObjects.reduce((sum, s) => sum + s.duration, 0),
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };

      // Simular actualización API
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBooking),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la reserva");
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating booking:", error);
      setErrors({ submit: "Error al actualizar la reserva" });
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const timeSlots = (() => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Editar Reserva</h2>
            <p className="text-sm text-gray-600">ID: {booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Cliente Information */}
            <div className="space-y-4">
              <h3 className="flex items-center text-lg font-semibold text-gray-900">
                <User className="mr-2 h-5 w-5" />
                Información del Cliente
              </h3>

              <div>
                <label
                  htmlFor="client-name"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Nombre Completo *
                </label>
                <input
                  id="client-name"
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nombre del cliente"
                />
                {errors.clientName && (
                  <p className="mt-1 text-sm text-red-500">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="client-phone"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Teléfono *
                </label>
                <input
                  id="client-phone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientPhone: e.target.value }))
                  }
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+57 300 123 4567"
                />
                {errors.clientPhone && (
                  <p className="mt-1 text-sm text-red-500">{errors.clientPhone}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="client-email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>
                <input
                  id="client-email"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientEmail: e.target.value }))
                  }
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.clientEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="cliente@email.com"
                />
                {errors.clientEmail && (
                  <p className="mt-1 text-sm text-red-500">{errors.clientEmail}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="client-notes"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Notas del Cliente
                </label>
                <textarea
                  id="client-notes"
                  value={formData.clientNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientNotes: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </div>
            </div>

            {/* Appointment Information */}
            <div className="space-y-4">
              <h3 className="flex items-center text-lg font-semibold text-gray-900">
                <Calendar className="mr-2 h-5 w-5" />
                Información de la Cita
              </h3>

              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Fecha *
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
              </div>

              <div>
                <label
                  htmlFor="booking-time"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Hora *
                </label>
                <select
                  id="booking-time"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
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
                  htmlFor="booking-status"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Estado
                </label>
                <select
                  id="booking-status"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="in-progress">En Progreso</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="no-show">No Show</option>
                  <option value="rescheduled">Reagendada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Services Selection */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Servicios *</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    formData.selectedServices.includes(service.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.duration} min</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${service.price.toLocaleString("es-CO")}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {errors.services && <p className="mt-2 text-sm text-red-500">{errors.services}</p>}

            {/* Total */}
            {formData.selectedServices.length > 0 && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    $
                    {availableServices
                      .filter((s) => formData.selectedServices.includes(s.id))
                      .reduce((sum, s) => sum + s.price, 0)
                      .toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Duración total:</span>
                  <span>
                    {availableServices
                      .filter((s) => formData.selectedServices.includes(s.id))
                      .reduce((sum, s) => sum + s.duration, 0)}{" "}
                    minutos
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading["update-booking"]}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading["update-booking"] ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
