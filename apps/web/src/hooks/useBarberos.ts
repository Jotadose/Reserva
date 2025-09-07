import { useState, useEffect } from "react";

export interface Barbero {
  id_barbero: string;
  nombre: string;
  email: string;
  telefono?: string;
  especialidades: string[];
  horario_inicio: string;
  horario_fin: string;
  dias_trabajo: string[];
  tiempo_descanso: number;
  activo: boolean;
  biografia?: string;
  calificacion_promedio: number;
  total_cortes: number;
  avatar_url?: string;
}

export function useBarberos() {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBarberos = async () => {
    try {
      setLoading(true);
      setError(null);

      const resp = await fetch("/api/barberos?activo=true");
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error obteniendo barberos");
      }

      const list = json.data || [];
      console.log("💈 Barberos cargados (API):", list.length);
      setBarberos(list);
    } catch (err) {
      console.error("Error fetching barberos:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getBarberoById = async (id: string) => {
    try {
      const resp = await fetch(`/api/barberos/${id}`);
      const json = await resp.json();
      
      if (!resp.ok) {
        if (resp.status === 404) {
          return null;
        }
        throw new Error(json.error || "Error obteniendo barbero");
      }

      return json.data as Barbero;
    } catch (err) {
      console.error("Error fetching barbero by ID:", err);
      return null;
    }
  };

  const getBarberosPorEspecialidad = (especialidad: string) => {
    return barberos.filter(
      (barbero) =>
        barbero.especialidades.includes(especialidad) && barbero.activo
    );
  };

  const getBarberosDisponibles = (dia: string) => {
    return barberos.filter(
      (barbero) =>
        barbero.dias_trabajo.includes(dia.toLowerCase()) && barbero.activo
    );
  };

  useEffect(() => {
    fetchBarberos();
  }, []);

  return {
    barberos,
    loading,
    error,
    refetch: fetchBarberos,
    getBarberoById,
    getBarberosPorEspecialidad,
    getBarberosDisponibles,
  };
}
