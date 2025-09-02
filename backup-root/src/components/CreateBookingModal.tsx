import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Tag,
  DollarSign,
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: NewBooking) => Promise<void>;
  availableServices: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
}

interface NewBooking {
  clientName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  service: string;
  notes?: string;
  totalPrice: number;
  duration: number;
  status: "confirmed" | "pending";
}

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableServices = [],
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewBooking>({
    clientName: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    service: "",
    notes: "",
    totalPrice: 0,
    duration: 45,
    status: "confirmed",
  });

  const selectedService = availableServices.find(
    (s) => s.name === formData.service
  );

  const handleServiceChange = (serviceName: string) => {
    const service = availableServices.find((s) => s.name === serviceName);
    setFormData((prev) => ({
      ...prev,
      service: serviceName,
      totalPrice: service?.price || 0,
      duration: service?.duration || 45,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (
      !formData.clientName ||
      !formData.phone ||
      !formData.date ||
      !formData.time ||
      !formData.service
    ) {
      addToast("Por favor completa todos los campos obligatorios", "error");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      addToast("Reserva creada exitosamente", "success");
      onClose();
      // Reset form
      setFormData({
        clientName: "",
        phone: "",
        email: "",
        date: "",
        time: "",
        service: "",
        notes: "",
        totalPrice: 0,
        duration: 45,
        status: "confirmed",
      });
    } catch (error) {
      addToast("Error al crear la reserva", "error");
      console.error("Error creating booking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Crear Nueva Reserva</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">
              Información del Cliente
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-300">
                  <User className="h-4 w-4" />
                  <span>Nombre Completo *</span>
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clientName: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-300">
                  <Phone className="h-4 w-4" />
                  <span>Teléfono *</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Mail className="h-4 w-4" />
                <span>Correo Electrónico</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="juan@ejemplo.com"
              />
            </div>
          </div>

          {/* Información de la Reserva */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">
              Detalles de la Reserva
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha *</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>Hora *</span>
                </label>
                <select
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Seleccionar hora</option>
                  {Array.from({ length: 20 }, (_, i) => {
                    const hour = 9 + Math.floor(i * 0.75);
                    const minute = (i * 45) % 60;
                    const timeString = `${hour
                      .toString()
                      .padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                    return (
                      <option key={timeString} value={timeString}>
                        {timeString}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Tag className="h-4 w-4" />
                <span>Servicio *</span>
              </label>
              <select
                value={formData.service}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              >
                <option value="">Seleccionar servicio</option>
                {availableServices.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name} - ${service.price.toLocaleString()} (
                    {service.duration} min)
                  </option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div className="rounded-lg border border-gray-600 bg-gray-800/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <DollarSign className="h-4 w-4" />
                    <span>Precio Total:</span>
                  </div>
                  <span className="text-xl font-bold text-green-400">
                    ${selectedService.price.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  Duración: {selectedService.duration} minutos
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-300">
                <span>Notas (Opcional)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Preferencias del cliente, observaciones especiales..."
                rows={3}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center space-x-2 text-sm font-medium text-gray-300">
                <span>Estado *</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as "confirmed" | "pending",
                  }))
                }
                className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="confirmed">Confirmada</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-600 px-6 py-3 text-gray-300 transition-colors hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
