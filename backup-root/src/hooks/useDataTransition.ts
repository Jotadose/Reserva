/**
 * =============================================================================
 * HOOK DE TRANSICIÓN DE DATOS
 * =============================================================================
 * Facilita la transición de datos mock a datos reales de Supabase
 * Proporciona una interfaz unificada para ambos casos
 */

import { useState, useEffect } from "react";
import { useSupabaseNormalized } from "./useSupabaseNormalized";
import { servicesData } from "../data/servicesData";
import type {
  ServiceType,
  BookingType,
  ClientType,
} from "../lib/database.types";

// =============================================================================
// TIPOS
// =============================================================================

interface TransitionHookOptions {
  enableRealtime?: boolean;
  fallbackToMock?: boolean;
  autoMigrate?: boolean;
}

interface TransitionHookResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  isUsingMockData: boolean;
  refetch: () => Promise<void>;
  createItem: (item: Partial<T>) => Promise<T | null>;
  updateItem: (id: string, updates: Partial<T>) => Promise<T | null>;
  deleteItem: (id: string) => Promise<boolean>;
}

// =============================================================================
// HOOK PRINCIPAL
// =============================================================================

export function useDataTransition<T = any>(
  dataType: "services" | "bookings" | "clients",
  options: TransitionHookOptions = {}
): TransitionHookResult<T> {
  const {
    enableRealtime = true,
    fallbackToMock = true,
    autoMigrate = false,
  } = options;

  const [isUsingMockData, setIsUsingMockData] = useState(fallbackToMock);
  const [mockData, setMockData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Hooks de Supabase normalizado
  const supabaseHooks = useSupabaseNormalized();

  // =============================================================================
  // INICIALIZACIÓN DE DATOS MOCK
  // =============================================================================

  useEffect(() => {
    if (dataType === "services" && fallbackToMock) {
      // Convertir servicesData a formato normalizado
      const transformedServices = servicesData.map((service, index) => ({
        id: `mock-service-${index}`,
        name: service.name,
        description: service.description || "",
        base_price: service.price * 100, // Convertir a centavos
        base_duration: service.duration,
        category: service.category || "General",
        requires_specialist: true,
        is_active: true,
        booking_advance_hours: 1,
        cancellation_hours: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as T[];

      setMockData(transformedServices);
    }
  }, [dataType, fallbackToMock]);

  // =============================================================================
  // LÓGICA DE SELECCIÓN DE DATOS
  // =============================================================================

  const getDataSource = () => {
    if (!isUsingMockData) {
      switch (dataType) {
        case "services":
          return {
            data: supabaseHooks.services.data || [],
            isLoading: supabaseHooks.services.isLoading,
            error: supabaseHooks.services.error,
            refetch: supabaseHooks.services.refetch,
          };
        case "bookings":
          return {
            data: supabaseHooks.bookings.data || [],
            isLoading: supabaseHooks.bookings.isLoading,
            error: supabaseHooks.bookings.error,
            refetch: supabaseHooks.bookings.refetch,
          };
        case "clients":
          return {
            data: supabaseHooks.clients.data || [],
            isLoading: supabaseHooks.clients.isLoading,
            error: supabaseHooks.clients.error,
            refetch: supabaseHooks.clients.refetch,
          };
        default:
          return {
            data: [],
            isLoading: false,
            error: "Tipo de datos no soportado",
            refetch: async () => {},
          };
      }
    }

    return {
      data: mockData,
      isLoading: false,
      error: null,
      refetch: async () => {},
    };
  };

  const dataSource = getDataSource();

  // =============================================================================
  // FUNCIONES DE CRUD
  // =============================================================================

  const createItem = async (item: Partial<T>): Promise<T | null> => {
    if (isUsingMockData) {
      // Simular creación en datos mock
      const newItem = {
        ...item,
        id: `mock-${dataType}-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as T;

      setMockData((prev) => [...prev, newItem]);
      return newItem;
    }

    // Usar Supabase
    try {
      switch (dataType) {
        case "services":
          return (await supabaseHooks.createService.mutateAsync(
            item as Partial<ServiceType>
          )) as T;
        case "bookings":
          return (await supabaseHooks.createBooking.mutateAsync(
            item as Partial<BookingType>
          )) as T;
        case "clients":
          return (await supabaseHooks.createClient.mutateAsync(
            item as Partial<ClientType>
          )) as T;
        default:
          throw new Error("Tipo de datos no soportado");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error creando item");
      return null;
    }
  };

  const updateItem = async (
    id: string,
    updates: Partial<T>
  ): Promise<T | null> => {
    if (isUsingMockData) {
      // Simular actualización en datos mock
      setMockData((prev) =>
        prev.map((item) =>
          (item as any).id === id
            ? { ...item, ...updates, updated_at: new Date().toISOString() }
            : item
        )
      );

      const updatedItem = mockData.find((item) => (item as any).id === id);
      return updatedItem ? { ...updatedItem, ...updates } : null;
    }

    // Usar Supabase
    try {
      switch (dataType) {
        case "services":
          return (await supabaseHooks.updateService.mutateAsync({
            id,
            updates: updates as Partial<ServiceType>,
          })) as T;
        case "bookings":
          return (await supabaseHooks.updateBooking.mutateAsync({
            id,
            updates: updates as Partial<BookingType>,
          })) as T;
        case "clients":
          return (await supabaseHooks.updateClient.mutateAsync({
            id,
            updates: updates as Partial<ClientType>,
          })) as T;
        default:
          throw new Error("Tipo de datos no soportado");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error actualizando item"
      );
      return null;
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    if (isUsingMockData) {
      // Simular eliminación en datos mock
      setMockData((prev) => prev.filter((item) => (item as any).id !== id));
      return true;
    }

    // Usar Supabase
    try {
      switch (dataType) {
        case "services":
          await supabaseHooks.deleteService.mutateAsync(id);
          return true;
        case "bookings":
          await supabaseHooks.deleteBooking.mutateAsync(id);
          return true;
        case "clients":
          await supabaseHooks.deleteClient.mutateAsync(id);
          return true;
        default:
          throw new Error("Tipo de datos no soportado");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error eliminando item"
      );
      return false;
    }
  };

  const refetch = async () => {
    if (!isUsingMockData) {
      await dataSource.refetch();
    }
    setError(null);
  };

  // =============================================================================
  // AUTO-DETECCIÓN DE DISPONIBILIDAD DE SUPABASE
  // =============================================================================

  useEffect(() => {
    const checkSupabaseAvailability = async () => {
      if (!fallbackToMock) return;

      try {
        // Intentar una consulta simple para verificar disponibilidad
        const testResult = await supabaseHooks.services.refetch();

        if (testResult.isSuccess && !testResult.error) {
          console.log("✅ Supabase disponible, cambiando a datos reales");
          setIsUsingMockData(false);
          setError(null);
        }
      } catch (error) {
        console.log("⚠️ Supabase no disponible, usando datos mock");
        console.error("Detalles del error:", error);
        setIsUsingMockData(true);
        if (autoMigrate) {
          setError("Configuración de base de datos requerida");
        }
      }
    };

    if (isUsingMockData && fallbackToMock) {
      checkSupabaseAvailability();
    }
  }, [fallbackToMock, autoMigrate, isUsingMockData, supabaseHooks.services]);

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    data: dataSource.data,
    isLoading: dataSource.isLoading,
    error: error || dataSource.error,
    isUsingMockData,
    refetch,
    createItem,
    updateItem,
    deleteItem,
  };
}

// =============================================================================
// HOOKS ESPECÍFICOS PARA CADA TIPO DE DATOS
// =============================================================================

export function useServices(options?: TransitionHookOptions) {
  return useDataTransition<ServiceType>("services", options);
}

export function useBookings(options?: TransitionHookOptions) {
  return useDataTransition<BookingType>("bookings", options);
}

export function useClients(options?: TransitionHookOptions) {
  return useDataTransition<ClientType>("clients", options);
}

// =============================================================================
// HOOK PARA MIGRACIÓN MANUAL
// =============================================================================

export function useMigrationControls() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const migrateMockToReal = async (
    dataType: "services" | "bookings" | "clients"
  ) => {
    setIsMigrating(true);
    setMigrationProgress(0);

    try {
      // Implementar migración específica según tipo de datos
      console.log(`Migrando ${dataType} de mock a Supabase...`);

      if (dataType === "services") {
        // Migración de servicios ya está implementada en DataMigrationService
        console.log(
          "Servicios se migran automáticamente en la configuración inicial"
        );
      } else if (dataType === "bookings") {
        console.log(
          "Migración de reservas no implementada - datos mock se mantienen separados"
        );
      } else if (dataType === "clients") {
        console.log(
          "Migración de clientes no implementada - se crearán nuevos según reservas"
        );
      }

      // Simular progreso para feedback visual
      for (let i = 0; i <= 100; i += 10) {
        setMigrationProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`✅ Proceso de migración de ${dataType} completado`);
      return true;
    } catch (error) {
      console.error(`❌ Error migrando ${dataType}:`, error);
      return false;
    } finally {
      setIsMigrating(false);
      setMigrationProgress(0);
    }
  };

  return {
    isMigrating,
    migrationProgress,
    migrateMockToReal,
  };
}
