/**
 * ===================================================================
 * GESTIÓN AVANZADA DE RESERVAS - COMPONENTE PARA ADMIN
 * ===================================================================
 *
 * Componente especializado para la gestión completa de reservas
 * con filtros, búsqueda, acciones masivas y vista detallada
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Calendar,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Scissors,
  CreditCard,
  Phone,
} from "lucide-react";

import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  LoadingSpinner,
  EmptyState,
} from "../ui";

import { useReservas } from "../../hooks/useApiHooks";
import { useToast } from "../../contexts/ToastContext";

// ===================================================================
// TIPOS
// ===================================================================

interface ReservaFiltros {
  estado?: string;
  fecha?: string;
  barbero?: string;
  busqueda?: string;
}

// ===================================================================
// UTILIDADES MEMOIZADAS
// ===================================================================

const getEstadoBadge = React.memo((estado: string) => {
  switch (estado) {
    case "confirmada":
      return { variant: "success" as const, label: "Confirmada" };
    case "pendiente":
      return { variant: "warning" as const, label: "Pendiente" };
    case "cancelada":
      return { variant: "danger" as const, label: "Cancelada" };
    case "completada":
      return { variant: "primary" as const, label: "Completada" };
    default:
      return { variant: "secondary" as const, label: estado };
  }
});

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const GestionReservas: React.FC = () => {
  const [filtros, setFiltros] = useState<ReservaFiltros>({});

  const { reservas, loading, error } = useReservas();
  const { showToast } = useToast();

  // Filtrado optimizado con memoización
  const reservasFiltradas = useMemo(() => {
    if (!reservas) return [];
    
    return reservas.filter((reserva) => {
      // Filtro por estado
      if (
        filtros.estado &&
        filtros.estado !== "todos" &&
        reserva.estado !== filtros.estado
      ) {
        return false;
      }
      
      // Filtro por búsqueda
      if (filtros.busqueda) {
        const searchTerm = filtros.busqueda.toLowerCase();
        const clienteNombre = reserva.cliente_info?.nombre?.toLowerCase() || "";
        const servicioNombre = reserva.servicio_info?.nombre?.toLowerCase() || "";
        
        if (
          !clienteNombre.includes(searchTerm) &&
          !servicioNombre.includes(searchTerm)
        ) {
          return false;
        }
      }
      
      return true;
    });
  }, [reservas, filtros]);

  // Handlers memoizados
  const handleFiltroChange = useCallback((key: keyof ReservaFiltros, value: string) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleBusquedaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiltroChange("busqueda", e.target.value);
  }, [handleFiltroChange]);

  const handleEstadoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFiltroChange("estado", e.target.value);
  }, [handleFiltroChange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Gestión de Reservas</h3>
          <p className="text-slate-400">
            {reservasFiltradas.length} de {reservas?.length || 0} reservas
          </p>
        </div>
        <Button variant="primary" icon={Calendar}>
          Nueva Reserva
        </Button>
      </div>

      <Card padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Buscar reservas..."
            icon={Search}
            value={filtros.busqueda || ""}
            onChange={handleBusquedaChange}
          />
          <Select
            options={[
              { value: "todos", label: "Todos los estados" },
              { value: "pendiente", label: "Pendientes" },
              { value: "confirmada", label: "Confirmadas" },
            ]}
            value={filtros.estado || "todos"}
            onChange={handleEstadoChange}
          />
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" text="Cargando reservas..." />
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="text-center text-red-400">
              Error al cargar las reservas: {error}
            </div>
          </div>
        ) : reservasFiltradas.length > 0 ? (
          <div className="space-y-4 p-6">
            {reservasFiltradas.map((reserva) => {
              const estadoBadge = getEstadoBadge(reserva.estado);
              return (
                <div
                  key={reserva.id_reserva}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <User className="h-8 w-8 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">
                        {reserva.cliente_info?.nombre || "Cliente"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {reserva.servicio_info?.nombre || "Servicio"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">
                      {reserva.fecha_reserva} - {reserva.hora_inicio}
                    </p>
                    <Badge variant={estadoBadge.variant}>
                      {estadoBadge.label}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={Edit3} />
                    <Button variant="ghost" size="sm" icon={Trash2} />
                    <Button variant="ghost" size="sm" icon={MoreHorizontal} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Calendar}
              title="No hay reservas"
              description="No hay reservas registradas"
              action={
                <Button variant="primary" icon={Calendar}>
                  Nueva Reserva
                </Button>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default GestionReservas;
