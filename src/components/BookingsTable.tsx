import React, { useState } from 'react';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Phone,
  Mail,
  DollarSign,
  User
} from 'lucide-react';
import { Booking } from '../types/booking';
import { LoadingSpinner } from './common/LoadingSpinner';
import { useBookingActions } from '../hooks/useBookingActions';

interface BookingsTableProps {
  bookings: Booking[];
  onBookingChange: () => Promise<void>;
  selectedBookings: string[];
  onSelectionChange: (selected: string[]) => void;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  onBookingChange,
  selectedBookings,
  onSelectionChange,
}) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const { loading, cancelBooking, markAsCompleted, markAsNoShow } = useBookingActions(onBookingChange);

  const toggleMenu = (bookingId: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === bookings.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(bookings.map(b => b.id));
    }
  };

  const handleSelectBooking = (bookingId: string) => {
    if (selectedBookings.includes(bookingId)) {
      onSelectionChange(selectedBookings.filter(id => id !== bookingId));
    } else {
      onSelectionChange([...selectedBookings, bookingId]);
    }
  };

  const getStatusColor = (status: string = 'confirmed') => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'no-show': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string = 'confirmed') => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      case 'no-show': return 'No Show';
      default: return 'Confirmada';
    }
  };

  const ActionMenu: React.FC<{ booking: Booking }> = ({ booking }) => (
    <div className="relative">
      <button
        onClick={() => toggleMenu(booking.id)}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-gray-400" />
      </button>
      
      {openMenus[booking.id] && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                // TODO: Implementar modal de edición
                setOpenMenus({});
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
            
            <button
              onClick={async () => {
                await markAsCompleted(booking.id);
                setOpenMenus({});
              }}
              disabled={loading[booking.id]}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar Completada
            </button>
            
            <button
              onClick={async () => {
                await markAsNoShow(booking.id);
                setOpenMenus({});
              }}
              disabled={loading[booking.id]}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center disabled:opacity-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Marcar No-Show
            </button>
            
            <button
              onClick={async () => {
                if (confirm('¿Estás seguro de cancelar esta reserva?')) {
                  await cancelBooking(booking.id);
                  setOpenMenus({});
                }
              }}
              disabled={loading[booking.id]}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 flex items-center disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (bookings.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No hay reservas</h3>
          <p className="text-gray-500">No se encontraron reservas con los filtros aplicados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            Reservas ({bookings.length})
          </h3>
          
          {selectedBookings.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {selectedBookings.length} seleccionada(s)
              </span>
              <button
                onClick={() => {
                  // TODO: Implementar acciones masivas
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Cancelar Seleccionadas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedBookings.length === bookings.length && bookings.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Fecha & Hora
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Servicios
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(booking.id)}
                    onChange={() => handleSelectBooking(booking.id)}
                    className="rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-black" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{booking.client.name}</div>
                      <div className="text-sm text-gray-400 flex items-center space-x-3">
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {booking.client.phone}
                        </span>
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {booking.client.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white">{booking.date}</div>
                  <div className="text-sm text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {booking.time}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {booking.services?.map((service, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-white">{service.name}</span>
                        <span className="text-gray-400 ml-2">${service.price}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-white flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {booking.services?.reduce((sum, s) => sum + s.price, 0) || 0}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {loading[booking.id] ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <ActionMenu booking={booking} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-700">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedBookings.includes(booking.id)}
                  onChange={() => handleSelectBooking(booking.id)}
                  className="rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                />
                <div>
                  <h4 className="text-lg font-medium text-white">{booking.client.name}</h4>
                  <p className="text-sm text-gray-400">{booking.date} a las {booking.time}</p>
                </div>
              </div>
              {loading[booking.id] ? (
                <LoadingSpinner size="sm" />
              ) : (
                <ActionMenu booking={booking} />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Teléfono:</span>
                <p className="text-white">{booking.client.phone}</p>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <p className="text-white">{booking.client.email}</p>
              </div>
            </div>
            
            <div>
              <span className="text-gray-400 text-sm">Servicios:</span>
              <div className="mt-1 space-y-1">
                {booking.services?.map((service, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-white">{service.name}</span>
                    <span className="text-yellow-400">${service.price}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              <div className="text-lg font-semibold text-white">
                Total: ${booking.services?.reduce((sum, s) => sum + s.price, 0) || 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
