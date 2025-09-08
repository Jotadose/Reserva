import { supabase } from '../lib/database.js';

/**
 * 🚀 ULTRA-CONSOLIDATED API - Solución al límite de 12 funciones Vercel Hobby
 * 
 * Esta API maneja MÚLTIPLES endpoints en una sola función:
 * - GET /api/consolidated?type=barberos
 * - GET /api/consolidated?type=servicios  
 * - GET /api/consolidated?type=usuarios
 * - GET /api/consolidated?type=reservas
 * - GET /api/consolidated?type=bloqueos
 * - GET /api/consolidated?type=disponibilidad&action=month
 * - GET /api/consolidated?type=disponibilidad&action=check
 * - POST /api/consolidated?type=barberos (CRUD)
 * - POST /api/consolidated?type=reservas (CRUD)
 */
export default async function handler(req, res) {
  const { type, action, ...params } = req.query;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log(`🚀 CONSOLIDATED API: ${req.method} ${type}/${action || 'default'}`);

    switch (type) {
      case 'barberos':
        return await handleBarberos(req, res, params);
        
      case 'servicios':
        return await handleServicios(req, res, params);
        
      case 'usuarios':
        return await handleUsuarios(req, res, params);
        
      case 'reservas':
        return await handleReservas(req, res, params);
        
      case 'bloqueos':
        return await handleBloqueos(req, res, params);
        
      case 'disponibilidad':
        if (action === 'month') {
          return await handleDisponibilidadMonth(req, res, params);
        } else if (action === 'check') {
          return await handleDisponibilidadCheck(req, res, params);
        }
        break;
        
      case 'health':
        return res.status(200).json({ 
          status: 'OK', 
          timestamp: new Date().toISOString(),
          message: 'Consolidated API is running'
        });
        
      default:
        return res.status(400).json({ 
          error: 'Invalid type parameter',
          available: ['barberos', 'servicios', 'usuarios', 'reservas', 'bloqueos', 'disponibilidad', 'health']
        });
    }

  } catch (error) {
    console.error('❌ Consolidated API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// =====================================================
// 🔥 BARBEROS HANDLER - Corregido para usar tabla usuarios
// =====================================================
async function handleBarberos(req, res, params) {
  if (req.method === 'GET') {
    const { id } = params;
    
    if (id) {
      // Obtener barbero específico
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
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
        `)
        .eq('id_usuario', id)
        .single();
        
      if (error) return res.status(404).json({ error: 'Barbero no encontrado' });
      return res.status(200).json({ data });
    } else {
      // Obtener todos los barberos (filtrar por activo y rol)
      const showInactive = params.includeInactive === 'true';
      let query = supabase
        .from('usuarios')
        .select(`
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
        `)
        .eq('rol', 'barbero');
      
      if (!showInactive) {
        query = query.eq('activo', true);
      }
      
      const { data, error } = await query.order('nombre');
      if (error) {
        console.error('Error fetching barberos:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ data: data || [] });
    }
  }
  
  if (req.method === 'POST') {
    const { nombre, telefono, email, especialidades, horario_inicio, horario_fin, dias_trabajo, tiempo_descanso, activo } = req.body;
    
    // Crear usuario primero
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        nombre,
        telefono,
        email,
        rol: 'barbero',
        activo: activo !== false
      })
      .select()
      .single();
      
    if (usuarioError) return res.status(400).json({ error: usuarioError.message });
    
    // Crear perfil de barbero
    const { data: barbero, error: barberoError } = await supabase
      .from('barberos')
      .insert({
        id_usuario: usuario.id_usuario,
        especialidades: especialidades || [],
        horario_inicio: horario_inicio || '09:00',
        horario_fin: horario_fin || '18:00',
        dias_trabajo: dias_trabajo || ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
        tiempo_descanso: tiempo_descanso || 15
      })
      .select()
      .single();
      
    if (barberoError) return res.status(400).json({ error: barberoError.message });
    
    return res.status(201).json({ data: { ...usuario, barberos: barbero } });
  }
  
  if (req.method === 'PUT') {
    const { id } = params;
    const updates = req.body;
    
    // Separar updates de usuario y barbero
    const usuarioUpdates = {};
    const barberoUpdates = {};
    
    ['nombre', 'email', 'telefono', 'activo'].forEach(field => {
      if (updates[field] !== undefined) usuarioUpdates[field] = updates[field];
    });
    
    ['especialidades', 'horario_inicio', 'horario_fin', 'dias_trabajo', 'tiempo_descanso', 'biografia'].forEach(field => {
      if (updates[field] !== undefined) barberoUpdates[field] = updates[field];
    });
    
    // Actualizar usuario
    if (Object.keys(usuarioUpdates).length > 0) {
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .update(usuarioUpdates)
        .eq('id_usuario', id);
        
      if (usuarioError) return res.status(400).json({ error: usuarioError.message });
    }
    
    // Actualizar barbero
    if (Object.keys(barberoUpdates).length > 0) {
      const { error: barberoError } = await supabase
        .from('barberos')
        .update(barberoUpdates)
        .eq('id_usuario', id);
        
      if (barberoError) return res.status(400).json({ error: barberoError.message });
    }
    
    // Obtener datos actualizados
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id_usuario, nombre, email, telefono, rol, activo,
        barberos (especialidades, horario_inicio, horario_fin, dias_trabajo, tiempo_descanso)
      `)
      .eq('id_usuario', id)
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// =====================================================
// 🔥 DISPONIBILIDAD MONTH HANDLER (SIMPLIFICADO)
// =====================================================
async function handleDisponibilidadMonth(req, res, params) {
  const { barberoId, serviceId, year, month } = params;

  if (!barberoId || !serviceId || !year || !month) {
    return res.status(400).json({ 
      error: 'Faltan parámetros: barberoId, serviceId, year, month' 
    });
  }

  console.log(`🚀 ULTRA-FAST Calendar: ${barberoId}-${serviceId}-${year}-${month}`);
  const startTime = Date.now();

  try {
    // STEP 1: Obtener información del barbero desde usuarios
    const { data: barbero, error: barberoError } = await supabase
      .from('usuarios')
      .select(`
        id_usuario,
        nombre,
        activo,
        barberos (
          horario_inicio,
          horario_fin,
          dias_trabajo
        )
      `)
      .eq('id_usuario', barberoId)
      .eq('rol', 'barbero')
      .eq('activo', true)
      .single();

    if (barberoError || !barbero) {
      return res.status(404).json({ error: 'Barbero no encontrado' });
    }

    // STEP 2: Obtener información del servicio
    const { data: servicio, error: servicioError } = await supabase
      .from('servicios')
      .select('id_servicio, duracion_minutos, nombre')
      .eq('id_servicio', serviceId)
      .eq('activo', true)
      .single();

    if (servicioError || !servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // STEP 3: Calcular rango de fechas del mes
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;

    // STEP 4: Obtener reservas del mes
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

    // STEP 5: Obtener bloqueos del mes
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

    // STEP 6: Procesar datos
    const serviceDuration = servicio.duracion_minutos || 30;
    const barberoConfig = barbero.barberos || {};
    const workingDays = Array.isArray(barberoConfig.dias_trabajo) 
      ? barberoConfig.dias_trabajo 
      : JSON.parse(barberoConfig.dias_trabajo || '["lunes","martes","miercoles","jueves","viernes"]');
    
    const horaInicio = barberoConfig.horario_inicio || '09:00';
    const horaFin = barberoConfig.horario_fin || '18:00';

    // Indexar datos para búsqueda O(1)
    const reservasByDate = new Map();
    const bloqueosByDate = new Map();

    (reservas || []).forEach(reserva => {
      if (!reservasByDate.has(reserva.fecha)) {
        reservasByDate.set(reserva.fecha, []);
      }
      reservasByDate.get(reserva.fecha).push({
        inicio: reserva.hora_inicio,
        fin: reserva.hora_fin
      });
    });

    (bloqueos || []).forEach(bloqueo => {
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

    // STEP 7: Procesar todos los días
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
    const daysMap = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3,
      'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(parseInt(year), parseInt(month) - 1, day);
      const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayName = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][date.getDay()];

      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const isWorkingDay = workingDays.includes(dayName) || workingDays.includes(dayName.replace('é', 'e'));

      if (isPast || !isWorkingDay) {
        result.unavailableDays.push({
          day,
          date: dateStr,
          reason: isPast ? 'past' : 'not_working_day'
        });
        continue;
      }

      const dayBloqueos = bloqueosByDate.get(dateStr) || [];
      const hasFullDayBlock = dayBloqueos.some(b => 
        b.inicio === '00:00:00' && b.fin === '23:59:59'
      );

      if (hasFullDayBlock) {
        result.unavailableDays.push({ day, date: dateStr, reason: 'blocked' });
        continue;
      }

      const availableSlots = generateAvailableSlots(
        horaInicio,
        horaFin,
        serviceDuration,
        reservasByDate.get(dateStr) || [],
        dayBloqueos,
        isToday ? today.getHours() * 60 + today.getMinutes() : 0
      );

      if (availableSlots.length > 0) {
        result.availableDays.push({
          day, date: dateStr, slotsCount: availableSlots.length,
          firstSlot: availableSlots[0], lastSlot: availableSlots[availableSlots.length - 1]
        });
      } else {
        result.unavailableDays.push({ day, date: dateStr, reason: 'no_slots' });
      }
    }

    result.processingTime = Date.now() - startTime;
    console.log(`✅ ULTRA-FAST: ${result.processingTime}ms, Available: ${result.availableDays.length}/${daysInMonth}`);
    
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Disponibilidad Month Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// =====================================================
// 🔥 OTROS HANDLERS SIMPLIFICADOS
// =====================================================
async function handleServicios(req, res, params) {
  if (req.method === 'GET') {
    const { id } = params;
    
    if (id) {
      // Obtener servicio específico
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('id_servicio', id)
        .single();
        
      if (error) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.status(200).json({ data });
    } else {
      // Obtener todos los servicios
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('activo', true)
        .order('nombre');
        
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data: data || [] });
    }
  }
  
  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('servicios')
      .insert(req.body)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ data });
  }
  
  if (req.method === 'PUT') {
    const { id } = params;
    const { data, error } = await supabase
      .from('servicios')
      .update(req.body)
      .eq('id_servicio', id)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }
  
  if (req.method === 'DELETE') {
    const { id } = params;
    const { data, error } = await supabase
      .from('servicios')
      .update({ activo: false })
      .eq('id_servicio', id)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleUsuarios(req, res, params) {
  if (req.method === 'GET') {
    const { id, email } = params;
    
    if (id) {
      // Obtener usuario específico
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario', id)
        .single();
        
      if (error) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.status(200).json({ data });
    } else if (email) {
      // Buscar por email
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('activo', true);
        
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data: data || [] });
    } else {
      // Obtener todos los usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nombre');
        
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data: data || [] });
    }
  }
  
  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(req.body)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ data });
  }
  
  if (req.method === 'PUT') {
    const { id } = params;
    const { data, error } = await supabase
      .from('usuarios')
      .update(req.body)
      .eq('id_usuario', id)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleReservas(req, res, params) {
  if (req.method === 'GET') {
    const { id, barbero, fecha, estado, cliente } = params;
    
    if (id) {
      // Obtener reserva específica
      const { data, error } = await supabase
        .from('reservas_mvp')
        .select(`
          *,
          cliente:clientes(id_cliente, nombre, telefono, email),
          servicios(id_servicio, nombre, precio, duracion_minutos)
        `)
        .eq('id_reserva', id)
        .single();
        
      if (error) return res.status(404).json({ error: 'Reserva no encontrada' });
      return res.status(200).json({ data });
    } else {
      // Obtener reservas con filtros
      let query = supabase
        .from('reservas_mvp')
        .select(`
          *,
          cliente:clientes(id_cliente, nombre, telefono, email),
          servicios(id_servicio, nombre, precio, duracion_minutos)
        `);
      
      if (barbero) query = query.eq('id_barbero', barbero);
      if (fecha) query = query.eq('fecha', fecha);
      if (estado) query = query.eq('estado', estado);
      if (cliente) query = query.eq('id_cliente', cliente);
      
      query = query.order('fecha', { ascending: false })
                   .order('hora_inicio', { ascending: false });
      
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data: data || [] });
    }
  }
  
  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('reservas_mvp')
      .insert(req.body)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ data });
  }
  
  if (req.method === 'PUT') {
    const { id } = params;
    const { data, error } = await supabase
      .from('reservas_mvp')
      .update(req.body)
      .eq('id_reserva', id)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleBloqueos(req, res, params) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('bloqueos')
      .select('*')
      .order('fecha_inicio');
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data: data || [] });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleDisponibilidadCheck(req, res, params) {
  // Implementación simplificada para check individual
  return res.status(200).json({ available: true, slots: [] });
}

