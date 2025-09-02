/**
 * TABLA DE RESERVAS - Componente principal para mostrar y gestionar reservas
 *
 * Funcionalidades:
 * - Mostrar todas las reservas en formato tabla
 * - Editar, cancelar, marcar como completada
 * - Selección múltiple para acciones en lote
 * - Filtros y búsqueda
 *
 * Mantiene simplicidad y funcionalidad para barbería
 */

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
  Scissors,
  History,
} from "lucide-react";
import { Booking } from "../types/booking";
import { LoadingSpinner } from "./common/LoadingSpinner";
import { useBookingActions } from "../hooks/useBookingActions";
import { BookingEditModal } from "./BookingEditModal";
import { ConfirmationModal } from "./common/ConfirmationModal";
import { ClientHistoryModal } from "./ClientHistoryModal";

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
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState<{
    booking: Booking;
    isOpen: boolean;
  } | null>(null);
  const [confirmingBulkCancel, setConfirmingBulkCancel] = useState(false);
  const [clientHistoryData, setClientHistoryData] = useState<{
    clientName: string;
    clientPhone: string;
    isOpen: boolean;
  } | null>(null);
  const { loading, cancelBooking, markAsCompleted, markAsNoShow, editBooking } =
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
        className="rounded-lg p-2 transition-all duration-200 hover:bg-gray-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
      >
        <MoreVertical className="h-4 w-4 text-gray-400 transition-colors group-hover:text-white" />
      </button>

      {openMenus[booking.id] && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 animate-in fade-in-0 slide-in-from-top-2 duration-200 rounded-xl border border-gray-600 bg-gray-800/95 backdrop-blur-md shadow-2xl ring-1 ring-gray-700/50">
          <div className="py-2">
            <button
              onClick={() => {
                setEditingBooking(booking);
                setOpenMenus({});
              }}
              className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-300 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-500/10 hover:text-blue-400 group"
            >
              <Edit className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
              Editar Reserva
            </button>

            <button
              onClick={() => {
                setClientHistoryData({
                  clientName:
                    booking.clientName || booking.client?.name || "Cliente",
                  clientPhone:
                    booking.clientPhone || booking.client?.phone || "",
                  isOpen: true,
                });
                setOpenMenus({});
              }}
              className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-300 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-500/10 hover:text-purple-400 group"
            >
              <History className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
              Ver Historial
            </button>

            <button
              onClick={async () => {
                await markAsCompleted(booking.id);
                setOpenMenus({});
              }}
              disabled={loading[booking.id]}
              className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-300 transition-all duration-200 hover:bg-gradient-to-r hover:from-green-600/20 hover:to-green-500/10 hover:text-green-400 disabled:opacity-50 group"
            >
              <CheckCircle className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
              {loading[booking.id] ? "Procesando..." : "Marcar Completada"}
            </button>

            <button
              onClick={async () => {
                await markAsNoShow(booking.id);
                setOpenMenus({});
              }}
              disabled={loading[booking.id]}
              className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-300 transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-500/10 hover:text-orange-400 disabled:opacity-50 group"
            >
              <XCircle className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
              {loading[booking.id] ? "Procesando..." : "Marcar No-Show"}
            </button>

            <div className="my-1 h-px bg-gray-700" />

            <button
              onClick={() => {
                setConfirmingCancel({
                  booking,
                  isOpen: true,
                });
                setOpenMenus({});
              }}
              disabled={loading[booking.id]}
              className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-300 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-500/10 hover:text-red-400 disabled:opacity-50 group"
            >
              <Trash2 className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
              {loading[booking.id] ? "Procesando..." : "Cancelar Reserva"}
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
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 ring-2 ring-yellow-500/30">
            <Calendar className="h-10 w-10 text-yellow-400" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-gray-300">
            No hay reservas
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No se encontraron reservas con los filtros aplicados. Intenta
            ajustar los criterios de búsqueda.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-yellow-500 px-6 py-2 text-black font-medium transition-all duration-200 hover:bg-yellow-400 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          >
            Actualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-sm shadow-2xl">
      {/* Header Mejorado */}
      <div className="border-b border-gray-700 bg-gradient-to-r from-gray-800/80 to-gray-800/40 p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg">
              <Calendar className="h-6 w-6 text-black" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Reservas ({bookings.length})
              </h3>
              <p className="text-sm text-gray-400">
                Gestiona todas las citas de tu barbería
              </p>
            </div>
          </div>

          {selectedBookings.length > 0 && (
            <div className="flex items-center space-x-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <span className="text-sm text-gray-400 font-medium">
                {selectedBookings.length} seleccionada(s)
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    selectedBookings.forEach(async (id) => {
                      await markAsCompleted(id);
                    });
                    onSelectionChange([]);
                  }}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white font-medium transition-all duration-200 hover:bg-green-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  Completar Todas
                </button>
                <button
                  onClick={() => setConfirmingBulkCancel(true)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white font-medium transition-all duration-200 hover:bg-red-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  Cancelar Seleccionadas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedBookings.length === bookings.length &&
                    bookings.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-gray-600 bg-gray-700 text-yellow-500 transition-all duration-200 focus:ring-2 focus:ring-yellow-500/50 hover:scale-105"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Cliente</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha & Hora</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                <div className="flex items-center space-x-2">
                  <Scissors className="h-4 w-4" />
                  <span>Servicios</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Total</span>
                </div>
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
              <tr
                key={booking.id}
                className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-yellow-500/5 hover:shadow-lg"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(booking.id)}
                    onChange={() => handleSelectBooking(booking.id)}
                    className="rounded border-gray-600 bg-gray-700 text-yellow-500 transition-all duration-200 focus:ring-2 focus:ring-yellow-500/50 hover:scale-105"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg transition-transform duration-200 group-hover:scale-110">
                        <User className="h-5 w-5 text-black" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white transition-colors group-hover:text-yellow-400">
                        {booking.clientName ||
                          booking.client?.name ||
                          "Cliente"}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span className="flex items-center transition-colors group-hover:text-gray-300">
                          <Phone className="mr-1 h-3 w-3" />
                          {booking.client?.phone || "N/A"}
                        </span>
                        <span className="flex items-center transition-colors group-hover:text-gray-300">
                          <Mail className="mr-1 h-3 w-3" />
                          {booking.client?.email || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white transition-colors group-hover:text-yellow-400 font-medium">
                    {booking.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-400 transition-colors group-hover:text-gray-300">
                    <Clock className="mr-1 h-3 w-3" />
                    {booking.time}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-white font-medium transition-colors group-hover:text-yellow-400">
                        {booking.service || "Servicio General"}
                      </span>
                      <span className="ml-2 text-gray-400 transition-colors group-hover:text-gray-300">
                        ${(booking.total / 100).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm font-semibold text-white transition-colors group-hover:text-yellow-400">
                    <DollarSign className="mr-1 h-4 w-4" />$
                    {(booking.total / 100).toFixed(0)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 group-hover:scale-105 ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusText(booking.status)}
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
          <div
            key={booking.id}
            className="group space-y-4 p-6 transition-all duration-200 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-yellow-500/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedBookings.includes(booking.id)}
                  onChange={() => handleSelectBooking(booking.id)}
                  className="rounded border-gray-600 bg-gray-700 text-yellow-500 transition-all duration-200 focus:ring-2 focus:ring-yellow-500/50 hover:scale-105"
                />
                <div>
                  <h4 className="text-lg font-medium text-white transition-colors group-hover:text-yellow-400">
                    {booking.clientName || booking.client?.name || "Cliente"}
                  </h4>
                  <p className="text-sm text-gray-400 transition-colors group-hover:text-gray-300">
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
                <p className="text-white font-medium transition-colors group-hover:text-yellow-400">
                  {booking.client?.phone || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <p className="text-white font-medium transition-colors group-hover:text-yellow-400">
                  {booking.client?.email || "N/A"}
                </p>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-400">Servicio:</span>
              <div className="mt-1 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-medium transition-colors group-hover:text-yellow-400">
                    {booking.service || "Servicio General"}
                  </span>
                  <span className="text-yellow-400 font-semibold">
                    ${(booking.total / 100).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 group-hover:scale-105 ${getStatusColor(
                  booking.status
                )}`}
              >
                {getStatusText(booking.status)}
              </span>
              <div className="text-lg font-semibold text-white transition-colors group-hover:text-yellow-400">
                Total: ${(booking.total / 100).toFixed(0)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edición */}
      <BookingEditModal
        booking={editingBooking}
        isOpen={editingBooking !== null}
        onClose={() => setEditingBooking(null)}
        onSave={async (bookingId, updates) => {
          await editBooking(bookingId, updates);
          setEditingBooking(null);
        }}
        loading={loading}
      />

      {/* Modal de Confirmación de Cancelación Individual */}
      <ConfirmationModal
        isOpen={confirmingCancel?.isOpen || false}
        onClose={() => setConfirmingCancel(null)}
        onConfirm={async () => {
          if (confirmingCancel?.booking) {
            await cancelBooking(confirmingCancel.booking.id);
            setConfirmingCancel(null);
          }
        }}
        title="Cancelar Reserva"
        message={`¿Estás seguro de que quieres cancelar la reserva de ${
          confirmingCancel?.booking?.clientName ||
          confirmingCancel?.booking?.client?.name ||
          "este cliente"
        }? Esta acción no se puede deshacer.`}
        confirmText="Sí, Cancelar"
        cancelText="No, Mantener"
        type="danger"
        loading={
          confirmingCancel?.booking
            ? loading[confirmingCancel.booking.id]
            : false
        }
      />

      {/* Modal de Confirmación de Cancelación Masiva */}
      <ConfirmationModal
        isOpen={confirmingBulkCancel}
        onClose={() => setConfirmingBulkCancel(false)}
        onConfirm={async () => {
          for (const id of selectedBookings) {
            await cancelBooking(id);
          }
          onSelectionChange([]);
          setConfirmingBulkCancel(false);
        }}
        title="Cancelar Múltiples Reservas"
        message={`¿Estás seguro de que quieres cancelar ${
          selectedBookings.length
        } reserva${
          selectedBookings.length > 1 ? "s" : ""
        }? Esta acción no se puede deshacer y afectará a todos los clientes seleccionados.`}
        confirmText={`Sí, Cancelar ${selectedBookings.length} Reserva${
          selectedBookings.length > 1 ? "s" : ""
        }`}
        cancelText="No, Mantener Todas"
        type="danger"
        loading={selectedBookings.some((id) => loading[id])}
      />

      {/* Modal de Historial del Cliente */}
      <ClientHistoryModal
        isOpen={clientHistoryData?.isOpen || false}
        onClose={() => setClientHistoryData(null)}
        clientName={clientHistoryData?.clientName || ""}
        clientPhone={clientHistoryData?.clientPhone || ""}
      />
    </div>
  );
};
