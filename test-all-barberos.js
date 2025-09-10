// Test para verificar que TODOS los barberos se muestren (activos e inactivos)
const API_BASE = 'https://reserva-mauve.vercel.app/api/consolidated';

async function testAllBarberos() {
  console.log('🧪 Probando que se muestren TODOS los barberos...');

  try {
    // 1. Obtener barberos SIN includeInactive (solo activos)
    console.log('📋 1. Obteniendo barberos ACTIVOS solamente...');
    const responseActive = await fetch(`${API_BASE}?type=barberos`);
    const activeData = await responseActive.json();
    
    console.log(`✅ Barberos ACTIVOS: ${activeData.data?.length || 0}`);
    activeData.data?.forEach(barbero => {
      console.log(`  - ${barbero.nombre} (activo: ${barbero.activo})`);
    });

    // 2. Obtener TODOS los barberos incluyendo inactivos
    console.log('\n📋 2. Obteniendo TODOS los barberos (activos + inactivos)...');
    const responseAll = await fetch(`${API_BASE}?type=barberos&includeInactive=true`);
    const allData = await responseAll.json();
    
    console.log(`✅ TODOS los barberos: ${allData.data?.length || 0}`);
    
    // Separar por estado
    const activos = allData.data?.filter(b => b.activo) || [];
    const inactivos = allData.data?.filter(b => !b.activo) || [];
    
    console.log(`\n📊 ACTIVOS (${activos.length}):`);
    activos.forEach(barbero => {
      console.log(`  ✅ ${barbero.nombre} - servicios: ${barbero.barberos?.servicios?.length || 'sin servicios'}`);
    });
    
    console.log(`\n📊 INACTIVOS (${inactivos.length}):`);
    inactivos.forEach(barbero => {
      console.log(`  ❌ ${barbero.nombre} - servicios: ${barbero.barberos?.servicios?.length || 'sin servicios'}`);
    });

    // 3. Verificar que el hook del frontend esté pidiendo includeInactive
    console.log('\n🔍 3. Verificación de diferencias:');
    console.log(`- API solo activos: ${activeData.data?.length || 0} barberos`);
    console.log(`- API todos: ${allData.data?.length || 0} barberos`);
    console.log(`- Diferencia: ${(allData.data?.length || 0) - (activeData.data?.length || 0)} barberos inactivos`);
    
    if ((allData.data?.length || 0) > (activeData.data?.length || 0)) {
      console.log('⚠️ HAY BARBEROS INACTIVOS que no se mostrarán en el frontend si no se usa includeInactive=true');
    } else {
      console.log('✅ Todos los barberos están activos o no hay diferencia');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAllBarberos();
