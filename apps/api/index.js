/**
 * ===================================================================
 * API SERVER - SISTEMA DE RESERVAS BARBERÍA
 * ===================================================================
 *
 * Servidor Express moderno para la API REST del sistema de reservas
 * con soporte para Vercel Serverless Functions
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// ===================================================================
// CONFIGURACIÓN DE MIDDLEWARE
// ===================================================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://reserva-imfi1r7az-jotadoses-projects.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================================================================
// CONFIGURACIÓN DE SUPABASE
// ===================================================================

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan variables de entorno de Supabase");
  console.log("SUPABASE_URL:", supabaseUrl ? "✅ Configurada" : "❌ Faltante");
  console.log(
    "SUPABASE_ANON_KEY:",
    supabaseKey ? "✅ Configurada" : "❌ Faltante"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ===================================================================
// UTILIDADES Y HELPERS
// ===================================================================

const handleError = (res, error, message = "Error interno del servidor") => {
  console.error("API Error:", error);
  res.status(500).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

const formatApiResponse = (data, message = "Operación exitosa") => ({
  success: true,
  data,
  message,
});

// ===================================================================
// RUTAS DE SALUD Y ESTADO
// ===================================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Barbería - Sistema de Reservas",
    version: "2.0.0",
    status: "active",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", async (req, res) => {
  try {
    // Test conexión a Supabase
    const { data, error } = await supabase
      .from("usuarios")
      .select("count(*)")
      .limit(1);

    res.json({
      success: true,
      status: "healthy",
      database: error ? "disconnected" : "connected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    handleError(res, error, "Error al verificar el estado de la API");
  }
});

// ===================================================================
// RUTAS DE USUARIOS/CLIENTES
// ===================================================================

app.get("/api/usuarios", async (req, res) => {
  try {
    const { rol, activo, search, page = 1, limit = 50 } = req.query;

    let query = supabase.from("usuarios").select("*");

    if (rol) query = query.eq("rol", rol);
    if (activo !== undefined) query = query.eq("activo", activo === "true");
    if (search) {
      query = query.or(
        `nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`
      );
    }

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    handleError(res, error, "Error al obtener usuarios");
  }
});

app.post("/api/usuarios", async (req, res) => {
  try {
    const { nombre, telefono, email, rol = "cliente" } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({
        success: false,
        error: "Nombre y teléfono son obligatorios",
      });
    }

    const { data, error } = await supabase
      .from("usuarios")
      .insert({
        nombre,
        telefono,
        email,
        rol,
        activo: true,
      })
      .select()
      .single();

    if (error) throw error;

    res
      .status(201)
      .json(formatApiResponse(data, "Usuario creado exitosamente"));
  } catch (error) {
    handleError(res, error, "Error al crear usuario");
  }
});

app.get("/api/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      });
    }

    res.json(formatApiResponse(data));
  } catch (error) {
    handleError(res, error, "Error al obtener usuario");
  }
});

app.put("/api/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remover campos que no se pueden actualizar
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    const { data, error } = await supabase
      .from("usuarios")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json(formatApiResponse(data, "Usuario actualizado exitosamente"));
  } catch (error) {
    handleError(res, error, "Error al actualizar usuario");
  }
});

// ===================================================================
// RUTAS DE SERVICIOS
// ===================================================================

app.get("/api/servicios", async (req, res) => {
  try {
    const { activo, categoria, search } = req.query;

    let query = supabase.from("servicios").select("*");

    if (activo !== undefined) query = query.eq("activo", activo === "true");
    if (categoria) query = query.eq("categoria", categoria);
    if (search) {
      query = query.or(
        `nombre.ilike.%${search}%,descripcion.ilike.%${search}%`
      );
    }

    query = query.order("nombre");

    const { data, error } = await query;

    if (error) throw error;

    res.json(formatApiResponse(data));
  } catch (error) {
    handleError(res, error, "Error al obtener servicios");
  }
});

app.post("/api/servicios", async (req, res) => {
  try {
    const { nombre, descripcion, precio, duracion, categoria } = req.body;

    if (!nombre || !precio || !duracion) {
      return res.status(400).json({
        success: false,
        error: "Nombre, precio y duración son obligatorios",
      });
    }

    const { data, error } = await supabase
      .from("servicios")
      .insert({
        nombre,
        descripcion,
        precio: parseFloat(precio),
        duracion: parseInt(duracion),
        categoria,
        activo: true,
      })
      .select()
      .single();

    if (error) throw error;

    res
      .status(201)
      .json(formatApiResponse(data, "Servicio creado exitosamente"));
  } catch (error) {
    handleError(res, error, "Error al crear servicio");
  }
});

// ===================================================================
// RUTAS DE RESERVAS
// ===================================================================

app.get("/api/reservas", async (req, res) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      estado,
      barbero_id,
      usuario_id,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    let query = supabase.from("reservas").select(`
        *,
        usuario:usuarios!usuario_id(id, nombre, telefono, email),
        barbero:usuarios!barbero_id(id, nombre),
        servicio:servicios!servicio_id(id, nombre, precio, duracion)
      `);

    if (fecha_inicio) query = query.gte("fecha", fecha_inicio);
    if (fecha_fin) query = query.lte("fecha", fecha_fin);
    if (estado) query = query.eq("estado", estado);
    if (barbero_id) query = query.eq("barbero_id", barbero_id);
    if (usuario_id) query = query.eq("usuario_id", usuario_id);

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);
    query = query
      .order("fecha", { ascending: false })
      .order("hora", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Formatear datos para compatibilidad con frontend
    const formattedData =
      data?.map((reserva) => ({
        ...reserva,
        cliente_nombre: reserva.usuario?.nombre || "Cliente",
        barbero_nombre: reserva.barbero?.nombre || "Barbero",
        servicio_nombre: reserva.servicio?.nombre || "Servicio",
      })) || [];

    res.json(formatApiResponse(formattedData));
  } catch (error) {
    handleError(res, error, "Error al obtener reservas");
  }
});

app.post("/api/reservas", async (req, res) => {
  try {
    const { usuario_id, barbero_id, servicio_id, fecha, hora, notas } =
      req.body;

    if (!usuario_id || !barbero_id || !servicio_id || !fecha || !hora) {
      return res.status(400).json({
        success: false,
        error: "Todos los campos son obligatorios",
      });
    }

    // Verificar disponibilidad
    const { data: existingReserva } = await supabase
      .from("reservas")
      .select("id")
      .eq("barbero_id", barbero_id)
      .eq("fecha", fecha)
      .eq("hora", hora)
      .neq("estado", "cancelada")
      .single();

    if (existingReserva) {
      return res.status(409).json({
        success: false,
        error: "El horario no está disponible",
      });
    }

    // Obtener precio del servicio
    const { data: servicio } = await supabase
      .from("servicios")
      .select("precio")
      .eq("id", servicio_id)
      .single();

    const { data, error } = await supabase
      .from("reservas")
      .insert({
        usuario_id: parseInt(usuario_id),
        barbero_id: parseInt(barbero_id),
        servicio_id: parseInt(servicio_id),
        fecha,
        hora,
        precio: servicio?.precio || 0,
        estado: "pendiente",
        notas,
      })
      .select(
        `
        *,
        usuario:usuarios!usuario_id(id, nombre, telefono, email),
        barbero:usuarios!barbero_id(id, nombre),
        servicio:servicios!servicio_id(id, nombre, precio, duracion)
      `
      )
      .single();

    if (error) throw error;

    res
      .status(201)
      .json(formatApiResponse(data, "Reserva creada exitosamente"));
  } catch (error) {
    handleError(res, error, "Error al crear reserva");
  }
});

app.put("/api/reservas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remover campos que no se pueden actualizar
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    const { data, error } = await supabase
      .from("reservas")
      .update(updates)
      .eq("id", id)
      .select(
        `
        *,
        usuario:usuarios!usuario_id(id, nombre, telefono, email),
        barbero:usuarios!barbero_id(id, nombre),
        servicio:servicios!servicio_id(id, nombre, precio, duracion)
      `
      )
      .single();

    if (error) throw error;

    res.json(formatApiResponse(data, "Reserva actualizada exitosamente"));
  } catch (error) {
    handleError(res, error, "Error al actualizar reserva");
  }
});

// ===================================================================
// RUTAS DE DISPONIBILIDAD
// ===================================================================

app.get("/api/disponibilidad", async (req, res) => {
  try {
    const { fecha, barbero_id, servicio_id } = req.query;

    if (!fecha) {
      return res.status(400).json({
        success: false,
        error: "Fecha es obligatoria",
      });
    }

    // Obtener reservas existentes
    let reservasQuery = supabase
      .from("reservas")
      .select("hora, barbero_id")
      .eq("fecha", fecha)
      .neq("estado", "cancelada");

    if (barbero_id) {
      reservasQuery = reservasQuery.eq("barbero_id", barbero_id);
    }

    const { data: reservasExistentes } = await reservasQuery;

    // Generar slots de tiempo (9 AM a 6 PM)
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hora = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const ocupado = reservasExistentes?.some(
          (r) => r.hora === hora && (!barbero_id || r.barbero_id == barbero_id)
        );

        slots.push({
          hora,
          disponible: !ocupado,
          barbero_id: barbero_id ? parseInt(barbero_id) : null,
        });
      }
    }

    res.json(formatApiResponse(slots));
  } catch (error) {
    handleError(res, error, "Error al obtener disponibilidad");
  }
});

// ===================================================================
// RUTAS DE ANALYTICS
// ===================================================================

app.get("/api/analytics/resumen", async (req, res) => {
  try {
    const { periodo = "30" } = req.query; // días
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - parseInt(periodo));

    // Reservas por estado
    const { data: reservas } = await supabase
      .from("reservas")
      .select("estado, precio, fecha")
      .gte("fecha", fechaInicio.toISOString().split("T")[0]);

    // Calcular estadísticas
    const stats = {
      total_reservas: reservas?.length || 0,
      reservas_completadas:
        reservas?.filter((r) => r.estado === "completada").length || 0,
      reservas_canceladas:
        reservas?.filter((r) => r.estado === "cancelada").length || 0,
      reservas_pendientes:
        reservas?.filter((r) => r.estado === "pendiente").length || 0,
      ingresos_total:
        reservas
          ?.filter((r) => r.estado === "completada")
          .reduce((sum, r) => sum + (r.precio || 0), 0) || 0,
      ingresos_mes_actual:
        reservas
          ?.filter((r) => {
            const fecha = new Date(r.fecha);
            const ahora = new Date();
            return (
              fecha.getMonth() === ahora.getMonth() &&
              fecha.getFullYear() === ahora.getFullYear() &&
              r.estado === "completada"
            );
          })
          .reduce((sum, r) => sum + (r.precio || 0), 0) || 0,
      reservas_hoy:
        reservas?.filter(
          (r) => r.fecha === new Date().toISOString().split("T")[0]
        ).length || 0,
    };

    res.json(formatApiResponse(stats));
  } catch (error) {
    handleError(res, error, "Error al obtener analytics");
  }
});

// ===================================================================
// MIDDLEWARE DE ERROR 404
// ===================================================================

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint no encontrado",
    path: req.originalUrl,
    method: req.method,
  });
});

// ===================================================================
// INICIO DEL SERVIDOR
// ===================================================================

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 API Server running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
    console.log(`🔗 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Export para Vercel
export default app;
