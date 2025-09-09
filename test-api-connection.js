// Probar conexión a través de la API que sabemos que funciona
const API_BASE = 'https://reserva-mauve.vercel.app/api/consolidated';

async function testApiConnection() {
  console.log('🔍 Probando conexión con API...');
  
  try {
    // 1. Probar obtener servicios
    console.log('📋 1. Obteniendo servicios via API...');
    const servicesResponse = await fetch(`${API_BASE}?type=servicios`);
    const services = await servicesResponse.json();
    
    if (servicesResponse.ok) {
      console.log('✅ Servicios obtenidos:', services.data?.length || 0);
      if (services.data) {
        services.data.forEach(s => console.log(`  - ${s.nombre} (${s.id_servicio})`));
      }
    } else {
      console.log('❌ Error obteniendo servicios:', services.error);
      return;
    }
    
    // 2. Probar obtener barberos
    console.log('\n📋 2. Obteniendo barberos via API...');
    const barberosResponse = await fetch(`${API_BASE}?type=barberos`);
    const barberos = await barberosResponse.json();
    
    if (barberosResponse.ok) {
      console.log('✅ Barberos obtenidos:', barberos.data?.length || 0);
      if (barberos.data) {
        barberos.data.forEach(b => {
          console.log(`  - ${b.nombre}: servicios = ${JSON.stringify(b.barberos?.servicios || b.barberos?.especialidades)}`);
        });
      }
    } else {
      console.log('❌ Error obteniendo barberos:', barberos.error);
      return;
    }
    
    // 3. Si tenemos datos, intentar actualizar un barbero
    if (services.data && barberos.data && barberos.data.length > 0 && services.data.length > 0) {
      console.log('\n🔄 3. Probando actualización de barbero...');
      
      const barberoTest = barberos.data[0];
      const serviciosIds = services.data.slice(0, 2).map(s => s.id_servicio); // Primeros 2 servicios
      
      console.log(`👤 Actualizando barbero: ${barberoTest.nombre} (${barberoTest.id_usuario})`);
      console.log(`🎯 Nuevos servicios: ${serviciosIds.join(', ')}`);
      
      const updateResponse = await fetch(
        `${API_BASE}?type=barberos&id=${barberoTest.id_usuario}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            servicios: serviciosIds
          })
        }
      );
      
      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ Barbero actualizado exitosamente!');
        console.log('📊 Resultado:', updateResult.data);
      } else {
        console.log('❌ Error actualizando barbero:', updateResult.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testApiConnection();
