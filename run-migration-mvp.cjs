const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

// Usar el cliente de Supabase existente - necesitamos usar import dinámico
async function runMigrationByParts() {
  try {
    console.log('🚀 Iniciando migración completa a esquema MVP...\n');
    
    console.log('📋 Para ejecutar esta migración necesitas acceso directo a la base de datos.');
    console.log('💡 Te proporciono 3 opciones:\n');
    
    console.log('📝 OPCIÓN 1: Editor SQL de Supabase (RECOMENDADO)');
    console.log('  1. Ve a: https://supabase.com/dashboard/project/qvxwfkbcrunaebahpmft/sql');
    console.log('  2. Copia el contenido del archivo: database/migration-mvp-complete.sql');
    console.log('  3. Pégalo en el editor y ejecuta\n');
    
    console.log('📝 OPCIÓN 2: Usar psql (si tienes acceso)');
    console.log('  1. Obtén la connection string de Supabase');
    console.log('  2. Ejecuta: psql "postgresql://..." -f database/migration-mvp-complete.sql\n');
    
    console.log('📝 OPCIÓN 3: Ejecutar por partes (siguiente)');
    console.log('  Si las opciones anteriores no funcionan, podemos ejecutar por partes usando Supabase client\n');
    
    // Mostrar contenido del archivo de migración para referencia
    const migrationPath = path.join(__dirname, 'database', 'migration-mvp-complete.sql');
    
    if (fs.existsSync(migrationPath)) {
      console.log('📁 Archivo de migración encontrado en:', migrationPath);
      console.log('📄 Tamaño:', fs.statSync(migrationPath).size, 'bytes');
    } else {
      console.error('❌ No se encontró el archivo de migración en:', migrationPath);
      return;
    }
    
    console.log('\n🎯 Estructura que se creará:');
    console.log('  📊 Tablas principales:');
    console.log('    • usuarios (con roles: cliente, barbero, admin)');
    console.log('    • barberos (extiende usuarios)');
    console.log('    • servicios (cortes, barba, etc.)');
    console.log('    • disponibilidad (horarios por barbero)');
    console.log('    • reservas (normalizada con referencias)');
    
    console.log('\n  👥 Datos de prueba:');
    console.log('    • 1 administrador');
    console.log('    • 4 barberos con especialidades');
    console.log('    • 6 servicios configurados');
    console.log('    • 2 clientes de ejemplo');
    console.log('    • Algunas reservas de prueba');
    
    console.log('\n🚀 Una vez ejecutada la migración, podremos:');
    console.log('  ✅ Actualizar la API para usar las nuevas tablas');
    console.log('  ✅ Crear hooks para usuarios, barberos, servicios');
    console.log('  ✅ Implementar sistema de roles');
    console.log('  ✅ Crear interfaces específicas por rol');
    
    console.log('\n❓ ¿Qué opción prefieres? (Responde con 1, 2 o 3)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Función para mostrar el contenido del archivo de migración
function showMigrationContent() {
  try {
    const migrationPath = path.join(__dirname, 'database', 'migration-mvp-complete.sql');
    const content = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 CONTENIDO DE LA MIGRACIÓN:');
    console.log('=' .repeat(80));
    console.log(content);
    console.log('=' .repeat(80));
    
  } catch (error) {
    console.error('❌ Error leyendo archivo:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--show-content')) {
    showMigrationContent();
  } else {
    runMigrationByParts().catch(console.error);
  }
}

module.exports = { runMigrationByParts, showMigrationContent };
