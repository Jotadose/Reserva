import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Star,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Booking } from "../types/booking";
import { LoadingSpinner } from "./common/LoadingSpinner";

interface AdvancedAnalyticsProps {
  bookings: Booking[];
}

interface MetricData {
  label: string;
  value: number;
  previousValue: number;
  format: "number" | "currency" | "percentage" | "time";
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface PeriodFilter {
  label: string;
  value: string;
  days: number;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ bookings }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [isLoading, setIsLoading] = useState(false);

  const periods: PeriodFilter[] = [
    { label: "Última Semana", value: "7", days: 7 },
    { label: "Último Mes", value: "30", days: 30 },
    { label: "Últimos 3 Meses", value: "90", days: 90 },
    { label: "Último Año", value: "365", days: 365 },
  ];

  const currentPeriod = periods.find((p) => p.value === selectedPeriod) || periods[1];

  // Filtrar bookings por período actual y anterior
  const { currentBookings, previousBookings } = useMemo(() => {
    const now = new Date();
    const periodStart = new Date(now.getTime() - currentPeriod.days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(
      periodStart.getTime() - currentPeriod.days * 24 * 60 * 60 * 1000,
    );

    const current = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= periodStart && bookingDate <= now;
    });

    const previous = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= previousPeriodStart && bookingDate < periodStart;
    });

    return { currentBookings: current, previousBookings: previous };
  }, [bookings, currentPeriod.days]);

  // Calcular métricas avanzadas
  const metrics: MetricData[] = useMemo(() => {
    const currentRevenue = currentBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const previousRevenue = previousBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    const currentCompleted = currentBookings.filter((b) => b.status === "completed").length;
    const previousCompleted = previousBookings.filter((b) => b.status === "completed").length;

    const currentCancelled = currentBookings.filter((b) => b.status === "cancelled").length;
    const previousCancelled = previousBookings.filter((b) => b.status === "cancelled").length;

    const currentCancellationRate =
      currentBookings.length > 0 ? (currentCancelled / currentBookings.length) * 100 : 0;
    const previousCancellationRate =
      previousBookings.length > 0 ? (previousCancelled / previousBookings.length) * 100 : 0;

    const currentAvgBookingValue =
      currentBookings.length > 0 ? currentRevenue / currentBookings.length : 0;
    const previousAvgBookingValue =
      previousBookings.length > 0 ? previousRevenue / previousBookings.length : 0;

    // Clientes únicos
    const currentUniqueClients = new Set(currentBookings.map((b) => b.client.email)).size;
    const previousUniqueClients = new Set(previousBookings.map((b) => b.client.email)).size;

    // Tiempo promedio entre reservas
    const calculateAvgTimeBetweenBookings = (bookingsList: Booking[]) => {
      if (bookingsList.length < 2) return 0;
      const sortedDates = bookingsList.map((b) => new Date(b.date).getTime()).sort((a, b) => a - b);

      let totalDiff = 0;
      for (let i = 1; i < sortedDates.length; i++) {
        totalDiff += sortedDates[i] - sortedDates[i - 1];
      }

      return totalDiff / (sortedDates.length - 1) / (24 * 60 * 60 * 1000); // Días
    };

    const currentAvgDaysBetween = calculateAvgTimeBetweenBookings(currentBookings);
    const previousAvgDaysBetween = calculateAvgTimeBetweenBookings(previousBookings);

    // Cliente retention rate (clientes que volvieron)
    const currentReturnClients = currentBookings.filter((booking) => {
      const clientPreviousBookings = bookings.filter(
        (b) => b.client.email === booking.client.email && new Date(b.date) < new Date(booking.date),
      );
      return clientPreviousBookings.length > 0;
    }).length;

    const currentRetentionRate =
      currentBookings.length > 0 ? (currentReturnClients / currentBookings.length) * 100 : 0;

    const previousReturnClients = previousBookings.filter((booking) => {
      const clientPreviousBookings = bookings.filter(
        (b) => b.client.email === booking.client.email && new Date(b.date) < new Date(booking.date),
      );
      return clientPreviousBookings.length > 0;
    }).length;

    const previousRetentionRate =
      previousBookings.length > 0 ? (previousReturnClients / previousBookings.length) * 100 : 0;

    const getTrend = (current: number, previous: number): "up" | "down" | "neutral" => {
      if (current > previous) return "up";
      if (current < previous) return "down";
      return "neutral";
    };

    return [
      {
        label: "Ingresos Totales",
        value: currentRevenue,
        previousValue: previousRevenue,
        format: "currency",
        trend: getTrend(currentRevenue, previousRevenue),
        icon: DollarSign,
        color: "text-green-600",
      },
      {
        label: "Reservas Completadas",
        value: currentCompleted,
        previousValue: previousCompleted,
        format: "number",
        trend: getTrend(currentCompleted, previousCompleted),
        icon: Calendar,
        color: "text-blue-600",
      },
      {
        label: "Clientes Únicos",
        value: currentUniqueClients,
        previousValue: previousUniqueClients,
        format: "number",
        trend: getTrend(currentUniqueClients, previousUniqueClients),
        icon: Users,
        color: "text-purple-600",
      },
      {
        label: "Valor Promedio",
        value: currentAvgBookingValue,
        previousValue: previousAvgBookingValue,
        format: "currency",
        trend: getTrend(currentAvgBookingValue, previousAvgBookingValue),
        icon: TrendingUp,
        color: "text-indigo-600",
      },
      {
        label: "Tasa de Cancelación",
        value: currentCancellationRate,
        previousValue: previousCancellationRate,
        format: "percentage",
        trend: getTrend(previousCancellationRate, currentCancellationRate), // Invertido porque menos cancelaciones es mejor
        icon: Activity,
        color: "text-red-600",
      },
      {
        label: "Tasa de Retención",
        value: currentRetentionRate,
        previousValue: previousRetentionRate,
        format: "percentage",
        trend: getTrend(currentRetentionRate, previousRetentionRate),
        icon: Star,
        color: "text-yellow-600",
      },
      {
        label: "Días Entre Reservas",
        value: currentAvgDaysBetween,
        previousValue: previousAvgDaysBetween,
        format: "time",
        trend: getTrend(previousAvgDaysBetween, currentAvgDaysBetween), // Invertido porque menos días es mejor
        icon: Clock,
        color: "text-gray-600",
      },
    ];
  }, [currentBookings, previousBookings, bookings]);

  // Análisis por servicios
  const serviceAnalytics = useMemo(() => {
    const serviceStats = new Map<string, { count: number; revenue: number; avgPrice: number }>();

    currentBookings.forEach((booking) => {
      booking.services.forEach((service) => {
        const existing = serviceStats.get(service.name) || { count: 0, revenue: 0, avgPrice: 0 };
        existing.count += 1;
        existing.revenue += service.price;
        existing.avgPrice = existing.revenue / existing.count;
        serviceStats.set(service.name, existing);
      });
    });

    return Array.from(serviceStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [currentBookings]);

  // Análisis temporal (por día de la semana y hora)
  const temporalAnalytics = useMemo(() => {
    const dayStats = new Map<string, number>();
    const hourStats = new Map<number, number>();

    currentBookings.forEach((booking) => {
      const date = new Date(booking.date);
      const dayName = date.toLocaleDateString("es-CO", { weekday: "long" });
      const hour = parseInt(booking.time.split(":")[0]);

      dayStats.set(dayName, (dayStats.get(dayName) || 0) + 1);
      hourStats.set(hour, (hourStats.get(hour) || 0) + 1);
    });

    const bestDay = Array.from(dayStats.entries()).sort((a, b) => b[1] - a[1])[0];
    const bestHour = Array.from(hourStats.entries()).sort((a, b) => b[1] - a[1])[0];

    return {
      bestDay: bestDay ? { day: bestDay[0], count: bestDay[1] } : null,
      bestHour: bestHour ? { hour: bestHour[0], count: bestHour[1] } : null,
      dayDistribution: Array.from(dayStats.entries()),
      hourDistribution: Array.from(hourStats.entries()).sort((a, b) => a[0] - b[0]),
    };
  }, [currentBookings]);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
        }).format(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "time":
        return `${value.toFixed(1)} días`;
      default:
        return value.toLocaleString("es-CO");
    }
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Análisis Avanzado</h2>
            <p className="text-gray-600">Métricas detalladas y análisis de tendencias</p>
          </div>
          <div>
            <label htmlFor="period-select" className="mb-2 block text-sm font-medium text-gray-700">
              Período de Análisis
            </label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.slice(0, 4).map((metric, index) => (
          <div key={index} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className={`text-2xl font-bold ${metric.color}`}>
                  {formatValue(metric.value, metric.format)}
                </p>
                <div className="mt-2 flex items-center">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : metric.trend === "down" ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span
                    className={`ml-1 text-sm ${
                      metric.trend === "up"
                        ? "text-green-500"
                        : metric.trend === "down"
                          ? "text-red-500"
                          : "text-gray-500"
                    }`}
                  >
                    {Math.abs(
                      calculatePercentageChange(metric.value, metric.previousValue),
                    ).toFixed(1)}
                    %
                  </span>
                  <span className="ml-1 text-sm text-gray-500">vs período anterior</span>
                </div>
              </div>
              <div className={`rounded-full bg-gray-100 p-3`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {metrics.slice(4).map((metric, index) => (
          <div key={index + 4} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className={`text-xl font-bold ${metric.color}`}>
                  {formatValue(metric.value, metric.format)}
                </p>
                <div className="mt-2 flex items-center">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : metric.trend === "down" ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <div className="h-3 w-3" />
                  )}
                  <span
                    className={`ml-1 text-xs ${
                      metric.trend === "up"
                        ? "text-green-500"
                        : metric.trend === "down"
                          ? "text-red-500"
                          : "text-gray-500"
                    }`}
                  >
                    {Math.abs(
                      calculatePercentageChange(metric.value, metric.previousValue),
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-gray-100 p-2">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Análisis por Servicios */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Rendimiento por Servicio</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>

        {serviceAnalytics.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <PieChart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p>No hay datos de servicios para el período seleccionado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Servicio</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Reservas</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Ingresos</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Precio Promedio
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">% del Total</th>
                </tr>
              </thead>
              <tbody>
                {serviceAnalytics.map((service, index) => {
                  const totalRevenue = serviceAnalytics.reduce((sum, s) => sum + s.revenue, 0);
                  const percentage = totalRevenue > 0 ? (service.revenue / totalRevenue) * 100 : 0;

                  return (
                    <tr key={service.name} className="border-b border-gray-100">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div
                            className={`mr-3 h-3 w-3 rounded-full ${
                              index === 0
                                ? "bg-blue-500"
                                : index === 1
                                  ? "bg-green-500"
                                  : index === 2
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                            }`}
                          />
                          <span className="font-medium text-gray-900">{service.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">{service.count}</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {formatValue(service.revenue, "currency")}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {formatValue(service.avgPrice, "currency")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-gray-900">{percentage.toFixed(1)}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Análisis Temporal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mejores Días y Horas */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Patrones Temporales</h3>

          <div className="space-y-4">
            {temporalAnalytics.bestDay && (
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 font-medium text-blue-900">Mejor Día de la Semana</h4>
                <p className="text-blue-700">
                  <span className="font-semibold capitalize">{temporalAnalytics.bestDay.day}</span>
                  <span className="ml-2 text-sm">({temporalAnalytics.bestDay.count} reservas)</span>
                </p>
              </div>
            )}

            {temporalAnalytics.bestHour && (
              <div className="rounded-lg bg-green-50 p-4">
                <h4 className="mb-2 font-medium text-green-900">Mejor Hora del Día</h4>
                <p className="text-green-700">
                  <span className="font-semibold">{temporalAnalytics.bestHour.hour}:00</span>
                  <span className="ml-2 text-sm">
                    ({temporalAnalytics.bestHour.count} reservas)
                  </span>
                </p>
              </div>
            )}
          </div>

          {temporalAnalytics.dayDistribution.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 font-medium text-gray-900">Distribución por Día</h4>
              <div className="space-y-2">
                {temporalAnalytics.dayDistribution.map(([day, count]) => {
                  const maxCount = Math.max(...temporalAnalytics.dayDistribution.map((d) => d[1]));
                  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                  return (
                    <div key={day} className="flex items-center">
                      <div className="w-16 text-sm capitalize text-gray-600">{day.slice(0, 3)}</div>
                      <div className="mx-3 flex-1">
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-8 text-right text-sm text-gray-900">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Distribución por Horas */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Distribución por Horas</h3>

          {temporalAnalytics.hourDistribution.length > 0 ? (
            <div className="space-y-2">
              {temporalAnalytics.hourDistribution.map(([hour, count]) => {
                const maxCount = Math.max(...temporalAnalytics.hourDistribution.map((h) => h[1]));
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <div key={hour} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                    <div className="mx-3 flex-1">
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-500 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-8 text-right text-sm text-gray-900">{count}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p>No hay datos suficientes para mostrar distribución por horas</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen de Insights */}
      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Insights Clave</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4">
            <h4 className="mb-2 font-medium text-gray-900">📈 Crecimiento</h4>
            <p className="text-sm text-gray-600">
              Los ingresos han {metrics[0].trend === "up" ? "aumentado" : "disminuido"} un{" "}
              {Math.abs(
                calculatePercentageChange(metrics[0].value, metrics[0].previousValue),
              ).toFixed(1)}
              % comparado con el período anterior.
            </p>
          </div>

          <div className="rounded-lg bg-white p-4">
            <h4 className="mb-2 font-medium text-gray-900">⭐ Retención</h4>
            <p className="text-sm text-gray-600">
              El {metrics[5].value.toFixed(1)}% de tus clientes son recurrentes, lo que indica una
              buena fidelización.
            </p>
          </div>

          {serviceAnalytics.length > 0 && (
            <div className="rounded-lg bg-white p-4">
              <h4 className="mb-2 font-medium text-gray-900">🏆 Mejor Servicio</h4>
              <p className="text-sm text-gray-600">
                {serviceAnalytics[0].name} es tu servicio más popular con{" "}
                {serviceAnalytics[0].count} reservas en este período.
              </p>
            </div>
          )}

          {temporalAnalytics.bestDay && (
            <div className="rounded-lg bg-white p-4">
              <h4 className="mb-2 font-medium text-gray-900">📅 Mejor Día</h4>
              <p className="text-sm capitalize text-gray-600">
                Los {temporalAnalytics.bestDay.day}s son tus días más ocupados con{" "}
                {temporalAnalytics.bestDay.count} reservas promedio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
