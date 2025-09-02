/**
 * =============================================================================
 * HOOK DE RESERVAS CON SUPABASE
 * =============================================================================
 * Hook personalizado para manejar todas las operaciones de reservas
 * Reemplaza los datos mock con conexión real a Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  supabase, 
  getBookingsWithRelations, 
  createBookingWithServices,
  updateClientMetrics,
  subscribeToBookings,
  transformBookingToFrontend,
  BookingWithRelations,
  Booking,
  BookingInsert,
  BookingUpdate,
  Client,
  ClientInsert,
  Service
} from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';

// =============================================================================
// INTERFACES
// =============================================================================

export interface BookingFilters {
  startDate?: string;
  endDate?: string;
  status?: string[];
  clientId?: string;
  specialistId?: string;
  serviceIds?: string[];
}

export interface CreateBookingRequest {
  client: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  date: string;
  time: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  notes?: string;
  specialistId?: string;
}

export interface BookingStats {
  total: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  pending: number;
  revenue: number;
  todayBookings: number;
  upcomingBookings: number;
}

// =============================================================================
// HOOK PRINCIPAL
// =============================================================================

export function useBookingsSupabase(filters?: BookingFilters) {
  // Estados
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BookingStats | null>(null);
  
  // Contextos
  const { addToast } = useToast();

  // =============================================================================
  // FUNCIONES DE CARGA
  // =============================================================================

  /**
   * Cargar reservas desde Supabase
   */
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Cargando reservas desde Supabase...', filters);

      const { data, error: queryError } = await getBookingsWithRelations(filters);
      
      if (queryError) {
        throw queryError;
      }

      // Transformar datos al formato del frontend
      const transformedBookings = data?.map((booking: BookingWithRelations) => 
        transformBookingToFrontend(booking)
      ) || [];

      console.log('✅ Reservas cargadas:', transformedBookings.length);
      setBookings(transformedBookings);

      // Calcular estadísticas
      await calculateStats(transformedBookings);

    } catch (err) {
      console.error('❌ Error cargando reservas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar las reservas'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  /**
   * Calcular estadísticas de reservas
   */
  const calculateStats = useCallback(async (bookingsList: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats: BookingStats = {
      total: bookingsList.length,
      confirmed: bookingsList.filter(b => b.status === 'confirmed').length,
      completed: bookingsList.filter(b => b.status === 'completed').length,
      cancelled: bookingsList.filter(b => b.status === 'cancelled').length,
      pending: bookingsList.filter(b => b.status === 'pending').length,
      revenue: bookingsList
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total || 0), 0),
      todayBookings: bookingsList.filter(b => b.date === today).length,
      upcomingBookings: bookingsList.filter(b => 
        b.date >= today && ['confirmed', 'pending'].includes(b.status)
      ).length
    };

    setStats(stats);
  }, []);

  // =============================================================================
  // OPERACIONES CRUD
  // =============================================================================

  /**
   * Crear nueva reserva
   */
  const createBooking = useCallback(async (bookingData: CreateBookingRequest) => {
    try {
      setLoading(true);

      console.log('📝 Creando nueva reserva...', bookingData);

      // 1. Buscar o crear cliente
      let client: Client;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('email', bookingData.client.email)
        .single();

      if (existingClient) {
        client = existingClient;
        console.log('👤 Cliente existente encontrado:', client.name);
      } else {
        // Crear nuevo cliente
        const clientInsert: ClientInsert = {
          name: bookingData.client.name,
          email: bookingData.client.email,
          phone: bookingData.client.phone,
          notes: bookingData.client.notes
        };

        const { data: newClient, error: createClientError } = await supabase
          .from('clients')
          .insert(clientInsert)
          .select()
          .single();

        if (createClientError) throw createClientError;
        client = newClient;
        console.log('👤 Nuevo cliente creado:', client.name);
      }

      // 2. Calcular totales
      const subtotal = bookingData.services.reduce((sum, service) => sum + service.price, 0);
      const taxes = Math.round(subtotal * 0.19); // IVA 19%
      const total = subtotal + taxes;
      const duration = bookingData.services.reduce((sum, service) => sum + service.duration, 0);

      // 3. Crear reserva
      const bookingInsert: BookingInsert = {
        client_id: client.id,
        specialist_id: bookingData.specialistId || null,
        scheduled_date: bookingData.date,
        scheduled_time: bookingData.time,
        estimated_duration: duration,
        subtotal,
        taxes,
        total,
        notes: bookingData.notes,
        status: 'confirmed'
      };

      const booking = await createBookingWithServices(
        bookingInsert,
        bookingData.services.map(service => ({
          serviceId: service.id,
          price: service.price,
          duration: service.duration
        }))
      );

      console.log('✅ Reserva creada exitosamente:', booking.id);

      // 4. Actualizar métricas del cliente
      await updateClientMetrics(client.id);

      // 5. Recargar datos
      await loadBookings();

      addToast({
        type: 'success',
        title: 'Reserva Creada',
        message: `Reserva confirmada para ${client.name}`
      });

      return booking;

    } catch (err) {
      console.error('❌ Error creando reserva:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo crear la reserva'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadBookings, addToast]);

  /**
   * Actualizar reserva existente
   */
  const updateBooking = useCallback(async (
    bookingId: string, 
    updates: Partial<BookingUpdate>
  ) => {
    try {
      console.log('🔄 Actualizando reserva:', bookingId, updates);

      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Reserva actualizada:', data.id);

      // Recargar datos
      await loadBookings();

      addToast({
        type: 'success',
        title: 'Reserva Actualizada',
        message: 'Los cambios se guardaron correctamente'
      });

      return data;

    } catch (err) {
      console.error('❌ Error actualizando reserva:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar la reserva'
      });
      throw err;
    }
  }, [loadBookings, addToast]);

  /**
   * Cambiar estado de reserva
   */
  const updateBookingStatus = useCallback(async (
    bookingId: string, 
    newStatus: Booking['status'],
    reason?: string
  ) => {
    try {
      const updates: Partial<BookingUpdate> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Agregar timestamps específicos según el estado
      switch (newStatus) {
        case 'confirmed':
          updates.confirmed_at = new Date().toISOString();
          break;
        case 'in_progress':
          updates.started_at = new Date().toISOString();
          break;
        case 'completed':
          updates.completed_at = new Date().toISOString();
          break;
        case 'cancelled':
          updates.cancelled_at = new Date().toISOString();
          updates.cancellation_reason = reason;
          break;
      }

      await updateBooking(bookingId, updates);

      // Si se completó, actualizar métricas del cliente
      if (newStatus === 'completed') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking?.client?.id) {
          await updateClientMetrics(booking.client.id);
        }
      }

    } catch (err) {
      console.error('❌ Error cambiando estado:', err);
      throw err;
    }
  }, [updateBooking, bookings]);

  /**
   * Eliminar reserva
   */
  const deleteBooking = useCallback(async (bookingId: string) => {
    try {
      console.log('🗑️ Eliminando reserva:', bookingId);

      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      console.log('✅ Reserva eliminada');

      // Recargar datos
      await loadBookings();

      addToast({
        type: 'success',
        title: 'Reserva Eliminada',
        message: 'La reserva se eliminó correctamente'
      });

    } catch (err) {
      console.error('❌ Error eliminando reserva:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar la reserva'
      });
      throw err;
    }
  }, [loadBookings, addToast]);

  /**
   * Operaciones masivas
   */
  const bulkUpdateStatus = useCallback(async (
    bookingIds: string[],
    newStatus: Booking['status']
  ) => {
    try {
      console.log('🔄 Actualización masiva:', bookingIds.length, 'reservas');

      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', bookingIds);

      if (error) throw error;

      await loadBookings();

      addToast({
        type: 'success',
        title: 'Actualización Masiva',
        message: `${bookingIds.length} reservas actualizadas`
      });

    } catch (err) {
      console.error('❌ Error en actualización masiva:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo realizar la actualización masiva'
      });
      throw err;
    }
  }, [loadBookings, addToast]);

  // =============================================================================
  // SUSCRIPCIONES EN TIEMPO REAL
  // =============================================================================

  useEffect(() => {
    // Cargar datos iniciales
    loadBookings();

    // Suscribirse a cambios en tiempo real
    const subscription = subscribeToBookings((payload) => {
      console.log('🔔 Cambio en tiempo real:', payload);
      
      // Recargar datos cuando hay cambios
      loadBookings();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadBookings]);

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // Estados
    bookings,
    loading,
    error,
    stats,

    // Operaciones CRUD
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
    bulkUpdateStatus,

    // Utilidades
    loadBookings,
    refetch: loadBookings
  };
}

// =============================================================================
// HOOK PARA SERVICIOS
// =============================================================================

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setServices(data || []);
    } catch (err) {
      console.error('❌ Error cargando servicios:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los servicios'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return {
    services,
    loading,
    refetch: loadServices
  };
}

// =============================================================================
// HOOK PARA DISPONIBILIDAD
// =============================================================================

export function useAvailability() {
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkAvailability = useCallback(async (
    date: string,
    duration: number = 60,
    specialistId?: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_available_slots', {
        p_date: date,
        p_duration: duration,
        p_specialist_id: specialistId || null
      });

      if (error) throw error;

      setAvailability(data || []);
      return data || [];
    } catch (err) {
      console.error('❌ Error verificando disponibilidad:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    availability,
    loading,
    checkAvailability
  };
}

export default useBookingsSupabase;
