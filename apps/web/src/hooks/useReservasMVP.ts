import { useState, useEffect } from "react";

export interface ReservaMVP {
  id_reserva: string;
  id_cliente: string;
  id_barbero: string;
  id_servicio: string; // servicio primario
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
  servicios_json?: Array<{
    id_servicio: string;
    duracion: number;
    precio: number;
  }>;
}

export interface CrearReservaData {
  id_cliente: string;
  id_barbero: string;
  fecha_reserva: string;
  hora_inicio: string;
  notas_cliente?: string;
  id_servicio: string;
}

export interface VerificarDisponibilidadData {
  id_barbero: string;
  fecha: string;
  hora: string;
  id_servicio: string;
}

export function useReservasMVP() {
  const [reservas, setReservas] = useState<ReservaMVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async (filtros?: {
    barbero?: string;
    fecha?: string; // mapped to ?fecha= en API
    estado?: string;
    cliente?: string;
    incluir_eliminadas?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filtros?.barbero) params.set("barbero", filtros.barbero);
      if (filtros?.fecha) params.set("fecha", filtros.fecha);
      if (filtros?.estado) params.set("estado", filtros.estado);
      if (filtros?.cliente) params.set("cliente", filtros.cliente);
      if (filtros?.incluir_eliminadas) params.set("incluir_eliminadas", "true");
      const qs = params.toString();
      const url = qs ? `/api/consolidated?type=reservas&${qs}` : "/api/consolidated?type=reservas";
      const resp = await fetch(url);
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Error obteniendo reservas");
      const list = json.data || [];
      console.log("📋 Reservas cargadas (API):", list.length);
      setReservas(list);
    } catch (err) {
      console.error("Error fetching reservas (API):", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getReservaById = async (id: string): Promise<ReservaMVP | null> => {
    try {
      const resp = await fetch(`/api/consolidated?type=reservas&id=${id}`);
      const json = await resp.json();
      
      if (!resp.ok) {
        if (resp.status === 404) {
          return null;
        }
        throw new Error(json.error || "Error obteniendo reserva");
      }

      return json.data as ReservaMVP;
    } catch (err) {
      console.error("Error fetching reserva by ID:", err);
      return null;
    }
  };

  const verificarDisponibilidad = async (
    params: VerificarDisponibilidadData
  ): Promise<{ esDisponible: boolean; mensaje?: string }> => {
    try {
      const queryParams = new URLSearchParams({
        barberId: params.id_barbero,
        date: params.fecha,
        startTime: params.hora,
        serviceId: params.id_servicio,
      });

      const resp = await fetch(`/api/consolidated?type=disponibilidad&action=check&${queryParams}`);
      
      // Check if response is HTML (authentication error)
      const contentType = resp.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('🔒 API devolvió HTML en lugar de JSON - posible error de autenticación');
        throw new Error('Error de autenticación en el servidor. Por favor, contacta al administrador.');
      }
      
      let json;
      try {
        json = await resp.json();
      } catch (parseError) {
        console.error('❌ Error al parsear respuesta JSON:', parseError);
        throw new Error('El servidor devolvió una respuesta inválida. Por favor, intenta nuevamente.');
      }

      if (!resp.ok) {
        if (resp.status === 409) {
          // 409 Conflict is a good status for "slot taken"
          return {
            esDisponible: false,
            mensaje:
              json.message ||
              "El horario seleccionado ya no está disponible. Por favor, elige otro.",
          };
        }
        throw new Error(
          json.error ||
            json.message ||
            "Error al verificar disponibilidad del servidor."
        );
      }

      return { esDisponible: true, ...json };
    } catch (err) {
      console.error("Error al verificar disponibilidad (API):", err);
      // Re-throw so the UI can display a generic error toast
      throw err;
    }
  };

  const crearReserva = async (
    reservaData: CrearReservaData
  ): Promise<ReservaMVP> => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch("/api/consolidated?type=reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaData),
      });
      
      // Check if response is HTML (authentication error)
      const contentType = resp.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('🔒 API devolvió HTML en lugar de JSON - posible error de autenticación');
        throw new Error('Error de autenticación en el servidor. Por favor, contacta al administrador.');
      }
      
      let json;
      try {
        json = await resp.json();
      } catch (parseError) {
        console.error('❌ Error al parsear respuesta JSON:', parseError);
        throw new Error('El servidor devolvió una respuesta inválida. Por favor, intenta nuevamente.');
      }
      
      if (!resp.ok)
        throw new Error(json.error || json.message || "Error creando reserva");
      const created: ReservaMVP = json.data;
      // Optimistic append then refresh (ensures ordering logic from API if changed later)
      setReservas((prev) => [created, ...prev]);
      // Refresh in background (no await to keep UX snappy)
      fetchReservas();
      return created;
    } catch (err) {
      console.error("Error creating reserva (API):", err);
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
      const resp = await fetch(`/api/consolidated?type=reservas&id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await resp.json();
      if (!resp.ok)
        throw new Error(
          json.error || json.message || "Error actualizando reserva"
        );
      const updated: ReservaMVP = json.data;
      setReservas((prev) =>
        prev.map((r) => (r.id_reserva === id ? updated : r))
      );
      return updated;
    } catch (err) {
      console.error("Error updating reserva (API):", err);
      setError(
        err instanceof Error ? err.message : "Error actualizando reserva"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (id: string, motivo?: string) =>
    actualizarReserva(id, {
      estado: "cancelada",
      motivo_cancelacion: motivo,
      cancelada_at: new Date().toISOString(),
    });

  const completarReserva = async (id: string, notas_internas?: string) =>
    actualizarReserva(id, {
      estado: "completada",
      notas_internas,
      completada_at: new Date().toISOString(),
    });

  const marcarEnProgreso = async (id: string) =>
    actualizarReserva(id, { estado: "en_progreso" });

  const marcarNoShow = async (id: string) =>
    actualizarReserva(id, { estado: "no_show" });

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
      setError(null);

      const params = new URLSearchParams();
      params.set("fecha_inicio", fechaInicio);
      params.set("fecha_fin", fechaFin);
      if (idBarbero) {
        params.set("barbero", idBarbero);
      }

      const resp = await fetch(`/api/consolidated?type=reservas&${params.toString()}`);
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error obteniendo reservas por rango");
      }

      const list = json.data || [];
      console.log("📅 Reservas por rango cargadas (API):", list.length);
      setReservas(list);
    } catch (err) {
      console.error("Error fetching reservas by range:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear precio
  const formatearPrecio = (precio: number) => {
    // Los precios en la BD están en centavos (ej: 10000 para $10.000 CLP)
    // Intl.NumberFormat para CLP no maneja centavos.
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(precio);
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
    verificarDisponibilidad,
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
