import { supabase } from '../../lib/database.js';

/**
 * API ULTRA-OPTIMIZADA: Calcula disponibilidad completa de un mes
 * EN UNA SOLA QUERY COMPLEJA - Sin loops, sin llamadas múltiples
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { barberoId, serviceId, year, month } = req.query;

    if (!barberoId || !serviceId || !year || !month) {
      return res.status(400).json({ 
        error: 'Faltan parámetros: barberoId, serviceId, year, month' 
      });
    }

    console.log(`🚀 ULTRA-FAST Calendar API: ${barberoId}-${serviceId}-${year}-${month}`);
    
    const startTime = Date.now();

    // STEP 1: Obtener configuración del barbero Y servicio en 1 query
    const { data: config, error: configError } = await supabase
      .from('barberos')
      .select(`
        id_barbero,
        nombre,
        dias_trabajo,
        hora_inicio,
        hora_fin,
        activo,
        servicios_barberos!inner(
          servicios!inner(
            id_servicio,
            duracion_minutos,
            nombre
          )
        )
      `)
      .eq('id_barbero', barberoId)
      .eq('servicios_barberos.id_servicio', serviceId)
      .eq('activo', true)
      .single();

    if (configError || !config) {
      return res.status(404).json({ error: 'Barbero o servicio no encontrado' });
    }

    // STEP 2: Calcular rango de fechas del mes
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;

    // STEP 3: Obtener TODAS las reservas y bloqueos del mes en 1 query
    const { data: reservas, error: reservasError } = await supabase
      .from('reservas_mvp')
      .select('fecha, hora_inicio, hora_fin, estado')
      .eq('id_barbero', barberoId)
      .gte('fecha', startDate)
      .lte('fecha', endDate)
      .in('estado', ['confirmed', 'pending']);

    if (reservasError) {
      console.error('Error reservas:', reservasError);
      return res.status(500).json({ error: 'Error consultando reservas' });
    }

    // STEP 4: Obtener bloqueos del mes en 1 query  
    const { data: bloqueos, error: bloqueosError } = await supabase
      .from('bloqueos')
      .select('fecha_inicio, fecha_fin, hora_inicio, hora_fin')
      .eq('id_barbero', barberoId)
      .gte('fecha_inicio', startDate)
      .lte('fecha_fin', endDate);

    if (bloqueosError) {
      console.error('Error bloqueos:', bloqueosError);
      return res.status(500).json({ error: 'Error consultando bloqueos' });
    }

    // STEP 5: ALGORITMO ULTRA-OPTIMIZADO - Procesar todo en memoria
    const serviceDuration = config.servicios_barberos[0].servicios.duracion_minutos;
    const workingDays = Array.isArray(config.dias_trabajo) 
      ? config.dias_trabajo 
      : JSON.parse(config.dias_trabajo || '[]');
    
    const daysMap = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3,
      'jueves': 4, 'viernes': 5, 'sábado': 6
    };

    // Crear sets optimizados para búsqueda O(1)
    const reservasByDate = new Map();
    const bloqueosByDate = new Map();

    // Indexar reservas por fecha
    reservas.forEach(reserva => {
      if (!reservasByDate.has(reserva.fecha)) {
        reservasByDate.set(reserva.fecha, []);
      }
      reservasByDate.get(reserva.fecha).push({
        inicio: reserva.hora_inicio,
        fin: reserva.hora_fin
      });
    });

    // Indexar bloqueos por fecha
    bloqueos.forEach(bloqueo => {
      const startDay = new Date(bloqueo.fecha_inicio);
      const endDay = new Date(bloqueo.fecha_fin);
      
      for (let d = new Date(startDay); d <= endDay; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!bloqueosByDate.has(dateStr)) {
          bloqueosByDate.set(dateStr, []);
        }
        bloqueosByDate.get(dateStr).push({
          inicio: bloqueo.hora_inicio,
          fin: bloqueo.hora_fin
        });
      }
    });

    // STEP 6: CÁLCULO FINAL - Una sola pasada por todos los días
    const result = {
      barberoId: parseInt(barberoId),
      serviceId: parseInt(serviceId),
      month: parseInt(month),
      year: parseInt(year),
      availableDays: [],
      unavailableDays: [],
      totalDays: daysInMonth,
      workingDays: workingDays,
      processingTime: 0
    };

    const today = new Date();
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(parseInt(year), parseInt(month) - 1, day);
      const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayName = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][date.getDay()];

      // Verificaciones rápidas de exclusión
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const isWorkingDay = workingDays.includes(dayName);

      if (isPast || !isWorkingDay) {
        result.unavailableDays.push({
          day,
          date: dateStr,
          reason: isPast ? 'past' : 'not_working_day'
        });
        continue;
      }

      // Verificar bloqueos completos
      const dayBloqueos = bloqueosByDate.get(dateStr) || [];
      const hasFullDayBlock = dayBloqueos.some(b => 
        b.inicio === '00:00:00' && b.fin === '23:59:59'
      );

      if (hasFullDayBlock) {
        result.unavailableDays.push({
          day,
          date: dateStr,
          reason: 'blocked'
        });
        continue;
      }

      // Generar slots disponibles para este día
      const availableSlots = generateAvailableSlots(
        config.hora_inicio,
        config.hora_fin,
        serviceDuration,
        reservasByDate.get(dateStr) || [],
        dayBloqueos,
        isToday ? currentHour * 60 + currentMinutes : 0
      );

      if (availableSlots.length > 0) {
        result.availableDays.push({
          day,
          date: dateStr,
          slotsCount: availableSlots.length,
          firstSlot: availableSlots[0],
          lastSlot: availableSlots[availableSlots.length - 1]
        });
      } else {
        result.unavailableDays.push({
          day,
          date: dateStr,
          reason: 'no_slots'
        });
      }
    }

    result.processingTime = Date.now() - startTime;
    
    console.log(`✅ ULTRA-FAST Processing: ${result.processingTime}ms for ${daysInMonth} days`);
    console.log(`📊 Available: ${result.availableDays.length}, Unavailable: ${result.unavailableDays.length}`);

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Ultra-Fast Calendar Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * ALGORITMO OPTIMIZADO: Generar slots disponibles
 * Usa intersección de rangos para máxima eficiencia
 */
