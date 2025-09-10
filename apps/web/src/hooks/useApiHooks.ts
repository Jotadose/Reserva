/**
 * ===================================================================
 * HOOKS ACTUALIZADOS - ARQUITECTURA API INTERMEDIA
 * ===================================================================
 *
 * Hooks optimizados que utilizan la nueva capa de servicios API
 * Proporcionan mejor manejo de errores, loading states y cache
 */

import { useState, useEffect, useCallback } from "react";
import { reservasApi, serviciosApi, usuariosApi } from "../services/api";

// ===================================================================
// TIPOS UNIFICADOS
// ===================================================================

export interface Reserva {
  id_reserva: string;
  id_cliente: string;
  id_barbero: string;
  id_servicio: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  precio_total: number;
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

  // Relaciones (cuando se incluyen)
  cliente_info?: {
    nombre: string;
    email: string;
    telefono?: string;
  };
  barbero_info?: {
    nombre: string;
    email: string;
  };
  servicio_info?: {
    nombre: string;
    categoria: string;
    color: string;
    precio: number;
    duracion: number;
  };
}

export interface Servicio {
  id_servicio: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion: number;
  categoria?: string;
  activo: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id_usuario: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: "cliente" | "barbero" | "admin";
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// ===================================================================
// HOOK DE RESERVAS
// ===================================================================

export function useReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = useCallback(
    async (options?: {
      filters?: {
        id_barbero?: string;
        fecha_reserva?: string;
        estado?: string;
        id_cliente?: string;
      };
      includeRelations?: boolean;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await reservasApi.getAll({
          filters: options?.filters,
          includeRelations: options?.includeRelations ?? true,
        });

        if (response.success) {
          setReservas(response.data || []);
        } else {
          setError(response.error?.message || "Error al cargar reservas");
        }
      } catch (err: any) {
        setError(err.message || "Error de conexión");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getReservaById = useCallback(async (id: string) => {
    const response = await reservasApi.getById(id);
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error?.message || "Reserva no encontrada");
    }
  }, []);

  const crearReserva = useCallback(
    async (data: Partial<Reserva>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await reservasApi.create(data);

        if (response.success) {
          // Refrescar la lista
          await fetchReservas();
          return response.data;
        } else {
          const errorMsg = response.error?.message || "Error al crear reserva";
          setError(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err.message || "Error de conexión";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchReservas]
  );

  const actualizarReserva = useCallback(
    async (id: string, updates: Partial<Reserva>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await reservasApi.update(id, updates);

        if (response.success) {
          // Actualizar la lista local
          setReservas((prev) =>
            prev.map((r) =>
              r.id_reserva === id ? { ...r, ...response.data } : r
            )
          );
          return response.data;
        } else {
          const errorMsg =
            response.error?.message || "Error al actualizar reserva";
          setError(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err.message || "Error de conexión";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const eliminarReserva = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reservasApi.delete(id);

      if (response.success) {
        // Remover de la lista local
        setReservas((prev) => prev.filter((r) => r.id_reserva !== id));
        return true;
      } else {
        const errorMsg = response.error?.message || "Error al eliminar reserva";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Error de conexión";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Acciones específicas
  const confirmarReserva = useCallback(
    (id: string) => actualizarReserva(id, { estado: "confirmada" }),
    [actualizarReserva]
  );

  const completarReserva = useCallback(
    (id: string, notas?: string) =>
      actualizarReserva(id, { estado: "completada", notas_internas: notas }),
    [actualizarReserva]
  );

  const cancelarReserva = useCallback(
    (id: string, motivo?: string) =>
      actualizarReserva(id, {
        estado: "cancelada",
        motivo_cancelacion: motivo,
      }),
    [actualizarReserva]
  );

  const marcarNoShow = useCallback(
    (id: string) => actualizarReserva(id, { estado: "no_show" }),
    [actualizarReserva]
  );

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  return {
    reservas,
    loading,
    error,
    refetch: fetchReservas,
    getReservaById,
    crearReserva,
    actualizarReserva,
    eliminarReserva,
    confirmarReserva,
    completarReserva,
    cancelarReserva,
    marcarNoShow,
  };
}

// ===================================================================
// HOOK DE SERVICIOS
// ===================================================================

export function useServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServicios = useCallback(
    async (options?: {
      filters?: { categoria?: string; activo?: boolean };
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await serviciosApi.getAll({
          filters: options?.filters,
        });

        if (response.success) {
          setServicios(response.data || []);
        } else {
          setError(response.error?.message || "Error al cargar servicios");
        }
      } catch (err: any) {
        setError(err.message || "Error de conexión");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getServicioById = useCallback(async (id: string) => {
    const response = await serviciosApi.getById(id);
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error?.message || "Servicio no encontrado");
    }
  }, []);

  const crearServicio = useCallback(
    async (data: Partial<Servicio>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await serviciosApi.create(data);

        if (response.success) {
          // Refrescar la lista
          await fetchServicios();
          return response.data;
        } else {
          const errorMsg = response.error?.message || "Error al crear servicio";
          setError(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err.message || "Error de conexión";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchServicios]
  );

  const actualizarServicio = useCallback(
    async (id: string, updates: Partial<Servicio>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await serviciosApi.update(id, updates);

        if (response.success) {
          // Actualizar la lista local
          setServicios((prev) =>
            prev.map((s) =>
              s.id_servicio === id ? { ...s, ...response.data } : s
            )
          );
          return response.data;
        } else {
          const errorMsg =
            response.error?.message || "Error al actualizar servicio";
          setError(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err.message || "Error de conexión";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const eliminarServicio = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await serviciosApi.delete(id);

      if (response.success) {
        // Marcar como inactivo en la lista local
        setServicios((prev) =>
          prev.map((s) => (s.id_servicio === id ? { ...s, activo: false } : s))
        );
        return true;
      } else {
        const errorMsg =
          response.error?.message || "Error al eliminar servicio";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Error de conexión";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Utilidades
  const getCategorias = useCallback(() => {
    const categorias = [
      ...new Set(servicios.map((s) => s.categoria).filter(Boolean)),
    ];
    return categorias;
  }, [servicios]);

  const getServiciosPorCategoria = useCallback(
    (categoria: string) => {
      return servicios.filter((s) => s.categoria === categoria && s.activo);
    },
    [servicios]
  );

  const formatearPrecio = useCallback((precio: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(precio);
  }, []);

  useEffect(() => {
    // Cargar todos los servicios por defecto (evitar filtros que el backend no soporte)
    fetchServicios();
  }, [fetchServicios]);

  return {
    servicios,
    loading,
    error,
    refetch: fetchServicios,
    getServicioById,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    getCategorias,
    getServiciosPorCategoria,
    formatearPrecio,
  };
}

// ===================================================================
// HOOK DE USUARIOS
// ===================================================================

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(
    async (options?: { filters?: { rol?: string; activo?: boolean } }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await usuariosApi.getAll({
          filters: options?.filters,
        });

        if (response.success) {
          setUsuarios(response.data || []);
        } else {
          setError(response.error?.message || "Error al cargar usuarios");
        }
      } catch (err: any) {
        setError(err.message || "Error de conexión");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUsuarioById = useCallback(async (id: string) => {
    const response = await usuariosApi.getById(id);
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error?.message || "Usuario no encontrado");
    }
  }, []);

  const buscarPorEmail = useCallback(async (email: string) => {
    const response = await usuariosApi.getByEmail(email);
    if (response.success) {
      return response.data;
    } else {
      return null; // Usuario no encontrado
    }
  }, []);

  const crearUsuario = useCallback(
    async (data: Partial<Usuario>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await usuariosApi.create(data);

        if (response.success) {
          // Refrescar la lista
          await fetchUsuarios();
          return response.data;
        } else {
          const errorMsg = response.error?.message || "Error al crear usuario";
          setError(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err.message || "Error de conexión";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsuarios]
  );

  const actualizarUsuario = useCallback(
    async (id: string, updates: Partial<Usuario>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await usuariosApi.update(id, updates);

        if (response.success) {
          // Actualizar la lista local
          setUsuarios((prev) =>
            prev.map((u) =>
              u.id_usuario === id ? { ...u, ...response.data } : u
            )
          );
          return response.data;
        } else {
          const errorMsg =
            response.error?.message || "Error al actualizar usuario";
          setError(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err.message || "Error de conexión";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const eliminarUsuario = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await usuariosApi.delete(id);

      if (response.success) {
        // Marcar como inactivo en la lista local
        setUsuarios((prev) =>
          prev.map((u) => (u.id_usuario === id ? { ...u, activo: false } : u))
        );
        return true;
      } else {
        const errorMsg = response.error?.message || "Error al eliminar usuario";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Error de conexión";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Utilidades
  const getClientes = useCallback(() => {
    return usuarios.filter((u) => u.rol === "cliente" && u.activo);
  }, [usuarios]);

  const getBarberos = useCallback(() => {
    return usuarios.filter((u) => u.rol === "barbero" && u.activo);
  }, [usuarios]);

  const getAdmins = useCallback(() => {
    return usuarios.filter((u) => u.rol === "admin" && u.activo);
  }, [usuarios]);

  useEffect(() => {
    fetchUsuarios({ filters: { activo: true } });
  }, [fetchUsuarios]);

  return {
    usuarios,
    loading,
    error,
    refetch: fetchUsuarios,
    getUsuarioById,
    buscarPorEmail,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    getClientes,
    getBarberos,
    getAdmins,
  };
}
