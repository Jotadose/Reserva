/**
 * =============================================================================
 * TIPOS DE BASE DE DATOS - SUPABASE
 * =============================================================================
 * Tipos específicos para la base de datos normalizada
 * Corrige los tipos genéricos y mejora la type safety
 */

// =============================================================================
// ENUMS Y TIPOS LITERALES
// =============================================================================

export type Gender = "male" | "female" | "other";

export type ClientTier = "standard" | "premium" | "vip";

export type ClientStatus = "active" | "inactive" | "blocked";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export type BookingServiceStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped";

export type Priority = "low" | "medium" | "high" | "urgent";

export type WaitingListStatus =
  | "waiting"
  | "contacted"
  | "booked"
  | "expired"
  | "cancelled";

export type PaymentMethodType =
  | "cash"
  | "card"
  | "bank_transfer"
  | "digital_wallet"
  | "crypto";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "booking"
  | "reminder"
  | "payment"
  | "marketing";

export type NotificationStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "failed"
  | "cancelled";

// =============================================================================
// INTERFACES PARA CAMPOS JSONB
// =============================================================================

export interface SpecialistScheduleTemplate {
  monday?: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
    breaks?: Array<{ start: string; end: string }>;
  };
  tuesday?: {
    enabled: boolean;
    start: string;
    end: string;
    breaks?: Array<{ start: string; end: string }>;
  };
  wednesday?: {
    enabled: boolean;
    start: string;
    end: string;
    breaks?: Array<{ start: string; end: string }>;
  };
  thursday?: {
    enabled: boolean;
    start: string;
    end: string;
    breaks?: Array<{ start: string; end: string }>;
  };
  friday?: {
    enabled: boolean;
    start: string;
    end: string;
    breaks?: Array<{ start: string; end: string }>;
  };
  saturday?: {
    enabled: boolean;
    start: string;
    end: string;
    breaks?: Array<{ start: string; end: string }>;
  };
  sunday?: {
    enabled: boolean;
    start: string;
    end: string;
    breaks?: Array<{ start: string; end: string }>;
  };
}

export interface ClientPreferences {
  preferredServices?: string[];
  preferredTimes?: string[];
  preferredSpecialist?: string;
  communicationMethod?: "email" | "phone" | "sms" | "whatsapp";
  notes?: string;
  remindersEnabled?: boolean;
  reminderHours?: number;
  language?: "es" | "en";
}

export interface PaymentMethodConfig {
  // Para tarjetas
  gateway?: string;
  acceptedCards?: string[];

  // Para transferencias bancarias
  banks?: string[];
  accountNumber?: string;

  // Para billeteras digitales
  maxAmount?: number;
  minAmount?: number;

  // Para criptomonedas
  wallet?: string;
  supportedCoins?: string[];

  // Configuración general
  requiresVerification?: boolean;
  processingDays?: number;
}

export interface GatewayResponse {
  transactionId?: string;
  status?: string;
  message?: string;
  responseCode?: string;
  processorResponse?: Record<string, unknown>;
  timestamp?: string;
  fees?: number;
  currency?: string;
}