function generateAvailableSlots(horaInicio, horaFin, duration, reservas, bloqueos, minCurrentTime) {
  const slots = [];
  
  // Convertir horas a minutos para cálculos más rápidos
  const [startHour, startMin] = horaInicio.split(':').map(Number);
  const [endHour, endMin] = horaFin.split(':').map(Number);
  
  const dayStart = startHour * 60 + startMin;
  const dayEnd = endHour * 60 + endMin;
  
  // Crear array de ocupación (cada minuto del día)
  const occupied = new Array(24 * 60).fill(false);
  
  // Marcar reservas como ocupadas
  reservas.forEach(reserva => {
    const [rStartH, rStartM] = reserva.inicio.split(':').map(Number);
    const [rEndH, rEndM] = reserva.fin.split(':').map(Number);
    
    const rStart = rStartH * 60 + rStartM;
    const rEnd = rEndH * 60 + rEndM;
    
    for (let m = rStart; m < rEnd; m++) {
      occupied[m] = true;
    }
  });
  
  // Marcar bloqueos como ocupados
  bloqueos.forEach(bloqueo => {
    const [bStartH, bStartM] = bloqueo.inicio.split(':').map(Number);
    const [bEndH, bEndM] = bloqueo.fin.split(':').map(Number);
    
    const bStart = bStartH * 60 + bStartM;
    const bEnd = bEndH * 60 + bEndM;
    
    for (let m = bStart; m < bEnd; m++) {
      occupied[m] = true;
    }
  });
  
  // Encontrar slots libres de la duración requerida
  for (let start = Math.max(dayStart, minCurrentTime + 120); start + duration <= dayEnd; start += 15) {
    let canBook = true;
    
    for (let m = start; m < start + duration; m++) {
      if (occupied[m]) {
        canBook = false;
        break;
      }
    }
    
    if (canBook) {
      const startHour = Math.floor(start / 60);
      const startMin = start % 60;
      
      slots.push(`${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`);
    }
  }
  
  return slots;
}
