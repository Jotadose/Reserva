import React from "react";
import { useAnalytics } from "../../hooks/useAnalytics";
import { Booking } from "../../types/booking";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  services?: string[];
  statuses?: string[];
  clientType?: "all" | "new" | "returning";
}

interface AdvancedAnalyticsDashboardProps {
  bookings: Booking[];
  filters?: AnalyticsFilters;
  onFiltersChange?: (filters: AnalyticsFilters) => void;
}

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  bookings,
  filters,
  onFiltersChange,
}) => {
  const { analytics, isLoading } = useAnalytics(bookings, filters);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      {onFiltersChange && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Filtros de Análisis</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="start-date" className="mb-2 block text-sm font-medium text-gray-700">
                Fecha Inicio
              </label>
              <input
                id="start-date"
                type="date"
                value={filters?.startDate || ""}
                onChange={(e) =>
                  onFiltersChange({ ...filters, startDate: e.target.value } as AnalyticsFilters)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="mb-2 block text-sm font-medium text-gray-700">
                Fecha Fin
              </label>
              <input
                id="end-date"
                type="date"
                value={filters?.endDate || ""}
                onChange={(e) =>
                  onFiltersChange({ ...filters, endDate: e.target.value } as AnalyticsFilters)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="client-type" className="mb-2 block text-sm font-medium text-gray-700">
                Tipo de Cliente
              </label>
              <select
                id="client-type"
                value={filters?.clientType || "all"}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    clientType: e.target.value as "all" | "new" | "returning",
                  } as AnalyticsFilters)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los Clientes</option>
                <option value="new">Clientes Nuevos</option>
                <option value="returning">Clientes Recurrentes</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.totalRevenue)}
              </p>
            </div>
            <div
              className={`text-sm ${analytics.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {analytics.revenueGrowth >= 0 ? "↗" : "↘"}{" "}
              {formatPercentage(Math.abs(analytics.revenueGrowth))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reservas</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalBookings}</p>
            </div>
            <div
              className={`text-sm ${analytics.bookingGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {analytics.bookingGrowth >= 0 ? "↗" : "↘"}{" "}
              {formatPercentage(Math.abs(analytics.bookingGrowth))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-600">Valor Promedio</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(analytics.averageBookingValue)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercentage(analytics.bookingConversionRate)}
            </p>
          </div>
        </div>
      </div>

      {/* Métricas Adicionales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-lg font-semibold text-gray-900">Ingresos por Período</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Hoy:</span>
              <span className="font-semibold">{formatCurrency(analytics.dailyRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Esta Semana:</span>
              <span className="font-semibold">{formatCurrency(analytics.weeklyRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Este Mes:</span>
              <span className="font-semibold">{formatCurrency(analytics.monthlyRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-lg font-semibold text-gray-900">Estado de Reservas</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completadas:</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{analytics.completedBookings}</span>
                <div className="h-2 w-16 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${(analytics.completedBookings / analytics.totalBookings) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pendientes:</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{analytics.pendingBookings}</span>
                <div className="h-2 w-16 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-500"
                    style={{
                      width: `${(analytics.pendingBookings / analytics.totalBookings) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Canceladas:</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{analytics.cancelledBookings}</span>
                <div className="h-2 w-16 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{
                      width: `${(analytics.cancelledBookings / analytics.totalBookings) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-lg font-semibold text-gray-900">Métricas de Clientes</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Clientes:</span>
              <span className="font-semibold">{analytics.totalClients}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clientes Nuevos:</span>
              <span className="font-semibold">{analytics.newClients}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tasa Retención:</span>
              <span className="font-semibold">
                {formatPercentage(analytics.clientRetentionRate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Servicios */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-lg font-semibold text-gray-900">Servicios Más Populares</h4>
        <div className="space-y-4">
          {analytics.serviceDistribution.slice(0, 5).map((service, index) => (
            <div key={service.service} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium text-gray-600">#{index + 1}</div>
                <div>
                  <p className="font-medium text-gray-900">{service.service}</p>
                  <p className="text-sm text-gray-500">{service.count} reservas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(service.revenue)}</p>
                <p className="text-sm text-gray-500">{formatPercentage(service.percentage)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Horarios Más Populares */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-lg font-semibold text-gray-900">Horarios Más Demandados</h4>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {analytics.timeSlotPopularity.slice(0, 6).map((slot) => (
            <div key={slot.hour} className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{slot.hour}:00</p>
              <p className="text-sm text-gray-600">{slot.count} reservas</p>
              <p className="text-xs text-gray-500">{formatPercentage(slot.percentage)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de Rendimiento */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tasa de Cancelación</p>
            <p className="text-2xl font-bold text-red-600">
              {formatPercentage(analytics.cancellationRate)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tasa de No-Show</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatPercentage(analytics.noShowRate)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Tiempo Promedio de Reserva</p>
            <p className="text-2xl font-bold text-blue-600">
              {analytics.averageBookingLeadTime.toFixed(1)} días
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Retención de Clientes</p>
            <p className="text-2xl font-bold text-green-600">
              {formatPercentage(analytics.clientRetentionRate)}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de Tendencias (Simplified) */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-lg font-semibold text-gray-900">
          Tendencia de Ingresos (Últimos 30 días)
        </h4>
        <div className="flex h-64 items-end justify-between space-x-1">
          {analytics.dailyTrends.map((day, index) => {
            const maxRevenue = Math.max(...analytics.dailyTrends.map((d) => d.revenue));
            const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

            return (
              <div
                key={day.date}
                className="group relative min-h-[4px] flex-1 rounded-t bg-blue-500"
                style={{ height: `${height}%` }}
              >
                <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                  {day.date}: {formatCurrency(day.revenue)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Hace 30 días</span>
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
};
