/**
 * =============================================================================
 * HOOKS PARA ESTRUCTURA NORMALIZADA DE SUPABASE
 * =============================================================================
 * Hooks React Query para interactuar con la nueva estructura de base de datos
 * Incluye manejo de estados, caché optimizado y actualizaciones en tiempo real
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  bookingsService,
  clientsService,
  servicesService,
  specialistsService,
  availabilityService,
  waitingListService,
  supabaseNormalized,
} from "../lib/supabaseNormalized";
import type {
  BookingWithRelations,
  CreateBookingData,
  Database,
} from "../lib/database.types";

// =============================================================================
// TIPOS PARA LOS HOOKS
// =============================================================================

type bookings_newtatus =
  Database["public"]["Tables"]["bookings_new"]["Row"]["status"];

// =============================================================================
// HOOKS PARA SERVICIOS
// =============================================================================

export function useServices() {
  return useQuery({
    queryKey: ["services", "active"],
    queryFn: () => servicesService.getActive(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => servicesService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useServicesByCategory(category: string) {
  return useQuery({
    queryKey: ["services", "category", category],
    queryFn: () => servicesService.getByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// HOOKS PARA CLIENTES
// =============================================================================

export function useClients() {
  return useQuery({
    queryKey: ["clients", "all"],
    queryFn: () => clientsService.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => clientsService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useClientByEmail(email: string) {
  return useQuery({
    queryKey: ["clients", "email", email],
    queryFn: () => clientsService.getByEmail(email),
    enabled: !!email,
    staleTime: 2 * 60 * 1000,
  });
}

export function useClientSearch(query: string) {
  return useQuery({
    queryKey: ["clients", "search", query],
    queryFn: () => clientsService.search(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      client: Database["public"]["Tables"]["clients_new"]["Insert"]
    ) => clientsService.create(client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["clients_new"]["Update"];
    }) => clientsService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.setQueryData(["clients", data.id], data);
    },
  });
}

// =============================================================================
// HOOKS PARA ESPECIALISTAS
// =============================================================================

export function useSpecialists() {
  return useQuery({
    queryKey: ["specialists", "active"],
    queryFn: () => specialistsService.getActive(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSpecialist(id: string) {
  return useQuery({
    queryKey: ["specialists", id],
    queryFn: () => specialistsService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSpecialistsByService(serviceId: string) {
  return useQuery({
    queryKey: ["specialists", "service", serviceId],
    queryFn: () => specialistsService.getByService(serviceId),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// HOOKS PARA RESERVAS
// =============================================================================

export function usebookings_new() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["bookings_new", "all"],
    queryFn: () => bookingsService.getAll(),
    staleTime: 30 * 1000, // 30 segundos
    retry: 2,
  });

  // Suscripción en tiempo real
  useEffect(() => {
    const channel = supabaseNormalized
      .channel("bookings_new_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings_new",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["bookings_new"] });
        }
      )
      .subscribe();

    return () => {
      supabaseNormalized.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function usebookings_newByDate(date: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["bookings_new", "date", date],
    queryFn: () => bookingsService.getByDate(date),
    enabled: !!date,
    staleTime: 30 * 1000,
  });

  // Suscripción específica para la fecha
  useEffect(() => {
    if (!date) return;

    const channel = supabaseNormalized
      .channel(`bookings_new_date_${date}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings_new",
          filter: `scheduled_date=eq.${date}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["bookings_new", "date", date],
          });
        }
      )
      .subscribe();

    return () => {
      supabaseNormalized.removeChannel(channel);
    };
  }, [date, queryClient]);

  return query;
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["bookings_new", id],
    queryFn: () => bookingsService.getById(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (booking: CreateBookingData) => bookingsService.create(booking),
    onSuccess: (data) => {
      // Invalidar todas las queries de bookings_new
      queryClient.invalidateQueries({ queryKey: ["bookings_new"] });
      // Actualizar el cliente para refrescar sus métricas
      queryClient.invalidateQueries({ queryKey: ["clients", data.client.id] });
      // Invalidar disponibilidad para la fecha
      queryClient.invalidateQueries({
        queryKey: ["availability", data.scheduled_date],
      });
    },
  });
}

export function useUpdatebookings_newtatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: bookings_newtatus }) =>
      bookingsService.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings_new"] });
      queryClient.setQueryData(["bookings_new", data.id], data);

      // Si se completó, actualizar métricas del cliente
      if (data.status === "completed") {
        queryClient.invalidateQueries({
          queryKey: ["clients", data.client_id],
        });
      }
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingsService.cancel(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings_new"] });
      queryClient.setQueryData(["bookings_new", data.id], data);
      // Liberar el slot en disponibilidad
      queryClient.invalidateQueries({
        queryKey: ["availability", data.scheduled_date],
      });
    },
  });
}

// =============================================================================
// HOOKS PARA DISPONIBILIDAD
// =============================================================================

export function useAvailability(
  date: string,
  specialistId?: string,
  duration = 60
) {
  return useQuery({
    queryKey: ["availability", date, specialistId, duration],
    queryFn: () =>
      availabilityService.getAvailableSlots(date, specialistId, duration),
    enabled: !!date,
    staleTime: 1 * 60 * 1000, // 1 minuto
    retry: 2,
  });
}

// =============================================================================
// HOOKS PARA LISTA DE ESPERA
// =============================================================================

export function useWaitingList() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["waitingList", "active"],
    queryFn: () => waitingListService.getActive(),
    staleTime: 1 * 60 * 1000,
  });

  // Suscripción en tiempo real
  useEffect(() => {
    const channel = supabaseNormalized
      .channel("waiting_list_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "waiting_list",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["waitingList"] });
        }
      )
      .subscribe();

    return () => {
      supabaseNormalized.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useAddToWaitingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Database["public"]["Tables"]["waiting_list"]["Insert"]
    ) => waitingListService.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitingList"] });
    },
  });
}

export function useUpdateWaitingListStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Database["public"]["Tables"]["waiting_list"]["Row"]["status"];
    }) => waitingListService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitingList"] });
    },
  });
}

// =============================================================================
// HOOKS COMBINADOS Y ESTADÍSTICAS
// =============================================================================

export function useDashboardStats(date?: string) {
  const currentDate = date || new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["dashboard", "stats", currentDate],
    queryFn: async () => {
      // Obtener reservas de hoy
      const todaybookings_new = await bookingsService.getByDate(currentDate);

      // Calcular estadísticas
      const today = {
        bookings_new: todaybookings_new.length,
        revenue: todaybookings_new
          .filter((b) => b.status === "completed")
          .reduce((sum, b) => sum + b.total, 0),
        completed: todaybookings_new.filter((b) => b.status === "completed")
          .length,
        cancelled: todaybookings_new.filter((b) => b.status === "cancelled")
          .length,
      };

      return {
        today,
        thisWeek: { bookings_new: 0, revenue: 0, newClients: 0 },
        thisMonth: { bookings_new: 0, revenue: 0, avgRating: 0 },
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });
}

export function useRealtimebookings_new(date?: string) {
  const queryClient = useQueryClient();
  const currentDate = date || new Date().toISOString().split("T")[0];

  useEffect(() => {
    const channel = supabaseNormalized
      .channel(`realtime_bookings_new_${currentDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings_new",
        },
        (payload) => {
          console.log("Booking change detected:", payload);
          queryClient.invalidateQueries({ queryKey: ["bookings_new"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        }
      )
      .subscribe();

    return () => {
      supabaseNormalized.removeChannel(channel);
    };
  }, [currentDate, queryClient]);
}

// =============================================================================
// HOOKS DE UTILIDAD
// =============================================================================

export function useOptimisticBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (booking: CreateBookingData) => bookingsService.create(booking),
    onMutate: async (newBooking) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ["bookings_new"] });

      // Obtener snapshot del estado actual
      const previousbookings_new = queryClient.getQueryData<
        BookingWithRelations[]
      >(["bookings_new", "all"]);

      // Crear booking optimista
      const optimisticBooking: BookingWithRelations = {
        id: `temp-${Date.now()}`,
        client_id: newBooking.client_id,
        client: {} as any, // Se llenará cuando llegue la respuesta real
        scheduled_date: newBooking.scheduled_date,
        scheduled_time: newBooking.scheduled_time,
        status: "pending",
        services: [],
        estimated_duration: newBooking.services.reduce(
          (sum, s) => sum + s.duration,
          0
        ),
        subtotal: newBooking.services.reduce((sum, s) => sum + s.price, 0),
        total: newBooking.services.reduce((sum, s) => sum + s.price, 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as BookingWithRelations;

      // Actualizar optimísticamente
      if (previousbookings_new) {
        queryClient.setQueryData(
          ["bookings_new", "all"],
          [...previousbookings_new, optimisticBooking]
        );
      }

      return { previousbookings_new };
    },
    onError: (err, newBooking, context) => {
      // Revertir en caso de error
      if (context?.previousbookings_new) {
        queryClient.setQueryData(
          ["bookings_new", "all"],
          context.previousbookings_new
        );
      }
    },
    onSettled: () => {
      // Refrescar después de la operación
      queryClient.invalidateQueries({ queryKey: ["bookings_new"] });
    },
  });
}

// =============================================================================
// HOOK PRINCIPAL COMBINADO
// =============================================================================

export function useSupabaseNormalized() {
  const bookings_newQuery = usebookings_new();
  const servicesQuery = useServices();
  const createBooking = useCreateBooking();
  const updatebookings_newtatus = useUpdatebookings_newtatus();
  const cancelBooking = useCancelBooking();
  const clientsQuery = useClients();
  const createClient = useCreateClient();
  const specialistsQuery = useSpecialists();

  return {
    // Datos
    bookings_new: bookings_newQuery.data || [],
    services: servicesQuery.data || [],
    clients: clientsQuery.data || [],
    specialists: specialistsQuery.data || [],

    // Estados de carga
    isLoading: bookings_newQuery.isLoading || servicesQuery.isLoading,
    isError: bookings_newQuery.isError || servicesQuery.isError,

    // Acciones
    createBooking,
    updatebookings_newtatus,
    cancelBooking,
    createClient,

    // Queries individuales para refetch
    refetchbookings_new: bookings_newQuery.refetch,
    refetchServices: servicesQuery.refetch,
  };
}

// =============================================================================
// EXPORTACIONES
// =============================================================================

export default {
  // Servicios
  useServices,
  useService,
  useServicesByCategory,

  // Clientes
  useClients,
  useClient,
  useClientByEmail,
  useClientSearch,
  useCreateClient,
  useUpdateClient,

  // Especialistas
  useSpecialists,
  useSpecialist,
  useSpecialistsByService,

  // Reservas
  usebookings_new,
  usebookings_newByDate,
  useBooking,
  useCreateBooking,
  useUpdatebookings_newtatus,
  useCancelBooking,
  useOptimisticBooking,

  // Disponibilidad
  useAvailability,

  // Lista de espera
  useWaitingList,
  useAddToWaitingList,
  useUpdateWaitingListStatus,

  // Dashboard y estadísticas
  useDashboardStats,
  useRealtimebookings_new,

  // Hook principal
  useSupabaseNormalized,
};
