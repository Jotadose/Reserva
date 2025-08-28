const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const SUPABASE_URL = 'https://qvxwfkbcrunaebahpmft.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eHdma2JjcnVuYWViYWhwbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5OTAzNTAsImV4cCI6MjA1MDU2NjM1MH0.cYa6R8XdIEqmgm3FGKj3nQZY3gB6WbELKhXsYy6XO08';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugDatabase() {
  console.log('🔍 Debuggeando estado de la base de datos...\n');
  
  try {
    // 1. Verificar especialistas
    console.log('1️⃣ Verificando especialistas:');
    const { data: specialists, error: specialistsError } = await supabase
      .from('specialists')
      .select('*');
    
    if (specialistsError) {
      console.error('❌ Error obteniendo especialistas:', specialistsError);
    } else {
      console.log(`✅ Encontrados ${specialists.length} especialistas`);
      specialists.forEach(s => {
        console.log(`   - ${s.name} (${s.is_active ? 'activo' : 'inactivo'})`);
      });
    }
    console.log('');

    // 2. Verificar servicios
    console.log('2️⃣ Verificando servicios:');
    const { data: services, error: servicesError } = await supabase
      .from('services_new')
      .select('*');
    
    if (servicesError) {
      console.error('❌ Error obteniendo servicios:', servicesError);
    } else {
      console.log(`✅ Encontrados ${services.length} servicios`);
      services.forEach(s => {
        console.log(`   - ${s.name} (${s.is_active ? 'activo' : 'inactivo'})`);
      });
    }
    console.log('');

    // 3. Verificar reservas de hoy
    const today = new Date().toISOString().split('T')[0];
    console.log(`3️⃣ Verificando reservas para hoy (${today}):`);
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings_new')
      .select('*')
      .eq('scheduled_date', today);
    
    if (bookingsError) {
      console.error('❌ Error obteniendo reservas:', bookingsError);
    } else {
      console.log(`✅ Encontradas ${bookings.length} reservas para hoy`);
      bookings.forEach(b => {
        console.log(`   - ${b.scheduled_time} - Estado: ${b.status}`);
      });
    }
    console.log('');

    // 4. Probar lógica de disponibilidad
    console.log('4️⃣ Probando lógica de disponibilidad:');
    
    if (specialists && specialists.length > 0) {
      // Simular la lógica de disponibilidad
      const workStart = 9;
      const workEnd = 18;
      const slotInterval = 30;
      
      const allSlots = [];
      for (let hour = workStart; hour < workEnd; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          allSlots.push(timeString);
        }
      }
      
      console.log(`✅ Slots generados: ${allSlots.length}`);
      console.log(`   Ejemplos: ${allSlots.slice(0, 5).join(', ')}...`);
      
      // Verificar disponibilidad para cada slot
      const availableSlots = allSlots.filter(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const slotStartMinutes = slotHour * 60 + slotMinute;
        const slotEndMinutes = slotStartMinutes + 60; // asumiendo 60 min de duración
        
        // Verificar conflictos
        const hasConflicts = (bookings || []).some(booking => {
          const [bookingHour, bookingMinute] = booking.scheduled_time.split(':').map(Number);
          const bookingStartMinutes = bookingHour * 60 + bookingMinute;
          const bookingEndMinutes = bookingStartMinutes + (booking.estimated_duration || 60);
          
          return (
            (slotStartMinutes < bookingEndMinutes) &&
            (slotEndMinutes > bookingStartMinutes)
          );
        });
        
        return !hasConflicts;
      });
      
      console.log(`✅ Slots disponibles: ${availableSlots.length}`);
      if (availableSlots.length > 0) {
        console.log(`   Primeros 10: ${availableSlots.slice(0, 10).join(', ')}`);
      }
    } else {
      console.log('❌ No hay especialistas para calcular disponibilidad');
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

debugDatabase();
