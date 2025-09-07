/**
 * ===================================================================
 * API INTERMEDIA - GESTIÓN DE DISPONIBILIDAD
 * ===================================================================
 *
 * API intermedia para gestión de disponibilidad de barberos
 * Arquitectura: FRONT → API INTERMEDIA → DB SUPABASE
 */

import { supabase } from "../lib/database.js";

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
        return await getDisponibilidad(req, res);
      case "POST":
        return await createDisponibilidad(req, res);
      case "PUT":
        return await updateDisponibilidad(req, res);
      case "DELETE":
        return await deleteDisponibilidad(req, res);
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

async function getDisponibilidad(req, res) {
  const { barbero, fecha, dia_semana } = req.query;

  let query = supabase
    .from("disponibilidad")
    .select(
      `
      id_disponibilidad,
      id_barbero,
      fecha,
      dia_semana,
      hora_inicio,
      hora_fin,
      disponible,
      tipo_bloqueo,
      motivo,
      created_at,
      updated_at,
      barberos:usuarios!id_barbero (
        id_usuario,
        nombre,
        email
      )
    `
    )
    .order("fecha", { ascending: true })
    .order("hora_inicio", { ascending: true });

  if (barbero) {
    query = query.eq("id_barbero", barbero);
  }

  if (fecha) {
    query = query.eq("fecha", fecha);
  }

  if (dia_semana) {
    query = query.eq("dia_semana", dia_semana);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data: data || [],
    count: data?.length || 0,
  });
}

async function createDisponibilidad(req, res) {
  const {
    id_barbero,
    fecha,
    dia_semana,
    hora_inicio,
    hora_fin,
    disponible = true,
    tipo_bloqueo,
    motivo,
  } = req.body;

  // Validación básica
  if (!id_barbero || (!fecha && !dia_semana) || !hora_inicio || !hora_fin) {
    return res.status(400).json({
      error: "Faltan campos requeridos",
      required: ["id_barbero", "fecha o dia_semana", "hora_inicio", "hora_fin"],
    });
  }

  // Verificar que el barbero existe y está activo
  const { data: barbero, error: errorBarbero } = await supabase
    .from("usuarios")
    .select("id_usuario")
    .eq("id_usuario", id_barbero)
    .eq("rol", "barbero")
    .eq("activo", true)
    .single();

  if (errorBarbero || !barbero) {
    return res.status(400).json({ error: "Barbero no encontrado o inactivo" });
  }

  // Verificar conflictos de horarios
  let conflictQuery = supabase
    .from("disponibilidad")
    .select("id_disponibilidad")
    .eq("id_barbero", id_barbero)
    .or(
      `and(hora_inicio.lte.${hora_inicio},hora_fin.gt.${hora_inicio}),and(hora_inicio.lt.${hora_fin},hora_fin.gte.${hora_fin}),and(hora_inicio.gte.${hora_inicio},hora_fin.lte.${hora_fin})`
    );

  if (fecha) {
    conflictQuery = conflictQuery.eq("fecha", fecha);
  } else if (dia_semana) {
    conflictQuery = conflictQuery.eq("dia_semana", dia_semana);
  }

  const { data: conflictos, error: errorConflictos } = await conflictQuery;

  if (errorConflictos) {
    return res.status(400).json({ error: errorConflictos.message });
  }

  if (conflictos && conflictos.length > 0) {
    return res.status(400).json({
      error: "Conflicto de horarios",
      message: "Ya existe disponibilidad configurada en ese horario",
    });
  }

  // Crear la disponibilidad
  const { data, error } = await supabase
    .from("disponibilidad")
    .insert({
      id_barbero,
      fecha,
      dia_semana,
      hora_inicio,
      hora_fin,
      disponible,
      tipo_bloqueo,
      motivo,
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    success: true,
    data,
    message: "Disponibilidad creada exitosamente",
  });
}

async function updateDisponibilidad(req, res) {
  const { id } = req.query;
  const { hora_inicio, hora_fin, disponible, tipo_bloqueo, motivo } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID de disponibilidad requerido" });
  }

  const updates = {};
  if (hora_inicio !== undefined) updates.hora_inicio = hora_inicio;
  if (hora_fin !== undefined) updates.hora_fin = hora_fin;
  if (disponible !== undefined) updates.disponible = disponible;
  if (tipo_bloqueo !== undefined) updates.tipo_bloqueo = tipo_bloqueo;
  if (motivo !== undefined) updates.motivo = motivo;

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("disponibilidad")
    .update(updates)
    .eq("id_disponibilidad", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data,
    message: "Disponibilidad actualizada exitosamente",
  });
}

async function deleteDisponibilidad(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID de disponibilidad requerido" });
  }

  const { error } = await supabase
    .from("disponibilidad")
    .delete()
    .eq("id_disponibilidad", id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    message: "Disponibilidad eliminada exitosamente",
  });
}
