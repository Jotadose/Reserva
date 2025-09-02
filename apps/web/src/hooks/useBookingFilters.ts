import { useState, useMemo } from "react";
import { Booking } from "../types/booking";

export interface BookingFilters {
  searchQuery: string;
  dateRange: {
    start: string;
    end: string;
  } | null;
  status: string[];
  services: string[];
  priceRange: {
    min: number;
    max: number;
  } | null;
}

export interface UseBookingFiltersReturn {
  filters: BookingFilters;
  filteredBookings: Booking[];
  setSearchQuery: (query: string) => void;
  setDateRange: (range: BookingFilters["dateRange"]) => void;
  setStatusFilter: (status: string[]) => void;
  setServiceFilter: (services: string[]) => void;
  setPriceRange: (range: BookingFilters["priceRange"]) => void;
  clearFilters: () => void;
  getFilterStats: () => {
    total: number;
    filtered: number;
    percentage: number;
  };
}

const initialFilters: BookingFilters = {
  searchQuery: "",
  dateRange: null,
  status: [],
  services: [],
  priceRange: null,
};

export const useBookingFilters = (bookings: Booking[]): UseBookingFiltersReturn => {
  const [filters, setFilters] = useState<BookingFilters>(initialFilters);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Búsqueda por texto
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesSearch =
          booking.client.name.toLowerCase().includes(searchLower) ||
          booking.client.phone.includes(filters.searchQuery) ||
          booking.client.email.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filtro por rango de fechas
      if (filters.dateRange) {
        const bookingDate = new Date(booking.date).getTime();
        const startDate = new Date(filters.dateRange.start).getTime();
        const endDate = new Date(filters.dateRange.end).getTime();

        if (bookingDate < startDate || bookingDate > endDate) {
          return false;
        }
      }

      // Filtro por estado (futuro - por ahora solo confirmadas)
      if (filters.status.length > 0) {
        // Por ahora todas las reservas son "confirmed"
        if (!filters.status.includes("confirmed")) {
          return false;
        }
      }

      // Filtro por servicios
      if (filters.services.length > 0) {
        const bookingServices = booking.services?.map((s) => s.name) || [];
        const hasMatchingService = filters.services.some((filterService) =>
          bookingServices.includes(filterService),
        );

        if (!hasMatchingService) return false;
      }

      // Filtro por rango de precios
      if (filters.priceRange) {
        const total = booking.services?.reduce((sum, s) => sum + s.price, 0) || 0;
        if (total < filters.priceRange.min || total > filters.priceRange.max) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, filters]);

  const setSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const setDateRange = (range: BookingFilters["dateRange"]) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  };

  const setStatusFilter = (status: string[]) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const setServiceFilter = (services: string[]) => {
    setFilters((prev) => ({ ...prev, services }));
  };

  const setPriceRange = (range: BookingFilters["priceRange"]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const getFilterStats = () => {
    const total = bookings.length;
    const filtered = filteredBookings.length;
    const percentage = total > 0 ? (filtered / total) * 100 : 0;

    return { total, filtered, percentage };
  };

  return {
    filters,
    filteredBookings,
    setSearchQuery,
    setDateRange,
    setStatusFilter,
    setServiceFilter,
    setPriceRange,
    clearFilters,
    getFilterStats,
  };
};
