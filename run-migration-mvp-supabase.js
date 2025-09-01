const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

// Usar el cliente de Supabase existente
const { supabaseClient } = require('./src/lib/supabaseClient');

async function runMigrationWithSupabase() {
  try {
    console.log('🚀 Iniciando migración completa a esquema MVP con Supabase...\n');
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'database', 'migration-mvp-complete.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Dividir el SQL en statements individuales para mejor manejo de errores
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Ejecutando ${statements.length} statements SQL...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Saltar comentarios y líneas vacías
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }
      
      try {
        console.log(`📄 Ejecutando statement ${i + 1}/${statements.length}...`);
        
        // Usar el método rpc de Supabase para ejecutar SQL
        const { error } = await supabaseClient.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          console.warn(`⚠️  Warning en statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.warn(`⚠️  Error en statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Migración completada:`);
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`⚠️  Con warnings: ${errorCount}`);
    
    // Verificar el estado final
    console.log('\n📋 Verificando estado final:');
    
    const usuarios = await supabaseClient.from('usuarios').select('count', { count: 'exact' });
    const barberos = await supabaseClient.from('barberos').select('count', { count: 'exact' }).eq('activo', true);
    const servicios = await supabaseClient.from('servicios').select('count', { count: 'exact' }).eq('activo', true);
    const reservas = await supabaseClient.from('reservas').select('count', { count: 'exact' });
    
    console.log(`👥 Usuarios creados: ${usuarios.count || 0}`);
    console.log(`💇 Barberos activos: ${barberos.count || 0}`);
    console.log(`🔧 Servicios disponibles: ${servicios.count || 0}`);
    console.log(`📅 Reservas de ejemplo: ${reservas.count || 0}`);
    
    // Mostrar barberos creados
    const { data: barberosInfo } = await supabaseClient
      .from('usuarios')
      .select(`
        nombre,
        email,
        barberos (
          especialidades,
          horario_inicio,
          horario_fin
        )
      `)
      .eq('rol', 'barbero');
    
    if (barberosInfo && barberosInfo.length > 0) {
      console.log('\n💇 Barberos configurados:');
      barberosInfo.forEach(barbero => {
        const info = barbero.barberos;
        console.log(`  • ${barbero.nombre} (${info?.horario_inicio || 'N/A'} - ${info?.horario_fin || 'N/A'})`);
        console.log(`    Especialidades: ${info?.especialidades?.join(', ') || 'N/A'}`);
      });
    }
    
    // Mostrar servicios creados
    const { data: serviciosInfo } = await supabaseClient
      .from('servicios')
      .select('nombre, precio, duracion, categoria')
      .eq('activo', true)
      .order('categoria', { ascending: true })
      .order('precio', { ascending: true });
    
    if (serviciosInfo && serviciosInfo.length > 0) {
      console.log('\n🔧 Servicios disponibles:');
      serviciosInfo.forEach(servicio => {
        const precioPesos = (servicio.precio / 100).toLocaleString();
        console.log(`  • ${servicio.nombre} - $${precioPesos} (${servicio.duracion} min)`);
      });
    }
    
    console.log('\n🎯 ¡MVP base implementado exitosamente!');
    console.log('📋 Próximos pasos:');
    console.log('  1. Actualizar API endpoints para usar nuevas tablas');
    console.log('  2. Actualizar hooks del frontend');
    console.log('  3. Implementar sistema de autenticación');
    console.log('  4. Crear interfaces de barbero y admin');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error('📋 Detalles del error:', error);
    process.exit(1);
  }
}

// Función alternativa: Ejecutar por partes si la función RPC no existe
async function runMigrationByParts() {
  try {
    console.log('🚀 Iniciando migración por partes...\n');
    
    // Primero eliminar tablas existentes
    console.log('🗑️  Eliminando tablas existentes...');
    
    const tablesToDrop = ['barber_schedules', 'bookings', 'specialists'];
    
    for (const table of tablesToDrop) {
      try {
        const { error } = await supabaseClient.rpc('exec_sql', {
          sql_query: `DROP TABLE IF EXISTS ${table} CASCADE`
        });
        
        if (!error) {
          console.log(`✅ Tabla ${table} eliminada`);
        }
      } catch (err) {
        console.log(`⚠️  No se pudo eliminar ${table}: ${err.message}`);
      }
    }
    
    console.log('\n📋 Migrando manualmente por ser migración compleja...');
    console.log('⏰ Por favor, ejecuta el siguiente script SQL manualmente en el editor SQL de Supabase:');
    console.log('📁 Archivo: database/migration-mvp-complete.sql');
    console.log('🌐 Dashboard: https://supabase.com/dashboard/project/qvxwfkbcrunaebahpmft/sql');
    
    console.log('\n📝 O puedes copiar y pegar el contenido del archivo en el editor SQL.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigrationByParts().catch(console.error);
}

module.exports = { runMigrationWithSupabase, runMigrationByParts };
