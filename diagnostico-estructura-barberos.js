/**
 * 🔍 DIAGNÓSTICO: Verificar estructura de tabla barberos
 */

console.log('🔍 INICIANDO DIAGNÓSTICO DE ESTRUCTURA DE TABLA BARBEROS');

const API_URL = 'https://reserva-mauve.vercel.app/api/consolidated?type=barberos';

// Primero obtener la lista de barberos existentes para ver la estructura
fetch(API_URL, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => {
  console.log('📡 GET Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('📋 Estructura actual de barberos:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.data && data.data.length > 0) {
    console.log('🔍 Primer barbero como ejemplo:');
    console.log(JSON.stringify(data.data[0], null, 2));
    
    if (data.data[0].barberos) {
      console.log('🔍 Estructura barberos:');
      console.log(JSON.stringify(data.data[0].barberos, null, 2));
    }
  }
})
.catch(error => {
  console.log('🔴 ERROR:', error);
});

console.log('⏳ Obteniendo estructura...');
