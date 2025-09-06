/**
 * ===================================================================
 * API ENDPOINT - VERIFICACIÓN DE DISPONIBILIDAD
 * ===================================================================
 *
 * Endpoint específico para verificar si un horario está disponible
 * Ruta: /api/disponibilidad/check
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { barberId, date, startTime, serviceId } = req.query;

    // Validar parámetros requeridos
    if (!barberId || !date || !startTime || !serviceId) {
      return res.status(400).json({
        error: "Parámetros requeridos: barberId, date, startTime, serviceId",
        received: { barberId, date, startTime, serviceId }
      });
    }

    // Obtener información del servicio para calcular duración
    const { data: servicio, error: servicioError } = await supabase
      .from("servicios")
      .select("duracion, nombre, activo")
      .eq("id_servicio", serviceId)
      .single();

    if (servicioError || !servicio) {
      return res.status(400).json({
        error: "Servicio no encontrado o inactivo",
        serviceId,
        servicioError: servicioError?.message
      });
    }

    if (!servicio.activo) {
      return res.status(400).json({
        error: "Servicio inactivo",
        serviceId,
        serviceName: servicio.nombre
      });
    }

    // Calcular hora de fin basada en la duración del servicio
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + servicio.duracion * 60000);
    const endTime = endDateTime.toTimeString().slice(0, 5); // HH:MM format

    // Verificar si hay conflictos con reservas existentes
    const { data: conflictos, error: conflictError } = await supabase
      .from("reservas")
      .select("id_reserva, hora_inicio, hora_fin")
      .eq("id_barbero", barberId)
      .eq("fecha_reserva", date)
      .in("estado", ["pendiente", "confirmada", "en_progreso"])
      .or(
        `and(hora_inicio.lte.${startTime},hora_fin.gt.${startTime}),and(hora_inicio.lt.${endTime},hora_fin.gte.${endTime}),and(hora_inicio.gte.${startTime},hora_fin.lte.${endTime})`
      );

    if (conflictError) {
      console.error("Error verificando conflictos:", conflictError);
      return res.status(500).json({
        error: "Error interno al verificar disponibilidad"
      });
    }

    // Si hay conflictos, el horario no está disponible
    if (conflictos && conflictos.length > 0) {
      return res.status(409).json({
        esDisponible: false,
        message: "El horario seleccionado ya está ocupado. Por favor, elige otro horario.",
        conflictos: conflictos.map(c => ({
          hora_inicio: c.hora_inicio,
          hora_fin: c.hora_fin
        }))
      });
    }

    // Verificar horarios de trabajo del barbero (opcional - implementar si existe tabla de horarios)
    // Por ahora asumimos horario estándar: 9:00 - 18:00, Lunes a Sábado
    const dayOfWeek = new Date(date).getDay(); // 0 = Domingo, 6 = Sábado
    if (dayOfWeek === 0) { // Domingo cerrado
      return res.status(409).json({
        esDisponible: false,
        message: "Los domingos estamos cerrados."
      });
    }

    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);
    
    // Verificar horario de trabajo (9:00 - 18:00)
    if (startHour < 9 || endHour > 18 || (endHour === 18 && endMinute > 0)) {
      return res.status(409).json({
        esDisponible: false,
        message: "El horario debe estar entre las 9:00 y 18:00 horas."
      });
    }

    // Si llegamos aquí, el horario está disponible
    return res.status(200).json({
      esDisponible: true,
      message: "Horario disponible",
      detalles: {
        barberId,
        fecha: date,
        hora_inicio: startTime,
        hora_fin: endTime,
        duracion_minutos: servicio.duracion_minutos
      }
    });

  } catch (error) {
    console.error("Error en verificación de disponibilidad:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      message: error.message
    });
  }
}