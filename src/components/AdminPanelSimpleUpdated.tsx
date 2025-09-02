import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  User,
  MapPin,
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";
import { useServicios } from "../hooks/useServicios";

interface AdminPanelSimpleProps {
  // Props vacías por ahora, ya que obtenemos los datos de los hooks
}

type ViewMode = "overview" | "bookings";

export const AdminPanelSimpleUpdated: React.FC<AdminPanelSimpleProps> = () => {
  const { addToast } = useToast();
  const [currentView, setCurrentView] = useState<ViewMode>("overview");

  // 🔧 HOOKS MVP PARA DATOS REALES
  const {
    reservas,
    loading: loadingReservas,
    refetch,
    actualizarReserva,
    formatearPrecio,
  } = useReservasMVP();
  const { usuarios, loading: loadingUsuarios } = useUsuarios();
  const { servicios, loading: loadingServicios } = useServicios();

  const loading = loadingReservas || loadingUsuarios || loadingServicios;

  // 🔧 CALCULAR ESTADÍSTICAS CON DATOS REALES MVP
  const stats = {
    totalBookings: reservas.length,
    todayBookings: reservas.filter((r) => {
      const today = new Date().toISOString().split("T")[0];
      return r.fecha_reserva === today;
    }).length,
    weeklyRevenue: reservas.reduce((sum, r) => sum + (r.precio_total || 0), 0),
    completedBookings: reservas.filter((r) => r.estado === "completada").length,
  };

  const handleCancelBooking = async (reservaId: string) => {
    try {
      await actualizarReserva(reservaId, { estado: "cancelada" });
      addToast("Reserva cancelada exitosamente", "success");
      await refetch();
    } catch (error) {
      console.error("Error cancelando reserva:", error);
      addToast("Error al cancelar la reserva", "error");
    }
  };

  const handleCompleteBooking = async (reservaId: string) => {
    try {
      await actualizarReserva(reservaId, { estado: "completada" });
      addToast("Reserva marcada como completada", "success");
      await refetch();
    } catch (error) {
      console.error("Error completando reserva:", error);
      addToast("Error al completar la reserva", "error");
    }
  };

  const exportData = () => {
    const csv = reservas
      .map((r) => {
        // Buscar cliente por ID
        const cliente = usuarios.find((u) => u.id_usuario === r.id_cliente);
        const servicio = servicios.find((s) => s.id_servicio === r.id_servicio);

        return `${r.fecha_reserva},${r.hora_inicio},${
          cliente?.nombre || "N/A"
        },${servicio?.nombre || "N/A"},${r.estado}`;
      })
      .join("\\n");

    const blob = new Blob([`Fecha,Hora,Cliente,Servicio,Estado\\n${csv}`], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addToast("Datos exportados exitosamente", "success");
  };

  if (currentView === "overview") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentView("bookings")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Ver Reservas
            </button>
            <button
              onClick={exportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Reservas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.todayBookings}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Ingresos Estimados
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }).format(stats.weeklyRevenue / 100)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedBookings}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Reservas Recientes
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-gray-500 text-center py-8">
                Cargando reservas...
              </p>
            ) : reservas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay reservas registradas
              </p>
            ) : (
              <div className="space-y-4">
                {reservas.slice(0, 5).map((reserva) => {
                  const cliente = usuarios.find(
                    (u) => u.id_usuario === reserva.id_cliente
                  );
                  const servicio = servicios.find(
                    (s) => s.id_servicio === reserva.id_servicio
                  );

                  return (
                    <div
                      key={reserva.id_reserva}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {cliente?.nombre || "Cliente no encontrado"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {servicio?.nombre || "Servicio no encontrado"}
                            </p>
                          </div>
                          <div className="text-sm text-gray-600">
                            {reserva.fecha_reserva} - {reserva.hora_inicio}
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              reserva.estado === "confirmada"
                                ? "bg-green-100 text-green-800"
                                : reserva.estado === "pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {reserva.estado}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format((reserva.precio_total || 0) / 100)}
                        </span>
                        {reserva.estado === "confirmada" && (
                          <button
                            onClick={() =>
                              handleCancelBooking(reserva.id_reserva)
                            }
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista de todas las reservas
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Todas las Reservas</h1>
        <button
          onClick={() => setCurrentView("overview")}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Volver al Inicio
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay reservas registradas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Servicio
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Hora
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Estado
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.clientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.client?.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {booking.service}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {booking.date}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {booking.time}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
