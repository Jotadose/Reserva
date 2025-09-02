/**
 * =============================================================================
 * SUPABASE CLIENT CONFIGURATION
 * =============================================================================
 * Configuración del cliente Supabase con TypeScript
 * Incluye tipos, configuración de RLS y funciones helper
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Importar tipos específicos
export type {
  Gender,
  ClientTier,
  ClientStatus,
  BookingStatus,
  BookingServiceStatus,
  Priority,
  WaitingListStatus,
  PaymentMethodType,
  PaymentStatus,
  NotificationType,
  NotificationStatus,
  SpecialistScheduleTemplate,
  ClientPreferences,
  PaymentMethodConfig,
  GatewayResponse,
  Database,
} from "./database.types";

// =============================================================================
// CONFIGURACIÓN DEL CLIENTE
// =============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase. Asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Export supabaseClient as an alias for compatibility
export const supabaseClient = supabase;

// =============================================================================
// TIPOS DERIVADOS PARA LA APLICACIÓN
// =============================================================================

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

export type Specialist = Database["public"]["Tables"]["specialists"]["Row"];
export type SpecialistInsert =
  Database["public"]["Tables"]["specialists"]["Insert"];
export type SpecialistUpdate =
  Database["public"]["Tables"]["specialists"]["Update"];

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
export type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

export type BookingService =
  Database["public"]["Tables"]["booking_services"]["Row"];
export type BookingServiceInsert =
  Database["public"]["Tables"]["booking_services"]["Insert"];
export type BookingServiceUpdate =
  Database["public"]["Tables"]["booking_services"]["Update"];

export type WaitingListEntry =
  Database["public"]["Tables"]["waiting_list"]["Row"];
export type WaitingListInsert =
  Database["public"]["Tables"]["waiting_list"]["Insert"];
export type WaitingListUpdate =
  Database["public"]["Tables"]["waiting_list"]["Update"];

export type PaymentMethod =
  Database["public"]["Tables"]["payment_methods"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];

// =============================================================================
// TIPOS EXTENDIDOS PARA EL FRONTEND
// =============================================================================

// Booking con relaciones expandidas
export interface BookingWithRelations extends Booking {
  client: Client;
  specialist?: Specialist | null;
  services: (BookingService & { service: Service })[];
  payments?: Payment[];
}

// Cliente con estadísticas
export interface ClientWithStats extends Client {
  upcomingBookings: number;
  lastBookingDate?: string;
  favoriteServices: string[];
  averageRating?: number;
}

// Servicio con estadísticas
export interface ServiceWithStats extends Service {
  bookingCount: number;
  totalRevenue: number;
  averageRating?: number;
  popularityRank: number;
}

// =============================================================================
// FUNCIONES HELPER PARA QUERIES COMUNES
// =============================================================================

/**
 * Obtiene reservas con todas las relaciones
 */
export async function getBookingsWithRelations(filters?: {
  startDate?: string;
  endDate?: string;
  status?: string[];
  clientId?: string;
  specialistId?: string;
}) {
  let query = supabase
    .from("bookings")
    .select(
      `
      *,
      client:clients(*),
      specialist:specialists(*),
      services:booking_services(
        *,
        service:services(*)
      ),
      payments(*)
    `
    )
    .order("scheduled_datetime", { ascending: true });

  if (filters?.startDate) {
    query = query.gte("scheduled_date", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("scheduled_date", filters.endDate);
  }

  if (filters?.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  if (filters?.clientId) {
    query = query.eq("client_id", filters.clientId);
  }

  if (filters?.specialistId) {
    query = query.eq("specialist_id", filters.specialistId);
  }

  return query;
}

/**
 * Obtiene clientes con estadísticas
 */
export async function getClientsWithStats() {
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("total_spent", { ascending: false });

  if (error) throw error;

  // Obtener estadísticas adicionales para cada cliente
  const clientsWithStats = await Promise.all(
    clients.map(async (client) => {
      const { data: upcomingBookings } = await supabase
        .from("bookings")
        .select("count")
        .eq("client_id", client.id)
        .in("status", ["confirmed", "pending"])
        .gte("scheduled_date", new Date().toISOString().split("T")[0]);

      const { data: recentBookings } = await supabase
        .from("bookings")
        .select(
          `
          *,
          services:booking_services(
            service:services(name)
          )
        `
        )
        .eq("client_id", client.id)
        .eq("status", "completed")
        .order("scheduled_date", { ascending: false })
        .limit(5);

      const favoriteServices = recentBookings
        ?.flatMap(
          (booking) =>
            booking.services?.map((bs) => bs.service?.name).filter(Boolean) ||
            []
        )
        .reduce((acc: Record<string, number>, service) => {
          acc[service] = (acc[service] || 0) + 1;
          return acc;
        }, {});

      const topServices = Object.entries(favoriteServices || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([service]) => service);

      return {
        ...client,
        upcomingBookings: upcomingBookings?.[0]?.count || 0,
        lastBookingDate: recentBookings?.[0]?.scheduled_date,
        favoriteServices: topServices,
        averageRating:
          recentBookings
            ?.filter((b) => b.rating)
            .reduce((sum, b) => sum + (b.rating || 0), 0) /
          (recentBookings?.filter((b) => b.rating).length || 1),
      } as ClientWithStats;
    })
  );

  return clientsWithStats;
}

/**
 * Obtiene horarios disponibles
 */
export async function getAvailableSlots(
  date: string,
  duration: number = 60,
  specialistId?: string
) {
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_date: date,
    p_duration: duration,
    p_specialist_id: specialistId || null,
  });

  if (error) throw error;
  return data;
}

