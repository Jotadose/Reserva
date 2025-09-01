import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface CreateBookingData {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  service: string;
  notes?: string;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingStats {
  totalBookings: number;
  todayBookings: number;
  weeklyBookings: number;
  monthlyBookings: number;
  revenue: number;
}

export function useBookingsSimple() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar reservas
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setBookings(data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError(err instanceof Error ? err.message : 'Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva reserva
  const createBooking = async (bookingData: CreateBookingData): Promise<boolean> => {
    try {
      const { error: supabaseError } = await supabase
        .from('bookings')
        .insert([{
          name: bookingData.name,
          phone: bookingData.phone,
          email: bookingData.email,
          date: bookingData.date,
          time: bookingData.time,
          service: bookingData.service,
          notes: bookingData.notes || '',
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (supabaseError) {
        throw supabaseError;
      }

      // Recargar la lista de reservas
      await loadBookings();
      return true;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Error creating booking');
      return false;
    }
  };

  // Función para eliminar una reserva
  const deleteBooking = async (id: string): Promise<boolean> => {
    try {
      const { error: supabaseError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      // Recargar la lista de reservas
      await loadBookings();
      return true;
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError(err instanceof Error ? err.message : 'Error deleting booking');
      return false;
    }
  };

  // Función para actualizar una reserva
  const updateBooking = async (id: string, updates: Partial<CreateBookingData>): Promise<boolean> => {
    try {
      const { error: supabaseError } = await supabase
        .from('bookings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      // Recargar la lista de reservas
      await loadBookings();
      return true;
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err instanceof Error ? err.message : 'Error updating booking');
      return false;
    }
  };

  // Calcular estadísticas
  const stats: BookingStats = {
    totalBookings: bookings.length,
    todayBookings: bookings.filter(b => {
      const today = new Date().toISOString().split('T')[0];
      return b.date === today;
    }).length,
    weeklyBookings: bookings.filter(b => {
      const bookingDate = new Date(b.date);
      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return bookingDate >= oneWeekAgo && bookingDate <= today;
    }).length,
    monthlyBookings: bookings.filter(b => {
      const bookingDate = new Date(b.date);
      const today = new Date();
      const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      return bookingDate >= oneMonthAgo && bookingDate <= today;
    }).length,
    revenue: bookings.length * 25000 // Precio promedio por servicio
  };

  // Cargar reservas al montar el componente
  useEffect(() => {
    loadBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    stats,
    createBooking,
    deleteBooking,
    updateBooking,
    refreshBookings: loadBookings
  };
}
