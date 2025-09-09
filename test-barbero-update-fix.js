// Test para verificar la funcionalidad de actualización de barberos
// Este script prueba el endpoint PUT que estaba fallando

const API_BASE = 'https://reserva-mauve.vercel.app/api/consolidated';

async function testBarberoUpdate() {
  console.log('🧪 Iniciando prueba de actualización de barberos...');

  try {
    // 1. Primero obtener la lista de barberos
    console.log('📋 1. Obteniendo lista de barberos...');
    const responseGet = await fetch(`${API_BASE}?type=barberos`);
    const barberos = await responseGet.json();
    
    if (!barberos.data || barberos.data.length === 0) {
      console.log('❌ No hay barberos para probar');
      return;
    }

    console.log(`✅ Encontrados ${barberos.data.length} barberos`);
    
    // 2. Seleccionar el primer barbero para actualizar
    const barberoToUpdate = barberos.data[0];
    console.log('👤 Barbero seleccionado:', {
      id: barberoToUpdate.id_usuario,
      nombre: barberoToUpdate.nombre,
      servicios_actuales: barberoToUpdate.barberos?.servicios || barberoToUpdate.barberos?.especialidades
    });

    // 3. Preparar datos de prueba para la actualización
    const updateData = {
      nombre: barberoToUpdate.nombre, // Mantener el nombre
      servicios: ['660e8400-e29b-41d4-a716-446655440001'], // ID de servicio de ejemplo
      horario_inicio: '09:00:00',
      horario_fin: '18:00:00',
      biografia: 'Barbero profesional actualizado via API'
    };

    console.log('🔄 2. Intentando actualización...');
    console.log('📝 Datos a enviar:', updateData);

    // 4. Hacer la petición PUT
    const responsePut = await fetch(
      `${API_BASE}?type=barberos&id=${barberoToUpdate.id_usuario}`, 
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      }
    );

    const result = await responsePut.json();

    if (responsePut.ok) {
      console.log('✅ Actualización exitosa!');
      console.log('📊 Resultado:', result.data);
    } else {
      console.log('❌ Error en la actualización:', {
        status: responsePut.status,
        error: result.error
      });
      
      // Mostrar detalles adicionales si están disponibles
      if (result.details) {
        console.log('🔍 Detalles del error:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Función auxiliar para probar la creación (que ya funcionaba)
async function testBarberoCreation() {
  console.log('🧪 Probando creación de barbero...');
  
  const newBarbero = {
    nombre: 'Test API Update',
    email: 'test-api-update@example.com',
    telefono: '+56999888777',
    servicios: ['660e8400-e29b-41d4-a716-446655440001'], // Usar servicios en lugar de especialidades
    horario_inicio: '09:00',
    horario_fin: '18:00',
    dias_trabajo: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']
  };

  try {
    const response = await fetch(`${API_BASE}?type=barberos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBarbero)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Barbero creado exitosamente:', result.data.id_usuario);
      return result.data;
    } else {
      console.log('❌ Error creando barbero:', result.error);
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar las pruebas
async function runTests() {
  console.log('🚀 INICIANDO PRUEBAS DE BARBEROS API');
  console.log('==========================================');
  
  await testBarberoUpdate();
  
  console.log('\n==========================================');
  console.log('Prueba completada. Revisar logs arriba.');
}

runTests();
