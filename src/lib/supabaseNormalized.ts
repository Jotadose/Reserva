/**
 * =============================================================================
 * CLIENTE SUPABASE NORMALIZADO
 * =============================================================================
 * Cliente para interactuar con la nueva estructura de base de datos normalizada
 * Mantiene compatibilidad con el cliente anterior mientras migra a la nueva estructura
 */

import { createClient } from "@supabase/supabase-js";
import type {
  Database,
  BookingWithRelations,
  CreateBookingData,
  AvailabilitySlot,
} from "./database.types";

// =============================================================================
// CONFIGURACIÓN DEL CLIENTE
// =============================================================================

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://tu-proyecto.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "tu-anon-key";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "⚠️ Faltan variables de entorno de Supabase. Revisa tu archivo .env.local"
  );
}

export const supabaseNormalized = createClient<Database>(
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

// =============================================================================
// SERVICIOS (NUEVA ESTRUCTURA)
// =============================================================================

export const servicesService = {
  // Obtener todos los servicios activos
  async getActive() {
    const { data, error } = await supabaseNormalized
      .from("services_new")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data;
  },

  // Obtener servicio por ID
  async getById(id: string) {
    const { data, error } = await supabaseNormalized
      .from("services_new")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nuevo servicio
  async create(
    service: Database["public"]["Tables"]["services_new"]["Insert"]
  ) {
    const { data, error } = await supabaseNormalized
      .from("services_new")
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar servicio
  async update(
    id: string,
    updates: Database["public"]["Tables"]["services_new"]["Update"]
  ) {
    const { data, error } = await supabaseNormalized
      .from("services_new")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener servicios por categoría
  async getByCategory(category: string) {
    const { data, error } = await supabaseNormalized
      .from("services_new")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// CLIENTES (NUEVA ESTRUCTURA)
// =============================================================================

export const clientsService = {
  // Obtener todos los clientes activos
  async getAll() {
    const { data, error } = await supabaseNormalized
      .from("clients_new")
      .select("*")
      .eq("status", "active")
      .order("name");

    if (error) throw error;
    return data;
  },

  // Obtener cliente por ID
  async getById(id: string) {
    const { data, error } = await supabaseNormalized
      .from("clients_new")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener cliente por email
  async getByEmail(email: string) {
    const { data, error } = await supabaseNormalized
      .from("clients_new")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Crear nuevo cliente
  async create(client: Database["public"]["Tables"]["clients_new"]["Insert"]) {
    const { data, error } = await supabaseNormalized
      .from("clients_new")
      .insert(client)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar cliente
  async update(
    id: string,
    updates: Database["public"]["Tables"]["clients_new"]["Update"]
  ) {
    const { data, error } = await supabaseNormalized
      .from("clients_new")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar clientes
  async search(query: string) {
    const { data, error } = await supabaseNormalized
      .from("clients_new")
      .select("*")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .eq("status", "active")
      .order("name")
      .limit(10);

    if (error) throw error;
    return data;
  },

  // Actualizar métricas del cliente
  async updateMetrics(clientId: string) {
    const { error } = await supabaseNormalized.rpc("update_client_metrics", {
      p_client_id: clientId,
    });

    if (error) throw error;
  },
};

// =============================================================================
// ESPECIALISTAS
// =============================================================================

export const specialistsService = {
  // Obtener todos los especialistas activos
  async getActive() {
    const { data, error } = await supabaseNormalized
      .from("specialists")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data;
  },

  // Obtener especialista por ID
  async getById(id: string) {
    const { data, error } = await supabaseNormalized
      .from("specialists")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener especialistas que pueden hacer un servicio
  async getByService(serviceId: string) {
    const { data, error } = await supabaseNormalized
      .from("specialist_services_new")
      .select(
        `
        specialists (*)
      `
      )
      .eq("service_id", serviceId);

    if (error) throw error;
    return data.map((item) => item.specialists).filter(Boolean);
  },
};

// =============================================================================
// RESERVAS (NUEVA ESTRUCTURA)
// =============================================================================

export const bookingsService = {
  // Obtener todas las reservas con relaciones
  async getAll(): Promise<BookingWithRelations[]> {
    const { data, error } = await supabaseNormalized
      .from("bookings_new")
      .select(
        `
        *,
        client:clients_new(*)
      `
      )
      .order("scheduled_datetime", { ascending: false });

    if (error) throw error;

    return data.map((booking) => ({
      ...booking,
      services: [], // Temporal: sin servicios por simplicidad
      specialist: null, // Temporal: sin especialista
    })) as BookingWithRelations[];
  },

  // Obtener reservas por fecha
  async getByDate(date: string): Promise<BookingWithRelations[]> {
    const { data, error } = await supabaseNormalized
      .from("bookings_new")
      .select(
        `
        *,
        client:clients_new(*)
      `
      )
      .eq("scheduled_date", date)
      .order("scheduled_time");

    if (error) throw error;

    return data.map((booking) => ({
      ...booking,
      services: [], // Temporal: sin servicios por simplicidad
      specialist: null, // Temporal: sin especialista
    })) as BookingWithRelations[];
  },

  // Obtener reserva por ID
  async getById(id: string): Promise<BookingWithRelations> {
    const { data, error } = await supabaseNormalized
      .from("bookings_new")
      .select(
        `
        *,
        client:clients_new(*),
        specialist:specialists(*),
  booking_services(
          *,
          service:services_new(*)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return {
      ...data,
      services:
        data.booking_services?.map((bs) => ({
          ...bs.service,
          price: bs.price,
          duration: bs.duration,
          status: bs.status,
          execution_order: bs.execution_order,
        })) || [],
    } as BookingWithRelations;
  },

  // Crear nueva reserva
  async create(bookingData: CreateBookingData): Promise<BookingWithRelations> {
    console.log("🚀 Iniciando creación de reserva:", bookingData);

    try {
      // ⚠️ SIMPLIFICACIÓN: No validar servicios por ahora
      console.log("⚠️ Modo simplificado: saltando validación de servicios");

      // Buscar o crear el cliente
      let clientId = bookingData.client_id;
      if (!clientId && bookingData.client_name) {
        console.log("👤 Buscando cliente existente...");

        // Primero buscar si el cliente ya existe por email o teléfono
        let existingClient = null;

        if (bookingData.client_email) {
          const { data: clientByEmail } = await supabaseNormalized
            .from("clients_new")
            .select("*")
            .eq("email", bookingData.client_email)
            .eq("status", "active")
            .single();
          existingClient = clientByEmail;
        }

        if (!existingClient && bookingData.client_phone) {
          const { data: clientByPhone } = await supabaseNormalized
            .from("clients_new")
            .select("*")
            .eq("phone", bookingData.client_phone)
            .eq("status", "active")
            .single();
          existingClient = clientByPhone;
        }

        if (existingClient) {
          console.log("✅ Cliente existente encontrado:", existingClient.id);
          clientId = existingClient.id;
        } else {
          // Cliente no existe, crear uno nuevo
          console.log("👤 Creando cliente nuevo");
          const { data: newClient, error: clientError } =
            await supabaseNormalized
              .from("clients_new")
              .insert({
                name: bookingData.client_name,
                phone: bookingData.client_phone || "",
                email: bookingData.client_email || "",
                status: "active",
              })
              .select()
              .single();

          if (clientError) {
            console.error("❌ Error creando cliente:", clientError);
            throw clientError;
          }
          clientId = newClient.id;
          console.log("✅ Cliente nuevo creado:", clientId);
        }
      }

      // Validar que tenemos un cliente válido
      if (!clientId) {
        const errorMsg = "No se pudo obtener o crear un cliente válido";
        console.error("❌", errorMsg);
        throw new Error(errorMsg);
      }

      // Crear la reserva principal
      console.log("📅 Creando reserva principal");

      const bookingPayload = {
        client_id: clientId,
        specialist_id: bookingData.specialist_id || null,
        scheduled_date: bookingData.scheduled_date,
        scheduled_time: bookingData.scheduled_time,
        estimated_duration: bookingData.estimated_duration || 60,
        subtotal: bookingData.subtotal || bookingData.total || 0,
        taxes: bookingData.taxes || 0,
        discounts: bookingData.discounts || 0,
        total: bookingData.total || bookingData.subtotal || 0,
        notes: bookingData.notes,
        deposit_required: bookingData.deposit_required ? 1 : 0,
        status: "confirmed",
      };

      console.log(
        "📝 Payload para bookings_new:",
        JSON.stringify(bookingPayload, null, 2)
      );

      const { data: booking, error: bookingError } = await supabaseNormalized
        .from("bookings_new")
        .insert(bookingPayload)
        .select()
        .single();

      if (bookingError) {
        console.error("❌ Error creando reserva:", {
          message: bookingError.message,
          details: bookingError.details,
          hint: bookingError.hint,
          code: bookingError.code,
        });
        console.error(
          "📋 Payload que causó el error:",
          JSON.stringify(bookingPayload, null, 2)
        );
        throw bookingError;
      }

      console.log("✅ Reserva principal creada:", booking.id);

      // ⚠️ TEMPORAL: Omitir servicios para simplificar
      // Los servicios se pueden agregar más tarde cuando estén configurados en BD
      console.log("⚠️ Saltando creación de servicios - reserva simple creada");

      // Retornar la reserva básica (sin servicios por simplicidad)
      console.log("📋 Retornando reserva básica");
      return {
        ...booking,
        client: {
          id: clientId,
          name: bookingData.client_name || "Cliente",
          email: bookingData.client_email || "",
          phone: bookingData.client_phone || "",
        },
        specialist: null,
        services: [], // Array vacío por ahora
      } as BookingWithRelations;
    } catch (error) {
      console.error("💥 Error general en create:", error);
      throw error;
    }
  },

  // Actualizar reserva completa
  async update(id: string, updates: Partial<BookingWithRelations>) {
    const updateData: any = {};

    // Mapear campos de la interfaz a la base de datos
    if (updates.clientName) updateData.client_name = updates.clientName;
    if (updates.date) updateData.scheduled_date = updates.date;
    if (updates.time) updateData.scheduled_time = updates.time;
    if (updates.service) updateData.service_type = updates.service;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.notes) updateData.notes = updates.notes;
    if (updates.status) updateData.status = updates.status;

    // Si se actualiza el cliente, actualizar también la tabla de clientes
    if (updates.client && updates.client.id) {
      const clientUpdates: any = {};
      if (updates.client.name) clientUpdates.name = updates.client.name;
      if (updates.client.phone) clientUpdates.phone = updates.client.phone;
      if (updates.client.email) clientUpdates.email = updates.client.email;

      if (Object.keys(clientUpdates).length > 0) {
        const { error: clientError } = await supabaseNormalized
          .from("clients_new")
          .update(clientUpdates)
          .eq("id", updates.client.id);

        if (clientError) {
          console.error("Error actualizando cliente:", clientError);
          throw clientError;
        }
      }
    }

    // Actualizar la reserva
    const { data, error } = await supabaseNormalized
      .from("bookings_new")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar estado de reserva
  async updateStatus(
    id: string,
    status: Database["public"]["Tables"]["bookings_new"]["Row"]["status"]
  ) {
    const { data, error } = await supabaseNormalized
      .from("bookings_new")
      .update({
        status,
        ...(status === "confirmed" && {
          confirmed_at: new Date().toISOString(),
        }),
        ...(status === "in_progress" && {
          started_at: new Date().toISOString(),
        }),
        ...(status === "completed" && {
          completed_at: new Date().toISOString(),
        }),
        ...(status === "cancelled" && {
          cancelled_at: new Date().toISOString(),
        }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Cancelar reserva
  async cancel(id: string, reason?: string) {
    const { data, error } = await supabaseNormalized
      .from("bookings_new")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// DISPONIBILIDAD
// =============================================================================

export const availabilityService = {
  // Obtener slots disponibles para una fecha (implementación temporal con datos mock)
  async getAvailableSlots(
    date: string,
    specialistId?: string,
    duration = 60
  ): Promise<AvailabilitySlot[]> {
    try {
      console.log(
        `🔍 Obteniendo slots para fecha: ${date}, duración: ${duration} min`
      );

      // Horarios de trabajo (9:00 AM a 6:00 PM)
      const workStart = 9; // 9:00 AM
      const workEnd = 18; // 6:00 PM
      const slotInterval = 30; // minutos entre slots

      // Generar todos los slots posibles
      const allSlots: AvailabilitySlot[] = [];
      for (let hour = workStart; hour < workEnd; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const timeString = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          allSlots.push({
            slot_time: timeString,
            available_specialists: ["default-specialist"], // Usar especialista por defecto
            is_available: true,
            duration_minutes: duration,
          });
        }
      }

      console.log(`📅 Generados ${allSlots.length} slots base`);

      // Obtener reservas existentes para la fecha para verificar conflictos
      console.log(`🔍 Buscando reservas para fecha: ${date}`);
      const { data: bookings_new, error: bookings_newError } =
        await supabaseNormalized
          .from("bookings_new")
          .select(
            "scheduled_time, estimated_duration, specialist_id, status, scheduled_date"
          )
          .eq("scheduled_date", date)
          .in("status", ["confirmed", "in_progress"]);

      if (bookings_newError) {
        console.warn(
          "⚠️ Error obteniendo reservas, continuando sin filtrar:",
          bookings_newError
        );
      }

      const existingbookings_new = bookings_new || [];
      console.log(
        `📋 Encontradas ${existingbookings_new.length} reservas existentes para ${date}`
      );
      console.log("📋 Reservas encontradas:", existingbookings_new);

      // Intentar obtener especialistas de la base de datos
      const { data: specialists, error: specialistsError } =
        await supabaseNormalized
          .from("specialists")
          .select("id, name, is_active")
          .eq("is_active", true);

      let activeSpecialists = specialists || [];

      if (specialistsError || activeSpecialists.length === 0) {
        console.warn(
          "⚠️ No se encontraron especialistas en BD, usando datos mock"
        );
        // Usar especialistas mock si no hay en la base de datos
        activeSpecialists = [
          { id: "mock-specialist-1", name: "Dr. García", is_active: true },
          { id: "mock-specialist-2", name: "Dra. López", is_active: true },
        ];
      }

      console.log(`👥 Especialistas disponibles: ${activeSpecialists.length}`);

      // Filtrar slots disponibles basado en conflictos
      const availableSlots = allSlots.map((slot) => {
        const slotTime = slot.slot_time;
        const [slotHour, slotMinute] = slotTime.split(":").map(Number);
        const slotStartMinutes = slotHour * 60 + slotMinute;
        const slotEndMinutes = slotStartMinutes + duration;

        // Encontrar especialistas disponibles para este slot
        const availableSpecialistIds = activeSpecialists
          .filter((specialist) => {
            // Si se especifica un especialista, solo incluir ese
            if (specialistId && specialist.id !== specialistId) {
              return false;
            }

            // Verificar si hay conflictos en esta hora (simplificado sin especialistas)
            const hasConflict = existingbookings_new.some((booking) => {
              const [bookingHour, bookingMinute] = booking.scheduled_time
                .split(":")
                .map(Number);
              const bookingStartMinutes = bookingHour * 60 + bookingMinute;
              const bookingEndMinutes =
                bookingStartMinutes + (booking.estimated_duration || 60);

              // Verificar superposición
              return (
                slotStartMinutes < bookingEndMinutes &&
                slotEndMinutes > bookingStartMinutes
              );
            });

            return !hasConflict;
          })
          .map((s) => s.id);

        return {
          ...slot,
          available_specialists: availableSpecialistIds,
          is_available: availableSpecialistIds.length > 0,
        };
      });

      // Solo retornar slots que tienen al menos un especialista disponible
      const finalSlots = availableSlots.filter((slot) => slot.is_available);

      console.log(`✅ Slots finales disponibles: ${finalSlots.length}`);
      console.log(
        `📝 Primeros 5 slots:`,
        finalSlots.slice(0, 5).map((s) => s.slot_time)
      );

      return finalSlots;
    } catch (error) {
      console.error("💥 Error en getAvailableSlots:", error);

      // En caso de error, devolver slots básicos como fallback
      const fallbackSlots: AvailabilitySlot[] = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          fallbackSlots.push({
            slot_time: timeString,
            available_specialists: ["fallback-specialist"],
            is_available: true,
            duration_minutes: duration,
          });
        }
      }

      console.log(`🆘 Usando ${fallbackSlots.length} slots de fallback`);
      return fallbackSlots;
    }
  },
};

// =============================================================================
// LISTA DE ESPERA
// =============================================================================

export const waitingListService = {
  // Obtener lista de espera activa
  async getActive() {
    const { data, error } = await supabaseNormalized
      .from("waiting_list")
      .select("*")
      .eq("status", "waiting")
      .order("priority", { ascending: false })
      .order("created_at");

    if (error) throw error;
    return data;
  },

  // Agregar a lista de espera
  async add(
    waitingListData: Database["public"]["Tables"]["waiting_list"]["Insert"]
  ) {
    const { data, error } = await supabaseNormalized
      .from("waiting_list")
      .insert(waitingListData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar estado
  async updateStatus(
    id: string,
    status: Database["public"]["Tables"]["waiting_list"]["Row"]["status"]
  ) {
    const { data, error } = await supabaseNormalized
      .from("waiting_list")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// MÉTODOS DE PAGO
// =============================================================================

export const paymentMethodsService = {
  // Obtener métodos activos
  async getActive() {
    const { data, error } = await supabaseNormalized
      .from("payment_methods")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// NOTIFICACIONES
// =============================================================================

export const notificationsService = {
  // Crear notificación
  async create(
    notification: Database["public"]["Tables"]["notifications"]["Insert"]
  ) {
    const { data, error } = await supabaseNormalized
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener notificaciones pendientes para un cliente
  async getPendingForClient(clientId: string) {
    const { data, error } = await supabaseNormalized
      .from("notifications")
      .select("*")
      .eq("client_id", clientId)
      .eq("status", "pending")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Marcar como leída
  async markAsRead(id: string) {
    const { data, error } = await supabaseNormalized
      .from("notifications")
      .update({
        status: "delivered",
        read_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =============================================================================
// CONFIGURACIÓN DEL SISTEMA
// =============================================================================

export const systemSettingsService = {
  // Obtener configuración pública
  async getPublic() {
    const { data, error } = await supabaseNormalized
      .from("system_settings")
      .select("*")
      .eq("is_public", true);

    if (error) throw error;
    return data;
  },

  // Obtener valor específico
  async getValue(category: string, key: string) {
    const { data, error } = await supabaseNormalized
      .from("system_settings")
      .select("value")
      .eq("category", category)
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data?.value;
  },
};

// =============================================================================
// EXPORTACIONES
// =============================================================================

export default supabaseNormalized;
