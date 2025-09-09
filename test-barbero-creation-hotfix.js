/**
 * 🔥 TEST HOTFIX - Verificar creación de barberos post-deploy
 */

console.log('🚀 INICIANDO TEST DE CREACIÓN DE BARBEROS - HOTFIX v2.1');

const API_URL = 'https://reserva-mauve.vercel.app/api/consolidated?type=barberos';

// Datos de prueba
const testBarbero = {
  nombre: 'Test Barbero Hotfix',
  email: `test.hotfix.${Date.now()}@example.com`,
  telefono: '+56912345999',
  horario_inicio: '09:00',
  horario_fin: '18:00',
  dias_trabajo: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  especialidades: ['corte'],
  activo: true
};

console.log('📋 Datos a enviar:', testBarbero);

fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testBarbero)
})
.then(response => {
  console.log('📡 Status de respuesta:', response.status);
  console.log('📡 Headers:', [...response.headers.entries()]);
  return response.text();
})
.then(text => {
  console.log('📋 Respuesta RAW:', text);
  
  try {
    const json = JSON.parse(text);
    console.log('✅ Respuesta parseada:', json);
    
    if (json.data) {
      console.log('🎯 ÉXITO: Barbero creado correctamente');
      console.log('🔍 ID Usuario:', json.data.id_usuario);
      console.log('🔍 Barbero info:', json.data.barberos);
    } else if (json.error) {
      console.log('❌ ERROR en API:', json.error);
    }
  } catch (e) {
    console.log('❌ Error parsing JSON:', e);
  }
})
.catch(error => {
  console.log('🔴 ERROR de red:', error);
});

console.log('⏳ Esperando respuesta...');
