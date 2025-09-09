// Script para verificar y corregir los servicios de los barberos
import { supabase } from './lib/database.js';

async function fixBarberosServicios() {
  console.log('🔍 Verificando y corrigiendo servicios de barberos...');
  
  try {
    // 1. Obtener todos los servicios disponibles
    console.log('📋 1. Obteniendo servicios disponibles...');
    const { data: servicios, error: serviciosError } = await supabase
      .from('servicios')
      .select('id_servicio, nombre, descripcion, precio, duracion')
      .eq('activo', true);
    
    if (serviciosError) {
      console.error('❌ Error obteniendo servicios:', serviciosError.message);
      return;
    }
    
    console.log('✅ Servicios encontrados:');
    servicios.forEach(servicio => {
      console.log(`  - ${servicio.id_servicio}: ${servicio.nombre} ($${servicio.precio})`);
    });
    
    // 2. Obtener todos los barberos
    console.log('\n📋 2. Obteniendo barberos actuales...');
    const { data: barberos, error: barberosError } = await supabase
      .from('barberos')
      .select('id_barbero, servicios');
    
    if (barberosError) {
      console.error('❌ Error obteniendo barberos:', barberosError.message);
      return;
    }
    
    console.log('✅ Barberos encontrados:');
    barberos.forEach(barbero => {
      console.log(`  - ${barbero.id_barbero}: servicios = ${JSON.stringify(barbero.servicios)}`);
    });
    
    // 3. Crear mapeo de especialidades a servicios
    const mapeoEspecialidadesAServicios = {
      'Especialista en cortes clásicos y modernos': [servicios[0]?.id_servicio], // Primer servicio
      'Experto en tendencias y coloración. Formado': [servicios[1]?.id_servicio], // Segundo servicio
      'Maestro del afeitado tradicional con navaja': [servicios[2]?.id_servicio], // Tercer servicio
      'Especialista en diseños creativos y cortes': [servicios[3]?.id_servicio], // Cuarto servicio
    };
    
    // 4. Actualizar barberos con IDs correctos
    console.log('\n🔄 3. Actualizando barberos...');
    
    for (const barbero of barberos) {
      let nuevosServicios = [];
      
      // Si servicios es un array de strings (descripciones), mapear a IDs
      if (Array.isArray(barbero.servicios)) {
        for (const servicioActual of barbero.servicios) {
          if (typeof servicioActual === 'string' && mapeoEspecialidadesAServicios[servicioActual]) {
            nuevosServicios.push(...mapeoEspecialidadesAServicios[servicioActual]);
          } else if (typeof servicioActual === 'string' && servicioActual.length === 36) {
            // Ya es un UUID, mantenerlo
            nuevosServicios.push(servicioActual);
          }
        }
      }
      
      // Si no se pudo mapear, asignar el primer servicio por defecto
      if (nuevosServicios.length === 0 && servicios.length > 0) {
        nuevosServicios = [servicios[0].id_servicio];
      }
      
      // Eliminar duplicados
      nuevosServicios = [...new Set(nuevosServicios)];
      
      console.log(`Actualizando barbero ${barbero.id_barbero}:`);
      console.log(`  Antes: ${JSON.stringify(barbero.servicios)}`);
      console.log(`  Después: ${JSON.stringify(nuevosServicios)}`);
      
      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from('barberos')
        .update({ servicios: nuevosServicios })
        .eq('id_barbero', barbero.id_barbero);
      
      if (updateError) {
        console.error(`❌ Error actualizando barbero ${barbero.id_barbero}:`, updateError.message);
      } else {
        console.log(`✅ Barbero ${barbero.id_barbero} actualizado`);
      }
    }
    
    console.log('\n🎉 Proceso completado. Verificando resultado...');
    
    // 5. Verificar resultado final
    const { data: barberosActualizados, error: verificacionError } = await supabase
      .from('barberos')
      .select('id_barbero, servicios');
    
    if (verificacionError) {
      console.error('❌ Error en verificación:', verificacionError.message);
      return;
    }
    
    console.log('✅ Estado final de barberos:');
    barberosActualizados.forEach(barbero => {
      console.log(`  - ${barbero.id_barbero}: ${JSON.stringify(barbero.servicios)}`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
  
  process.exit(0);
}

fixBarberosServicios();
