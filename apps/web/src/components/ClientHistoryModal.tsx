import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Scissors,
  Clock,
  MapPin,
} from "lucide-react";
import { Booking } from "../types/booking";
import { useSupabaseNormalized } from "../hooks/useSupabaseNormalized";

interface ClientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  clientPhone: string;
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  isOpen,
  onClose,
  clientName,
  clientPhone,
}) => {
  const [sortBy, setSortBy] = useState<"date" | "service" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Obtener las reservas de Supabase
  const { bookings_new: allBookings } = useSupabaseNormalized();

  // Filtrar reservas del cliente específico
  const clientBookings =
    allBookings
      ?.filter(
        (booking) =>
          booking.client?.name === clientName ||
          booking.client?.phone === clientPhone
      )
      .map((booking) => ({
        id: booking.id,
        clientName: booking.client?.name || "Cliente",
        service: booking.services[0]?.name || "Servicio",
        date: booking.scheduled_date,
        time: booking.scheduled_time,
        status: booking.status,
        total: booking.total || 0,
        duration: booking.estimated_duration || 60,
        client: {
          name: booking.client?.name || "Cliente",
          phone: booking.client?.phone || "No disponible",
          email: booking.client?.email || "No disponible",
          notes: booking.notes || "",
        },
        services: [],
        totalPrice: (booking.total || 0) / 100, // Convertir de centavos a pesos
        createdAt: booking.created_at || new Date().toISOString(),
        notes: booking.notes || "",
      })) || [];

  // Ordenar reservas
  const sortedBookings = [...clientBookings].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case "date":
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case "service":
        aValue = a.service;
        bValue = b.service;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = new Date(a.date);
        bValue = new Date(b.date);
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Estadísticas del cliente
  const stats = {
    totalBookings: clientBookings.length,
    completedBookings: clientBookings.filter((b) => b.status === "completed")
      .length,
    cancelledBookings: clientBookings.filter((b) => b.status === "cancelled")
      .length,
    totalSpent: clientBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    favoriteService: clientBookings.reduce((acc, booking) => {
      acc[booking.service] = (acc[booking.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    lastVisit: clientBookings
      .filter((b) => b.status === "completed")
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0],
  };

  const favoriteServiceName =
    Object.entries(stats.favoriteService).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || "Ninguno";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "confirmed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "no-show":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada";
      case "confirmed":
        return "Confirmada";
      case "cancelled":
        return "Cancelada";
      case "no-show":
        return "No Asistió";
      default:
        return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-blue-500/20 p-3">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Historial del Cliente
              </h2>
              <p className="text-gray-400">{clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Estadísticas del Cliente */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">
                Total Reservas
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.totalBookings}
            </p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
            <div className="flex items-center space-x-2">
              <Scissors className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium text-gray-300">
                Completadas
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.completedBookings}
            </p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">
                Total Gastado
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${stats.totalSpent.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">
                Servicio Favorito
              </span>
            </div>
            <p className="text-lg font-bold text-white">
              {favoriteServiceName}
            </p>
          </div>
        </div>

        {/* Información adicional */}
        {stats.lastVisit && (
          <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="h-4 w-4" />
                <span>
                  Última visita:{" "}
                  {new Date(stats.lastVisit.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>
                  Email: {stats.lastVisit.client?.email || "No disponible"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Controles de ordenamiento */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">
            Historial de Reservas ({clientBookings.length})
          </h3>
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "service" | "status")
              }
              className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white text-sm"
            >
              <option value="date">Ordenar por Fecha</option>
              <option value="service">Ordenar por Servicio</option>
              <option value="status">Ordenar por Estado</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="rounded-lg border border-gray-600 px-3 py-2 text-white text-sm hover:bg-gray-800"
            >
              {sortOrder === "asc" ? "↑ Ascendente" : "↓ Descendente"}
            </button>
          </div>
        </div>

        {/* Lista de reservas */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg border border-gray-700 bg-gray-800/30 p-4 transition-colors hover:bg-gray-800/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-semibold text-white">
                        {booking.service}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                        <span>{booking.time}</span>
                        {booking.totalPrice && (
                          <span>${booking.totalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {booking.notes && (
                    <p className="mt-2 text-sm text-gray-400">
                      {booking.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {clientBookings.length === 0 && (
            <div className="py-8 text-center text-gray-400">
              <User className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-2">
                No se encontraron reservas para este cliente
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-700 px-6 py-2 text-white transition-colors hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
