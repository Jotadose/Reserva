/**
 * 🔍 TEST DIRECTO: Insertar en tabla barberos directamente
 */

// Usar un usuario existente para probar
const usuarioExistente = '4552d657-6c68-4d9d-a2d9-57929b92d215'; // Jota

const testData = {
  especialidades: ['corte'],
  horario_inicio: '09:00',
  horario_fin: '18:00',
  dias_trabajo: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
  tiempo_descanso: 15
};

// Intentar insertar con id_usuario
console.log('🔍 Test 1: Insertando barbero con id_usuario...');
console.log('Usuario a usar:', usuarioExistente);
console.log('Datos:', testData);

const API_URL = 'https://reserva-mauve.vercel.app/api/consolidated';

// Crear un POST con solo actualización de barbero
fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    debug: 'direct-barbero-insert',
    userId: usuarioExistente,
    ...testData
  })
})
.then(response => {
  console.log('📡 Response status:', response.status);
  return response.text();
})
.then(text => {
  console.log('📋 Response:', text);
})
.catch(err => {
  console.log('❌ Error:', err);
});
