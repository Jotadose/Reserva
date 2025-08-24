import React, { useState } from "react";
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
  User,
} from "lucide-react";
import { Booking } from "../types/booking";
import { LoadingSpinner } from "./common/LoadingSpinner";
import { useBookingActions } from "../hooks/useBookingActions";

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
  const { loading, cancelBooking, markAsCompleted, markAsNoShow } =
    useBookingActions(onBookingChange);

  const toggleMenu = (bookingId: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === bookings.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(bookings.map((b) => b.id));
    }
  };

  const handleSelectBooking = (bookingId: string) => {
    if (selectedBookings.includes(bookingId)) {
      onSelectionChange(selectedBookings.filter((id) => id !== bookingId));
    } else {
      onSelectionChange([...selectedBookings, bookingId]);
    }
  };

  const getStatusColor = (status: string = "confirmed") => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "no-show":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusText = (status: string = "confirmed") => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Completada";
      case "no-show":
        return "No Show";
      default:
        return "Confirmada";
    }
  };

  const ActionMenu: React.FC<{ booking: Booking }> = ({ booking }) => (
    <div className="relative">
      <button
        onClick={() => toggleMenu(booking.id)}
        className="rounded-lg p-2 transition-colors hover:bg-gray-700"
      >
        <MoreVertical className="h-4 w-4 text-gray-400" />
      </button>

      {openMenus[booking.id] && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
          <div className="py-1">
            <button
              onClick={() => {
                // TODO: Implementar modal de edición
                setOpenMenus({});
              }}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </button>

            <button
              onClick={async () => {
                await markAsCompleted(booking.id);
                setOpenMenus({});
              }}
              disabled={loading[booking.id]}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar Completada
            </button>

            <button
              onClick={async () => {
                await markAsNoShow(booking.id);
                setOpenMenus({});
              }}
              disabled={loading[booking.id]}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Marcar No-Show
            </button>

            <button
              onClick={async () => {
                if (confirm("¿Estás seguro de cancelar esta reserva?")) {
                  await cancelBooking(booking.id);
                  setOpenMenus({});
                }
              }}
              disabled={loading[booking.id]}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 disabled:opacity-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-12 backdrop-blur-sm">
        <div className="text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-500" />
          <h3 className="mb-2 text-lg font-medium text-gray-300">No hay reservas</h3>
          <p className="text-gray-500">No se encontraron reservas con los filtros aplicados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Reservas ({bookings.length})</h3>

          {selectedBookings.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {selectedBookings.length} seleccionada(s)
              </span>
              <button
                onClick={() => {
                  // TODO: Implementar acciones masivas
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
              >
                Cancelar Seleccionadas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
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
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Cliente
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Fecha & Hora
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Servicios
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
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
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500">
                        <User className="h-5 w-5 text-black" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{booking.client.name}</div>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {booking.client.phone}
                        </span>
                        <span className="flex items-center">
                          <Mail className="mr-1 h-3 w-3" />
                          {booking.client.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white">{booking.date}</div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="mr-1 h-3 w-3" />
                    {booking.time}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {booking.services?.map((service, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-white">{service.name}</span>
                        <span className="ml-2 text-gray-400">${service.price}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm font-semibold text-white">
                    <DollarSign className="mr-1 h-4 w-4" />
                    {booking.services?.reduce((sum, s) => sum + s.price, 0) || 0}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getStatusColor()}`}
                  >
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
      <div className="divide-y divide-gray-700 lg:hidden">
        {bookings.map((booking) => (
          <div key={booking.id} className="space-y-4 p-6">
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
                  <p className="text-sm text-gray-400">
                    {booking.date} a las {booking.time}
                  </p>
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
              <span className="text-sm text-gray-400">Servicios:</span>
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
              <span
                className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getStatusColor()}`}
              >
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
