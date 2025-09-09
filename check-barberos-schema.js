// Verificar esquema de la tabla barberos
import { supabase } from './lib/database.js';

async function checkBarberSchema() {
  console.log('🔍 Verificando esquema de la tabla barberos...');
  
  try {
    // Obtener información de columnas directamente de información_schema
    const { data: columns, error: columnError } = await supabase
      .rpc('sql', {
        query: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'barberos' 
          ORDER BY ordinal_position;
        `
      });

    if (columnError) {
      console.log('❌ Error obteniendo columnas via RPC, intentando método alternativo...');
      
      // Método alternativo: obtener un registro para ver columnas
      const { data: sample, error: sampleError } = await supabase
        .from('barberos')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Error obteniendo muestra:', sampleError.message);
        return;
      }
      
      if (sample && sample.length > 0) {
        console.log('✅ Columnas encontradas en barberos:', Object.keys(sample[0]));
        console.log('📋 Registro de muestra:', sample[0]);
        
        // Verificar si tiene "servicios" o "especialidades"
        const hasServicios = 'servicios' in sample[0];
        const hasEspecialidades = 'especialidades' in sample[0];
        
        console.log(`🔍 Tiene columna "servicios": ${hasServicios}`);
        console.log(`🔍 Tiene columna "especialidades": ${hasEspecialidades}`);
        
        if (hasEspecialidades && !hasServicios) {
          console.log('⚠️ NECESITA MIGRACIÓN: La tabla tiene "especialidades" pero no "servicios"');
        } else if (hasServicios) {
          console.log('✅ La tabla ya tiene la columna "servicios"');
        }
      } else {
        console.log('📋 No hay registros en la tabla barberos');
      }
    } else {
      console.log('✅ Columnas de la tabla barberos:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkBarberSchema();
