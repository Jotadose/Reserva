/**
 * ===================================================================
 * API SERVICE - ARQUITECTURA INTERMEDIA DE SERVICIOS
 * ===================================================================
 *
 * Esta capa intermedia maneja todas las comunicaciones con la API
 * Proporciona consistencia, manejo de errores y transformación de datos
 * Diseñada para ser escalable y mantenible
 */

import { supabaseClient } from "../lib/supabaseClient";

// ===================================================================
// TIPOS BASE
// ===================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  [key: string]: any;
}

// ===================================================================
// BASE API SERVICE CLASS
// ===================================================================

class BaseApiService {
  protected async handleApiCall<T>(
    operation: () => Promise<any>
  ): Promise<ApiResponse<T>> {
    try {
      const result = await operation();

      if (result.error) {
        return {
          success: false,
          error: {
            code: result.error.code || "UNKNOWN_ERROR",
            message: result.error.message || "Error desconocido",
            details: result.error.details || result.error,
          },
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      console.error("API Service Error:", error);

      return {
        success: false,
        error: {
          code: error.code || "NETWORK_ERROR",
          message: error.message || "Error de conexión",
          details: error,
        },
      };
    }
  }

  protected buildQuery(
    table: string,
    options?: {
      select?: string;
      filters?: FilterParams;
      orderBy?: { column: string; ascending?: boolean }[];
      pagination?: PaginationParams;
    }
  ) {
    let query = supabaseClient.from(table);

    // Select columns
    if (options?.select) {
      query = query.select(options.select);
    } else {
      query = query.select("*");
    }

    // Apply filters
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === "string" && value.includes("%")) {
            query = query.ilike(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });
    }

    // Apply ordering
    if (options?.orderBy) {
      options.orderBy.forEach((order) => {
        query = query.order(order.column, {
          ascending: order.ascending ?? true,
        });
      });
    }

    // Apply pagination
    if (options?.pagination) {
      const { page = 1, limit = 50 } = options.pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    return query;
  }
}

// ===================================================================
// SERVICIOS ESPECÍFICOS
// ===================================================================

export class ReservasApiService extends BaseApiService {
  async getAll(options?: {
    filters?: {
      id_barbero?: string;
      fecha_reserva?: string;
      estado?: string;
      id_cliente?: string;
    };
    pagination?: PaginationParams;
    includeRelations?: boolean;
  }): Promise<ApiResponse<any[]>> {
    const selectClause = options?.includeRelations
      ? `*, 
         cliente_info:usuarios!reservas_id_cliente_fkey(nombre, email, telefono),
         barbero_info:usuarios!reservas_id_barbero_fkey(nombre, email),
         servicio_info:servicios(nombre, categoria, color, precio, duracion)`
      : "*";

    return this.handleApiCall(async () => {
      const query = this.buildQuery("reservas", {
        select: selectClause,
        filters: options?.filters,
        orderBy: [
          { column: "fecha_reserva", ascending: false },
          { column: "hora_inicio", ascending: false },
        ],
        pagination: options?.pagination,
      });

      return await query;
    });
  }

  async getById(
    id: string,
    includeRelations = true
  ): Promise<ApiResponse<any>> {
    const selectClause = includeRelations
      ? `*, 
         cliente_info:usuarios!reservas_id_cliente_fkey(nombre, email, telefono),
         barbero_info:usuarios!reservas_id_barbero_fkey(nombre, email),
         servicio_info:servicios(nombre, categoria, color, precio, duracion)`
      : "*";

    return this.handleApiCall(async () => {
      return await supabaseClient
        .from("reservas")
        .select(selectClause)
        .eq("id_reserva", id)
        .single();
    });
  }

