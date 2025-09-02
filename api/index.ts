/**
 * ===================================================================
 * API SERVER - SISTEMA DE RESERVAS BARBERÍA (Vercel Serverless)
 * ===================================================================
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Configuración de CORS
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

// Utilidades
const formatApiResponse = (data: any, message = "Operación exitosa") => ({
  success: true,
  data,
  message,
});

const handleError = (
  res: VercelResponse,
  error: any,
  message = "Error interno del servidor"
) => {
  console.error("API Error:", error);
  res.status(500).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { url, method } = req;
  const path = url?.replace("/api", "") || "/";

  try {
    // Root endpoint
    if (path === "/" && method === "GET") {
      return res.json({
        success: true,
        message: "API Barbería - Sistema de Reservas",
        version: "2.0.0",
        status: "active",
        timestamp: new Date().toISOString(),
        endpoints: [
          "GET /",
          "GET /health",
          "GET /availability",
          "GET /servicios",
          "GET /reservas",
          "POST /reservas",
          "GET /analytics/resumen",
        ],
      });
    }

    // Health check
    if (path === "/health" && method === "GET") {
      return res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      });
    }

    // Mock data para testing
    if (path === "/servicios" && method === "GET") {
      const mockServicios = [
        {
          id: 1,
          nombre: "Corte Clásico",
          descripcion: "Corte de cabello tradicional",
          precio: 15000,
          duracion: 30,
          activo: true,
        },
        {
          id: 2,
          nombre: "Corte + Barba",
          descripcion: "Corte de cabello y arreglo de barba",
          precio: 25000,
          duracion: 45,
          activo: true,
        },
        {
          id: 3,
          nombre: "Barba Premium",
          descripcion: "Arreglo completo de barba con productos premium",
          precio: 18000,
          duracion: 30,
          activo: true,
        },
      ];

      return res.json(formatApiResponse(mockServicios));
    }

    // Mock availability
    if (path === "/availability" && method === "GET") {
      const { fecha } = req.query;

      if (!fecha) {
        return res.status(400).json({
          success: false,
          error: "Fecha es obligatoria",
        });
      }

      // Generar slots mock (9 AM a 6 PM)
      const slots = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const hora = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;

          slots.push({
            hora,
            disponible: Math.random() > 0.3, // 70% disponibles
            barbero_id: 1,
          });
        }
      }

      return res.json(formatApiResponse(slots));
    }

    // Mock reservas
    if (path === "/reservas" && method === "GET") {
      const mockReservas = [
        {
          id: 1,
          usuario_id: 1,
          barbero_id: 1,
          servicio_id: 1,
          fecha: new Date().toISOString().split("T")[0],
          hora: "10:00",
          estado: "confirmada",
          precio: 15000,
          cliente_nombre: "Juan Pérez",
          barbero_nombre: "Michael",
          servicio_nombre: "Corte Clásico",
        },
      ];

      return res.json(formatApiResponse(mockReservas));
    }

    // Crear reserva
    if (path === "/reservas" && method === "POST") {
      const { usuario_id, barbero_id, servicio_id, fecha, hora, notas } =
        req.body;

      if (!usuario_id || !barbero_id || !servicio_id || !fecha || !hora) {
        return res.status(400).json({
          success: false,
          error: "Todos los campos son obligatorios",
        });
      }

      const nuevaReserva = {
        id: Date.now(),
        usuario_id: parseInt(usuario_id),
        barbero_id: parseInt(barbero_id),
        servicio_id: parseInt(servicio_id),
        fecha,
        hora,
        precio: 15000,
        estado: "pendiente",
        notas,
        cliente_nombre: "Cliente Nuevo",
        barbero_nombre: "Michael",
        servicio_nombre: "Servicio",
      };

      return res
        .status(201)
        .json(formatApiResponse(nuevaReserva, "Reserva creada exitosamente"));
    }

    // Analytics mock
    if (path === "/analytics/resumen" && method === "GET") {
      const stats = {
        total_reservas: 150,
        reservas_completadas: 120,
        reservas_canceladas: 15,
        reservas_pendientes: 15,
        ingresos_total: 1800000,
        reservas_hoy: 8,
      };

      return res.json(formatApiResponse(stats));
    }

    // 404 - Endpoint no encontrado
    return res.status(404).json({
      success: false,
      error: "Endpoint no encontrado",
      path,
      method,
      available_endpoints: [
        "GET /",
        "GET /health",
        "GET /availability",
        "GET /servicios",
        "GET /reservas",
        "POST /reservas",
        "GET /analytics/resumen",
      ],
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export default handler;
