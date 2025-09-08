import { useState, useEffect, useCallback, useRef } from 'react';

// Tipos para la respuesta de la API
interface AvailableDay {
  day: number;
  date: string;
  slotsCount: number;
  firstSlot: string;
  lastSlot: string;
}

interface UnavailableDay {
  day: number;
  date: string;
  reason: 'past' | 'not_working_day' | 'blocked' | 'no_slots';
}

interface CalendarAvailability {
  barberoId: number;
  serviceId: number;
  month: number;
  year: number;
  availableDays: AvailableDay[];
  unavailableDays: UnavailableDay[];
  totalDays: number;
  workingDays: string[];
  processingTime: number;
}

/**
 * Hook ULTRA-OPTIMIZADO para disponibilidad de calendario
 * - 1 sola llamada al backend por mes
 * - Cache inteligente
 * - Respuesta instantánea
 */
export const useCalendarAvailability = () => {
  const [availability, setAvailability] = useState<CalendarAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache ultra-eficiente
  const cache = useRef(new Map<string, CalendarAvailability>());
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMonthAvailability = useCallback(async (barberoId: number, serviceId: number, year: number, month: number) => {
    if (!barberoId || !serviceId || !year || !month) {
      setAvailability(null);
      return;
    }

    const cacheKey = `${barberoId}-${serviceId}-${year}-${month}`;
    
    // ⚡ CACHE HIT - Respuesta instantánea
    if (cache.current.has(cacheKey)) {
      console.log('🎯 CACHE HIT - Respuesta instantánea');
      setAvailability(cache.current.get(cacheKey)!);
      return;
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Fetching ULTRA-FAST calendar data...');
      const startTime = Date.now();

      const response = await fetch(
        `/api/consolidated?type=disponibilidad&action=month&barberoId=${barberoId}&serviceId=${serviceId}&year=${year}&month=${month}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CalendarAvailability = await response.json();
      const fetchTime = Date.now() - startTime;
      
      console.log(`✅ ULTRA-FAST Response: ${fetchTime}ms (Backend: ${data.processingTime}ms)`);
      console.log(`📊 Available days: ${data.availableDays.length}/${data.totalDays}`);

      // Guardar en cache
      cache.current.set(cacheKey, data);
      setAvailability(data);

    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('❌ Calendar availability error:', err);
        setError(err.message);
        setAvailability(null);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  // Limpiar cache cuando sea necesario
  const clearCache = useCallback(() => {
    console.log('🗑️ Clearing calendar cache');
    cache.current.clear();
  }, []);

  // Obtener días disponibles como Set para O(1) lookup
  const getAvailableDaysSet = useCallback(() => {
    if (!availability) return new Set<string>();
    
    return new Set(
      availability.availableDays.map(day => day.date)
    );
  }, [availability]);

  // Verificar si una fecha específica está disponible
  const isDateAvailable = useCallback((dateString: string) => {
    if (!availability) return false;
    
    return availability.availableDays.some(day => day.date === dateString);
  }, [availability]);

  // Obtener slots para una fecha específica (desde cache)
  const getSlotsForDate = useCallback((dateString: string) => {
    if (!availability) return [];
    
    const dayData = availability.availableDays.find(day => day.date === dateString);
    return dayData ? [dayData.firstSlot, dayData.lastSlot] : [];
  }, [availability]);

  // Stats útiles
  const getStats = useCallback(() => {
    if (!availability) return null;
    
    return {
      totalDays: availability.totalDays,
      availableDays: availability.availableDays.length,
      unavailableDays: availability.unavailableDays.length,
      availabilityRate: ((availability.availableDays.length / availability.totalDays) * 100).toFixed(1),
      processingTime: availability.processingTime,
      workingDays: availability.workingDays
    };
  }, [availability]);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Data
    availability,
    isLoading,
    error,
    
    // Actions
    fetchMonthAvailability,
    clearCache,
    
    // Helpers
    getAvailableDaysSet,
    isDateAvailable,
    getSlotsForDate,
    getStats,
    
    // Cache info
    cacheSize: cache.current.size
  };
};
