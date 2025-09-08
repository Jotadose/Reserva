// Script para verificar límite de funciones Vercel
console.log('🔍 VERIFICANDO LÍMITE DE FUNCIONES SERVERLESS VERCEL\n');

const fs = require('fs');
const path = require('path');

// Contar archivos API
const apiDir = path.join(__dirname, 'api');
const apiFiles = [];

function scanDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.js')) {
        // Solo contar archivos .js principales (no subdirectorios)
        const relativePath = path.relative(__dirname, fullPath);
        apiFiles.push(relativePath);
      }
    });
  } catch (error) {
    console.log('❌ Error scanning directory:', error.message);
  }
}

scanDirectory(apiDir);

console.log('📊 ANÁLISIS DE FUNCIONES SERVERLESS:');
console.log('=====================================');
console.log(`📁 Total de archivos API encontrados: ${apiFiles.length}`);
console.log('');

// Mostrar lista completa
console.log('📋 LISTA COMPLETA DE APIS:');
apiFiles.forEach((file, index) => {
  const status = file.includes('consolidated') ? '🚀 CONSOLIDADA' : 
                 file.includes('test') || file.includes('backup') || file.includes('old') ? '🗑️  PUEDE ELIMINAR' :
                 '⚠️  INDIVIDUAL';
  console.log(`${(index + 1).toString().padStart(2, '0')}. ${file} ${status}`);
});

console.log('');

// Análisis del límite
const VERCEL_HOBBY_LIMIT = 12;
console.log('🎯 ANÁLISIS DEL LÍMITE VERCEL HOBBY:');
console.log('===================================');
console.log(`📏 Límite Vercel Hobby: ${VERCEL_HOBBY_LIMIT} funciones`);
console.log(`📊 Funciones actuales: ${apiFiles.length}`);

if (apiFiles.length > VERCEL_HOBBY_LIMIT) {
  console.log(`❌ EXCEDE EL LÍMITE por ${apiFiles.length - VERCEL_HOBBY_LIMIT} funciones`);
  console.log('');
  console.log('🚀 SOLUCIONES IMPLEMENTADAS:');
  console.log('✅ API consolidada (/api/consolidated.js)');
  console.log('✅ Maneja múltiples endpoints en una función');
  console.log('✅ Hooks actualizados para usar API consolidada');
  console.log('');
  console.log('🗑️  ARCHIVOS QUE PUEDEN ELIMINARSE:');
  
  const removableFiles = apiFiles.filter(file => 
    file.includes('test') || 
    file.includes('backup') || 
    file.includes('old') ||
    file.includes('servicios-backup') ||
    file.includes('servicios-new') ||
    file.includes('test-servicios')
  );
  
  removableFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  
  if (removableFiles.length > 0) {
    console.log(`\n💡 Eliminando ${removableFiles.length} archivos innecesarios reduciría a ${apiFiles.length - removableFiles.length} funciones`);
  }
  
} else {
  console.log(`✅ DENTRO DEL LÍMITE (${VERCEL_HOBBY_LIMIT - apiFiles.length} funciones disponibles)`);
}

console.log('');
console.log('🎯 RECOMENDACIONES FINALES:');
console.log('==========================');
console.log('1. 🗑️  Eliminar archivos *-backup.js, *-test.js, *-old.js');
console.log('2. 🚀 Usar /api/consolidated.js para todos los endpoints principales');
console.log('3. 📦 Mantener solo APIs esenciales como health.js');
console.log('4. ✅ Actualizar todos los hooks para usar API consolidada');
console.log('');

// Generar comando de limpieza
console.log('🔧 COMANDO DE LIMPIEZA AUTOMÁTICA:');
const cleanupFiles = apiFiles.filter(file => 
  file.includes('backup') || 
  file.includes('test') ||
  file.includes('servicios-new')
);

if (cleanupFiles.length > 0) {
  console.log('```bash');
  cleanupFiles.forEach(file => {
    console.log(`rm "${file}"`);
  });
  console.log('```');
  console.log(`\n💡 Esto eliminaría ${cleanupFiles.length} archivos innecesarios`);
} else {
  console.log('✅ No hay archivos innecesarios detectados');
}

console.log('\n🎉 VERIFICACIÓN COMPLETA');
