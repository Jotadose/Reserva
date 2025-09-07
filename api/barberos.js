/**
 * ===================================================================
 * API INTERMEDIA - GESTIÓN DE BARBEROS
 * ===================================================================
 *
 * API intermedia para gestión de barberos y personal
 * Arquitectura: FRONT → API INTERMEDIA → DB SUPABASE
 */

import { supabase } from "../lib/database.js";

async function logEvent(actor, entidad, accion, metadata = {}) {
  try {
    await supabase
      .from("event_log")
      .insert({ actor: actor || null, entidad, accion, metadata });
  } catch (e) {
    console.warn("No se pudo registrar evento barberos", e.message);
  }
}

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case "GET":
        return await getBarberos(req, res);
      case "POST":
        return await createBarbero(req, res);
      case "PUT":
        return await updateBarbero(req, res);
      case "DELETE":
        return await deleteBarbero(req, res);
      default:
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}

async function getBarberos(req, res) {
  const { data, error } = await supabase
    .from("usuarios")
    .select(
      `
      id_usuario,
      nombre,
      email,
      telefono,
      rol,
      activo,
      avatar_url,
      configuracion,
      created_at,
      barberos (
        especialidades,
        horario_inicio,
        horario_fin,
        dias_trabajo,
        tiempo_descanso,
  comision_base,
        biografia,
        calificacion_promedio,
        total_cortes
      )
    `
    )
    .eq("rol", "barbero")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data: data || [],
    count: data?.length || 0,
  });
}

async function createBarbero(req, res) {
  const {
    nombre,
    email,
    telefono,
    especialidades,
    horario_inicio,
    horario_fin,
    dias_trabajo,
    biografia,
    tiempo_descanso,
    comision_base,
  } = req.body;

  // Validación básica
  if (!nombre || !email) {
    return res.status(400).json({
      error: "Faltan campos requeridos",
      required: ["nombre", "email"],
    });
  }

  // Crear usuario primero
  const { data: usuario, error: errorUsuario } = await supabase
    .from("usuarios")
    .insert({
      nombre,
      email,
      telefono,
      rol: "barbero",
      activo: true,
    })
    .select()
    .single();

  if (errorUsuario) {
    return res.status(400).json({ error: errorUsuario.message });
  }

  // Crear registro de barbero
  const { data: barbero, error: errorBarbero } = await supabase
    .from("barberos")
    .insert({
      id_barbero: usuario.id_usuario,
      especialidades: especialidades || [],
      horario_inicio: horario_inicio || "09:00:00",
      horario_fin: horario_fin || "18:00:00",
      dias_trabajo: dias_trabajo || [
        "lunes",
        "martes",
        "miercoles",
        "jueves",
        "viernes",
        "sabado",
      ],
      tiempo_descanso: tiempo_descanso || 10,
      comision_base: comision_base ?? 0,
      biografia,
      activo: true,
    })
    .select()
    .single();

  if (errorBarbero) {
    // Si falla, eliminar el usuario creado
    await supabase
      .from("usuarios")
      .delete()
      .eq("id_usuario", usuario.id_usuario);
    return res.status(400).json({ error: errorBarbero.message });
  }

  res.status(201).json({
    success: true,
    data: {
      usuario,
      barbero: { ...barbero, comision_base: barbero.comision_base ?? 0 },
    },
    message: "Barbero creado exitosamente",
  });
  logEvent(null, "barbero", "create", { id_barbero: usuario.id_usuario });
}

async function updateBarbero(req, res) {
  const { id } = req.query;
  const {
    nombre,
    email,
    telefono,
    especialidades,
    horario_inicio,
    horario_fin,
    dias_trabajo,
    biografia,
    tiempo_descanso,
    activo,
    comision_base,
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID de barbero requerido" });
  }

  // Actualizar usuario
  const { error: errorUsuario } = await supabase
    .from("usuarios")
    .update({
      nombre,
      email,
      telefono,
      activo,
      updated_at: new Date().toISOString(),
    })
    .eq("id_usuario", id);

  if (errorUsuario) {
    return res.status(400).json({ error: errorUsuario.message });
  }

  // Actualizar barbero
  const { data, error } = await supabase
    .from("barberos")
    .update({
      especialidades,
      horario_inicio,
      horario_fin,
      dias_trabajo,
      tiempo_descanso,
      biografia,
      activo,
      comision_base,
      updated_at: new Date().toISOString(),
    })
    .eq("id_barbero", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data: { ...data, comision_base: data.comision_base ?? 0 },
    message: "Barbero actualizado exitosamente",
  });
  logEvent(null, "barbero", "update", { id_barbero: id });
}

async function deleteBarbero(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID de barbero requerido" });
  }

  // Soft delete - marcar como inactivo
  const { error: errorUsuario } = await supabase
    .from("usuarios")
    .update({
      activo: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id_usuario", id);

  const { error: errorBarbero } = await supabase
    .from("barberos")
    .update({
      activo: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id_barbero", id);

  if (errorUsuario || errorBarbero) {
    return res.status(400).json({
      error: errorUsuario?.message || errorBarbero?.message,
    });
  }

  res.status(200).json({
    success: true,
    message: "Barbero desactivado exitosamente",
  });
}
