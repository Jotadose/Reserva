import { useState, useEffect } from "react";
import { supabaseClient } from "../lib/supabaseClient";

export interface ReservaMVP {
  id_reserva: string;
  id_cliente: string;
  id_barbero: string;
  id_servicio: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  precio_total: number; // En centavos
  estado:
    | "pendiente"
    | "confirmada"
    | "en_progreso"
    | "completada"
    | "cancelada"
    | "no_show";
  notas_cliente?: string;
  notas_internas?: string;
  motivo_cancelacion?: string;
  created_at: string;
  updated_at: string;
  confirmada_at?: string;
  completada_at?: string;
  cancelada_at?: string;

  // Datos relacionados (joins)
  cliente?: {
    nombre: string;
    email: string;
    telefono?: string;
  };
  barbero?: {
    nombre: string;
    email: string;
  };
  servicio?: {
    nombre: string;
    categoria: string;
    color: string;
  };
}

export interface CrearReservaData {
  id_cliente: string;
  id_barbero: string;
  id_servicio: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  precio_total: number;
  notas_cliente?: string;
}

export function useReservasMVP() {
  const [reservas, setReservas] = useState<ReservaMVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async (filtros?: {
    barbero?: string;
    fecha?: string;
    estado?: string;
    cliente?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient.from("reservas").select(`
          *,
          cliente:usuarios!reservas_id_cliente_fkey (
            nombre,
            email,
            telefono
          ),
          barbero:usuarios!reservas_id_barbero_fkey (
            nombre,
            email
          ),
          servicio:servicios (
            nombre,
            categoria,
            color
          )
        `);

      // Aplicar filtros
      if (filtros?.barbero) {
        query = query.eq("id_barbero", filtros.barbero);
      }
      if (filtros?.fecha) {
        query = query.eq("fecha_reserva", filtros.fecha);
      }
      if (filtros?.estado) {
        query = query.eq("estado", filtros.estado);
      }
      if (filtros?.cliente) {
        query = query.eq("id_cliente", filtros.cliente);
      }

      // Ordenar por fecha y hora
      query = query
        .order("fecha_reserva", { ascending: true })
        .order("hora_inicio", { ascending: true });

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setReservas(data || []);
    } catch (err) {
      console.error("Error fetching reservas:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getReservaById = async (id: string): Promise<ReservaMVP | null> => {
    try {
      const { data, error: queryError } = await supabaseClient
        .from("reservas")
        .select(
          `
          *,
          cliente:usuarios!reservas_id_cliente_fkey (
            nombre,
            email,
            telefono
          ),
          barbero:usuarios!reservas_id_barbero_fkey (
            nombre,
            email
          ),
          servicio:servicios (
            nombre,
            categoria,
            color
          )
        `
        )
        .eq("id_reserva", id)
        .single();

      if (queryError) {
        throw queryError;
      }

      return data;
    } catch (err) {
      console.error("Error fetching reserva by ID:", err);
      return null;
    }
  };

  const crearReserva = async (
    reservaData: CrearReservaData
  ): Promise<ReservaMVP> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabaseClient
        .from("reservas")
        .insert([
          {
            ...reservaData,
            estado: "confirmada",
          },
        ])
        .select(
          `
          *,
          cliente:usuarios!reservas_id_cliente_fkey (
            nombre,
            email,
            telefono
          ),
          barbero:usuarios!reservas_id_barbero_fkey (
            nombre,
            email
          ),
          servicio:servicios (
            nombre,
            categoria,
            color
          )
        `
        )
        .single();

      if (queryError) {
        throw queryError;
      }

      // Actualizar la lista local
      await fetchReservas();

      return data;
    } catch (err) {
      console.error("Error creating reserva:", err);
      setError(err instanceof Error ? err.message : "Error creando reserva");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarReserva = async (
    id: string,
    updates: Partial<ReservaMVP>
  ): Promise<ReservaMVP> => {
    try {
      setLoading(true);
      setError(null);

      // Agregar timestamps según el estado
      const updatesWithTimestamps = { ...updates };

      if (updates.estado === "confirmada" && !updates.confirmada_at) {
        updatesWithTimestamps.confirmada_at = new Date().toISOString();
      }
      if (updates.estado === "completada" && !updates.completada_at) {
        updatesWithTimestamps.completada_at = new Date().toISOString();
      }
      if (updates.estado === "cancelada" && !updates.cancelada_at) {
        updatesWithTimestamps.cancelada_at = new Date().toISOString();
      }

      const { data, error: queryError } = await supabaseClient
        .from("reservas")
        .update(updatesWithTimestamps)
        .eq("id_reserva", id)
        .select(
          `
          *,
          cliente:usuarios!reservas_id_cliente_fkey (
            nombre,
            email,
            telefono
          ),
          barbero:usuarios!reservas_id_barbero_fkey (
            nombre,
            email
          ),
          servicio:servicios (
            nombre,
            categoria,
            color
          )
        `
        )
        .single();

      if (queryError) {
        throw queryError;
      }

      // Actualizar la lista local
      await fetchReservas();

      return data;
    } catch (err) {
      console.error("Error updating reserva:", err);
      setError(
        err instanceof Error ? err.message : "Error actualizando reserva"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (id: string, motivo?: string) => {
    return await actualizarReserva(id, {
      estado: "cancelada",
      motivo_cancelacion: motivo,
      cancelada_at: new Date().toISOString(),
    });
  };

  const completarReserva = async (id: string, notas_internas?: string) => {
    return await actualizarReserva(id, {
      estado: "completada",
      notas_internas,
      completada_at: new Date().toISOString(),
    });
  };

  const marcarEnProgreso = async (id: string) => {
    return await actualizarReserva(id, {
      estado: "en_progreso",
    });
  };

  const marcarNoShow = async (id: string) => {
    return await actualizarReserva(id, {
      estado: "no_show",
    });
  };

  // Obtener reservas de hoy para un barbero
  const getReservasHoy = async (idBarbero: string) => {
    const hoy = new Date().toISOString().split("T")[0];
    await fetchReservas({ barbero: idBarbero, fecha: hoy });
  };

  // Obtener reservas por rango de fechas
  const getReservasPorRango = async (
    fechaInicio: string,
    fechaFin: string,
    idBarbero?: string
  ) => {
    try {
      setLoading(true);

      let query = supabaseClient
        .from("reservas")
        .select(
          `
          *,
          cliente:usuarios!reservas_id_cliente_fkey (
            nombre,
            email,
            telefono
          ),
          barbero:usuarios!reservas_id_barbero_fkey (
            nombre,
            email
          ),
          servicio:servicios (
            nombre,
            categoria,
            color
          )
        `
        )
        .gte("fecha_reserva", fechaInicio)
        .lte("fecha_reserva", fechaFin);

      if (idBarbero) {
        query = query.eq("id_barbero", idBarbero);
      }

      const { data, error } = await query
        .order("fecha_reserva", { ascending: true })
        .order("hora_inicio", { ascending: true });

      if (error) {
        throw error;
      }

      setReservas(data || []);
    } catch (err) {
      console.error("Error fetching reservas by range:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear precio
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio / 100);
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return {
    reservas,
    loading,
    error,
    refetch: fetchReservas,
    getReservaById,
    crearReserva,
    actualizarReserva,
    cancelarReserva,
    completarReserva,
    marcarEnProgreso,
    marcarNoShow,
    getReservasHoy,
    getReservasPorRango,
    formatearPrecio,
  };
}
