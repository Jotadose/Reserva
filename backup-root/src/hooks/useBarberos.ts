import { useState, useEffect } from "react";
import { supabaseClient } from "../lib/supabaseClient";

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

      // First get barberos data
      const { data: barberosData, error: barberosError } = await supabaseClient
        .from("barberos")
        .select("*")
        .eq("activo", true);

      if (barberosError) {
        throw barberosError;
      }

      // Then get usuarios data for these barberos
      const barberoIds = barberosData?.map((b) => b.id_barbero) || [];

      const { data: usuariosData, error: usuariosError } = await supabaseClient
        .from("usuarios")
        .select("id_usuario, nombre, email, telefono, avatar_url")
        .in("id_usuario", barberoIds);

      if (usuariosError) {
        throw usuariosError;
      }

      // Join the data
      const barberosJoined =
        barberosData?.map((barbero: any) => {
          const usuario = usuariosData?.find(
            (u) => u.id_usuario === barbero.id_barbero
          );
          return {
            id_barbero: barbero.id_barbero,
            nombre: usuario?.nombre || "Usuario desconocido",
            email: usuario?.email || "",
            telefono: usuario?.telefono,
            avatar_url: usuario?.avatar_url,
            especialidades: barbero.especialidades || [],
            horario_inicio: barbero.horario_inicio || "09:00",
            horario_fin: barbero.horario_fin || "18:00",
            dias_trabajo: barbero.dias_trabajo || [],
            tiempo_descanso: barbero.tiempo_descanso || 10,
            activo: barbero.activo ?? true,
            biografia: barbero.biografia,
            calificacion_promedio: barbero.calificacion_promedio || 0,
            total_cortes: barbero.total_cortes || 0,
          };
        }) || [];

      setBarberos(barberosJoined);
    } catch (err) {
      console.error("Error fetching barberos:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getBarberoById = async (id: string) => {
    try {
      const { data, error: queryError } = await supabaseClient
        .from("usuarios")
        .select(
          `
          id_usuario,
          nombre,
          email,
          telefono,
          avatar_url,
          barberos (
            id_barbero,
            especialidades,
            horario_inicio,
            horario_fin,
            dias_trabajo,
            tiempo_descanso,
            activo,
            biografia,
            calificacion_promedio,
            total_cortes
          )
        `
        )
        .eq("id_usuario", id)
        .eq("rol", "barbero")
        .single();

      if (queryError) {
        throw queryError;
      }

      if (!data) {
        return null;
      }

      return {
        id_barbero: data.id_usuario,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        avatar_url: data.avatar_url,
        especialidades: data.barberos?.especialidades || [],
        horario_inicio: data.barberos?.horario_inicio || "09:00",
        horario_fin: data.barberos?.horario_fin || "18:00",
        dias_trabajo: data.barberos?.dias_trabajo || [],
        tiempo_descanso: data.barberos?.tiempo_descanso || 10,
        activo: data.barberos?.activo ?? true,
        biografia: data.barberos?.biografia,
        calificacion_promedio: data.barberos?.calificacion_promedio || 0,
        total_cortes: data.barberos?.total_cortes || 0,
      } as Barbero;
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
