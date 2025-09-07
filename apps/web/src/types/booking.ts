export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  category: "barberia" | "colorimetria" | "extras";
}

export interface Booking {
  id: string;
  date: string;
  time: string;
  endTime?: string; // hora_fin calculada por backend
  barberId?: string; // añadido para integración MVP Supabase (id_barbero)
  service?: Service; // Un solo servicio por reserva
  services?: Service[]; // Mantenido por retrocompatibilidad o para otros flujos
  client: {
    name: string;
    phone: string;
    email: string;
    notes?: string;
  };
  totalPrice: number; // precio_total (centavos o pesos según normalización UI)
  duration: number; // duracion total en minutos (duracion_minutos backend)
  status:
    | "pending"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show"
    | "rescheduled";
  createdAt: string;
  updatedAt?: string;
  cancelReason?: string;
  rescheduleHistory?: {
    originalDate: string;
    originalTime: string;
    reason: string;
    timestamp: string;
  }[];
}

export interface BookingFilters {
  dateRange: [Date, Date] | null;
  status: Booking["status"][];
  services: string[];
  priceRange: [number, number] | null;
  searchQuery: string;
}

export interface AdminPanelState {
  bookings: Booking[];
  filters: BookingFilters;
  selectedBookings: string[];
  viewMode: "overview" | "bookings" | "analytics";
  loading: boolean;
  error: string | null;
}
