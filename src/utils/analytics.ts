import { Booking } from "../types/booking";

export interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  bookingsByDay: { [key: string]: number };
  bookingsByService: { [key: string]: number };
  revenueByService: { [key: string]: number };
  hourlyDistribution: { [key: string]: number };
  monthlyGrowth: number;
  weeklyGrowth: number;
  popularServices: Array<{ name: string; count: number; revenue: number }>;
  peakHours: Array<{ hour: string; count: number }>;
  busyDays: Array<{ day: string; count: number }>;
}

export const calculateAnalytics = (bookings: Booking[]): AnalyticsData => {
  // Filtrar bookings válidos para evitar errores
  const validBookings = bookings.filter(
    (booking) =>
      booking &&
      typeof booking === "object" &&
      booking.date &&
      booking.time &&
      Array.isArray(booking.services),
  );

  const totalBookings = validBookings.length;
  const totalRevenue = validBookings.reduce((sum, booking) => {
    return (
      sum +
      (booking.services?.reduce((serviceSum, service) => {
        return serviceSum + (typeof service?.price === "number" ? service.price : 0);
      }, 0) || 0)
    );
  }, 0);

  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Reservas por día
  const bookingsByDay: { [key: string]: number } = {};
  const hourlyDistribution: { [key: string]: number } = {};
  const serviceStats: { [key: string]: { count: number; revenue: number } } = {};

  validBookings.forEach((booking) => {
    // Validar que booking y sus propiedades existen
    if (!booking || !booking.date || !booking.time) return;

    // Por día
    try {
      const day = new Date(booking.date).toLocaleDateString("es-ES", { weekday: "long" });
      bookingsByDay[day] = (bookingsByDay[day] || 0) + 1;
    } catch (error) {
      console.warn("Error parsing date for booking:", booking.date);
    }

    // Por hora
    if (booking.time) {
      const hour = booking.time.split(":")[0] + ":00";
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
    }

    // Por servicio - validar que services existe y es un array
    if (booking.services && Array.isArray(booking.services)) {
      booking.services.forEach((service) => {
        // Validar que service y service.name existen
        if (service && service.name && typeof service.price === "number") {
          if (!serviceStats[service.name]) {
            serviceStats[service.name] = { count: 0, revenue: 0 };
          }
          serviceStats[service.name].count += 1;
          serviceStats[service.name].revenue += service.price;
        }
      });
    }
  });

  // Servicios populares
  const popularServices = Object.entries(serviceStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count);

  // Horas pico
  const peakHours = Object.entries(hourlyDistribution)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count);

  // Días ocupados
  const busyDays = Object.entries(bookingsByDay)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.count - a.count);

  // Crecimiento (simplificado - necesitaría fechas más detalladas para ser preciso)
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thisWeekBookings = validBookings.filter((b) => new Date(b.date) >= oneWeekAgo).length;
  const thisMonthBookings = validBookings.filter((b) => new Date(b.date) >= oneMonthAgo).length;

  const weeklyGrowth = totalBookings > 0 ? (thisWeekBookings / totalBookings) * 100 : 0;
  const monthlyGrowth = totalBookings > 0 ? (thisMonthBookings / totalBookings) * 100 : 0;

  return {
    totalBookings,
    totalRevenue,
    averageBookingValue,
    bookingsByDay,
    bookingsByService: Object.fromEntries(
      Object.entries(serviceStats).map(([name, stats]) => [name, stats.count]),
    ),
    revenueByService: Object.fromEntries(
      Object.entries(serviceStats).map(([name, stats]) => [name, stats.revenue]),
    ),
    hourlyDistribution,
    monthlyGrowth,
    weeklyGrowth,
    popularServices,
    peakHours,
    busyDays,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
