import React from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Star } from "lucide-react";
import { Booking } from "../types/booking";
import { calculateAnalytics, formatCurrency, formatPercentage } from "../utils/analytics";

interface AnalyticsDashboardProps {
  bookings: Booking[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ bookings }) => {
  const analytics = calculateAnalytics(bookings);

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className={`rounded-xl border border-gray-700 bg-gray-900/50 p-6 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center">
              {change >= 0 ? (
                <TrendingUp className="mr-1 h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatPercentage(Math.abs(change))}
              </span>
            </div>
          )}
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Reservas"
          value={analytics.totalBookings.toString()}
          change={analytics.weeklyGrowth}
          icon={<Users className="h-8 w-8" />}
          color="border-blue-500/20"
        />
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(analytics.totalRevenue)}
          change={analytics.monthlyGrowth}
          icon={<DollarSign className="h-8 w-8" />}
          color="border-green-500/20"
        />
        <MetricCard
          title="Valor Promedio"
          value={formatCurrency(analytics.averageBookingValue)}
          icon={<Star className="h-8 w-8" />}
          color="border-yellow-500/20"
        />
        <MetricCard
          title="Hora Pico"
          value={analytics.peakHours?.[0]?.hour || "N/A"}
          icon={<Clock className="h-8 w-8" />}
          color="border-purple-500/20"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Popular Services */}
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-6">
          <h3 className="mb-4 text-xl font-bold text-white">Servicios Populares</h3>
          <div className="space-y-3">
            {analytics.popularServices?.slice(0, 5).map((service, index) =>
              service?.name ? (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-sm font-bold text-black">
                      {index + 1}
                    </div>
                    <span className="text-white">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">{service.count || 0} reservas</div>
                    <div className="text-sm text-gray-400">
                      {formatCurrency(service.revenue || 0)}
                    </div>
                  </div>
                </div>
              ) : null,
            ) || (
              <div className="py-4 text-center text-gray-400">
                No hay datos de servicios disponibles
              </div>
            )}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-6">
          <h3 className="mb-4 text-xl font-bold text-white">Horas Más Ocupadas</h3>
          <div className="space-y-3">
            {analytics.peakHours?.slice(0, 5).map((hour, index) =>
              hour?.hour ? (
                <div key={hour.hour} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="text-white">{hour.hour}</span>
                  </div>
                  <div className="font-semibold text-white">{hour.count || 0} reservas</div>
                </div>
              ) : null,
            ) || (
              <div className="py-4 text-center text-gray-400">
                No hay datos de horarios disponibles
              </div>
            )}
          </div>
        </div>

        {/* Busy Days */}
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-6">
          <h3 className="mb-4 text-xl font-bold text-white">Días Más Ocupados</h3>
          <div className="space-y-3">
            {analytics.busyDays?.map((day, index) =>
              day?.day ? (
                <div key={day.day} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="capitalize text-white">{day.day}</span>
                  </div>
                  <div className="font-semibold text-white">{day.count || 0} reservas</div>
                </div>
              ) : null,
            ) || (
              <div className="py-4 text-center text-gray-400">No hay datos de días disponibles</div>
            )}
          </div>
        </div>

        {/* Revenue by Service */}
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-6">
          <h3 className="mb-4 text-xl font-bold text-white">Ingresos por Servicio</h3>
          <div className="space-y-3">
            {analytics.popularServices?.slice(0, 5).map((service, index) =>
              service?.name ? (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="text-white">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {formatCurrency(service.revenue || 0)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatPercentage(((service.revenue || 0) / analytics.totalRevenue) * 100)}
                    </div>
                  </div>
                </div>
              ) : null,
            ) || (
              <div className="py-4 text-center text-gray-400">
                No hay datos de ingresos disponibles
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