// =============================================================================
// INTERFACES DE BASE DE DATOS (CORREGIDAS)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      // Servicios
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          base_price: number;
          base_duration: number;
          category: string | null;
          is_active: boolean;
          requires_specialist: boolean;
          preparation_time: number;
          cleanup_time: number;
          max_concurrent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          base_price: number;
          base_duration: number;
          category?: string | null;
          is_active?: boolean;
          requires_specialist?: boolean;
          preparation_time?: number;
          cleanup_time?: number;
          max_concurrent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          base_price?: number;
          base_duration?: number;
          category?: string | null;
          is_active?: boolean;
          requires_specialist?: boolean;
          preparation_time?: number;
          cleanup_time?: number;
          max_concurrent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Especialistas
      specialists: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          is_active: boolean;
          schedule_template: SpecialistScheduleTemplate | null;
          specialties: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          is_active?: boolean;
          schedule_template?: SpecialistScheduleTemplate | null;
          specialties?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          is_active?: boolean;
          schedule_template?: SpecialistScheduleTemplate | null;
          specialties?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Clientes
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          birth_date: string | null;
          gender: Gender | null;
          notes: string | null;
          allergies: string[] | null;
          preferences: ClientPreferences | null;
          total_visits: number;
          total_spent: number;
          last_visit: string | null;
          client_since: string;
          tier: ClientTier;
          status: ClientStatus;
          email_notifications: boolean;
          sms_notifications: boolean;
          marketing_consent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          birth_date?: string | null;
          gender?: Gender | null;
          notes?: string | null;
          allergies?: string[] | null;
          preferences?: ClientPreferences | null;
          total_visits?: number;
          total_spent?: number;
          last_visit?: string | null;
          client_since?: string;
          tier?: ClientTier;
          status?: ClientStatus;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          marketing_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          birth_date?: string | null;
          gender?: Gender | null;
          notes?: string | null;
          allergies?: string[] | null;
          preferences?: ClientPreferences | null;
          total_visits?: number;
          total_spent?: number;
          last_visit?: string | null;
          client_since?: string;
          tier?: ClientTier;
          status?: ClientStatus;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          marketing_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Reservas
      bookings: {
        Row: {
          id: string;
          client_id: string;
          specialist_id: string | null;
          scheduled_date: string;
          scheduled_time: string;
          scheduled_datetime: string | null;
          estimated_duration: number;
          actual_duration: number | null;
          status: BookingStatus;
          subtotal: number;
          taxes: number;
          discounts: number | null;
          total: number;
          deposit_required: number | null;
          deposit_paid: number | null;
          notes: string | null;
          internal_notes: string | null;
          cancellation_reason: string | null;
          rating: number | null;
          review: string | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          specialist_id?: string | null;
          scheduled_date: string;
          scheduled_time: string;
          estimated_duration: number;
          actual_duration?: number | null;
          status?: BookingStatus;
          subtotal?: number;
          taxes?: number;
          discounts?: number | null;
          total?: number;
          deposit_required?: number | null;
          deposit_paid?: number | null;
          notes?: string | null;
          internal_notes?: string | null;
          cancellation_reason?: string | null;
          rating?: number | null;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          specialist_id?: string | null;
          scheduled_date?: string;
          scheduled_time?: string;
          estimated_duration?: number;
          actual_duration?: number | null;
          status?: BookingStatus;
          subtotal?: number;
          taxes?: number;
          discounts?: number | null;
          total?: number;
          deposit_required?: number | null;
          deposit_paid?: number | null;
          notes?: string | null;
          internal_notes?: string | null;
          cancellation_reason?: string | null;
          rating?: number | null;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
        };
      };

      // Servicios de reserva
      booking_services: {
        Row: {
          id: string;
          booking_id: string;
          service_id: string;
          price: number;
          duration: number;
          status: BookingServiceStatus;
          started_at: string | null;
          completed_at: string | null;
          execution_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          service_id: string;
          price: number;
          duration: number;
          status?: BookingServiceStatus;
          started_at?: string | null;
          completed_at?: string | null;
          execution_order?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          service_id?: string;
          price?: number;
          duration?: number;
          status?: BookingServiceStatus;
          started_at?: string | null;
          completed_at?: string | null;
          execution_order?: number | null;
          created_at?: string;
        };
      };

      // Lista de espera
      waiting_list: {
        Row: {
          id: string;
          client_id: string | null;
          client_name: string;
          client_email: string;
          client_phone: string;
          preferred_date: string | null;
          preferred_time_start: string | null;
          preferred_time_end: string | null;
          flexible_dates: boolean | null;
          requested_services: string[];
          estimated_duration: number | null;
          estimated_price: number | null;
          priority: Priority;
          auto_book: boolean | null;
          status: WaitingListStatus;
          notes: string | null;
          contacted_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          client_name: string;
          client_email: string;
          client_phone: string;
          preferred_date?: string | null;
          preferred_time_start?: string | null;
          preferred_time_end?: string | null;
          flexible_dates?: boolean | null;
          requested_services: string[];
          estimated_duration?: number | null;
          estimated_price?: number | null;
          priority?: Priority;
          auto_book?: boolean | null;
          status?: WaitingListStatus;
          notes?: string | null;
          contacted_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          client_name?: string;
          client_email?: string;
          client_phone?: string;
          preferred_date?: string | null;
          preferred_time_start?: string | null;
          preferred_time_end?: string | null;
          flexible_dates?: boolean | null;
          requested_services?: string[];
          estimated_duration?: number | null;
          estimated_price?: number | null;
          priority?: Priority;
          auto_book?: boolean | null;
          status?: WaitingListStatus;
          notes?: string | null;
          contacted_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Métodos de pago
      payment_methods: {
        Row: {
          id: string;
          name: string;
          type: PaymentMethodType;
          is_active: boolean;
          processing_fee_percentage: number | null;
          processing_fee_fixed: number | null;
          config: PaymentMethodConfig | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: PaymentMethodType;
          is_active?: boolean;
          processing_fee_percentage?: number | null;
          processing_fee_fixed?: number | null;
          config?: PaymentMethodConfig | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: PaymentMethodType;
          is_active?: boolean;
          processing_fee_percentage?: number | null;
          processing_fee_fixed?: number | null;
          config?: PaymentMethodConfig | null;
          created_at?: string;
        };
      };

      // Pagos
      payments: {
        Row: {
          id: string;
          booking_id: string;
          payment_method_id: string;
          amount: number;
          processing_fee: number | null;
          net_amount: number;
          status: PaymentStatus;
          external_transaction_id: string | null;
          gateway_response: GatewayResponse | null;
          description: string | null;
          failure_reason: string | null;
          refund_reason: string | null;
          refunded_amount: number | null;
          created_at: string;
          processed_at: string | null;
          failed_at: string | null;
          refunded_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          payment_method_id: string;
          amount: number;
          processing_fee?: number | null;
          net_amount: number;
          status?: PaymentStatus;
          external_transaction_id?: string | null;
          gateway_response?: GatewayResponse | null;
          description?: string | null;
          failure_reason?: string | null;
          refund_reason?: string | null;
          refunded_amount?: number | null;
          created_at?: string;
          processed_at?: string | null;
          failed_at?: string | null;
          refunded_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          payment_method_id?: string;
          amount?: number;
          processing_fee?: number | null;
          net_amount?: number;
          status?: PaymentStatus;
          external_transaction_id?: string | null;
          gateway_response?: GatewayResponse | null;
          description?: string | null;
          failure_reason?: string | null;
          refund_reason?: string | null;
          refunded_amount?: number | null;
          created_at?: string;
          processed_at?: string | null;
          failed_at?: string | null;
          refunded_at?: string | null;
        };
      };

      // Notificaciones
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          client_id: string | null;
          type: NotificationType;
          title: string;
          message: string;
          channels: string[];
          status: NotificationStatus;
          priority: Priority;
          data: Record<string, unknown> | null;
          action_url: string | null;
          action_text: string | null;
          expires_at: string | null;
          created_at: string;
          sent_at: string | null;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          client_id?: string | null;
          type: NotificationType;
          title: string;
          message: string;
          channels?: string[];
          status?: NotificationStatus;
          priority?: Priority;
          data?: Record<string, unknown> | null;
          action_url?: string | null;
          action_text?: string | null;
          expires_at?: string | null;
          created_at?: string;
          sent_at?: string | null;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          client_id?: string | null;
          type?: NotificationType;
          title?: string;
          message?: string;
          channels?: string[];
          status?: NotificationStatus;
          priority?: Priority;
          data?: Record<string, unknown> | null;
          action_url?: string | null;
          action_text?: string | null;
          expires_at?: string | null;
          created_at?: string;
          sent_at?: string | null;
          read_at?: string | null;
        };
      };

      // Logs de auditoría
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_name: string | null;
          user_email: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          old_values: Record<string, unknown> | null;
          new_values: Record<string, unknown> | null;
          changes: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_name?: string | null;
          user_email?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          changes?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_name?: string | null;
          user_email?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          changes?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
      };

      // Configuración del sistema
      system_settings: {
        Row: {
          id: string;
          category: string;
          key: string;
          value: Record<string, unknown>;
          description: string | null;
          is_public: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          key: string;
          value: Record<string, unknown>;
          description?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          key?: string;
          value?: Record<string, unknown>;
          description?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
      };

      // NUEVAS TABLAS NORMALIZADAS (con sufijo _new)
      services_new: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          base_price: number;
          base_duration: number;
          category: string | null;
          is_active: boolean;
          requires_specialist: boolean;
          preparation_time: number;
          cleanup_time: number;
          max_concurrent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          base_price: number;
          base_duration: number;
          category?: string | null;
          is_active?: boolean;
          requires_specialist?: boolean;
          preparation_time?: number;
          cleanup_time?: number;
          max_concurrent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          base_price?: number;
          base_duration?: number;
          category?: string | null;
          is_active?: boolean;
          requires_specialist?: boolean;
          preparation_time?: number;
          cleanup_time?: number;
          max_concurrent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      clients_new: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          birth_date: string | null;
          gender: Gender | null;
          notes: string | null;
          allergies: string[] | null;
          preferences: ClientPreferences | null;
          total_visits: number;
          total_spent: number;
          last_visit: string | null;
          client_since: string;
          tier: ClientTier;
          status: ClientStatus;
          email_notifications: boolean;
          sms_notifications: boolean;
          marketing_consent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          birth_date?: string | null;
          gender?: Gender | null;
          notes?: string | null;
          allergies?: string[] | null;
          preferences?: ClientPreferences | null;
          total_visits?: number;
          total_spent?: number;
          last_visit?: string | null;
          client_since?: string;
          tier?: ClientTier;
          status?: ClientStatus;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          marketing_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          birth_date?: string | null;
          gender?: Gender | null;
          notes?: string | null;
          allergies?: string[] | null;
          preferences?: ClientPreferences | null;
          total_visits?: number;
          total_spent?: number;
          last_visit?: string | null;
          client_since?: string;
          tier?: ClientTier;
          status?: ClientStatus;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          marketing_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      bookings_new: {
        Row: {
          id: string;
          client_id: string;
          specialist_id: string | null;
          scheduled_date: string;
          scheduled_time: string;
          scheduled_datetime: string | null;
          estimated_duration: number;
          actual_duration: number | null;
          status: BookingStatus;
          subtotal: number;
          taxes: number;
          discounts: number | null;
          total: number;
          deposit_required: number | null;
          deposit_paid: number | null;
          notes: string | null;
          internal_notes: string | null;
          cancellation_reason: string | null;
          rating: number | null;
          review: string | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          specialist_id?: string | null;
          scheduled_date: string;
          scheduled_time: string;
          estimated_duration: number;
          actual_duration?: number | null;
          status?: BookingStatus;
          subtotal?: number;
          taxes?: number;
          discounts?: number | null;
          total?: number;
          deposit_required?: number | null;
          deposit_paid?: number | null;
          notes?: string | null;
          internal_notes?: string | null;
          cancellation_reason?: string | null;
          rating?: number | null;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          specialist_id?: string | null;
          scheduled_date?: string;
          scheduled_time?: string;
          estimated_duration?: number;
          actual_duration?: number | null;
          status?: BookingStatus;
          subtotal?: number;
          taxes?: number;
          discounts?: number | null;
          total?: number;
          deposit_required?: number | null;
          deposit_paid?: number | null;
          notes?: string | null;
          internal_notes?: string | null;
          cancellation_reason?: string | null;
          rating?: number | null;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
        };
      };

      specialist_services: {
        Row: {
          id: string;
          specialist_id: string;
          service_id: string;
          proficiency_level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          specialist_id: string;
          service_id: string;
          proficiency_level?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          specialist_id?: string;
          service_id?: string;
          proficiency_level?: number;
          created_at?: string;
        };
      };
    };

    Views: {
      bookings_view: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          date: string;
          time: string;
          status: BookingStatus;
          duration: number;
          services: Record<string, unknown>;
          notes: string | null;
          created_at: string;
        };
      };
    };

    Functions: {
      get_available_slots: {
        Args: {
          p_date: string;
          p_specialist_id?: string;
          p_duration?: number;
        };
        Returns: {
          slot_time: string;
          available_specialists: string[];
        }[];
      };
      update_client_metrics: {
        Args: {
          p_client_id: string;
        };
        Returns: void;
      };
    };

    Enums: {
      [_ in never]: never;
    };
  };
}

