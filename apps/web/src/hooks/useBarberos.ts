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

      const resp = await fetch("/api/consolidated?type=barberos");
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error obteniendo barberos");
      }

      const rawData = json.data || [];
      console.log("💈 Datos brutos de barberos (API):", rawData.length);
      
      // Transformar datos de la API a la estructura esperada por la app
      const transformedBarberos: Barbero[] = rawData.map((item: any) => ({
        id_barbero: item.barberos?.id_barbero || item.id_usuario, // Usar el verdadero id_barbero si existe
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
      const resp = await fetch(`/api/consolidated?type=barberos&id=${id}`);
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

  // Crear un nuevo barbero (solo admin)
  const crearBarbero = async (barberoData: any) => {
    try {
      // Asegurar que los datos tienen la estructura correcta
      const payload = {
        nombre: barberoData.nombre,
        telefono: barberoData.telefono,
        email: barberoData.email,
        especialidades: barberoData.especialidades || [],
        horario_inicio: barberoData.horario_inicio || '09:00',
        horario_fin: barberoData.horario_fin || '18:00',
        dias_trabajo: barberoData.dias_trabajo || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
        tiempo_descanso: barberoData.tiempo_descanso || 15,
        activo: barberoData.activo !== false
      };
      
      console.log('🔧 Enviando datos de barbero:', payload);
      
      const resp = await fetch("/api/consolidated?type=barberos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const json = await resp.json();
      
      if (!resp.ok) {
        console.error('❌ Error de la API:', json);
        throw new Error(json.error || "Error creando barbero");
      }

      console.log('✅ Barbero creado exitosamente:', json);
      
      // Actualizar la lista local
      await fetchBarberos();
      return json.data;
    } catch (err) {
      console.error("Error creating barbero:", err);
      throw err;
    }
  };

  // Actualizar un barbero (solo admin)
  const actualizarBarbero = async (id: string, updates: any) => {
    try {
      const resp = await fetch(`/api/consolidated?type=barberos&id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error actualizando barbero");
      }

      // Actualizar la lista local
      await fetchBarberos();
      return json.data;
    } catch (err) {
      console.error("Error updating barbero:", err);
      throw err;
    }
  };

  // Eliminar un barbero (solo admin)
  const eliminarBarbero = async (id: string) => {
    try {
      const resp = await fetch(`/api/consolidated?type=barberos&id=${id}`, {
        method: "DELETE",
      });
      
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error eliminando barbero");
      }

      // Actualizar la lista local
      await fetchBarberos();
    } catch (err) {
      console.error("Error deleting barbero:", err);
      throw err;
    }
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
    crearBarbero,
    actualizarBarbero,
    eliminarBarbero,
  };
}
