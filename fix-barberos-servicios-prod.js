// Script para corregir los servicios de los barberos usando las credenciales de producción
import { createClient } from '@supabase/supabase-js';

// Usar exactamente las mismas credenciales que usa la API en producción
const supabaseUrl = "https://qvxwfkbcrunaebahpmft.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eHdma2JjcnVuYWViYWhwbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5OTAzNTAsImV4cCI6MjA1MDU2NjM1MH0.cYa6R8XdIEqmgm3FGKj3nQZY3gB6WbELKhXsYy6XO08";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBarberosServicios() {
  console.log('🔧 Iniciando corrección de servicios de barberos...');
  
  try {
    // 1. Obtener todos los servicios disponibles
    console.log('📋 1. Obteniendo servicios disponibles...');
    const { data: servicios, error: serviciosError } = await supabase
      .from('servicios')
      .select('id_servicio, nombre, descripcion')
      .eq('activo', true);
    
    if (serviciosError) {
      console.error('❌ Error obteniendo servicios:', serviciosError.message);
      return;
    }
    
    console.log('✅ Servicios encontrados:', servicios.length);
    servicios.forEach(s => console.log(`  - ${s.nombre} (${s.id_servicio})`));
    
    // 2. Obtener todos los barberos
    console.log('\n📋 2. Obteniendo barberos...');
    const { data: barberos, error: barberosError } = await supabase
      .from('barberos')
      .select('id_barbero, servicios');
    
    if (barberosError) {
      console.error('❌ Error obteniendo barberos:', barberosError.message);
      return;
    }
    
    console.log('✅ Barberos encontrados:', barberos.length);
    
    // 3. Mapear todos los barberos a servicios básicos por defecto
    console.log('\n🔄 3. Actualizando servicios de barberos...');
    
    // Usar los primeros servicios disponibles como servicios por defecto
    const serviciosBasicos = servicios.slice(0, 3).map(s => s.id_servicio); // Tomar los primeros 3 servicios
    
    console.log('🎯 Servicios por defecto a asignar:', serviciosBasicos);
    
    let updateCount = 0;
    
    for (const barbero of barberos) {
      console.log(`\n👤 Procesando barbero: ${barbero.id_barbero}`);
      console.log(`📝 Servicios actuales:`, barbero.servicios);
      
      // Actualizar con servicios por defecto
      const { error: updateError } = await supabase
        .from('barberos')
        .update({
          servicios: serviciosBasicos
        })
        .eq('id_barbero', barbero.id_barbero);
      
      if (updateError) {
        console.error(`❌ Error actualizando barbero ${barbero.id_barbero}:`, updateError.message);
      } else {
        console.log(`✅ Barbero actualizado con servicios: ${serviciosBasicos.join(', ')}`);
        updateCount++;
      }
    }
    
    console.log(`\n🎉 Corrección completada! ${updateCount}/${barberos.length} barberos actualizados.`);
    
    // 4. Verificar resultado
    console.log('\n📊 4. Verificando resultado...');
    const { data: verificacion, error: verifyError } = await supabase
      .from('barberos')
      .select('id_barbero, servicios');
    
    if (!verifyError && verificacion) {
      console.log('✅ Estado final de barberos:');
      verificacion.forEach(b => {
        console.log(`  - ${b.id_barbero}: ${JSON.stringify(b.servicios)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

fixBarberosServicios();