/**
 * Crea una nueva reserva completa
 */
export async function createBookingWithServices(
  bookingData: BookingInsert,
  services: { serviceId: string; price: number; duration: number }[]
) {
  // Iniciar transacción
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert(bookingData)
    .select()
    .single();

  if (bookingError) throw bookingError;

  // Insertar servicios
  const bookingServices = services.map((service, index) => ({
    booking_id: booking.id,
    service_id: service.serviceId,
    price: service.price,
    duration: service.duration,
    execution_order: index + 1,
  }));

  const { error: servicesError } = await supabase
    .from("booking_services")
    .insert(bookingServices);

  if (servicesError) {
    // Rollback: eliminar la reserva si falla la inserción de servicios
    await supabase.from("bookings").delete().eq("id", booking.id);
    throw servicesError;
  }

  return booking;
}

/**
 * Actualiza métricas de cliente
 */
export async function updateClientMetrics(clientId: string) {
  const { error } = await supabase.rpc("update_client_metrics", {
    p_client_id: clientId,
  });

  if (error) throw error;
}

/**
 * Suscripción en tiempo real a cambios de reservas
 */
export function subscribeToBookings(callback: (payload: any) => void) {
  return supabase
    .channel("bookings-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookings",
      },
      callback
    )
    .subscribe();
}

/**
 * Suscripción en tiempo real a cambios de lista de espera
 */
export function subscribeToWaitingList(callback: (payload: any) => void) {
  return supabase
    .channel("waiting-list-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "waiting_list",
      },
      callback
    )
    .subscribe();
}

// =============================================================================
// UTILIDADES DE TRANSFORMACIÓN
// =============================================================================

/**
 * Transforma datos de Supabase al formato esperado por el frontend
 */
export function transformBookingToFrontend(booking: BookingWithRelations) {
  return {
    id: booking.id,
    date: booking.scheduled_date,
    time: booking.scheduled_time,
    status: booking.status,
    duration: booking.estimated_duration,
    client: {
      name: booking.client.name,
      phone: booking.client.phone,
      email: booking.client.email,
      notes: booking.notes || "",
    },
    services: booking.services.map((bs) => ({
      id: bs.service.id,
      name: bs.service.name,
      price: bs.price,
      duration: bs.duration,
    })),
    total: booking.total,
    notes: booking.notes,
    rating: booking.rating,
    review: booking.review,
  };
}

/**
 * Transforma datos del frontend al formato de Supabase
 */
export function transformBookingFromFrontend(booking: any): BookingInsert {
  return {
    client_id: booking.clientId,
    specialist_id: booking.specialistId,
    scheduled_date: booking.date,
    scheduled_time: booking.time,
    estimated_duration: booking.duration,
    status: booking.status,
    subtotal: booking.subtotal || booking.total,
    taxes: booking.taxes || 0,
    discounts: booking.discounts || 0,
    total: booking.total,
    notes: booking.notes,
  };
}

export default supabase;
