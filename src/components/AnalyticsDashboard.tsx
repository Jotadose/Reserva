import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Star } from 'lucide-react';
import { Booking } from '../types/booking';
import { calculateAnalytics, formatCurrency, formatPercentage } from '../utils/analytics';

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
    <div className={`bg-gray-900/50 border border-gray-700 rounded-xl p-6 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          value={analytics.peakHours[0]?.hour || 'N/A'}
          icon={<Clock className="h-8 w-8" />}
          color="border-purple-500/20"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Services */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Servicios Populares</h3>
          <div className="space-y-3">
            {analytics.popularServices.slice(0, 5).map((service, index) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white">{service.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{service.count} reservas</div>
                  <div className="text-gray-400 text-sm">{formatCurrency(service.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Horas Más Ocupadas</h3>
          <div className="space-y-3">
            {analytics.peakHours.slice(0, 5).map((hour, index) => (
              <div key={hour.hour} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white">{hour.hour}</span>
                </div>
                <div className="text-white font-semibold">{hour.count} reservas</div>
              </div>
            ))}
          </div>
        </div>

        {/* Busy Days */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Días Más Ocupados</h3>
          <div className="space-y-3">
            {analytics.busyDays.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white capitalize">{day.day}</span>
                </div>
                <div className="text-white font-semibold">{day.count} reservas</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Service */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Ingresos por Servicio</h3>
          <div className="space-y-3">
            {analytics.popularServices.slice(0, 5).map((service, index) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white">{service.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{formatCurrency(service.revenue)}</div>
                  <div className="text-gray-400 text-sm">
                    {formatPercentage((service.revenue / analytics.totalRevenue) * 100)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
