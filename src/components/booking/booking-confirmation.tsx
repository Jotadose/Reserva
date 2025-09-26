'use client'

import React from "react";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Scissors,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BookingConfirmationProps {
  booking: {
    id: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    selectedDate: string;
    selectedTime: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    notes?: string;
  };
  tenant: {
    name: string;
    contact_phone?: string;
    address?: string;
  };
  onNewBooking: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  tenant,
  onNewBooking,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const whatsappMessage = `¡Hola! Mi reserva ha sido confirmada:

📅 Fecha: ${formatDate(booking.selectedDate)}
⏰ Hora: ${booking.selectedTime}
✂️ Servicio: ${booking.serviceName}
💰 Precio: ${formatPrice(booking.servicePrice)}
👤 Cliente: ${booking.clientName}
📞 Teléfono: ${booking.clientPhone}
${booking.clientEmail ? `📧 Email: ${booking.clientEmail}` : ''}
${booking.notes ? `📝 Notas: ${booking.notes}` : ''}

¡Nos vemos pronto!`;

  const whatsappUrl = `https://wa.me/${tenant.contact_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Success Header */}
        <Card className="glass-card border-green-500/20 bg-green-500/10 p-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-white">
            ¡Reserva Confirmada!
          </h2>
          <p className="text-lg text-gray-300">
            Tu cita ha sido registrada exitosamente en {tenant.name}
          </p>
        </Card>

        {/* Booking Details */}
        <Card className="glass-card p-6">
          <h3 className="mb-6 text-xl font-bold text-white">
            Detalles de tu reserva
          </h3>

          <div className="space-y-4">
            {/* Date and Time */}
            <div className="flex items-center space-x-4 rounded-xl bg-white/5 p-4">
              <div className="rounded-lg bg-purple-500/20 p-3">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-white capitalize">
                  {formatDate(booking.selectedDate)}
                </p>
                <p className="text-gray-400">
                  {booking.selectedTime} hrs
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center space-x-4 rounded-xl bg-white/5 p-4">
              <div className="rounded-lg bg-purple-500/20 p-3">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Duración estimada</p>
                <p className="text-gray-400">{booking.serviceDuration} minutos aprox.</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="flex items-center space-x-4 rounded-xl bg-white/5 p-4">
              <div className="rounded-lg bg-purple-500/20 p-3">
                <User className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{booking.clientName}</p>
                <div className="flex flex-col space-y-1 text-sm text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{booking.clientPhone}</span>
                  </span>
                  {booking.clientEmail && (
                    <span className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{booking.clientEmail}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Service Details */}
        <Card className="glass-card p-6">
          <h3 className="mb-4 text-xl font-bold text-white">
            Servicio reservado
          </h3>

          <div className="mb-6 rounded-lg bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-purple-500/20 p-2">
                  <Scissors className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <span className="font-medium text-white">
                    {booking.serviceName}
                  </span>
                  <span className="block text-sm text-gray-400">
                    {booking.serviceDuration} min
                  </span>
                </div>
              </div>
              <span className="font-semibold text-purple-400">
                {formatPrice(booking.servicePrice)}
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white">Total</span>
              <span className="text-2xl font-bold text-purple-400">
                {formatPrice(booking.servicePrice)}
              </span>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {booking.notes && (
          <Card className="glass-card p-6">
            <h3 className="mb-4 text-xl font-bold text-white">
              Notas adicionales
            </h3>
            <p className="rounded-lg bg-white/5 p-4 text-gray-300">
              {booking.notes}
            </p>
          </Card>
        )}

        {/* Important Info */}
        <Card className="glass-card border-yellow-500/20 bg-yellow-500/10 p-6">
          <h3 className="mb-3 text-lg font-bold text-yellow-400">
            Información importante
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Llega 10 minutos antes de tu cita</li>
            <li>
              • Si necesitas cancelar o reagendar, contáctanos con al menos 24
              horas de anticipación
            </li>
            {tenant.address && (
              <li className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Ubicación: {tenant.address}
              </li>
            )}
            {tenant.contact_phone && (
              <li className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                Para consultas: {tenant.contact_phone}
              </li>
            )}
            <li>
              • Recibirás un recordatorio por WhatsApp 24 horas antes de tu cita
            </li>
            <li>• Horario de atención: Lunes a Sábado de 9:00 a 19:00</li>
          </ul>
        </Card>

        {/* WhatsApp Contact */}
        {tenant.contact_phone && (
          <Card className="glass-card border-green-500/20 bg-green-500/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-2 text-lg font-bold text-green-400">
                  ¿Tienes alguna consulta?
                </h3>
                <p className="text-gray-300">
                  Contáctanos directamente por WhatsApp
                </p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-green-400 hover:scale-105"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </Card>
        )}

        {/* Action Button */}
        <div className="text-center">
          <Button
            onClick={onNewBooking}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transform transition-all duration-300 hover:scale-105 px-8 py-4 text-lg font-bold shadow-lg"
          >
            Hacer Nueva Reserva
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;