/**
 * ===================================================================
 * API INTERMEDIA - GESTIÓN DE BLOQUEOS / VACACIONES
 * ===================================================================
 * FRONT → /api/bloqueos → Supabase (tabla bloqueos_horarios)
 *
 * Endpoints:
 *  GET    /api/bloqueos?from=YYYY-MM-DD&to=YYYY-MM-DD&barbero=uuid|todos
 *  POST   /api/bloqueos  (body: { id_barbero?, fecha_inicio, fecha_fin, hora_inicio?, hora_fin?, tipo, motivo })
 *  DELETE /api/bloqueos?id=<id_bloqueo>
 *
 * (Se puede extender luego con PUT para edición / soft delete vía metadata)
 */
import { supabase } from "../lib/database.js";

async function logEvent(actor, entidad, accion, metadata = {}) {
  try {
    await supabase.from("event_log").insert({
      actor: actor || null,
      entidad,
      accion,
      metadata,
    });
  } catch (e) {
    console.warn("No se pudo registrar evento bloqueos", e.message);
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case "GET":
        return await listBloqueos(req, res);
      case "POST":
        return await createBloqueo(req, res);
      case "DELETE":
        return await deleteBloqueo(req, res);
      default:
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API bloqueos error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
}

async function listBloqueos(req, res) {
  const { from, to, barbero } = req.query;
  let query = supabase.from("bloqueos_horarios").select("*");

  if (from) query = query.gte("fecha_inicio", from);
  if (to) query = query.lte("fecha_fin", to);
  if (barbero && barbero !== "todos") query = query.eq("id_barbero", barbero);

  query = query.order("fecha_inicio", { ascending: true });

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });

  res
    .status(200)
    .json({ success: true, data: data || [], count: data?.length || 0 });
}

async function createBloqueo(req, res) {
  const {
    id_barbero = null,
    fecha_inicio,
    fecha_fin,
    hora_inicio = null,
    hora_fin = null,
    tipo,
    motivo,
    metadata = {},
  } = req.body || {};

  if (!fecha_inicio || !fecha_fin || !tipo) {
    return res.status(400).json({
      error: "Faltan campos requeridos",
      required: ["fecha_inicio", "fecha_fin", "tipo"],
    });
  }

  const { data, error } = await supabase
    .from("bloqueos_horarios")
    .insert({
      id_barbero: id_barbero || null,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      tipo,
      motivo,
      metadata,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  logEvent(null, "bloqueo", "create", { id_bloqueo: data.id_bloqueo });
  res.status(201).json({ success: true, data });
}

async function deleteBloqueo(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Falta id" });

  // Eliminación física (se puede refactorizar a soft con columna activa o metadata)
  const { error } = await supabase
    .from("bloqueos_horarios")
    .delete()
    .eq("id_bloqueo", id);

  if (error) return res.status(400).json({ error: error.message });
  logEvent(null, "bloqueo", "delete", { id_bloqueo: id });
  res.status(200).json({ success: true });
}
