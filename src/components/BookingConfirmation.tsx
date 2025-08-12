import React from 'react';
import { CheckCircle, Calendar, Clock, User, Phone, Mail, Scissors, Plus } from 'lucide-react';
import { Booking } from '../types/booking';

interface BookingConfirmationProps {
  booking: Booking;
  onNewBooking: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  onNewBooking
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center bg-green-500/10 border border-green-500/20 rounded-2xl p-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">¡Reserva Confirmada!</h2>
        <p className="text-gray-400 text-lg">
          Tu cita ha sido registrada exitosamente. Recibirás un mensaje de confirmación a tu WhatsApp.
        </p>
      </div>

      {/* Booking Details */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">Detalles de tu reserva</h3>
        
        <div className="space-y-4">
          {/* Date and Time */}
          <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {new Date(booking.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-gray-400">{booking.time} hrs</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-white font-semibold">Duración estimada</p>
              <p className="text-gray-400">{booking.duration} minutos aprox.</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <User className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-white font-semibold">{booking.client.name}</p>
              <div className="flex items-center space-x-4 text-gray-400 text-sm">
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
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Servicios reservados</h3>
        
        <div className="space-y-3 mb-6">
          {booking.services.map((service, index) => (
            <div key={service.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  {service.category === 'barberia' ? (
                    <Scissors className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Plus className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div>
                  <span className="text-white font-medium">{service.name}</span>
                  <span className="text-gray-400 text-sm block">{service.duration} min</span>
                </div>
              </div>
              <span className="text-yellow-500 font-semibold">
                ${service.price.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-600 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-bold">Total</span>
            <span className="text-yellow-500 text-2xl font-bold">
              ${booking.totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {booking.client.notes && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Notas adicionales</h3>
          <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg">
            {booking.client.notes}
          </p>
        </div>
      )}

      {/* Important Info */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-yellow-500 mb-3">Información importante</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>• Llega 10 minutos antes de tu cita</li>
          <li>• Si necesitas cancelar o reagendar, contáctanos con al menos 24 horas de anticipación</li>
          <li>• Ubicación: Lago Blanco 1585, Coquimbo</li>
          <li>• Para consultas: +56 9 1234 5678</li>
        </ul>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={onNewBooking}
          className="bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Hacer Nueva Reserva
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;