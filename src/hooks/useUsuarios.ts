import { useState, useEffect } from "react";
import { supabaseClient } from "../lib/supabaseClient";

export interface Usuario {
  id_usuario: string;
  nombre: string;
  email: string;
  telefono?: string;
  fecha_registro: string;
  rol: "cliente" | "barbero" | "admin";
  activo: boolean;
  avatar_url?: string;
  configuracion: any;
  created_at: string;
  updated_at: string;
}

export interface CrearUsuarioData {
  nombre: string;
  email: string;
  telefono?: string;
  rol: "cliente" | "barbero" | "admin";
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async (rol?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient.from("usuarios").select("*");

      if (rol) {
        query = query.eq("rol", rol);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setUsuarios(data || []);
    } catch (err) {
      console.error("Error fetching usuarios:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getUsuarioById = async (id: string): Promise<Usuario | null> => {
    try {
      const { data, error: queryError } = await supabaseClient
        .from("usuarios")
        .select("*")
        .eq("id_usuario", id)
        .single();

      if (queryError) {
        throw queryError;
      }

      return data;
    } catch (err) {
      console.error("Error fetching usuario by ID:", err);
      return null;
    }
  };

  const crearUsuario = async (
    usuarioData: CrearUsuarioData
  ): Promise<Usuario> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabaseClient
        .from("usuarios")
        .insert([usuarioData])
        .select()
        .single();

      if (queryError) {
        throw queryError;
      }

      // Actualizar la lista local
      await fetchUsuarios();

      return data;
    } catch (err) {
      console.error("Error creating usuario:", err);
      setError(err instanceof Error ? err.message : "Error creando usuario");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarUsuario = async (
    id: string,
    updates: Partial<Usuario>
  ): Promise<Usuario> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabaseClient
        .from("usuarios")
        .update(updates)
        .eq("id_usuario", id)
        .select()
        .single();

      if (queryError) {
        throw queryError;
      }

      // Actualizar la lista local
      await fetchUsuarios();

      return data;
    } catch (err) {
      console.error("Error updating usuario:", err);
      setError(
        err instanceof Error ? err.message : "Error actualizando usuario"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const desactivarUsuario = async (id: string) => {
    return await actualizarUsuario(id, { activo: false });
  };

  const activarUsuario = async (id: string) => {
    return await actualizarUsuario(id, { activo: true });
  };

  // Buscar usuario por email (para login)
  const buscarPorEmail = async (email: string): Promise<Usuario | null> => {
    try {
      const { data, error: queryError } = await supabaseClient
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .eq("activo", true)
        .single();

      if (queryError) {
        if (queryError.code === "PGRST116") {
          // No se encontró el usuario
          return null;
        }
        throw queryError;
      }

      return data;
    } catch (err) {
      console.error("Error searching user by email:", err);
      return null;
    }
  };

  // Obtener clientes para formularios
  const getClientes = () => {
    return usuarios.filter(
      (usuario) => usuario.rol === "cliente" && usuario.activo
    );
  };

  // Obtener barberos para formularios
  const getBarberos = () => {
    return usuarios.filter(
      (usuario) => usuario.rol === "barbero" && usuario.activo
    );
  };

  // Obtener admins
  const getAdmins = () => {
    return usuarios.filter(
      (usuario) => usuario.rol === "admin" && usuario.activo
    );
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    error,
    refetch: fetchUsuarios,
    getUsuarioById,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario,
    activarUsuario,
    buscarPorEmail,
    getClientes,
    getBarberos,
    getAdmins,
  };
}
