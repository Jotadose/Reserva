import React from "react";
import { CheckCircle, Calendar, Clock, User, Phone, Mail, Scissors, Plus } from "lucide-react";
import { Booking } from "../types/booking";

interface BookingConfirmationProps {
  booking: Booking;
  onNewBooking: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, onNewBooking }) => {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Success Header */}
      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-8 text-center">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h2 className="mb-2 text-3xl font-bold text-white">¡Reserva Confirmada!</h2>
        <p className="text-lg text-gray-400">
          Tu cita ha sido registrada exitosamente. Recibirás un mensaje de confirmación a tu
          WhatsApp.
        </p>
      </div>

      {/* Booking Details */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
        <h3 className="mb-6 text-xl font-bold text-white">Detalles de tu reserva</h3>

        <div className="space-y-4">
          {/* Date and Time */}
          <div className="flex items-center space-x-4 rounded-xl bg-gray-800/50 p-4">
            <div className="rounded-lg bg-yellow-500/20 p-3">
              <Calendar className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="font-semibold text-white">
                {new Date(booking.date).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-gray-400">{booking.time} hrs</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-4 rounded-xl bg-gray-800/50 p-4">
            <div className="rounded-lg bg-yellow-500/20 p-3">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="font-semibold text-white">Duración estimada</p>
              <p className="text-gray-400">{booking.duration} minutos aprox.</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="flex items-center space-x-4 rounded-xl bg-gray-800/50 p-4">
            <div className="rounded-lg bg-yellow-500/20 p-3">
              <User className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="font-semibold text-white">{booking.client.name}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{booking.client.phone}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{booking.client.email}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-xl font-bold text-white">Servicios reservados</h3>

        <div className="mb-6 space-y-3">
          {booking.services.map((service, index) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-yellow-500/20 p-2">
                  {service.category === "barberia" ? (
                    <Scissors className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Plus className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div>
                  <span className="font-medium text-white">{service.name}</span>
                  <span className="block text-sm text-gray-400">{service.duration} min</span>
                </div>
              </div>
              <span className="font-semibold text-yellow-500">
                ${service.price.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-600 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">Total</span>
            <span className="text-2xl font-bold text-yellow-500">
              ${booking.totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {booking.client.notes && (
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-xl font-bold text-white">Notas adicionales</h3>
          <p className="rounded-lg bg-gray-800/50 p-4 text-gray-300">{booking.client.notes}</p>
        </div>
      )}

      {/* Important Info */}
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6">
        <h3 className="mb-3 text-lg font-bold text-yellow-500">Información importante</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Llega 10 minutos antes de tu cita</li>
          <li>
            • Si necesitas cancelar o reagendar, contáctanos con al menos 24 horas de anticipación
          </li>
          <li>• Ubicación: Lago Blanco 1585, Coquimbo</li>
          <li>• Para consultas: +56 9 1234 5678</li>
          <li>• Recibirás un recordatorio por WhatsApp 24 horas antes de tu cita</li>
          <li>• Horario de atención: Lunes a Sábado de 9:00 a 19:00</li>
        </ul>
      </div>

      {/* WhatsApp Contact */}
      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-2 text-lg font-bold text-green-500">¿Tienes alguna consulta?</h3>
            <p className="text-gray-300">Contáctanos directamente por WhatsApp</p>
          </div>
          <a
            href={`https://wa.me/56912345678?text=Hola! Tengo una consulta sobre mi reserva del ${new Date(booking.date).toLocaleDateString("es-ES")} a las ${booking.time}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-400"
          >
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={onNewBooking}
          className="transform rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:shadow-xl"
        >
          Hacer Nueva Reserva
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
