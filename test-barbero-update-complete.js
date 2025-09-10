// Test específico para verificar el fix de la actualización de barberos
const API_BASE = 'https://reserva-mauve.vercel.app/api/consolidated';

async function testBarberoUpdateFix() {
  console.log('🧪 Probando fix de actualización de barberos...');

  try {
    // 1. Obtener barberos existentes
    const responseGet = await fetch(`${API_BASE}?type=barberos`);
    const barberos = await responseGet.json();
    
    if (!barberos.data || barberos.data.length === 0) {
      console.log('❌ No hay barberos para probar');
      return;
    }

    // 2. Seleccionar un barbero para actualizar
    const barbero = barberos.data.find(b => b.nombre === 'Jota') || barberos.data[0];
    console.log(`👤 Barbero seleccionado: ${barbero.nombre} (${barbero.id_usuario})`);
    console.log(`📋 Servicios actuales:`, barbero.barberos?.servicios);

    // 3. Datos de prueba para actualización
    const serviciosIds = [
      '660e8400-e29b-41d4-a716-446655440001', // Corte Básico
      '660e8400-e29b-41d4-a716-446655440003'  // Arreglo de Barba
    ];

    const updateData = {
      nombre: barbero.nombre,
      servicios: serviciosIds,
      biografia: `Barbero profesional actualizado en ${new Date().toISOString()}`
    };

    console.log('🔄 Actualizando con datos:', updateData);

    // 4. Hacer la actualización
    const responsePut = await fetch(
      `${API_BASE}?type=barberos&id=${barbero.id_usuario}`, 
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      }
    );

    const result = await responsePut.json();

    if (responsePut.ok) {
      console.log('✅ Actualización exitosa!');
      console.log('📊 Datos devueltos:', {
        id: result.data?.id_usuario,
        nombre: result.data?.nombre,
        servicios: result.data?.barberos?.servicios,
        biografia: result.data?.barberos?.biografia,
        barberos_object: result.data?.barberos ? 'EXISTS' : 'NULL'
      });

      // Verificar que los datos estén completos
      if (result.data?.barberos) {
        console.log('✅ Los datos del barbero se devuelven correctamente');
        
        if (Array.isArray(result.data.barberos.servicios)) {
          console.log('✅ Los servicios son un array válido');
        } else {
          console.log('❌ Los servicios no son un array:', typeof result.data.barberos.servicios);
        }
      } else {
        console.log('❌ PROBLEMA: barberos es null en la respuesta');
      }

    } else {
      console.log('❌ Error en actualización:', {
        status: responsePut.status,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar la prueba
testBarberoUpdateFix();
