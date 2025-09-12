import React, { useMemo, useCallback } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Booking } from "../types/booking";

interface SimpleAnalyticsProps {
  bookings: Booking[];
}

// Componente simplificado para barbería - foco en funcionalidad
export const SimpleAnalytics: React.FC<SimpleAnalyticsProps> = ({
  bookings,
}) => {
  // 🛠️ DEBUG: Verificar datos que llegan al componente
  console.log("📊 SimpleAnalytics - Datos recibidos:", {
    totalBookings: bookings.length,
    firstBooking: bookings[0],
    bookingPrices: bookings.map((b) => ({
      id: b.id,
      totalPrice: b.totalPrice,
      total: b.total,
    })),
  });

  // 🚨 TEMPORALMENTE: Si no hay datos, mostrar analytics con 0
  // Esto previene mostrar números incorrectos hasta que se arregle la carga de datos

  // Formateador de moneda memoizado
  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }, []);

  const formatChileanPesos = useCallback((amount: number) => {
    return currencyFormatter.format(amount);
  }, [currencyFormatter]);

  // 🚨 VALIDACIÓN: Asegurar datos válidos antes de cualquier cálculo
  const validBookings = useMemo(() => {
    return bookings && Array.isArray(bookings) ? bookings : [];
  }, [bookings]);

  // Función de normalización de fechas memoizada
  const normalizeDate = useCallback((dateStr?: string) => {
    return dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";
  }, []);

  // Métricas esenciales para una barbería - OPTIMIZADAS
  const metrics = useMemo(() => {
    console.log("🧮 Calculando métricas con:", {
      bookingsCount: validBookings.length,
      sampleBooking: validBookings[0],
    });

    // 🛠️ FECHAS CALCULADAS - Usando función memoizada
    const today = normalizeDate(new Date().toISOString());
    const yesterday = normalizeDate(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    const thisWeek = normalizeDate(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );
    const nextWeek = normalizeDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    );

    // 🎯 FILTRAR SOLO RESERVAS VÁLIDAS PARA MÉTRICAS (confirmadas/completadas)
    const validForStats = validBookings.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    );

    // 📊 FILTROS POR PERÍODO CON FECHAS NORMALIZADAS
    const todayBookings = validForStats.filter(
      (b) => normalizeDate(b.date) === today
    );
    const yesterdayBookings = validForStats.filter(
      (b) => normalizeDate(b.date) === yesterday
    );
    const weekBookings = validForStats.filter(
      (b) => normalizeDate(b.date) >= thisWeek
    );
    const upcomingBookings = validBookings.filter(
      (b) => normalizeDate(b.date) > today && normalizeDate(b.date) <= nextWeek
    );

    // 💰 CÁLCULOS DE INGRESOS POR PERÍODO - Solo reservas válidas
    const todayRevenue = todayBookings.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0
    );
    const weekRevenue = weekBookings.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0
    );
    const totalRevenue = validForStats.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0
    );

    console.log("💰 Ingresos calculados:", {
      validForStats: validForStats.length,
      todayBookings: todayBookings.length,
      todayRevenue,
      weekRevenue,
      totalRevenue,
    });

    // 📊 ESTADOS DE RESERVAS HOY
    const completedToday = todayBookings.filter(
      (b) => b.status === "completed"
    ).length;
    const confirmedToday = todayBookings.filter(
      (b) => b.status === "confirmed"
    ).length;

    // 🎯 SERVICIO MÁS POPULAR ESTA SEMANA - Solo de reservas válidas
    const serviceCount = weekBookings.reduce((acc, booking) => {
      if (booking.services && Array.isArray(booking.services)) {
        booking.services.forEach((service) => {
          acc[service.name] = (acc[service.name] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    const topService =
      Object.entries(serviceCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "Ninguno";

    // 📈 CAMBIO VS AYER - Basado en reservas válidas
    const yesterdayValidBookings = yesterdayBookings.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    );
    const todayValidBookings = todayBookings.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    );

    let revenueChange = 0;
    if (yesterdayValidBookings.length > 0) {
      revenueChange =
        ((todayValidBookings.length - yesterdayValidBookings.length) /
          yesterdayValidBookings.length) *
        100;
    } else if (todayValidBookings.length > 0) {
      revenueChange = 100;
    }

    // ⏰ HORA PICO - Análisis de reservas de hoy
    const hourCounts = todayBookings.reduce((acc, booking) => {
      if (booking.time) {
        const hour = booking.time.split(":")[0] + ":00";
        acc[hour] = (acc[hour] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const peakHour =
      Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

    console.log("📊 Métricas finales:", {
      todayValidBookings: todayValidBookings.length,
      revenueChange: Math.round(revenueChange),
      peakHour,
      topService,
    });

    return {
      // Métricas del día
      todayBookings: todayBookings.length,
      todayRevenue,
      completedToday,
      confirmedToday,

      // Métricas de período
      weekRevenue,
      totalRevenue,
      upcomingBookings: upcomingBookings.length,
      topService,

      // Comparaciones
      revenueChange: Math.round(revenueChange),

      // Hora pico hoy
      peakHour,
    };
  }, [validBookings]);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
          <div className="rounded-xl bg-blue-500/20 p-3">
            <TrendingUp className="h-6 w-6 text-blue-400" />
          </div>
          <span>Analíticas de la Barbería</span>
        </h3>
        <p className="text-gray-400 mt-2">
          Métricas esenciales para tu negocio
        </p>
      </div>

      {/* Métricas principales - Diseño simple pero funcional */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Reservas de Hoy */}
        <div className="rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-900/20 to-blue-800/20 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">Reservas Hoy</p>
              <p className="text-3xl font-bold text-white">
                {metrics.todayBookings}
              </p>
              <p className="text-xs text-gray-400">
                Completadas: {metrics.completedToday} | Confirmadas:{" "}
                {metrics.confirmedToday}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        {/* Ingresos Hoy */}
        <div className="rounded-2xl border border-green-700/30 bg-gradient-to-br from-green-900/20 to-green-800/20 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Ingresos Hoy</p>
              <p className="text-3xl font-bold text-white">
                {formatChileanPesos(metrics.todayRevenue)}
              </p>
              {metrics.revenueChange !== 0 && (
                <p
                  className={`text-xs ${
                    metrics.revenueChange > 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {metrics.revenueChange > 0 ? "+" : ""}
                  {metrics.revenueChange}% vs ayer
                </p>
              )}
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>

        {/* Próximas Reservas */}
        <div className="rounded-2xl border border-yellow-700/30 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-400">
                Próxima Semana
              </p>
              <p className="text-3xl font-bold text-white">
                {metrics.upcomingBookings}
              </p>
              <p className="text-xs text-gray-400">reservas confirmadas</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Resumen semanal y mensual */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Resumen de la semana */}
        <div className="rounded-2xl border border-purple-700/30 bg-gradient-to-br from-purple-900/20 to-purple-800/20 p-6 backdrop-blur-sm">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-purple-400 mr-2" />
            Esta Semana
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Ingresos:</span>
              <span className="text-white font-semibold">
                {formatChileanPesos(metrics.weekRevenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Servicio popular:</span>
              <span className="text-white font-semibold">
                {metrics.topService}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hora pico hoy:</span>
              <span className="text-white font-semibold">
                {metrics.peakHour}
              </span>
            </div>
          </div>
        </div>

        {/* Total general */}
        <div className="rounded-2xl border border-emerald-700/30 bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 p-6 backdrop-blur-sm">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-emerald-400 mr-2" />
            Totales
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total reservas:</span>
              <span className="text-white font-semibold">
                {validBookings.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ingresos totales:</span>
              <span className="text-white font-semibold">
                {formatChileanPesos(metrics.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Promedio por reserva:</span>
              <span className="text-white font-semibold">
                {validBookings.length > 0
                  ? formatChileanPesos(
                      metrics.totalRevenue / validBookings.length
                    )
                  : formatChileanPesos(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights rápidos para barbería */}
      <div className="rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 backdrop-blur-sm">
        <h4 className="text-lg font-semibold text-white mb-4">
          💡 Insights Rápidos
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-300 font-medium">🎯 Rendimiento Hoy</p>
            <p className="text-gray-300 text-sm mt-1">
              {metrics.todayBookings > 0
                ? `Tienes ${metrics.todayBookings} reservas programadas para hoy`
                : "No hay reservas para hoy - día libre o promociona servicios"}
            </p>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <p className="text-green-300 font-medium">💰 Ingresos</p>
            <p className="text-gray-300 text-sm mt-1">
              {metrics.todayRevenue > 0
                ? `Has generado ${formatChileanPesos(metrics.todayRevenue)} hoy`
                : "Aún no hay ingresos registrados para hoy"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
