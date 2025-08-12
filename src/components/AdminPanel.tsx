import React, { useState } from 'react';
import { Calendar, User, Phone, Mail, Clock, DollarSign, Filter, X, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Booking } from '../types/booking';

interface AdminPanelProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  bookings,
  onCancelBooking
}) => {
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter(booking => {
    const dateMatch = !filterDate || booking.date === filterDate;
    const statusMatch = filterStatus === 'all' || booking.status === filterStatus;
    return dateMatch && statusMatch;
  });

  const sortedBookings = filteredBookings.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const getTotalRevenue = () => {
    return filteredBookings
      .filter(booking => booking.status === 'confirmed')
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
  };

  const getBookingsByStatus = (status: string) => {
    return filteredBookings.filter(booking => booking.status === status).length;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            <span>Confirmada</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
            <XCircle className="h-3 w-3" />
            <span>Cancelada</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completada</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Reservas</p>
              <p className="text-2xl font-bold text-white">{filteredBookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Confirmadas</p>
              <p className="text-2xl font-bold text-white">{getBookingsByStatus('confirmed')}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Canceladas</p>
              <p className="text-2xl font-bold text-white">{getBookingsByStatus('cancelled')}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Ingresos</p>
              <p className="text-2xl font-bold text-white">
                ${getTotalRevenue().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-white">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Fecha</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="all">Todos</option>
              <option value="confirmed">Confirmadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="completed">Completadas</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterDate('');
                setFilterStatus('all');
              }}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Reservas ({sortedBookings.length})
          </h3>
        </div>
        
        {sortedBookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hay reservas que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {sortedBookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-white font-semibold text-lg">
                              {booking.client.name}
                            </span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-gray-400 text-sm">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(booking.date).toLocaleDateString('es-ES', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{booking.time}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{booking.client.phone}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-yellow-500 font-bold text-lg">
                          ${booking.totalPrice.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {booking.duration} min
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-gray-300 text-sm">
                        <span className="font-medium">Servicios: </span>
                        {booking.services.map(s => s.name).join(', ')}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => onCancelBooking(booking.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Detalle de Reserva</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Información del Cliente</h4>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-white">{selectedBooking.client.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-white">{selectedBooking.client.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-white">{selectedBooking.client.email}</span>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Información de la Cita</h4>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-white">Fecha</span>
                    </div>
                    <span className="text-gray-300">
                      {new Date(selectedBooking.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-white">Hora</span>
                    </div>
                    <span className="text-gray-300">{selectedBooking.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white">Estado</span>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Servicios</h4>
                <div className="space-y-2">
                  {selectedBooking.services.map((service, index) => (
                    <div key={service.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <div>
                        <span className="text-white font-medium">{service.name}</span>
                        <span className="text-gray-400 text-sm block">{service.duration} min</span>
                      </div>
                      <span className="text-yellow-500 font-semibold">
                        ${service.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-yellow-500 font-bold text-xl">
                      ${selectedBooking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.client.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Notas</h4>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-300">{selectedBooking.client.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;