import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Booking, Service, TimeSlot } from "../types/booking";

interface BookingState {
  // State
  currentStep: "calendar" | "service" | "form" | "confirmation";
  selectedDate: string;
  selectedTime: TimeSlot | null;
  selectedServices: Service[];
  currentBooking: Booking | null;
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setStep: (step: "calendar" | "service" | "form" | "confirmation") => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: TimeSlot | null) => void;
  setSelectedServices: (services: Service[]) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  setBookings: (bookings: Booking[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Complex actions
  resetBookingFlow: () => void;
  nextStep: () => void;
  prevStep: () => void;

  // API actions
  fetchBookings: () => Promise<void>;
  createBooking: (bookingData: Omit<Booking, "id">) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

const stepOrder = ["calendar", "service", "form", "confirmation"] as const;

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: "calendar",
      selectedDate: "",
      selectedTime: null,
      selectedServices: [],
      currentBooking: null,
      bookings: [],
      isLoading: false,
      error: null,

      // Basic setters
      setStep: (step) => set({ currentStep: step }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedTime: (time) => set({ selectedTime: time }),
      setSelectedServices: (services) => set({ selectedServices: services }),
      setCurrentBooking: (booking) => set({ currentBooking: booking }),
      setBookings: (bookings) => set({ bookings }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Complex actions
      resetBookingFlow: () =>
        set({
          currentStep: "calendar",
          selectedDate: "",
          selectedTime: null,
          selectedServices: [],
          currentBooking: null,
          error: null,
        }),

      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) {
          set({ currentStep: stepOrder[currentIndex + 1] });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: stepOrder[currentIndex - 1] });
        }
      },

      // API actions
      fetchBookings: async () => {
        const { setLoading, setError, setBookings } = get();

        setLoading(true);
        setError(null);

        try {
          const response = await fetch("/api/bookings");
          if (!response.ok) {
            throw new Error("Error al cargar reservas");
          }

          const bookings = await response.json();
          setBookings(bookings);
        } catch (error) {
          setError(error instanceof Error ? error.message : "Error desconocido");
          setBookings([]);
        } finally {
          setLoading(false);
        }
      },

      createBooking: async (bookingData) => {
        const { setLoading, setError, setCurrentBooking, fetchBookings, setStep } = get();

        setLoading(true);
        setError(null);

        try {
          const response = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: bookingData.client.name,
              phone: bookingData.client.phone,
              email: bookingData.client.email,
              date: bookingData.date,
              time: bookingData.time,
              services: bookingData.services,
            }),
          });

          if (!response.ok) {
            if (response.status === 409) {
              throw new Error(
                "Este horario ya fue reservado. Por favor elige otro horario disponible.",
              );
            }
            throw new Error("Error al guardar la reserva");
          }

          const saved = await response.json();
          setCurrentBooking({ ...bookingData, id: saved.id });
          setStep("confirmation");
          await fetchBookings();
        } catch (error) {
          setError(error instanceof Error ? error.message : "Error al crear la reserva");
          throw error;
        } finally {
          setLoading(false);
        }
      },

      cancelBooking: async (bookingId) => {
        const { setLoading, setError, fetchBookings } = get();

        setLoading(true);
        setError(null);

        try {
          const response = await fetch(`/api/bookings/${bookingId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("No se pudo cancelar la reserva");
          }

          await fetchBookings();
        } catch (error) {
          setError(error instanceof Error ? error.message : "Error al cancelar la reserva");
          throw error;
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: "booking-store",
      partialize: (state) => ({
        // Solo persistir el estado de la reserva actual
        currentStep: state.currentStep,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
        selectedServices: state.selectedServices,
      }),
    },
  ),
);
