import { useState, useEffect, useMemo } from "react";
import { Booking } from "../types/booking";

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  averageBookingValue: number;

  // Métricas por período
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;

  // Métricas de crecimiento
  revenueGrowth: number;
  bookingGrowth: number;

  // Distribución por servicios
  serviceDistribution: Array<{
    service: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;

  // Distribución por estado
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;

  // Tendencias por fecha
  dailyTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;

  // Horarios más populares
  timeSlotPopularity: Array<{
    hour: number;
    count: number;
    percentage: number;
  }>;

  // Métricas de clientes
  totalClients: number;
  newClients: number;
  returningClients: number;
  clientRetentionRate: number;

  // Métricas de rendimiento
  bookingConversionRate: number;
  averageBookingLeadTime: number;
  cancellationRate: number;
  noShowRate: number;
}

interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  services?: string[];
  statuses?: string[];
  clientType?: "all" | "new" | "returning";
}

export const useAnalytics = (bookings: Booking[], filters?: AnalyticsFilters) => {
  const [isLoading, setIsLoading] = useState(true);

  // Función auxiliar para filtrar por servicios
  const filterByServices = (booking: Booking, services: string[]) => {
    const lowerServices = services.map((s) => s.toLowerCase());
    return booking.services.some((service) => {
      const serviceName = service.name.toLowerCase();
      return lowerServices.some((filterService) => serviceName.includes(filterService));
    });
  };

  // Filtrar reservas según criterios
  const filteredBookings = useMemo(() => {
    if (!filters) return bookings;

    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);

      // Filtro por fecha
      if (bookingDate < startDate || bookingDate > endDate) {
        return false;
      }

      // Filtro por servicios
      if (filters.services && filters.services.length > 0) {
        if (!filterByServices(booking, filters.services)) {
          return false;
        }
      }

      // Filtro por estados
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(booking.status)) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, filters]);

  // Calcular analytics principales
  const analytics = useMemo((): AnalyticsData => {
    const totalBookings = filteredBookings.length;
    const completedBookings = filteredBookings.filter((b) => b.status === "completed").length;
    const cancelledBookings = filteredBookings.filter((b) => b.status === "cancelled").length;
    const pendingBookings = filteredBookings.filter((b) =>
      ["pending", "confirmed"].includes(b.status),
    ).length;

    // Calcular ingresos totales
    const totalRevenue = filteredBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, booking) => {
        return (
          sum + booking.services.reduce((serviceSum, service) => serviceSum + service.price, 0)
        );
      }, 0);

    const averageBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0;

    // Calcular ingresos por período
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const monthlyRevenue = filteredBookings
      .filter((b) => b.status === "completed" && new Date(b.date) >= startOfMonth)
      .reduce(
        (sum, booking) => sum + booking.services.reduce((s, service) => s + service.price, 0),
        0,
      );

    const weeklyRevenue = filteredBookings
      .filter((b) => b.status === "completed" && new Date(b.date) >= startOfWeek)
      .reduce(
        (sum, booking) => sum + booking.services.reduce((s, service) => s + service.price, 0),
        0,
      );

    const dailyRevenue = filteredBookings
      .filter((b) => b.status === "completed" && new Date(b.date) >= startOfDay)
      .reduce(
        (sum, booking) => sum + booking.services.reduce((s, service) => s + service.price, 0),
        0,
      );

    // Calcular crecimiento (mock - en producción compararía con período anterior)
    const revenueGrowth = Math.random() * 20 - 10; // Entre -10% y +10%
    const bookingGrowth = Math.random() * 30 - 15; // Entre -15% y +15%

    // Distribución por servicios
    const serviceMap = new Map<string, { count: number; revenue: number }>();
    filteredBookings.forEach((booking) => {
      booking.services.forEach((service) => {
        const current = serviceMap.get(service.name) || { count: 0, revenue: 0 };
        serviceMap.set(service.name, {
          count: current.count + 1,
          revenue:
            booking.status === "completed" ? current.revenue + service.price : current.revenue,
        });
      });
    });

    const serviceDistribution = Array.from(serviceMap.entries())
      .map(([service, data]) => ({
        service,
        count: data.count,
        revenue: data.revenue,
        percentage: totalBookings > 0 ? (data.count / totalBookings) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Distribución por estado
    const statusMap = new Map<string, number>();
    filteredBookings.forEach((booking) => {
      statusMap.set(booking.status, (statusMap.get(booking.status) || 0) + 1);
    });

    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0,
    }));

    // Tendencias diarias (últimos 30 días)
    const dailyTrends: Array<{ date: string; bookings: number; revenue: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayBookings = filteredBookings.filter((b) => b.date.startsWith(dateStr));

      const dayRevenue = dayBookings
        .filter((b) => b.status === "completed")
        .reduce(
          (sum, booking) => sum + booking.services.reduce((s, service) => s + service.price, 0),
          0,
        );

      dailyTrends.push({
        date: dateStr,
        bookings: dayBookings.length,
        revenue: dayRevenue,
      });
    }

    // Popularidad por horas
    const hourMap = new Map<number, number>();
    filteredBookings.forEach((booking) => {
      const hour = parseInt(booking.time.split(":")[0]);
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    const timeSlotPopularity = Array.from(hourMap.entries())
      .map(([hour, count]) => ({
        hour,
        count,
        percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Métricas de clientes (mock)
    const uniqueClients = new Set(filteredBookings.map((b) => b.clientInfo.email)).size;
    const totalClients = uniqueClients;
    const newClients = Math.floor(totalClients * 0.3); // 30% clientes nuevos
    const returningClients = totalClients - newClients;
    const clientRetentionRate = totalClients > 0 ? (returningClients / totalClients) * 100 : 0;

    // Métricas de rendimiento
    const bookingConversionRate = 85 + Math.random() * 10; // 85-95%
    const averageBookingLeadTime = 2 + Math.random() * 5; // 2-7 días
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
    const noShowRate = Math.random() * 5; // 0-5%

    return {
      totalBookings,
      totalRevenue,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      averageBookingValue,
      monthlyRevenue,
      weeklyRevenue,
      dailyRevenue,
      revenueGrowth,
      bookingGrowth,
      serviceDistribution,
      statusDistribution,
      dailyTrends,
      timeSlotPopularity,
      totalClients,
      newClients,
      returningClients,
      clientRetentionRate,
      bookingConversionRate,
      averageBookingLeadTime,
      cancellationRate,
      noShowRate,
    };
  }, [filteredBookings]);

  // Simular loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filteredBookings]);

  return {
    analytics,
    isLoading,
    filteredBookings,
  };
};
