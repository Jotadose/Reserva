import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Save,
  X,
  Clock,
  Phone,
  Mail,
  Scissors,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Booking } from "../types/booking";
import { LoadingSpinner } from "./common/LoadingSpinner";

interface BookingEditModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  loading?: boolean;
}

export const BookingEditModal: React.FC<BookingEditModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    service: "",
    total: "",
    notes: "",
    status: "confirmed",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (booking) {
      setFormData({
        clientName: booking.clientName || booking.client?.name || "",
        phone: booking.client?.phone || "",
        email: booking.client?.email || "",
        date: booking.date || "",
        time: booking.time || "",
        service: booking.service || "",
        total: ((booking.total || 0) / 100).toString(),
        notes: booking.notes || "",
        status: booking.status || "confirmed",
      });
      setErrors({});
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = "El nombre es obligatorio";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Formato de teléfono inválido";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!formData.date) {
      newErrors.date = "La fecha es obligatoria";
    }

    if (!formData.time) {
      newErrors.time = "La hora es obligatoria";
    }

    if (!formData.service.trim()) {
      newErrors.service = "El servicio es obligatorio";
    }

    if (!formData.total || parseFloat(formData.total) <= 0) {
      newErrors.total = "El precio debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const updates: Partial<Booking> = {
      clientName: formData.clientName.trim(),
      date: formData.date,
      time: formData.time,
      service: formData.service.trim(),
      total: Math.round(parseFloat(formData.total) * 100), // Convertir a centavos
      notes: formData.notes.trim(),
      status: formData.status as any,
      client: {
        ...booking.client,
        name: formData.clientName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
      },
    };

    await onSave(booking.id, updates);
  };

  const handleClose = () => {
    setFormData({
      clientName: "",
      phone: "",
      email: "",
      date: "",
      time: "",
      service: "",
      total: "",
      notes: "",
      status: "confirmed",
    });
    setErrors({});
    onClose();
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
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-yellow-500/20 p-2">
              <Scissors className="h-5 w-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Editar Reserva</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Cliente Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center text-sm font-medium text-gray-300">
                  <User className="mr-2 h-4 w-4" />
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white transition-colors focus:border-yellow-500 focus:outline-none ${
                    errors.clientName
                      ? "border-red-500"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  placeholder="Nombre completo"
                />
                {errors.clientName && (
                  <p className="mt-1 flex items-center text-sm text-red-400">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {errors.clientName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center text-sm font-medium text-gray-300">
                  <Phone className="mr-2 h-4 w-4" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white transition-colors focus:border-yellow-500 focus:outline-none ${
                    errors.phone
                      ? "border-red-500"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  placeholder="+1 234 567 8900"
                />
                {errors.phone && (
                  <p className="mt-1 flex items-center text-sm text-red-400">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-gray-300">
                <Mail className="mr-2 h-4 w-4" />
                Email (opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white transition-colors focus:border-yellow-500 focus:outline-none ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-600 hover:border-gray-500"
                }`}
                placeholder="cliente@email.com"
              />
              {errors.email && (
                <p className="mt-1 flex items-center text-sm text-red-400">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center text-sm font-medium text-gray-300">
                  <Calendar className="mr-2 h-4 w-4" />
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white transition-colors focus:border-yellow-500 focus:outline-none ${
                    errors.date
                      ? "border-red-500"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 flex items-center text-sm text-red-400">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {errors.date}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center text-sm font-medium text-gray-300">
                  <Clock className="mr-2 h-4 w-4" />
                  Hora *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white transition-colors focus:border-yellow-500 focus:outline-none ${
                    errors.time
                      ? "border-red-500"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                />
                {errors.time && (
                  <p className="mt-1 flex items-center text-sm text-red-400">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {errors.time}
                  </p>
                )}
              </div>
            </div>

            {/* Servicio y Precio */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center text-sm font-medium text-gray-300">
                  <Scissors className="mr-2 h-4 w-4" />
                  Servicio *
                </label>
                <select
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white transition-colors focus:border-yellow-500 focus:outline-none ${
                    errors.service
                      ? "border-red-500"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <option value="">Seleccionar servicio</option>
                  <option value="Corte de Cabello">Corte de Cabello</option>
                  <option value="Barba">Barba</option>
                  <option value="Corte + Barba">Corte + Barba</option>
                  <option value="Afeitado Clásico">Afeitado Clásico</option>
                  <option value="Lavado + Corte">Lavado + Corte</option>
                  <option value="Diseño Especial">Diseño Especial</option>
                </select>
                {errors.service && (
                  <p className="mt-1 flex items-center text-sm text-red-400">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {errors.service}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center text-sm font-medium text-gray-300">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Precio *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total}
                  onChange={(e) =>
                    setFormData({ ...formData, total: e.target.value })
                  }
                  className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white transition-colors focus:border-yellow-500 focus:outline-none ${
                    errors.total
                      ? "border-red-500"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  placeholder="0.00"
                />
                {errors.total && (
                  <p className="mt-1 flex items-center text-sm text-red-400">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {errors.total}
                  </p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-gray-300">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white transition-colors hover:border-gray-500 focus:border-yellow-500 focus:outline-none"
              >
                <option value="confirmed">Confirmada</option>
                <option value="pending">Pendiente</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
                <option value="no-show">No Show</option>
              </select>
            </div>

            {/* Notas */}
            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-gray-300">
                Notas adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white transition-colors hover:border-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="Observaciones, preferencias del cliente, etc."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-600 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center rounded-lg bg-yellow-500 px-4 py-2 text-black font-medium transition-colors hover:bg-yellow-400 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