// =====================================================
// 🔥 HELPER FUNCTION
// =====================================================
function generateAvailableSlots(horaInicio, horaFin, duration, reservas, bloqueos, minCurrentTime) {
  const slots = [];
  
  const [startHour, startMin] = horaInicio.split(':').map(Number);
  const [endHour, endMin] = horaFin.split(':').map(Number);
  
  const dayStart = startHour * 60 + startMin;
  const dayEnd = endHour * 60 + endMin;
  
  const occupied = new Array(24 * 60).fill(false);
  
  // Marcar reservas
  reservas.forEach(reserva => {
    const [rStartH, rStartM] = reserva.inicio.split(':').map(Number);
    const [rEndH, rEndM] = reserva.fin.split(':').map(Number);
    
    for (let m = rStartH * 60 + rStartM; m < rEndH * 60 + rEndM; m++) {
      occupied[m] = true;
    }
  });
  
  // Marcar bloqueos
  bloqueos.forEach(bloqueo => {
    const [bStartH, bStartM] = bloqueo.inicio.split(':').map(Number);
    const [bEndH, bEndM] = bloqueo.fin.split(':').map(Number);
    
    for (let m = bStartH * 60 + bStartM; m < bEndH * 60 + bEndM; m++) {
      occupied[m] = true;
    }
  });
  
  // Generar slots
  for (let start = Math.max(dayStart, minCurrentTime + 120); start + duration <= dayEnd; start += 15) {
    let canBook = true;
    
    for (let m = start; m < start + duration; m++) {
      if (occupied[m]) {
        canBook = false;
        break;
      }
    }
    
    if (canBook) {
      const hour = Math.floor(start / 60);
      const min = start % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }
  
  return slots;
}
