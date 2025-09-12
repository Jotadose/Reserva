/**
 * ===================================================================
 * GESTIÓN DE RESERVAS - COMPONENTE ADMIN MEJORADO
 * ===================================================================
 *
 * Vista de reservas para el panel de administración
 * Integrado con AdminContext y API consolidada
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
} from "lucide-react";

import { useReservasMVP } from "../../hooks/useReservasMVP";
import useBarberos from "../../hooks/useBarberos";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useServicios } from "../../hooks/useServicios";

// ===================================================================
// TIPOS
// ===================================================================

interface FiltroReservas {
  estado: string;
  barbero: string;
  fecha: string;
  busqueda: string;
}

const ESTADOS_RESERVA = [
  { value: 'todos', label: 'Todos los estados', color: 'gray' },
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'confirmada', label: 'Confirmada', color: 'blue' },
  { value: 'completada', label: 'Completada', color: 'green' },
  { value: 'cancelada', label: 'Cancelada', color: 'red' },
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const GestionReservasMejorada: React.FC = () => {
  // Hooks de datos
  const { 
    reservas, 
    loading: loadingReservas, 
    error: errorReservas,
    cancelarReserva,
    completarReserva,
    refetch: refetchReservas
  } = useReservasMVP();
  
  const { barberos } = useBarberos();
  const { usuarios } = useUsuarios();
  const { servicios } = useServicios();

  // Estados locales
  const [filtros, setFiltros] = useState<FiltroReservas>({
    estado: 'todos',
    barbero: 'todos',
    fecha: '',
    busqueda: ''
  });

  // Handlers memoizados
  const handleFiltroChange = useCallback((campo: keyof FiltroReservas, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleCancelarReserva = useCallback(async (reservaId: string) => {
    try {
      await cancelarReserva(reservaId);
      await refetchReservas();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
    }
  }, [cancelarReserva, refetchReservas]);

  const handleCompletarReserva = useCallback(async (reservaId: string) => {
    try {
      await completarReserva(reservaId);
      await refetchReservas();
    } catch (error) {
      console.error('Error al completar reserva:', error);
    }
  }, [completarReserva, refetchReservas]);

  // ===================================================================
  // DATOS COMPUTADOS
  // ===================================================================

  const reservasFiltradas = useMemo(() => {
    if (!reservas) return [];

    return reservas.filter(reserva => {
      // Filtro por estado
      if (filtros.estado !== 'todos' && reserva.estado !== filtros.estado) {
        return false;
      }

      // Filtro por barbero
      if (filtros.barbero !== 'todos' && reserva.id_barbero !== filtros.barbero) {
        return false;
      }

      // Filtro por fecha
      if (filtros.fecha && reserva.fecha_reserva !== filtros.fecha) {
        return false;
      }

      // Filtro por búsqueda
      if (filtros.busqueda) {
        const cliente = usuarios?.find(u => u.id_usuario === reserva.id_cliente);
        const barbero = barberos?.find(b => b.id_barbero === reserva.id_barbero);
        const servicio = servicios?.find(s => s.id_servicio === reserva.id_servicio);
        
        const searchLower = filtros.busqueda.toLowerCase();
        
        const matchesCliente = cliente?.nombre?.toLowerCase().includes(searchLower);
        const matchesBarbero = barbero?.nombre?.toLowerCase().includes(searchLower);
        const matchesServicio = servicio?.nombre?.toLowerCase().includes(searchLower);
        const matchesFecha = reserva.fecha_reserva.includes(searchLower);
        const matchesHora = reserva.hora_inicio.includes(searchLower);

        return matchesCliente || matchesBarbero || matchesServicio || matchesFecha || matchesHora;
      }

      return true;
    });
  }, [reservas, usuarios, barberos, servicios, filtros]);

  // Estadísticas rápidas
  const estadisticas = useMemo(() => {
    if (!reservas) return { total: 0, pendientes: 0, completadas: 0, canceladas: 0 };

    return {
      total: reservas.length,
      pendientes: reservas.filter(r => r.estado === 'pendiente').length,
      completadas: reservas.filter(r => r.estado === 'completada').length,
      canceladas: reservas.filter(r => r.estado === 'cancelada').length,
    };
  }, [reservas]);

  // ===================================================================
  // MANEJADORES DE EVENTOS
  // ===================================================================

  const handleCompletarReserva = async (reservaId: string) => {
    if (window.confirm('¿Confirmar que la reserva ha sido completada?')) {
      try {
        await completarReserva(reservaId);
        await refetchReservas();
      } catch (error) {
        console.error('Error completando reserva:', error);
        alert('Error al completar la reserva');
      }
    }
  };

  const handleCancelarReserva = async (reservaId: string) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      try {
        await cancelarReserva(reservaId);
        await refetchReservas();
      } catch (error) {
        console.error('Error cancelando reserva:', error);
        alert('Error al cancelar la reserva');
      }
    }
  };

  const handleExportarCSV = () => {
    const csvHeaders = 'Fecha,Hora,Cliente,Barbero,Servicio,Precio,Estado\n';
    const csvData = reservasFiltradas.map(reserva => {
      const cliente = usuarios?.find(u => u.id_usuario === reserva.id_cliente);
      const barbero = barberos?.find(b => b.id_barbero === reserva.id_barbero);
      const servicio = servicios?.find(s => s.id_servicio === reserva.id_servicio);

      return [
        reserva.fecha_reserva,
        reserva.hora_inicio,
        cliente?.nombre || 'N/A',
        barbero?.nombre || 'N/A',
        servicio?.nombre || 'N/A',
        reserva.precio_total || servicio?.precio || 0,
        reserva.estado
      ].join(',');
    }).join('\n');

    const blob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===================================================================
  // FUNCIÓN DE COLOR DE ESTADO
  // ===================================================================

  const getEstadoColor = (estado: string) => {
    const estadoConfig = ESTADOS_RESERVA.find(e => e.value === estado);
    return estadoConfig?.color || 'gray';
  };

  // ===================================================================
  // RENDERIZADO
  // ===================================================================

  if (loadingReservas) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (errorReservas) {
    return (
      <div className="bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded">
        Error al cargar reservas: {errorReservas}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-yellow-500" />
          <span className="hidden sm:inline">Gestión de Reservas</span>
          <span className="sm:hidden">Reservas</span>
        </h2>
        <button
          onClick={handleExportarCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md font-semibold flex items-center justify-center transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Exportar CSV</span>
          <span className="sm:hidden">Exportar</span>
        </button>
      </div>

      {/* Estadísticas rápidas - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="text-lg sm:text-2xl font-bold text-white">{estadisticas.total}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Total</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="text-lg sm:text-2xl font-bold text-yellow-400">{estadisticas.pendientes}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Pendientes</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="text-lg sm:text-2xl font-bold text-green-400">{estadisticas.completadas}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Completadas</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="text-lg sm:text-2xl font-bold text-red-400">{estadisticas.canceladas}</div>
          <div className="text-gray-400 text-xs sm:text-sm">Canceladas</div>
        </div>
      </div>

      {/* Filtros - Mobile First */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
            />
          </div>

          {/* Filtros en grid responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              className="px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            >
              {ESTADOS_RESERVA.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
              value={filtros.barbero}
              onChange={(e) => setFiltros({ ...filtros, barbero: e.target.value })}
            >
              <option value="todos">Todos los barberos</option>
              {barberos?.map(barbero => (
                <option key={barbero.id_barbero} value={barbero.id_barbero}>
                  {barbero.nombre}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
              value={filtros.fecha}
              onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Lista de reservas - Mobile First */}
      {reservasFiltradas.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 sm:p-12 text-center">
          <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-base sm:text-lg">No hay reservas que mostrar</p>
        </div>
      ) : (
        <>
          {/* Vista Mobile - Cards */}
          <div className="block lg:hidden space-y-4">
            {reservasFiltradas.map((reserva) => {
              const cliente = usuarios?.find(u => u.id_usuario === reserva.id_cliente);
              const barbero = barberos?.find(b => b.id_barbero === reserva.id_barbero);
              const servicio = servicios?.find(s => s.id_servicio === reserva.id_servicio);
              const colorEstado = getEstadoColor(reserva.estado);

              return (
                <div key={reserva.id_reserva} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  {/* Header de la card */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center text-white font-medium mb-1">
                        <Calendar className="h-4 w-4 mr-2 text-yellow-500" />
                        {new Date(reserva.fecha_reserva).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {reserva.hora_inicio} - {reserva.hora_fin}
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      colorEstado === 'green' ? 'bg-green-100 text-green-800' :
                      colorEstado === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      colorEstado === 'blue' ? 'bg-blue-100 text-blue-800' :
                      colorEstado === 'red' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                    </span>
                  </div>

                  {/* Información de la reserva */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-white text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium mr-2">Cliente:</span>
                      <span>{cliente?.nombre || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-white text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium mr-2">Barbero:</span>
                      <span>{barbero?.nombre || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-white text-sm">
                      <span className="font-medium mr-2">Servicio:</span>
                      <span>{servicio?.nombre || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-green-400 font-medium text-sm">
                      <span className="mr-2">Precio:</span>
                      <span>${(reserva.precio_total || servicio?.precio || 0).toLocaleString('es-CL')}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-2">
                    {reserva.estado === 'pendiente' && (
                      <button
                        onClick={() => handleCompletarReserva(reserva.id_reserva)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completar
                      </button>
                    )}
                    {(reserva.estado === 'pendiente' || reserva.estado === 'confirmada') && (
                      <button
                        onClick={() => handleCancelarReserva(reserva.id_reserva)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vista Desktop - Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Fecha & Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Barbero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {reservasFiltradas.map((reserva) => {
                  const cliente = usuarios?.find(u => u.id_usuario === reserva.id_cliente);
                  const barbero = barberos?.find(b => b.id_barbero === reserva.id_barbero);
                  const servicio = servicios?.find(s => s.id_servicio === reserva.id_servicio);
                  const colorEstado = getEstadoColor(reserva.estado);

                  return (
                    <tr key={reserva.id_reserva} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(reserva.fecha_reserva).toLocaleDateString('es-ES')}
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            {reserva.hora_inicio} - {reserva.hora_fin}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-white">
                            {cliente?.nombre || 'Cliente no encontrado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white">
                          {barbero?.nombre || 'Barbero no encontrado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white">
                          {servicio?.nombre || 'Servicio no encontrado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-green-400 font-medium">
                          ${(reserva.precio_total || servicio?.precio || 0).toLocaleString('es-CL')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          colorEstado === 'green' ? 'bg-green-100 text-green-800' :
                          colorEstado === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          colorEstado === 'blue' ? 'bg-blue-100 text-blue-800' :
                          colorEstado === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          {reserva.estado === 'pendiente' && (
                            <button
                              onClick={() => handleCompletarReserva(reserva.id_reserva)}
                              className="text-green-400 hover:text-green-300 p-1 rounded transition-colors"
                              title="Completar reserva"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {(reserva.estado === 'pendiente' || reserva.estado === 'confirmada') && (
                            <button
                              onClick={() => handleCancelarReserva(reserva.id_reserva)}
                              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                              title="Cancelar reserva"
                            >
                              <XCircle className="h-4 w-4" />
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
        </>
      )}
    </div>
  );
};

export default GestionReservasMejorada;
