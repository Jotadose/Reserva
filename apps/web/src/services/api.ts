/**
 * ===================================================================
 * API SERVICE - ARQUITECTURA MONOREPO CON BACKEND EXPRESS
 * ===================================================================
 *
 * Esta capa intermedia maneja todas las comunicaciones con la API Express
 * Proporciona consistencia, manejo de errores y transformación de datos
 * Diseñada para monorepo con backend serverless en Vercel
 */

import type {
  Usuario,
  Servicio,
  Reserva,
  ApiResponse,
  DisponibilidadSlot,
  AnalyticsResumen,
} from "@shared/types";

// ===================================================================
// CONFIGURACIÓN DE LA API
// ===================================================================

// Usar URL absoluta por defecto para asegurar funcionalidad fuera de entorno proxied
// Mantiene compatibilidad con VITE_API_URL si está configurado
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://reserva-mauve.vercel.app/api";

// ===================================================================
// TIPOS BASE
// ===================================================================

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
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
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

  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.makeRequest<T>(url, { method: "GET" });
  }

  protected async post<T>(
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async put<T>(
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "DELETE" });
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
  }): Promise<ApiResponse<Reserva[]>> {
    const params = {
      ...options?.filters,
      ...options?.pagination,
      include_relations: options?.includeRelations,
    };

  return this.get<Reserva>("/consolidated", { type: "reservas", ...params }) as any;
  }

  async getById(
    id: string,
    includeRelations = true
  ): Promise<ApiResponse<Reserva>> {
    return this.get<Reserva>(`/consolidated`, {
      type: "reservas",
      id,
      include_relations: includeRelations,
    });
  }

  async create(data: Partial<Reserva>): Promise<ApiResponse<Reserva>> {
  return this.post<Reserva>("/consolidated?type=reservas", data);
  }

  async update(
    id: string,
    updates: Partial<Reserva>
  ): Promise<ApiResponse<Reserva>> {
  return this.put<Reserva>(`/consolidated?type=reservas&id=${encodeURIComponent(id)}`, updates);
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
  return this.delete<boolean>(`/consolidated?type=reservas&id=${encodeURIComponent(id)}`);
  }

  async getByDateRange(
    startDate: string,
    endDate: string,
    barberoId?: string
  ): Promise<ApiResponse<Reserva[]>> {
    const params = {
      start_date: startDate,
      end_date: endDate,
      id_barbero: barberoId,
    };

  return this.get<Reserva[]>("/consolidated", { type: "reservas", action: "range", ...params });
  }
}

export class ServiciosApiService extends BaseApiService {
  async getAll(options?: {
    filters?: { categoria?: string; activo?: boolean };
    pagination?: PaginationParams;
  }): Promise<ApiResponse<Servicio[]>> {
    const params = {
      ...options?.filters,
      ...options?.pagination,
    };

  return this.get<Servicio[]>("/consolidated", { type: "servicios", ...params });
  }

  async getById(id: string): Promise<ApiResponse<Servicio>> {
  return this.get<Servicio>(`/consolidated`, { type: "servicios", id });
  }

  async create(data: Partial<Servicio>): Promise<ApiResponse<Servicio>> {
  return this.post<Servicio>("/consolidated?type=servicios", data);
  }

  async update(
    id: string,
    updates: Partial<Servicio>
  ): Promise<ApiResponse<Servicio>> {
  return this.put<Servicio>(`/consolidated?type=servicios&id=${encodeURIComponent(id)}`, updates);
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
  return this.delete<boolean>(`/consolidated?type=servicios&id=${encodeURIComponent(id)}`);
  }
}

export class UsuariosApiService extends BaseApiService {
  async getAll(options?: {
    filters?: { rol?: string; activo?: boolean };
    pagination?: PaginationParams;
  }): Promise<ApiResponse<Usuario[]>> {
    const params = {
      ...options?.filters,
      ...options?.pagination,
    };

  return this.get<Usuario[]>("/consolidated", { type: "usuarios", ...params });
  }

  async getById(id: string): Promise<ApiResponse<Usuario>> {
  return this.get<Usuario>(`/consolidated`, { type: "usuarios", id });
  }

  async getByEmail(email: string): Promise<ApiResponse<Usuario>> {
  return this.get<Usuario>(`/consolidated`, { type: "usuarios", email });
  }

  async create(data: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
  return this.post<Usuario>("/consolidated?type=usuarios", data);
  }

  async update(
    id: string,
    updates: Partial<Usuario>
  ): Promise<ApiResponse<Usuario>> {
  return this.put<Usuario>(`/consolidated?type=usuarios&id=${encodeURIComponent(id)}`, updates);
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
  return this.delete<boolean>(`/consolidated?type=usuarios&id=${encodeURIComponent(id)}`);
  }
}

export class DisponibilidadApiService extends BaseApiService {
  async getSlots(params: {
    fecha: string;
    id_barbero?: string;
    id_servicio?: string;
  }): Promise<ApiResponse<DisponibilidadSlot[]>> {
  return this.get<DisponibilidadSlot[]>("/consolidated", { type: "disponibilidad", action: "check", ...params });
  }
}

export class AnalyticsApiService extends BaseApiService {
  async getResumen(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    id_barbero?: string;
  }): Promise<ApiResponse<AnalyticsResumen>> {
    return this.get<AnalyticsResumen>("/analytics/resumen", params);
  }
}

export class SystemApiService extends BaseApiService {
  async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    return this.get<{ status: string; timestamp: string }>("/health");
  }

  async getInfo(): Promise<
    ApiResponse<{ name: string; version: string; environment: string }>
  > {
    return this.get<{ name: string; version: string; environment: string }>(
      "/"
    );
  }
}

// ===================================================================
// INSTANCIAS DE SERVICIOS
// ===================================================================

export const reservasApi = new ReservasApiService();
export const serviciosApi = new ServiciosApiService();
export const usuariosApi = new UsuariosApiService();
export const disponibilidadApi = new DisponibilidadApiService();
export const analyticsApi = new AnalyticsApiService();
export const systemApi = new SystemApiService();

// ===================================================================
// UTILIDADES - IMPORTADAS DESDE SHARED
// ===================================================================

import {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
} from "@shared/utils";

export { formatCurrency, formatDate, formatTime, formatDateTime };

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
