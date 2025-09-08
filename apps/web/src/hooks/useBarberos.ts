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

      const resp = await fetch("/api/barberos");
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error obteniendo barberos");
      }

      const rawData = json.data || [];
      console.log("💈 Datos brutos de barberos (API):", rawData.length);
      
      // Transformar datos de la API a la estructura esperada por la app
      const transformedBarberos: Barbero[] = rawData.map((item: any) => ({
        id_barbero: item.id_usuario,
        nombre: item.nombre,
        email: item.email,
        telefono: item.telefono,
        especialidades: item.barberos?.especialidades || [],
        horario_inicio: item.barberos?.horario_inicio || "09:00:00",
        horario_fin: item.barberos?.horario_fin || "18:00:00",
        dias_trabajo: item.barberos?.dias_trabajo || [],
        tiempo_descanso: item.barberos?.tiempo_descanso || 10,
        activo: item.activo,
        biografia: item.barberos?.biografia || "",
        calificacion_promedio: item.barberos?.calificacion_promedio || 0,
        total_cortes: item.barberos?.total_cortes || 0,
        avatar_url: item.avatar_url,
      }));

      console.log("💈 Barberos transformados:", transformedBarberos.length);
      setBarberos(transformedBarberos);
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

      const item = json.data;
      if (!item) return null;

      // Transformar datos de la API a la estructura esperada
      const transformedBarbero: Barbero = {
        id_barbero: item.id_usuario,
        nombre: item.nombre,
        email: item.email,
        telefono: item.telefono,
        especialidades: item.barberos?.especialidades || [],
        horario_inicio: item.barberos?.horario_inicio || "09:00:00",
        horario_fin: item.barberos?.horario_fin || "18:00:00",
        dias_trabajo: item.barberos?.dias_trabajo || [],
        tiempo_descanso: item.barberos?.tiempo_descanso || 10,
        activo: item.activo,
        biografia: item.barberos?.biografia || "",
        calificacion_promedio: item.barberos?.calificacion_promedio || 0,
        total_cortes: item.barberos?.total_cortes || 0,
        avatar_url: item.avatar_url,
      };

      return transformedBarbero;
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
