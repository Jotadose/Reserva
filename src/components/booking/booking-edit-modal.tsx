'use client'

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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseClient } from "@/lib/supabase";

interface BookingEditModalProps {
  booking: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
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
    price: "",
    notes: "",
    status: "confirmed",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        clientName: booking.client_name || "",
        phone: booking.client_phone || "",
        email: booking.client_email || "",
        date: booking.date || "",
        time: booking.time || "",
        service: booking.service_name || "",
        price: booking.price ? (booking.price / 100).toString() : "",
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

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "El precio debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const supabase = getSupabaseClient();
      
      // Actualizar la reserva en Supabase
      const { error } = await supabase
        .from('services') // Asumiendo que tienes una tabla bookings o similar
        .update({
          client_name: formData.clientName.trim(),
          client_phone: formData.phone.trim(),
          client_email: formData.email.trim() || null,
          date: formData.date,
          time: formData.time,
          service_name: formData.service.trim(),
          price: Math.round(parseFloat(formData.price) * 100), // Convertir a centavos
          notes: formData.notes.trim() || null,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      await onSave();
      onClose();
    } catch (error) {
      console.error('Error updating booking:', error);
      setErrors({ general: 'Error al actualizar la reserva' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      clientName: "",
      phone: "",
      email: "",
      date: "",
      time: "",
      service: "",
      price: "",
      notes: "",
      status: "confirmed",
    });
    setErrors({});
    onClose();
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
            <div className="rounded-lg bg-purple-500/20 p-2">
              <Scissors className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Editar Reserva</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Error general */}
            {errors.general && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-red-400 text-sm flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {errors.general}
                </p>
              </div>
            )}

            {/* Cliente Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="clientName" className="text-white flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Nombre del Cliente *
                </Label>
                <Input
                  id="clientName"
                  type="text"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  className={`bg-gray-800 border-gray-600 text-white ${
                    errors.clientName ? 'border-red-500' : ''
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
                <Label htmlFor="phone" className="text-white flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Teléfono *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`bg-gray-800 border-gray-600 text-white ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                  placeholder="+56 9 0000 0000"
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
              <Label htmlFor="email" className="text-white flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Email (opcional)
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`bg-gray-800 border-gray-600 text-white ${
                  errors.email ? 'border-red-500' : ''
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
                <Label htmlFor="date" className="text-white flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Fecha *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`bg-gray-800 border-gray-600 text-white ${
                    errors.date ? 'border-red-500' : ''
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
                <Label htmlFor="time" className="text-white flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Hora *
                </Label>
                <select
                  id="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-white ${
                    errors.time ? 'border-red-500' : 'border-gray-600'
                  }`}
                  aria-label="Seleccionar hora"
                >
                  <option value="">Seleccionar hora</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
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
                <Label htmlFor="service" className="text-white flex items-center">
                  <Scissors className="mr-2 h-4 w-4" />
                  Servicio *
                </Label>
                <Input
                  id="service"
                  type="text"
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className={`bg-gray-800 border-gray-600 text-white ${
                    errors.service ? 'border-red-500' : ''
                  }`}
                  placeholder="Nombre del servicio"
                />
                {errors.service && (
                  <p className="mt-1 flex items-center text-sm text-red-400">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {errors.service}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="price" className="text-white flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Precio *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="1000"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={`bg-gray-800 border-gray-600 text-white ${
                    errors.price ? 'border-red-500' : ''
                  }`}
                  placeholder="15000"
                />
                {errors.price && (
                  <p className="mt-1 flex items-center text-sm text-red-400">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {errors.price}
                  </p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="status" className="text-white">
                Estado
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white"
                aria-label="Seleccionar estado"
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
              <Label htmlFor="notes" className="text-white">
                Notas adicionales
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Observaciones, preferencias del cliente, etc."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};