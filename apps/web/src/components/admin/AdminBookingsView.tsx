import React, { useState } from "react";
import { useAdmin } from "./AdminContext";
import { formatDate, formatCurrency, getStatusColor } from "./utils";
import { bookingStatuses } from "./config";

export const AdminBookingsView: React.FC = () => {
  const {
    reservas,
    handleCancelBooking,
    handleCompleteBooking,
    exportData,
    loading,
  } = useAdmin();

  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filtrar reservas por estado y término de búsqueda
  const filteredReservas = reservas.filter((reserva) => {
    // Filtrar por estado
    if (filterStatus !== "todos" && reserva.estado !== filterStatus) {
      return false;
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      // Los datos del cliente y servicio ya vienen anidados en la reserva
      const cliente = reserva.cliente;
      const servicio = reserva.servicios;
      const searchLower = searchTerm.toLowerCase();

      const matchesCliente =
        cliente && cliente.nombre.toLowerCase().includes(searchLower);
      const matchesServicio =
        servicio && servicio.nombre.toLowerCase().includes(searchLower);
      const matchesFecha = reserva.fecha_reserva.includes(searchLower);

      return matchesCliente || matchesServicio || matchesFecha;
    }

    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Gestión de Reservas</h2>

        <div className="flex space-x-2">
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por cliente, servicio o fecha..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-300">Filtrar:</span>
            <select
              className="px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              {bookingStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : filteredReservas.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg">
            No hay reservas que coincidan con los criterios de búsqueda
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">Fecha</th>
                <th className="px-6 py-3">Hora</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Servicio</th>
                <th className="px-6 py-3">Precio</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredReservas.map((reserva) => {
                // Los datos del cliente y servicio ya vienen anidados en la reserva
                const cliente = reserva.cliente;
                const servicio = reserva.servicios;
                const statusColor = getStatusColor(reserva.estado);

                return (
                  <tr
                    key={reserva.id_reserva}
                    className="bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {formatDate(reserva.fecha_reserva)}
                    </td>
                    <td className="px-6 py-4">{reserva.hora_inicio}</td>
                    <td className="px-6 py-4">
                      {cliente?.nombre || "Cliente no encontrado"}
                    </td>
                    <td className="px-6 py-4">
                      {servicio?.nombre || "Servicio no encontrado"}
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(
                        reserva.precio_total || servicio?.precio || 0
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          statusColor === 'green' ? 'bg-green-100 text-green-800' :
                          statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                          statusColor === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {reserva.estado.charAt(0).toUpperCase() +
                          reserva.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {reserva.estado === "pendiente" && (
                          <button
                            onClick={() =>
                              handleCompleteBooking(reserva.id_reserva)
                            }
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            Completar
                          </button>
                        )}
                        {(reserva.estado === "pendiente" ||
                          reserva.estado === "confirmada") && (
                          <button
                            onClick={() =>
                              handleCancelBooking(reserva.id_reserva)
                            }
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsView;
