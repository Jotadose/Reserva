import React, { useState } from "react";
import {
  Calendar,
  User,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Filter,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  BarChart3,
  TrendingUp,
  Users,
} from "lucide-react";
import { Booking } from "../types/booking";

interface AdminPanelProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ bookings, onCancelBooking }) => {
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "bookings" | "analytics">("overview");

  const filteredBookings = bookings.filter((booking) => {
    const dateMatch = !filterDate || booking.date === filterDate;
    const statusMatch = filterStatus === "all" || booking.status === filterStatus;
    return dateMatch && statusMatch;
  });

  const sortedBookings = filteredBookings.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const getTotalRevenue = () => {
    return filteredBookings
      .filter((booking) => booking.status === "confirmed")
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
  };

  const getBookingsByStatus = (status: string) => {
    return filteredBookings.filter((booking) => booking.status === status).length;
  };

  const getUpcomingBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= today && booking.status === "confirmed";
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const getMonthlyStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });

    const revenue = monthlyBookings
      .filter((booking) => booking.status === "confirmed" || booking.status === "completed")
      .reduce((sum, booking) => sum + booking.totalPrice, 0);

    return {
      bookings: monthlyBookings.length,
      revenue,
      completed: monthlyBookings.filter((b) => b.status === "completed").length,
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Confirmada</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-400">
            <XCircle className="h-3 w-3" />
            <span>Cancelada</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completada</span>
          </span>
        );
      default:
        return null;
    }
  };

  const upcomingBookings = getUpcomingBookings();
  const monthlyStats = getMonthlyStats();

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode("overview")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
              viewMode === "overview"
                ? "bg-yellow-500 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Resumen</span>
          </button>
          <button
            onClick={() => setViewMode("bookings")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
              viewMode === "bookings"
                ? "bg-yellow-500 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Reservas</span>
          </button>
          <button
            onClick={() => setViewMode("analytics")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
              viewMode === "analytics"
                ? "bg-yellow-500 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Analíticas</span>
          </button>
        </div>
      </div>

      {viewMode === "overview" && (
        <>
          {/* Monthly Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-blue-500/20 p-3">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Este Mes</p>
                  <p className="text-2xl font-bold text-white">{monthlyStats.bookings}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-green-500/20 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Completadas</p>
                  <p className="text-2xl font-bold text-white">{monthlyStats.completed}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-yellow-500/20 p-3">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Ingresos del Mes</p>
                  <p className="text-2xl font-bold text-white">
                    ${monthlyStats.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-purple-500/20 p-3">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Próximas Citas</p>
                  <p className="text-2xl font-bold text-white">{upcomingBookings.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <div className="border-b border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white">
                Próximas Citas ({upcomingBookings.length})
              </h3>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                <p className="text-lg text-gray-400">No hay citas próximas</p>
              </div>
            ) : (
              <div className="max-h-96 divide-y divide-gray-700 overflow-y-auto">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="p-4 transition-colors hover:bg-gray-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-500">
                            {new Date(booking.date).getDate()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(booking.date).toLocaleDateString("es-ES", { month: "short" })}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{booking.client.name}</p>
                          <p className="text-sm text-gray-400">
                            {booking.time} - {booking.services.map((s) => s.name).join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-500">
                          ${booking.totalPrice.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">{booking.duration} min</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === "bookings" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-blue-500/20 p-3">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Reservas</p>
                  <p className="text-2xl font-bold text-white">{filteredBookings.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-green-500/20 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Confirmadas</p>
                  <p className="text-2xl font-bold text-white">
                    {getBookingsByStatus("confirmed")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-red-500/20 p-3">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Canceladas</p>
                  <p className="text-2xl font-bold text-white">
                    {getBookingsByStatus("cancelled")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-yellow-500/20 p-3">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Ingresos</p>
                  <p className="text-2xl font-bold text-white">
                    ${getTotalRevenue().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center space-x-2">
              <Filter className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-gray-400">Fecha</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">Estado</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
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
                    setFilterDate("");
                    setFilterStatus("all");
                  }}
                  className="w-full rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-600"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <div className="border-b border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white">
                Reservas ({sortedBookings.length})
              </h3>
            </div>

            {sortedBookings.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                <p className="text-lg text-gray-400">
                  No hay reservas que coincidan con los filtros
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {sortedBookings.map((booking) => (
                  <div key={booking.id} className="p-6 transition-colors hover:bg-gray-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="mb-1 flex items-center space-x-2">
                                <span className="text-lg font-semibold text-white">
                                  {booking.client.name}
                                </span>
                                {getStatusBadge(booking.status)}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {new Date(booking.date).toLocaleDateString("es-ES", {
                                      weekday: "short",
                                      day: "numeric",
                                      month: "short",
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
                            <div className="text-lg font-bold text-yellow-500">
                              ${booking.totalPrice.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-400">{booking.duration} min</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-300">
                            <span className="font-medium">Servicios: </span>
                            {booking.services.map((s) => s.name).join(", ")}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="rounded-lg bg-blue-500/20 p-2 text-blue-400 transition-colors hover:bg-blue-500/30"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {booking.status === "confirmed" && (
                              <button
                                onClick={() => onCancelBooking(booking.id)}
                                className="rounded-lg bg-red-500/20 p-2 text-red-400 transition-colors hover:bg-red-500/30"
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
        </>
      )}

      {viewMode === "analytics" && (
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-white">Analíticas Avanzadas</h3>
          <p className="text-gray-400">
            Próximamente: Gráficos de rendimiento, análisis de servicios más populares, tendencias
            de reservas y métricas de satisfacción del cliente.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-gray-800/50 p-4">
              <h4 className="mb-2 font-semibold text-white">Servicios Más Populares</h4>
              <div className="space-y-2">
                {Object.entries(
                  bookings.reduce(
                    (acc, booking) => {
                      booking.services.forEach((service) => {
                        acc[service.name] = (acc[service.name] || 0) + 1;
                      });
                      return acc;
                    },
                    {} as Record<string, number>,
                  ),
                )
                  .slice(0, 5)
                  .map(([service, count]) => (
                    <div key={service} className="flex justify-between">
                      <span className="text-gray-300">{service}</span>
                      <span className="text-yellow-500">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-4">
              <h4 className="mb-2 font-semibold text-white">Horarios Más Solicitados</h4>
              <div className="space-y-2">
                {Object.entries(
                  bookings.reduce(
                    (acc, booking) => {
                      acc[booking.time] = (acc[booking.time] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>,
                  ),
                )
                  .slice(0, 5)
                  .map(([time, count]) => (
                    <div key={time} className="flex justify-between">
                      <span className="text-gray-300">{time}</span>
                      <span className="text-yellow-500">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-700 p-6">
              <h3 className="text-xl font-bold text-white">Detalle de Reserva</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Client Info */}
              <div>
                <h4 className="mb-3 text-lg font-semibold text-white">Información del Cliente</h4>
                <div className="space-y-2 rounded-lg bg-gray-800/50 p-4">
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
                <h4 className="mb-3 text-lg font-semibold text-white">Información de la Cita</h4>
                <div className="space-y-3 rounded-lg bg-gray-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-white">Fecha</span>
                    </div>
                    <span className="text-gray-300">
                      {new Date(selectedBooking.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
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
                <h4 className="mb-3 text-lg font-semibold text-white">Servicios</h4>
                <div className="space-y-2">
                  {selectedBooking.services.map((service, index) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
                    >
                      <div>
                        <span className="font-medium text-white">{service.name}</span>
                        <span className="block text-sm text-gray-400">{service.duration} min</span>
                      </div>
                      <span className="font-semibold text-yellow-500">
                        ${service.price.toLocaleString()}
                      </span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                    <span className="font-bold text-white">Total</span>
                    <span className="text-xl font-bold text-yellow-500">
                      ${selectedBooking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.client.notes && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">Notas</h4>
                  <div className="rounded-lg bg-gray-800/50 p-4">
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
