import { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

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

      const { data, error: queryError } = await supabaseClient
        .from('servicios')
        .select('*')
        .eq('activo', true)
        .order('categoria', { ascending: true })
        .order('precio', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      setServicios(data || []);
    } catch (err) {
      console.error('Error fetching servicios:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getServicioById = async (id: string) => {
    try {
      const { data, error: queryError } = await supabaseClient
        .from('servicios')
        .select('*')
        .eq('id_servicio', id)
        .single();

      if (queryError) {
        throw queryError;
      }

      return data as Servicio;
    } catch (err) {
      console.error('Error fetching servicio by ID:', err);
      return null;
    }
  };

  const getServiciosPorCategoria = (categoria: string) => {
    return servicios.filter(servicio => 
      servicio.categoria === categoria && servicio.activo
    );
  };

  const getCategorias = () => {
    const categorias = [...new Set(servicios.map(s => s.categoria).filter(Boolean))];
    return categorias;
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio); // Price is already in pesos, not centavos
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
  const crearServicio = async (servicio: Omit<Servicio, 'id_servicio' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: queryError } = await supabaseClient
        .from('servicios')
        .insert([servicio])
        .select()
        .single();

      if (queryError) {
        throw queryError;
      }

      // Actualizar la lista local
      await fetchServicios();
      return data;
    } catch (err) {
      console.error('Error creating servicio:', err);
      throw err;
    }
  };

  // Actualizar un servicio (solo admin)
  const actualizarServicio = async (id: string, updates: Partial<Servicio>) => {
    try {
      const { data, error: queryError } = await supabaseClient
        .from('servicios')
        .update(updates)
        .eq('id_servicio', id)
        .select()
        .single();

      if (queryError) {
        throw queryError;
      }

      // Actualizar la lista local
      await fetchServicios();
      return data;
    } catch (err) {
      console.error('Error updating servicio:', err);
      throw err;
    }
  };

  // Desactivar un servicio (solo admin)
  const desactivarServicio = async (id: string) => {
    try {
      const { error: queryError } = await supabaseClient
        .from('servicios')
        .update({ activo: false })
        .eq('id_servicio', id);

      if (queryError) {
        throw queryError;
      }

      // Actualizar la lista local
      await fetchServicios();
    } catch (err) {
      console.error('Error deactivating servicio:', err);
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
    desactivarServicio
  };
}
