/**
 * =============================================================================
 * SERVICIO DE MIGRACIÓN DE DATOS
 * =============================================================================
 * Migra datos desde la estructura antigua a Supabase normalizado
 * Incluye transformación de datos mock a estructura real
 */

import { supabase } from "../lib/supabaseClient";
import { services as servicesData } from "../data/servicesData";

// =============================================================================
// INTERFAZ DE PROGRESO
// =============================================================================

export interface MigrationProgress {
  step: string;
  current: number;
  total: number;
  status: "pending" | "running" | "completed" | "error";
  message: string;
  error?: string;
}

export type MigrationCallback = (progress: MigrationProgress) => void;

// =============================================================================
// SERVICIO DE MIGRACIÓN
// =============================================================================

export class DataMigrationService {
  private onProgress?: MigrationCallback;

  constructor(onProgress?: MigrationCallback) {
    this.onProgress = onProgress;
  }

  private reportProgress(progress: Partial<MigrationProgress>) {
    if (this.onProgress) {
      this.onProgress({
        step: "",
        current: 0,
        total: 0,
        status: "pending",
        message: "",
        ...progress,
      } as MigrationProgress);
    }
  }

  /**
   * Ejecutar migración completa
   */
  async runMigration(): Promise<void> {
    try {
      this.reportProgress({
        step: "Iniciando migración",
        current: 0,
        total: 5,
        status: "running",
        message: "Preparando migración de datos...",
      });

      // Paso 1: Limpiar datos existentes
      await this.cleanExistingData();

      // Paso 2: Migrar servicios
      await this.migrateServices();

      // Paso 3: Crear especialista por defecto
      await this.createDefaultSpecialist();

      // Paso 4: Migrar métodos de pago
      await this.migratePaymentMethods();

      // Paso 5: Configurar settings del sistema
      await this.migrateSystemSettings();

      this.reportProgress({
        step: "Migración completada",
        current: 5,
        total: 5,
        status: "completed",
        message: "¡Migración completada exitosamente!",
      });
    } catch (error) {
      this.reportProgress({
        step: "Error en migración",
        current: 0,
        total: 5,
        status: "error",
        message: "Error durante la migración",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
      throw error;
    }
  }

  /**
   * Paso 1: Limpiar datos existentes (opcional)
   */
  private async cleanExistingData(): Promise<void> {
    this.reportProgress({
      step: "Limpiando datos existentes",
      current: 1,
      total: 5,
      status: "running",
      message: "Preparando base de datos...",
    });

    try {
      // En desarrollo, podemos limpiar algunas tablas
      // En producción, esto se debe manejar con cuidado

      console.log("🧹 Limpiando datos existentes...");

      // Nota: Comentado para evitar pérdida de datos en producción
      // await supabase.from('booking_services').delete().neq('id', '');
      // await supabase.from('bookings').delete().neq('id', '');
      // await supabase.from('clients').delete().neq('id', '');
    } catch (error) {
      console.warn("⚠️ Advertencia durante limpieza:", error);
      // No fallar la migración por esto
    }
  }

  /**
   * Paso 2: Migrar servicios desde servicesData
   */
  private async migrateServices(): Promise<void> {
    this.reportProgress({
      step: "Migrando servicios",
      current: 2,
      total: 5,
      status: "running",
      message: "Creando servicios...",
    });

    try {
      console.log("💼 Migrando servicios...");

      // Verificar si ya existen servicios
      const { data: existingServices } = await supabase
        .from("services")
        .select("name");

      if (existingServices && existingServices.length > 0) {
        console.log("ℹ️ Servicios ya existen, omitiendo migración");
        return;
      }

      // Preparar datos de servicios
      const servicesToInsert = servicesData.map((service) => ({
        name: service.name,
        description: service.description || null,
        base_price: service.price * 100, // Convertir a centavos
        base_duration: service.duration,
        category: service.category || "General",
        is_active: true,
        requires_specialist: true,
        preparation_time: 5, // 5 minutos de preparación
        cleanup_time: 5, // 5 minutos de limpieza
        max_concurrent: 1,
      }));

      const { data, error } = await supabase
        .from("services")
        .insert(servicesToInsert)
        .select();

      if (error) throw error;

      console.log(`✅ ${data?.length || 0} servicios migrados exitosamente`);
    } catch (error) {
      console.error("❌ Error migrando servicios:", error);
      throw error;
    }
  }

  /**
   * Paso 3: Crear especialista por defecto
   */
  private async createDefaultSpecialist(): Promise<void> {
    this.reportProgress({
      step: "Creando especialista",
      current: 3,
      total: 5,
      status: "running",
      message: "Configurando especialista por defecto...",
    });

    try {
      console.log("👨‍💼 Creando especialista por defecto...");

      // Verificar si ya existe un especialista
      const { data: existingSpecialists } = await supabase
        .from("specialists")
        .select("id");

      if (existingSpecialists && existingSpecialists.length > 0) {
        console.log("ℹ️ Especialista ya existe, omitiendo creación");
        return;
      }

      // Crear especialista por defecto
      const defaultSpecialist = {
        name: "Especialista Principal",
        email: "especialista@barberstudio.com",
        phone: "+57 300 123 4567",
        is_active: true,
        schedule_template: {
          monday: { enabled: true, start: "09:00", end: "18:00" },
          tuesday: { enabled: true, start: "09:00", end: "18:00" },
          wednesday: { enabled: true, start: "09:00", end: "18:00" },
          thursday: { enabled: true, start: "09:00", end: "18:00" },
          friday: { enabled: true, start: "09:00", end: "18:00" },
          saturday: { enabled: true, start: "09:00", end: "16:00" },
          sunday: { enabled: false, start: "09:00", end: "16:00" },
        },
        specialties: [
          "Corte de cabello",
          "Arreglo de barba",
          "Tratamientos capilares",
        ],
      };

      const { data, error } = await supabase
        .from("specialists")
        .insert(defaultSpecialist)
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Especialista por defecto creado:", data.name);
    } catch (error) {
      console.error("❌ Error creando especialista:", error);
      throw error;
    }
  }

  /**
   * Paso 4: Migrar métodos de pago
   */
  private async migratePaymentMethods(): Promise<void> {
    this.reportProgress({
      step: "Configurando métodos de pago",
      current: 4,
      total: 5,
      status: "running",
      message: "Instalando métodos de pago...",
    });

    try {
      console.log("💳 Configurando métodos de pago...");

      // Verificar si ya existen métodos de pago
      const { data: existingMethods } = await supabase
        .from("payment_methods")
        .select("name");

      if (existingMethods && existingMethods.length > 0) {
        console.log("ℹ️ Métodos de pago ya existen, omitiendo migración");
        return;
      }

      // Métodos de pago por defecto para Colombia
      const paymentMethods = [
        {
          name: "Efectivo",
          type: "cash" as const,
          is_active: true,
          processing_fee_percentage: 0,
          processing_fee_fixed: 0,
          config: {},
        },
        {
          name: "Tarjeta de Crédito/Débito",
          type: "card" as const,
          is_active: true,
          processing_fee_percentage: 2.9,
          processing_fee_fixed: 0,
          config: {
            gateway: "wompi",
            acceptedCards: ["visa", "mastercard", "amex"],
          },
        },
        {
          name: "Transferencia Bancaria",
          type: "bank_transfer" as const,
          is_active: true,
          processing_fee_percentage: 0.5,
          processing_fee_fixed: 0,
          config: {
            banks: ["bancolombia", "davivienda", "bbva", "banco_bogota"],
            processingDays: 1,
          },
        },
        {
          name: "Nequi",
          type: "digital_wallet" as const,
          is_active: true,
          processing_fee_percentage: 2.0,
          processing_fee_fixed: 0,
          config: {
            maxAmount: 2000000, // 2 millones de pesos
            minAmount: 1000,
          },
        },
        {
          name: "Daviplata",
          type: "digital_wallet" as const,
          is_active: true,
          processing_fee_percentage: 2.0,
          processing_fee_fixed: 0,
          config: {
            maxAmount: 1500000, // 1.5 millones de pesos
            minAmount: 1000,
          },
        },
      ];

      const { data, error } = await supabase
        .from("payment_methods")
        .insert(paymentMethods)
        .select();

      if (error) throw error;

      console.log(`✅ ${data?.length || 0} métodos de pago configurados`);
    } catch (error) {
      console.error("❌ Error configurando métodos de pago:", error);
      throw error;
    }
  }

  /**
   * Paso 5: Configurar settings del sistema
   */
  private async migrateSystemSettings(): Promise<void> {
    this.reportProgress({
      step: "Configurando sistema",
      current: 5,
      total: 5,
      status: "running",
      message: "Aplicando configuración final...",
    });

    try {
      console.log("⚙️ Configurando settings del sistema...");

      // Verificar si ya existen configuraciones
      const { data: existingSettings } = await supabase
        .from("system_settings")
        .select("key");

      if (existingSettings && existingSettings.length > 0) {
        console.log("ℹ️ Configuraciones ya existen, omitiendo migración");
        return;
      }

      // Configuraciones por defecto
      const systemSettings = [
        {
          category: "business",
          key: "name",
          value: "Barber Studio Premium",
          description: "Nombre del negocio",
          is_public: true,
        },
        {
          category: "business",
          key: "phone",
          value: "+57 300 123 4567",
          description: "Teléfono principal",
          is_public: true,
        },
        {
          category: "business",
          key: "email",
          value: "info@barberstudio.com",
          description: "Email de contacto",
          is_public: true,
        },
        {
          category: "business",
          key: "address",
          value: "Calle 123 #45-67, Bogotá, Colombia",
          description: "Dirección física",
          is_public: true,
        },
        {
          category: "business",
          key: "hours",
          value: {
            monday: { open: "09:00", close: "18:00" },
            tuesday: { open: "09:00", close: "18:00" },
            wednesday: { open: "09:00", close: "18:00" },
            thursday: { open: "09:00", close: "18:00" },
            friday: { open: "09:00", close: "18:00" },
            saturday: { open: "09:00", close: "16:00" },
            sunday: { open: "10:00", close: "15:00" },
          },
          description: "Horarios de atención",
          is_public: true,
        },
        {
          category: "booking",
          key: "advance_booking_days",
          value: 30,
          description: "Días máximos para reservar con anticipación",
          is_public: true,
        },
        {
          category: "booking",
          key: "cancellation_hours",
          value: 24,
          description: "Horas mínimas para cancelar sin penalización",
          is_public: true,
        },
        {
          category: "booking",
          key: "deposit_percentage",
          value: 20,
          description: "Porcentaje de depósito requerido",
          is_public: false,
        },
        {
          category: "notifications",
          key: "reminder_hours",
          value: [24, 2],
          description: "Horas antes de la cita para recordatorios",
          is_public: false,
        },
        {
          category: "pricing",
          key: "tax_rate",
          value: 0.19,
          description: "Tasa de IVA (19% en Colombia)",
          is_public: false,
        },
      ];

      const { data, error } = await supabase
        .from("system_settings")
        .insert(systemSettings)
        .select();

      if (error) throw error;

      console.log(
        `✅ ${data?.length || 0} configuraciones del sistema aplicadas`
      );
    } catch (error) {
      console.error("❌ Error configurando sistema:", error);
      throw error;
    }
  }

  /**
   * Migrar datos de reservas existentes (desde API)
   */
  async migrateExistingBookings(): Promise<void> {
    try {
      console.log("📅 Migrando reservas existentes...");

      // Intentar obtener datos desde la API existente
      const response = await fetch("/api/bookings");
      if (!response.ok) {
        console.log("ℹ️ No hay API existente, omitiendo migración de reservas");
        return;
      }

      const existingBookings = await response.json();
      console.log(
        `📊 Encontradas ${existingBookings.length} reservas para migrar`
      );

      for (const booking of existingBookings) {
        try {
          // 1. Crear o encontrar cliente
          let client;
          const { data: existingClient } = await supabase
            .from("clients")
            .select("*")
            .eq("email", booking.email)
            .single();

          if (existingClient) {
            client = existingClient;
          } else {
            const { data: newClient, error } = await supabase
              .from("clients")
              .insert({
                name: booking.name,
                email: booking.email,
                phone: booking.phone || "No especificado",
              })
              .select()
              .single();

            if (error) throw error;
            client = newClient;
          }

          // 2. Calcular totales de servicios
          const services = Array.isArray(booking.services)
            ? booking.services
            : [];
          const subtotal = services.reduce(
            (sum: number, s: any) => sum + (s.price || 0),
            0
          );
          const duration = services.reduce(
            (sum: number, s: any) => sum + (s.duration || 45),
            0
          );

          // 3. Crear reserva
          const { data: newBooking, error: bookingError } = await supabase
            .from("bookings")
            .insert({
              client_id: client.id,
              scheduled_date: booking.date,
              scheduled_time: booking.time,
              estimated_duration: duration,
              status: booking.status || "confirmed",
              subtotal: subtotal * 100, // Convertir a centavos
              taxes: Math.round(subtotal * 0.19 * 100),
              total: Math.round(subtotal * 1.19 * 100),
              notes: booking.notes,
            })
            .select()
            .single();

          if (bookingError) throw bookingError;

          // 4. Crear servicios de la reserva
          if (services.length > 0) {
            const bookingServices = services.map(
              (service: any, index: number) => ({
                booking_id: newBooking.id,
                service_id: service.id || "default-service-id", // Necesitarás mapear esto
                price: (service.price || 0) * 100,
                duration: service.duration || 45,
                execution_order: index + 1,
              })
            );

            await supabase.from("booking_services").insert(bookingServices);
          }

          console.log(`✅ Reserva migrada: ${booking.name} - ${booking.date}`);
        } catch (error) {
          console.error(`❌ Error migrando reserva ${booking.id}:`, error);
          // Continuar con la siguiente reserva
        }
      }

      console.log("🎉 Migración de reservas completada");
    } catch (error) {
      console.error("❌ Error en migración de reservas:", error);
      throw error;
    }
  }
}

// =============================================================================
// FUNCIÓN HELPER PARA EJECUTAR MIGRACIÓN
// =============================================================================

export async function runDataMigration(
  onProgress?: MigrationCallback
): Promise<void> {
  const migration = new DataMigrationService(onProgress);
  await migration.runMigration();
}

export default DataMigrationService;
