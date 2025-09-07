import React, { useState } from "react";
import { BarChart3, Download, Users, TrendingUp } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";
import { useServicios } from "../hooks/useServicios";

interface AdminPanelModernProps {
  // Props vacías por ahora, ya que obtenemos los datos de los hooks
}

type ViewMode = "overview" | "bookings";

export const AdminPanelModern: React.FC<AdminPanelModernProps> = () => {
  const { addToast } = useToast();
  const [currentView, setCurrentView] = useState<ViewMode>("overview");
  
  // 🔧 HOOKS MVP PARA DATOS REALES
  const { reservas, loading: loadingReservas, refetch, actualizarReserva } = useReservasMVP();
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
        const cliente = usuarios.find(u => u.id_usuario === r.id_cliente);
        const servicio = servicios.find(s => s.id_servicio === r.id_servicio);
        
        return `${r.fecha_reserva},${r.hora_inicio},${cliente?.nombre || 'N/A'},${servicio?.nombre || 'N/A'},${r.estado}`;
      })
      .join("\\n");

    const blob = new Blob([`Fecha,Hora,Cliente,Servicio,Estado\\n${csv}`], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservas.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Datos exportados exitosamente", "success");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
              <p className="text-slate-400">Gestiona las reservas y analiza el rendimiento</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentView("overview")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === "overview"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setCurrentView("bookings")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === "bookings"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Reservas
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {currentView === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Reservas */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Reservas</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalBookings}</p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Hoy */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Hoy</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.todayBookings}</p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </div>

              {/* Esta Semana */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Esta Semana</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalBookings}</p>
                  </div>
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
              </div>

              {/* Este Mes */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Este Mes</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalBookings}</p>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Ingresos */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Ingresos</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(stats.weeklyRevenue)}
                    </p>
                  </div>
                  <div className="bg-emerald-500/20 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reservas Hoy */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Reservas Hoy</h3>
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">{stats.todayBookings}</div>
                  <div className="text-sm text-slate-400">
                    Completadas: {stats.completedBookings} | Confirmadas: {stats.todayBookings - stats.completedBookings}
                  </div>
                </div>
              </div>

              {/* Ingresos Hoy */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Ingresos Hoy</h3>
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency", 
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    }).format(
                      reservas
                        .filter(r => {
                          const today = new Date().toISOString().split("T")[0];
                          return r.fecha_reserva === today;
                        })
                        .reduce((sum, r) => sum + (r.precio_total || 0), 0)
                    )}
                  </div>
                  <div className="text-sm text-slate-400">Has generado este monto hoy</div>
                </div>
              </div>

              {/* Próxima Semana */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Próxima Semana</h3>
                  <div className="bg-orange-500/20 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-orange-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">0</div>
                  <div className="text-sm text-slate-400">reservas confirmadas</div>
                </div>
              </div>
            </div>

            {/* Reservas Recientes */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">Reservas Recientes</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Cargando reservas...</div>
                  </div>
                ) : reservas.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">No hay reservas registradas</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reservas.slice(0, 5).map((reserva) => {
                      const cliente = usuarios.find(u => u.id_usuario === reserva.id_cliente);
                      const servicio = servicios.find(s => s.id_servicio === reserva.id_servicio);
                      
                      return (
                        <div
                          key={reserva.id_reserva}
                          className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/70 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-black font-medium text-sm">
                                  {cliente?.nombre?.charAt(0) || 'C'}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-white">
                                  {cliente?.nombre || 'Cliente no encontrado'}
                                </h3>
                                <p className="text-sm text-slate-400">
                                  {servicio?.nombre || 'Servicio no encontrado'}
                                </p>
                              </div>
                              <div className="text-sm text-slate-400">
                                {reserva.fecha_reserva} - {reserva.hora_inicio}
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                reserva.estado === "confirmada"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : reserva.estado === "pendiente"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}>
                                {reserva.estado}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-white">
                                {new Intl.NumberFormat("es-CL", {
                                  style: "currency",
                                  currency: "CLP",
                                  minimumFractionDigits: 0,
                                }).format(reserva.precio_total || 0)}
                              </span>
                              {reserva.estado === "confirmada" && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleCompleteBooking(reserva.id_reserva)}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                                  >
                                    Completar
                                  </button>
                                  <button
                                    onClick={() => handleCancelBooking(reserva.id_reserva)}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vista de Reservas Completa */}
        {currentView === "bookings" && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Reservas ({reservas.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Fecha & Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Servicios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        Cargando reservas...
                      </td>
                    </tr>
                  ) : reservas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        No hay reservas registradas
                      </td>
                    </tr>
                  ) : (
                    reservas.map((reserva) => {
                      const cliente = usuarios.find(u => u.id_usuario === reserva.id_cliente);
                      const servicio = servicios.find(s => s.id_servicio === reserva.id_servicio);
                      
                      return (
                        <tr key={reserva.id_reserva} className="hover:bg-slate-700/30">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-black font-medium text-sm">
                                  {cliente?.nombre?.charAt(0) || 'C'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                  {cliente?.nombre || 'Cliente no encontrado'}
                                </div>
                                <div className="text-sm text-slate-400">
                                  {cliente?.email || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{reserva.fecha_reserva}</div>
                            <div className="text-sm text-slate-400">{reserva.hora_inicio}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {servicio?.nombre || 'Servicio no encontrado'}
                            </div>
                            <div className="text-sm text-slate-400">
                              {reserva.duracion_minutos} min
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {new Intl.NumberFormat("es-CL", {
                              style: "currency",
                              currency: "CLP",
                              minimumFractionDigits: 0,
                            }).format(reserva.precio_total || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              reserva.estado === "confirmada"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : reserva.estado === "completada"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : reserva.estado === "pendiente"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}>
                              {reserva.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            {reserva.estado === "confirmada" && (
                              <>
                                <button
                                  onClick={() => handleCompleteBooking(reserva.id_reserva)}
                                  className="text-green-400 hover:text-green-300 font-medium"
                                >
                                  Completar
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(reserva.id_reserva)}
                                  className="text-red-400 hover:text-red-300 font-medium"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
