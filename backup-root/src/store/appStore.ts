// src/store/appStore.ts
// QUÉ HACE: Estado global de la aplicación usando Zustand
// BENEFICIO: Elimina prop drilling, estado centralizado, persistencia automática

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Booking, Service, TimeSlot } from "../types/booking";

// Definimos los tipos para las diferentes vistas y pasos del proceso
type View = "landing" | "booking" | "admin";
type BookingStep = "calendar" | "service" | "form" | "confirmation";

// Interface que define la estructura completa de nuestro estado
interface AppState {
  // Estado de la UI
  currentView: View;
  bookingStep: BookingStep;
  mobileMenuOpen: boolean;

  // Estado del Flujo de Reserva
  bookings: Booking[];
  selectedDate: string;
  selectedTime: TimeSlot | null;
  selectedServices: Service[];
  currentBooking: Booking | null;

  // Estado de autenticación simple para admin
  isAuthenticated: boolean;

  // Acciones para modificar el estado
  setView: (view: View) => void;
  setBookingStep: (step: BookingStep) => void;
  toggleMobileMenu: () => void;

  // Acciones del flujo de reserva
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
  cancelBooking: (bookingId: string) => void;
  startBookingProcess: () => void;
  resetBookingProcess: () => void;

  // Acciones para la selección
  setDate: (date: string) => void;
  setTime: (time: TimeSlot | null) => void;
  setServices: (services: Service[]) => void;

  // Acciones de autenticación
  login: (password: string) => boolean;
  logout: () => void;
}

// Simulamos una contraseña simple para el admin
const ADMIN_PASSWORD = "admin123";

export const useAppStore = create<AppState>()(
  // Usamos el middleware 'persist' para guardar automáticamente el estado en localStorage
  persist(
    (set, get) => ({
      // --- ESTADO INICIAL ---
      currentView: "landing",
      bookingStep: "calendar",
      mobileMenuOpen: false,
      bookings: [],
      selectedDate: "",
      selectedTime: null,
      selectedServices: [],
      currentBooking: null,
      isAuthenticated: false,

      // --- ACCIONES ---
      setView: (view) => set({ currentView: view, mobileMenuOpen: false }),
      setBookingStep: (step) => set({ bookingStep: step }),
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

      addBooking: (booking) => {
        set((state) => ({
          bookings: [...state.bookings, booking],
          currentBooking: booking,
          bookingStep: "confirmation",
        }));
      },

      updateBookingStatus: (bookingId, status) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === bookingId ? { ...booking, status } : booking,
          ),
        }));
      },

      cancelBooking: (bookingId) => {
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== bookingId),
        }));
      },

      startBookingProcess: () => {
        set({
          currentView: "booking",
          bookingStep: "calendar",
          selectedDate: "",
          selectedTime: null,
          selectedServices: [],
          currentBooking: null,
        });
      },

      resetBookingProcess: () => {
        set({
          bookingStep: "calendar",
          selectedDate: "",
          selectedTime: null,
          selectedServices: [],
          currentBooking: null,
        });
      },

      setDate: (date) => set({ selectedDate: date }),
      setTime: (time) => set({ selectedTime: time }),
      setServices: (services) => set({ selectedServices: services }),

      login: (password) => {
        const isValid = password === ADMIN_PASSWORD;
        if (isValid) {
          set({ isAuthenticated: true, currentView: "admin" });
        }
        return isValid;
      },

      logout: () => {
        set({ isAuthenticated: false, currentView: "landing" });
      },
    }),
    {
      // Nombre de la clave en localStorage
      name: "barbershop-storage",
      // No persistir datos sensibles como isAuthenticated
      partialize: (state) => ({
        bookings: state.bookings,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
        selectedServices: state.selectedServices,
        currentBooking: state.currentBooking,
      }),
    },
  ),
);
