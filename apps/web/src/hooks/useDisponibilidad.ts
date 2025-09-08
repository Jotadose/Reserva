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

        // Primero obtener información del barbero y sus horarios
        const { data: barberoData, error: barberoError } = await supabaseClient
          .from("usuarios")
          .select(`
            id_usuario,
            nombre,
            barberos (
              horario_inicio,
              horario_fin,
              dias_trabajo,
              tiempo_descanso
            )
          `)
          .eq("id_usuario", idBarbero)
          .eq("rol", "barbero")
          .eq("activo", true)
          .single();

        if (barberoError || !barberoData || !(barberoData as any).barberos) {
          throw new Error("Barbero no encontrado o inactivo");
        }

        const horarios = (barberoData as any).barberos;
        
        // Verificar si el barbero trabaja en este día
        // Verificar día de trabajo - Usar forma segura para evitar problemas de zona horaria
        const [year, month, day] = fecha.split('-').map(Number);
        const fechaObj = new Date(year, month - 1, day); // month es 0-indexed
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaActual = diasSemana[fechaObj.getDay()];
        
        console.log(`🗓️ Hook - Fecha: ${fecha}, Día calculado: ${diaActual} (getDay: ${fechaObj.getDay()})`);
        console.log(`🗂️ Hook - Días trabajo barbero: ${JSON.stringify(horarios.dias_trabajo)}`);
        
        if (!horarios.dias_trabajo.includes(diaActual)) {
          console.log(`Barbero no trabaja los ${diaActual}s`);
          return [];
        }

        // Generar slots basados en horarios del barbero
        const slots: SlotDisponible[] = [];
        const horaInicio = horarios.horario_inicio; // "08:00:00"
        const horaFin = horarios.horario_fin; // "17:00:00"
        
        const [horaIni, minIni] = horaInicio.split(':').map(Number);
        const [horaEnd, minEnd] = horaFin.split(':').map(Number);
        
        const tiempoDescanso = horarios.tiempo_descanso || 10; // minutos
        
        // En lugar de usar intervalos fijos basados en el servicio actual,
        // generar slots cada 10-15 minutos para máxima flexibilidad
        // y filtrar según reservas existentes y duración requerida
        const intervaloBase = 15; // Generar slots cada 15 minutos
        
        // Generar slots con intervalo pequeño para máxima flexibilidad
        let horaActual = horaIni * 60 + minIni; // convertir a minutos
        const horaLimite = horaEnd * 60 + minEnd;
        
        // Solo generar slots si el servicio completo cabe en el horario
        while (horaActual + duracion <= horaLimite) {
          const horas = Math.floor(horaActual / 60);
          const minutos = horaActual % 60;
          const horaSlot = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
          
          const horasFin = Math.floor((horaActual + duracion) / 60);
          const minutosFin = (horaActual + duracion) % 60;
          const horaFinSlot = `${horasFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`;
          
          slots.push({
            hora_inicio: horaSlot,
            hora_fin: horaFinSlot,
            disponible: true // Por defecto disponible, se verificará con reservas existentes
          });
          
          // Avanzar con intervalo pequeño para máxima flexibilidad
          horaActual += intervaloBase;
        }

        // Obtener reservas existentes para filtrar slots ocupados
        const { data: reservas, error: reservasError } = await supabaseClient
          .from("reservas")
          .select("hora_inicio, hora_fin")
          .eq("id_barbero", idBarbero)
          .eq("fecha_reserva", fecha)
          .in("estado", ["pendiente", "confirmada", "en_progreso"]);

        if (reservasError) {
          console.warn("Error obteniendo reservas:", reservasError);
        }

        // Marcar slots como no disponibles si hay conflictos o no hay tiempo de descanso suficiente
        const slotsDisponibles = slots.map(slot => {
          const tieneConflicto = reservas?.some((reserva: any) => {
            const slotStart = slot.hora_inicio;
            const slotEnd = slot.hora_fin;
            const reservaStart = reserva.hora_inicio;
            const reservaEnd = reserva.hora_fin;
            
            // Convertir horas a minutos para cálculos más precisos
            const slotStartMin = timeToMinutes(slotStart);
            const slotEndMin = timeToMinutes(slotEnd);
            const reservaStartMin = timeToMinutes(reservaStart);
            const reservaEndMin = timeToMinutes(reservaEnd);
            
            // Verificar solapamiento directo
            const solapamientoDirecto = (
              (slotStartMin >= reservaStartMin && slotStartMin < reservaEndMin) ||
              (slotEndMin > reservaStartMin && slotEndMin <= reservaEndMin) ||
              (slotStartMin <= reservaStartMin && slotEndMin >= reservaEndMin)
            );
            
            // Verificar si hay tiempo suficiente de descanso entre citas
            const tiempoDescanso = horarios.tiempo_descanso || 10;
            const demasiadoCerca = (
              // Slot muy cerca después de una reserva existente
              (slotStartMin >= reservaEndMin && slotStartMin < reservaEndMin + tiempoDescanso) ||
              // Slot muy cerca antes de una reserva existente  
              (slotEndMin <= reservaStartMin && slotEndMin > reservaStartMin - tiempoDescanso)
            );
            
            return solapamientoDirecto || demasiadoCerca;
          });
          
          return {
            ...slot,
            disponible: !tieneConflicto
          };
        });

        // Función helper para convertir HH:MM a minutos
        function timeToMinutes(timeStr: string): number {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        }

        const slotsFinalesDisponibles = slotsDisponibles.filter(slot => slot.disponible);
        
        console.log(`📅 Slots para ${(barberoData as any).nombre} (${fecha}):`, {
          horarioLaboral: `${horaInicio}-${horaFin}`,
          servicioMinutos: duracion,
          intervaloBase: intervaloBase,
          slotsGenerados: slots.length,
          slotsDisponibles: slotsFinalesDisponibles.length,
          reservasExistentes: reservas?.length || 0
        });

        // Si no hay slots disponibles, retornar array vacío con mensaje en consola
        if (slotsFinalesDisponibles.length === 0) {
          console.log(`⚠️ No hay slots disponibles para ${(barberoData as any).nombre} el ${fecha} - servicio de ${duracion}min no cabe en horario o está ocupado`);
        }

        return slotsFinalesDisponibles;
        
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
