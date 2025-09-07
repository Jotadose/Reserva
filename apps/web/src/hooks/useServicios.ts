import { useState, useEffect } from "react";

export interface Servicio {
  id_servicio: string;
  nombre: string;
  descripcion?: string;
  precio: number; // En centavos
  duracion: number; // En minutos
  categoria?: string;
  activo: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export function useServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      setError(null);

      const resp = await fetch("/api/servicios?activo=true");
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error obteniendo servicios");
      }

      const list = json.data || [];
      console.log("🛠️ Servicios cargados (API):", list.length);
      setServicios(list);
    } catch (err) {
      console.error("Error fetching servicios:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getServicioById = async (id: string) => {
    try {
      const resp = await fetch(`/api/servicios/${id}`);
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error obteniendo servicio");
      }

      return json.data as Servicio;
    } catch (err) {
      console.error("Error fetching servicio by ID:", err);
      return null;
    }
  };

  const getServiciosPorCategoria = (categoria: string) => {
    return servicios.filter(
      (servicio) => servicio.categoria === categoria && servicio.activo
    );
  };

  const getCategorias = () => {
    const categorias = [
      ...new Set(servicios.map((s) => s.categoria).filter(Boolean)),
    ];
    return categorias;
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(precio); // Price is already in pesos chilenos
  };

  const formatearDuracion = (duracion: number) => {
    if (duracion < 60) {
      return `${duracion} min`;
    }
    const horas = Math.floor(duracion / 60);
    const minutos = duracion % 60;
    if (minutos === 0) {
      return `${horas}h`;
    }
    return `${horas}h ${minutos}min`;
  };

  // Crear un nuevo servicio (solo admin)
  const crearServicio = async (
    servicio: Omit<Servicio, "id_servicio" | "created_at" | "updated_at">
  ) => {
    try {
      const resp = await fetch("/api/servicios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(servicio),
      });
      
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error creando servicio");
      }

      // Actualizar la lista local
      await fetchServicios();
      return json.data;
    } catch (err) {
      console.error("Error creating servicio:", err);
      throw err;
    }
  };

  // Actualizar un servicio (solo admin)
  const actualizarServicio = async (id: string, updates: Partial<Servicio>) => {
    try {
      const resp = await fetch(`/api/servicios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error actualizando servicio");
      }

      // Actualizar la lista local
      await fetchServicios();
      return json.data;
    } catch (err) {
      console.error("Error updating servicio:", err);
      throw err;
    }
  };

  // Desactivar un servicio (solo admin)
  const desactivarServicio = async (id: string) => {
    try {
      const resp = await fetch(`/api/servicios/${id}`, {
        method: "DELETE",
      });
      
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error desactivando servicio");
      }

      // Actualizar la lista local
      await fetchServicios();
    } catch (err) {
      console.error("Error deactivating servicio:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  return {
    servicios,
    loading,
    error,
    refetch: fetchServicios,
    getServicioById,
    getServiciosPorCategoria,
    getCategorias,
    formatearPrecio,
    formatearDuracion,
    crearServicio,
    actualizarServicio,
    desactivarServicio,
  };
}
