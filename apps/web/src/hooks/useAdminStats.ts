// src/hooks/useAdminStats.ts
// QUÉ HACE: Abstrae toda la lógica compleja de cálculos de estadísticas
// BENEFICIO: Componentes más limpios, lógica reutilizable, fácil de probar

import { useMemo } from "react";
import { Booking } from "../types/booking";

interface MonthlyStats {
  bookings: number;
  revenue: number;
  completed: number;
  completionRate: number;
}

interface AdminStats {
  monthlyStats: MonthlyStats;
  upcomingBookings: Booking[];
  todayBookings: Booking[];
  recentBookings: Booking[];
  topServices: { serviceName: string; count: number; revenue: number }[];
}

export const useAdminStats = (bookings: Booking[]): AdminStats => {
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });

    const completed = monthlyBookings.filter((b) => b.status === "completed").length;
    const revenue = monthlyBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, booking) => sum + booking.totalPrice, 0);

    return {
      bookings: monthlyBookings.length,
      revenue,
      completed,
      completionRate: monthlyBookings.length > 0 ? (completed / monthlyBookings.length) * 100 : 0,
    };
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((booking) => {
        const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
        return bookingDateTime > now && booking.status === "confirmed";
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 10); // Solo los próximos 10
  }, [bookings]);

  const todayBookings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return bookings
      .filter((booking) => booking.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20); // Los últimos 20 creados
  }, [bookings]);

  const topServices = useMemo(() => {
    const serviceStats = new Map<string, { count: number; revenue: number }>();

    bookings.forEach((booking) => {
      booking.services.forEach((service) => {
        const current = serviceStats.get(service.name) || {
          count: 0,
          revenue: 0,
        };
        serviceStats.set(service.name, {
          count: current.count + 1,
          revenue: current.revenue + service.price,
        });
      });
    });

    return Array.from(serviceStats.entries())
      .map(([serviceName, stats]) => ({
        serviceName,
        ...stats,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 servicios
  }, [bookings]);

  return {
    monthlyStats,
    upcomingBookings,
    todayBookings,
    recentBookings,
    topServices,
  };
};
