import { useState, useEffect } from "react";

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
  activo?: boolean; // Campo opcional con default true en DB
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async (rol?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (rol) params.set("rol", rol);
      const qs = params.toString();
      const url = qs ? `/api/consolidated?type=usuarios&${qs}` : "/api/consolidated?type=usuarios";
      
      const resp = await fetch(url);
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error obteniendo usuarios");
      }

      const list = json.data || [];
      console.log("👥 Usuarios cargados (API):", list.length);
      setUsuarios(list);
    } catch (err) {
      console.error("Error fetching usuarios:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getUsuarioById = async (id: string): Promise<Usuario | null> => {
    try {
      const resp = await fetch(`/api/consolidated?type=usuarios&id=${id}`);
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error obteniendo usuario");
      }

      return json.data;
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

      const resp = await fetch("/api/consolidated?type=usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuarioData),
      });
      
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error creando usuario");
      }

      // Actualizar la lista local
      await fetchUsuarios();

      return json.data;
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

      const resp = await fetch(`/api/consolidated?type=usuarios&id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      
      const json = await resp.json();
      
      if (!resp.ok) {
        throw new Error(json.error || "Error actualizando usuario");
      }

      // Actualizar la lista local
      await fetchUsuarios();

      return json.data;
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
      const resp = await fetch(`/api/consolidated?type=usuarios&email=${encodeURIComponent(email)}&activo=true`);
      const json = await resp.json();
      
      if (!resp.ok) {
        if (resp.status === 404) {
          // No se encontró el usuario
          return null;
        }
        throw new Error(json.error || "Error buscando usuario");
      }

      const usuarios = json.data || [];
      return usuarios.length > 0 ? usuarios[0] : null;
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
