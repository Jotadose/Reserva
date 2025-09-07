import { useState, useCallback } from "react";
import { supabaseClient } from "../lib/supabaseClient";

export interface SlotDisponible {
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

export interface BloqueDisponibilidad {
  id_disponibilidad: string;
  id_barbero: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: "trabajo" | "descanso" | "vacaciones" | "bloqueado";
  descripcion?: string;
  created_at: string;
}

export function useDisponibilidad() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener slots disponibles para un barbero en una fecha específica
  const getSlotsDisponibles = useCallback(
    async (
      idBarbero: string,
      fecha: string,
      duracion: number = 60
    ): Promise<SlotDisponible[]> => {
      try {
        setLoading(true);
        setError(null);

        // Llamar a la función PostgreSQL que creamos
        const { data, error: queryError } = await supabaseClient.rpc(
          "obtener_slots_disponibles",
          {
            p_id_barbero: idBarbero,
            p_fecha: fecha,
            p_duracion: duracion,
          }
        );

        if (queryError) {
          throw queryError;
        }

        return data || [];
      } catch (err) {
        console.error("Error fetching available slots:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [supabaseClient]
  );

  // Obtener bloques de no disponibilidad de un barbero
  const getBloquesDisponibilidad = useCallback(
    async (idBarbero: string): Promise<BloqueDisponibilidad[]> => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabaseClient
          .from("disponibilidad")
          .select("*")
          .eq("id_barbero", idBarbero)
          .order("fecha_inicio", { ascending: true });

        if (queryError) {
          throw queryError;
        }

        return data || [];
      } catch (err) {
        console.error("Error fetching availability blocks:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [supabaseClient]
  );

  // Crear un bloque de no disponibilidad (descanso, vacaciones, etc.)
  const crearBloqueDisponibilidad = useCallback(
    async (
      bloque: Omit<BloqueDisponibilidad, "id_disponibilidad" | "created_at">
    ) => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabaseClient
          .from("disponibilidad")
          .insert([bloque])
          .select()
          .single();

        if (queryError) {
          throw queryError;
        }

        return data;
      } catch (err) {
        console.error("Error creating availability block:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [supabaseClient]
  );

  // Eliminar un bloque de disponibilidad
  const eliminarBloqueDisponibilidad = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const { error: queryError } = await supabaseClient
          .from("disponibilidad")
          .delete()
          .eq("id_disponibilidad", id);

        if (queryError) {
          throw queryError;
        }
      } catch (err) {
        console.error("Error deleting availability block:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [supabaseClient]
  );

  // Verificar si un barbero está disponible en un horario específico
  const verificarDisponibilidad = useCallback(
    async (
      idBarbero: string,
      fecha: string,
      horaInicio: string,
      horaFin: string
    ): Promise<boolean> => {
      try {
        // Verificar que no hay reservas en ese horario
        const { data: reservas, error: reservasError } = await supabaseClient
          .from("reservas")
          .select("id_reserva")
          .eq("id_barbero", idBarbero)
          .eq("fecha_reserva", fecha)
          .not("estado", "in", "(cancelada,no_show)")
          .gte("hora_fin", horaInicio)
          .lte("hora_inicio", horaFin);

        if (reservasError) {
          throw reservasError;
        }

        if (reservas && reservas.length > 0) {
          return false; // Hay conflicto con reservas existentes
        }

        // Verificar que no hay bloques de no disponibilidad
        const fechaHoraInicio = `${fecha} ${horaInicio}`;
        const fechaHoraFin = `${fecha} ${horaFin}`;

        const { data: bloques, error: bloquesError } = await supabaseClient
          .from("disponibilidad")
          .select("id_disponibilidad")
          .eq("id_barbero", idBarbero)
          .in("tipo", ["descanso", "vacaciones", "bloqueado"])
          .lte("fecha_inicio", fechaHoraFin)
          .gte("fecha_fin", fechaHoraInicio);

        if (bloquesError) {
          throw bloquesError;
        }

        return !bloques || bloques.length === 0;
      } catch (err) {
        console.error("Error verifying availability:", err);
        return false;
      }
    },
    [supabaseClient]
  );

  // Generar slots de tiempo para mostrar en el calendario
  const generarSlots = useCallback(
    (
      horaInicio: string = "09:00",
      horaFin: string = "18:00",
      intervalo: number = 30
    ): string[] => {
      const slots: string[] = [];
      const inicio = new Date(`2000-01-01 ${horaInicio}`);
      const fin = new Date(`2000-01-01 ${horaFin}`);

      let actual = new Date(inicio);

      while (actual < fin) {
        slots.push(actual.toTimeString().slice(0, 5)); // HH:MM
        actual.setMinutes(actual.getMinutes() + intervalo);
      }

      return slots;
    },
    []
  );

  // Obtener el próximo slot disponible para un barbero
  const getProximoSlotDisponible = useCallback(
    async (
      idBarbero: string,
      duracion: number = 60,
      diasAdelante: number = 7
    ) => {
      const hoy = new Date();

      for (let i = 0; i < diasAdelante; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() + i);
        const fechaStr = fecha.toISOString().split("T")[0];

        const slots = await getSlotsDisponibles(idBarbero, fechaStr, duracion);
        const disponibles = slots.filter((slot) => slot.disponible);

        if (disponibles.length > 0) {
          return {
            fecha: fechaStr,
            hora: disponibles[0].hora_inicio,
          };
        }
      }

      return null; // No hay slots disponibles en los próximos días
    },
    [getSlotsDisponibles]
  );

  return {
    loading,
    error,
    getSlotsDisponibles,
    getBloquesDisponibilidad,
    crearBloqueDisponibilidad,
    eliminarBloqueDisponibilidad,
    verificarDisponibilidad,
    generarSlots,
    getProximoSlotDisponible,
  };
}
