import React, { useState } from "react";
import { ArrowLeft, User, Phone, Mail, MessageSquare } from "lucide-react";
import { Service, TimeSlot, Booking } from "../types/booking";

interface ClientFormProps {
  selectedDate: string;
  selectedTime: TimeSlot | null;
  selectedServices: Service[];
  onBack: () => void;
  onSubmit: (booking: Booking) => void;
  isSubmitting?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  selectedDate,
  selectedTime,
  selectedServices,
  onBack,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "El nombre no puede tener más de 50 caracteres";
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else {
      const phoneClean = formData.phone.replace(/[\s\-\(\)]/g, "");
      if (!/^[\+]?[0-9]{8,15}$/.test(phoneClean)) {
        newErrors.phone = "Formato de teléfono inválido (ej: +56912345678)";
      }
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    } else if (formData.email.length > 100) {
      newErrors.email = "El email no puede tener más de 100 caracteres";
    }

    // Validar notas (opcional pero con límite)
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = "Las notas no pueden tener más de 500 caracteres";
    }

    // Validar que la fecha/hora sigue siendo válida
    const selectedDateObj = new Date(selectedDate + "T12:00:00"); // Usar mediodía para consistencia
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDateObj);
    selectedDateOnly.setHours(0, 0, 0, 0);

    if (selectedDateOnly < today) {
      newErrors.general = "La fecha seleccionada ya no es válida. Por favor selecciona otra fecha.";
    } else if (selectedDateObj.getDay() === 0) {
      newErrors.general = "Los domingos estamos cerrados. Por favor selecciona otra fecha.";
    } else if (selectedTime && selectedDateOnly.getTime() === today.getTime()) {
      // Si es hoy, validar que no sea muy tarde
      const now = new Date();
      const [hour, minute] = selectedTime.time.split(":").map(Number);
      const slotTime = new Date();
      slotTime.setHours(hour, minute, 0, 0);
      const diffHours = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours < 2) {
        newErrors.general =
          "Para reservas de hoy necesitas al menos 2 horas de anticipación. Por favor selecciona otro horario.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
    const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      date: selectedDate,
      time: selectedTime?.time || "",
      services: selectedServices,
      client: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        notes: formData.notes.trim() || undefined,
      },
      totalPrice,
      duration: totalDuration,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    onSubmit(booking);
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
        <h2 className="mb-6 text-2xl font-bold text-white">Datos del cliente</h2>

        {/* Booking Summary */}
        <div className="mb-8 rounded-xl bg-gray-800/50 p-4">
          <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-400">Fecha</p>
              <p className="font-semibold text-white">
                {new Date(selectedDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Hora</p>
              <p className="font-semibold text-white">{selectedTime?.time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Duración estimada</p>
              <p className="font-semibold text-white">{totalDuration} min</p>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Servicios seleccionados</p>
                <p className="text-white">{selectedServices.map((s) => s.name).join(", ")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-bold text-yellow-500">${totalPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error general */}
        {errors.general && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm font-medium text-red-400">⚠️ {errors.general}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-white">
                <User className="mr-2 inline h-5 w-5" />
                Nombre completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full rounded-xl border bg-gray-800 px-4 py-3 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20"
                }`}
                placeholder="Ingresa tu nombre completo"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-2 block font-semibold text-white">
                <Phone className="mr-2 inline h-5 w-5" />
                Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full rounded-xl border bg-gray-800 px-4 py-3 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20"
                }`}
                placeholder="+56 9 1234 5678"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-white">
              <Mail className="mr-2 inline h-5 w-5" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full rounded-xl border bg-gray-800 px-4 py-3 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20"
              }`}
              placeholder="tu.email@ejemplo.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-2 block font-semibold text-white">
              <MessageSquare className="mr-2 inline h-5 w-5" />
              Notas adicionales (opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              maxLength={500}
              className={`w-full resize-none rounded-xl border bg-gray-800 px-4 py-3 text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${
                errors.notes
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20"
              }`}
              placeholder="¿Tienes alguna preferencia especial o comentario?"
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.notes && <p className="text-sm text-red-400">{errors.notes}</p>}
              <p
                className={`ml-auto text-xs ${
                  formData.notes.length > 450 ? "text-yellow-500" : "text-gray-500"
                }`}
              >
                {formData.notes.length}/500 caracteres
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className={`flex items-center space-x-2 rounded-xl px-6 py-3 font-semibold transition-colors ${
                isSubmitting
                  ? "cursor-not-allowed bg-gray-800 text-gray-500"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex transform items-center justify-center space-x-2 rounded-xl px-8 py-4 text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isSubmitting
                  ? "cursor-not-allowed bg-gray-600 text-gray-400"
                  : "bg-yellow-500 text-black hover:bg-yellow-400"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Confirmar Reserva</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
