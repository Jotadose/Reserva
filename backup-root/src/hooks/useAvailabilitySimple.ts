import { useState } from "react";

export interface AvailabilitySlot {
  time: string;
  available: boolean;
}

export function useAvailabilitySimple() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para verificar disponibilidad de un slot específico
  const checkAvailability = async (
    date: string,
    time: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Por ahora siempre devolvemos true (disponible)
      // En el futuro aquí se verificaría contra la base de datos
      return true;
    } catch (err) {
      console.error("Error checking availability:", err);
      setError(
        err instanceof Error ? err.message : "Error checking availability"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener todos los slots disponibles para una fecha
  const getAvailableSlots = async (
    date: string
  ): Promise<AvailabilitySlot[]> => {
    try {
      setLoading(true);
      setError(null);

      // Generar slots de 9:00 AM a 6:00 PM con intervalos de 30 minutos
      const slots: AvailabilitySlot[] = [];
      const startHour = 9;
      const endHour = 18;
      const interval = 30; // minutos

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          // Saltar horario de almuerzo (12:00 - 13:00)
          if (hour === 12) continue;

          const timeString = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;

          slots.push({
            time: timeString,
            available: true, // Por ahora todos están disponibles
          });
        }
      }

      return slots;
    } catch (err) {
      console.error("Error getting available slots:", err);
      setError(
        err instanceof Error ? err.message : "Error getting available slots"
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    checkAvailability,
    getAvailableSlots,
  };
}