// =============================================================================
// TIPOS AUXILIARES Y TRANSFORMADORES
// =============================================================================

// Tipo para booking completo con relaciones (nueva estructura)
export interface BookingWithRelations {
  id: string;
  client: Database["public"]["Tables"]["clients_new"]["Row"];
  specialist?: Database["public"]["Tables"]["specialists"]["Row"];
  services: Array<
    Database["public"]["Tables"]["services_new"]["Row"] & {
      price: number;
      duration: number;
      status: BookingServiceStatus;
      execution_order: number;
    }
  >;
  scheduled_date: string;
  scheduled_time: string;
  scheduled_datetime: string | null;
  estimated_duration: number;
  actual_duration: number | null;
  status: BookingStatus;
  subtotal: number;
  taxes: number;
  discounts: number | null;
  total: number;
  deposit_required: number | null;
  deposit_paid: number | null;
  notes: string | null;
  internal_notes: string | null;
  cancellation_reason: string | null;
  rating: number | null;
  review: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

// Tipo para crear una nueva reserva
export interface CreateBookingData {
  client_id?: string | null;
  specialist_id?: string;
  scheduled_date: string;
  scheduled_time: string;
  services: Array<{
    service_id: string;
    price: number;
    duration: number;
    execution_order?: number;
  }>;
  notes?: string;
  deposit_required?: number;
  // Campos adicionales para crear cliente automáticamente
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  // Campos de totales
  subtotal?: number;
  taxes?: number;
  discounts?: number;
  total?: number;
  estimated_duration?: number;
  status?: string;
}

// Tipo para slot de disponibilidad
export interface AvailabilitySlot {
  slot_time: string;
  available_specialists: string[];
  is_available: boolean;
  duration_minutes: number;
}

// Tipo para estadísticas del dashboard
export interface DashboardStats {
  today: {
    bookings: number;
    revenue: number;
    completed: number;
    cancelled: number;
  };
  thisWeek: {
    bookings: number;
    revenue: number;
    newClients: number;
  };
  thisMonth: {
    bookings: number;
    revenue: number;
    avgRating: number;
  };
}

// Transformador de booking legacy a nuevo formato
export function transformLegacyBooking(
  legacyBooking: Database["public"]["Tables"]["bookings"]["Row"]
): Partial<BookingWithRelations> {
  return {
    id: legacyBooking.id,
    client: {
      id: "", // Se debe obtener por email
      name: legacyBooking.client_id,
      email: "",
      phone: "",
    } as any,
    scheduled_date: legacyBooking.scheduled_date,
    scheduled_time: legacyBooking.scheduled_time,
    estimated_duration: legacyBooking.estimated_duration,
    status: legacyBooking.status,
    notes: legacyBooking.notes,
    services: [],
    created_at: legacyBooking.created_at,
    subtotal: legacyBooking.subtotal,
    taxes: legacyBooking.taxes,
    total: legacyBooking.total,
    updated_at: legacyBooking.updated_at,
  };
}

// Validadores de tipos
export function isValidBookingStatus(status: string): status is BookingStatus {
  return [
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show",
    "rescheduled",
  ].includes(status);
}

export function isValidClientTier(tier: string): tier is ClientTier {
  return ["standard", "premium", "vip"].includes(tier);
}

export function isValidPaymentStatus(status: string): status is PaymentStatus {
  return [
    "pending",
    "processing",
    "completed",
    "failed",
    "refunded",
    "partially_refunded",
  ].includes(status);
}

// Helper para convertir precios de centavos a pesos
export function centsToPesos(cents: number): number {
  return cents / 100;
}

// Helper para convertir pesos a centavos
export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100);
}

// Helper para formatear precios
export function formatPrice(cents: number, currency = "COP"): string {
  const amount = centsToPesos(cents);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency,
  }).format(amount);
}