  async create(data: any): Promise<ApiResponse<any>> {
    return this.handleApiCall(async () => {
      const reservaData = {
        ...data,
        estado: data.estado || "confirmada",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return await supabaseClient
        .from("reservas")
        .insert([reservaData])
        .select("*")
        .single();
    });
  }

  async update(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.handleApiCall(async () => {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Add timestamps based on status
      if (updates.estado === "confirmada" && !updates.confirmada_at) {
        updateData.confirmada_at = new Date().toISOString();
      }
      if (updates.estado === "completada" && !updates.completada_at) {
        updateData.completada_at = new Date().toISOString();
      }
      if (updates.estado === "cancelada" && !updates.cancelada_at) {
        updateData.cancelada_at = new Date().toISOString();
      }

      return await supabaseClient
        .from("reservas")
        .update(updateData)
        .eq("id_reserva", id)
        .select("*")
        .single();
    });
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return this.handleApiCall(async () => {
      const result = await supabaseClient
        .from("reservas")
        .delete()
        .eq("id_reserva", id);

      return { data: true, error: result.error };
    });
  }

  async getByDateRange(
    startDate: string,
    endDate: string,
    barberoId?: string
  ): Promise<ApiResponse<any[]>> {
    return this.handleApiCall(async () => {
      let query = supabaseClient
        .from("reservas")
        .select(
          `*, 
          cliente_info:usuarios!reservas_id_cliente_fkey(nombre, email, telefono),
          barbero_info:usuarios!reservas_id_barbero_fkey(nombre, email),
          servicio_info:servicios(nombre, categoria, color, precio, duracion)`
        )
        .gte("fecha_reserva", startDate)
        .lte("fecha_reserva", endDate);

      if (barberoId) {
        query = query.eq("id_barbero", barberoId);
      }

      return await query
        .order("fecha_reserva", { ascending: true })
        .order("hora_inicio", { ascending: true });
    });
  }
}

export class ServiciosApiService extends BaseApiService {
  async getAll(options?: {
    filters?: { categoria?: string; activo?: boolean };
    pagination?: PaginationParams;
  }): Promise<ApiResponse<any[]>> {
    return this.handleApiCall(async () => {
      return await this.buildQuery("servicios", {
        filters: options?.filters,
        orderBy: [
          { column: "categoria", ascending: true },
          { column: "precio", ascending: true },
        ],
        pagination: options?.pagination,
      });
    });
  }

  async getById(id: string): Promise<ApiResponse<any>> {
    return this.handleApiCall(async () => {
      return await supabaseClient
        .from("servicios")
        .select("*")
        .eq("id_servicio", id)
        .single();
    });
  }

  async create(data: any): Promise<ApiResponse<any>> {
    return this.handleApiCall(async () => {
      const servicioData = {
        ...data,
        activo: data.activo ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return await supabaseClient
        .from("servicios")
        .insert([servicioData])
        .select("*")
        .single();
    });
  }

  async update(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.handleApiCall(async () => {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      return await supabaseClient
        .from("servicios")
        .update(updateData)
        .eq("id_servicio", id)
        .select("*")
        .single();
    });
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return this.handleApiCall(async () => {
      // Soft delete - marcar como inactivo
      const result = await supabaseClient
        .from("servicios")
        .update({ activo: false, updated_at: new Date().toISOString() })
        .eq("id_servicio", id);

      return { data: true, error: result.error };
    });
  }
}

export class UsuariosApiService extends BaseApiService {
  async getAll(options?: {
    filters?: { rol?: string; activo?: boolean };
    pagination?: PaginationParams;
  }): Promise<ApiResponse<any[]>> {
    return this.handleApiCall(async () => {
      return await this.buildQuery("usuarios", {
        filters: options?.filters,
        orderBy: [{ column: "nombre", ascending: true }],
        pagination: options?.pagination,
      });
    });
  }

  async getById(id: string): Promise<ApiResponse<any>> {
    return this.handleApiCall(async () => {
      return await supabaseClient
        .from("usuarios")
        .select("*")
        .eq("id_usuario", id)
        .single();
    });
  }

  async getByEmail(email: string): Promise<ApiResponse<any>> {
    return this.handleApiCall(async () => {
      return await supabaseClient
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single();
    });
  }

  async create(data: any): Promise<ApiResponse<any>> {
    return this.handleApiCall(async () => {
      const usuarioData = {
        ...data,
        activo: data.activo ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return await supabaseClient
        .from("usuarios")
        .insert([usuarioData])
        .select("*")
        .single();
    });
  }

  async update(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.handleApiCall(async () => {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      return await supabaseClient
        .from("usuarios")
        .update(updateData)
        .eq("id_usuario", id)
        .select("*")
        .single();
    });
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return this.handleApiCall(async () => {
      // Soft delete - marcar como inactivo
      const result = await supabaseClient
        .from("usuarios")
        .update({ activo: false, updated_at: new Date().toISOString() })
        .eq("id_usuario", id);

      return { data: true, error: result.error };
    });
  }
}

// ===================================================================
// INSTANCIAS DE SERVICIOS
// ===================================================================

export const reservasApi = new ReservasApiService();
export const serviciosApi = new ServiciosApiService();
export const usuariosApi = new UsuariosApiService();

// ===================================================================
// UTILIDADES
// ===================================================================

export const formatCurrency = (amount: number, currency = "CLP") => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
) => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (timeString: string) => {
  return timeString.slice(0, 5); // HH:MM format
};

// ===================================================================
// ERROR HANDLER GLOBAL
// ===================================================================

export const handleApiError = (
  error: any,
  defaultMessage = "Ha ocurrido un error"
) => {
  console.error("API Error:", error);

  if (error?.error?.message) {
    return error.error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return defaultMessage;
};
