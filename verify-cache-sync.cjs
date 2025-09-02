#!/usr/bin/env node

/**
 * ===================================================================
 * VERIFICADOR DE CACHÉ Y SINCRONIZACIÓN EN PRODUCCIÓN
 * ===================================================================
 * Este script verifica que no existan problemas de caché o sincronización
 * que impidan la visualización de los cambios actualizados en producción.
 */

const https = require('https');
const { execSync } = require('child_process');

// URL base de la aplicación en producción
const BASE_URL = "https://reserva-mpcta07ok-jotadoses-projects.vercel.app";

console.log("🔍 VERIFICANDO CACHÉ Y SINCRONIZACIÓN EN PRODUCCIÓN\n");

/**
 * Ejecuta una petición HTTP y devuelve el resultado
 */
async function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Espera un tiempo específico
 */
async function wait(ms) {
  console.log(`⏱️ Esperando ${ms/1000} segundos...`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica problemas de caché en el frontend
 */
async function checkFrontendCache() {
  console.log("\n🔍 VERIFICANDO CACHÉ DEL FRONTEND\n");

  try {
    // 1. Primera petición normal
    console.log("1️⃣ Realizando petición normal al frontend...");
    const normalResponse = await fetchUrl(BASE_URL);
    console.log(`Status: ${normalResponse.status}`);
    console.log(`Cache-Control: ${normalResponse.headers['cache-control'] || 'No especificado'}`);

    // 2. Petición con parámetro nocache
    console.log("\n2️⃣ Realizando petición con parámetro nocache...");
    const noCacheResponse = await fetchUrl(`${BASE_URL}/?nocache=${Date.now()}`);
    console.log(`Status: ${noCacheResponse.status}`);
    console.log(`Cache-Control: ${noCacheResponse.headers['cache-control'] || 'No especificado'}`);

    // 3. Petición con cabeceras de caché específicas
    console.log("\n3️⃣ Realizando petición con cabeceras de caché específicas...");
    const cacheHeadersResponse = await fetchUrl(BASE_URL, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    console.log(`Status: ${cacheHeadersResponse.status}`);
    console.log(`Cache-Control: ${cacheHeadersResponse.headers['cache-control'] || 'No especificado'}`);

    // Análisis de resultados
    if (normalResponse.status === 200 && noCacheResponse.status === 200) {
      console.log("\n✅ El frontend responde correctamente a peticiones con y sin caché");
    } else {
      console.log("\n⚠️ Posible problema con el frontend. Verifica manualmente.");
    }
  } catch (error) {
    console.error("\n❌ Error al verificar caché del frontend:", error.message);
  }
}

/**
 * Verifica problemas de sincronización en la API
 */
async function checkApiSync() {
  console.log("\n🔄 VERIFICANDO SINCRONIZACIÓN DE LA API\n");

  const testDate = "2025-08-25"; // Fecha futura para pruebas
  const testTime = "11:30";
  const testName = `Test-${Date.now()}`;

  try {
    // 1. Verificar disponibilidad inicial
    console.log("1️⃣ Verificando disponibilidad inicial...");
    const initialAvailability = await fetchUrl(`${BASE_URL}/api/disponibilidad?date=${testDate}`);
    
    if (initialAvailability.status !== 200) {
      console.log(`❌ Error al obtener disponibilidad: ${initialAvailability.status}`);
      return;
    }
    
    const availData = JSON.parse(initialAvailability.data);
    const slotAvailableBefore = availData.availableSlots.includes(testTime);
    console.log(`Slot ${testTime} disponible inicialmente: ${slotAvailableBefore ? 'Sí' : 'No'}`);
    
    if (!slotAvailableBefore) {
      console.log(`⚠️ El horario ${testTime} no está disponible. Usando otro horario...`);
      // Buscar un horario disponible
      if (availData.availableSlots.length > 0) {
        testTime = availData.availableSlots[0];
        console.log(`Nuevo horario de prueba: ${testTime}`);
      } else {
        console.log("❌ No hay horarios disponibles para la prueba");
        return;
      }
    }

    // 2. Crear reserva de prueba
    console.log("\n2️⃣ Creando reserva de prueba...");
    const bookingData = {
      name: testName,
      phone: "+1234567890",
      email: "test@cache-sync.com",
      date: testDate,
      time: testTime,
      service: "Servicio Básico",
      notes: "Test de sincronización y caché"
    };

    const createResponse = await fetchUrl(`${BASE_URL}/api/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    console.log(`Status: ${createResponse.status}`);
    
    if (createResponse.status !== 200 && createResponse.status !== 201) {
      console.log(`❌ Error al crear reserva: ${createResponse.data}`);
      return;
    }

    // 3. Verificar inmediatamente la disponibilidad (debería estar actualizada)
    console.log("\n3️⃣ Verificando disponibilidad inmediatamente después de crear reserva...");
    const immediateAvailability = await fetchUrl(`${BASE_URL}/api/disponibilidad?date=${testDate}`);
    
    if (immediateAvailability.status === 200) {
      const immediateData = JSON.parse(immediateAvailability.data);
      const slotAvailableImmediate = immediateData.availableSlots.includes(testTime);
      console.log(`Slot ${testTime} disponible inmediatamente después: ${slotAvailableImmediate ? 'Sí ❌' : 'No ✅'}`);
      
      if (slotAvailableImmediate) {
        console.log("⚠️ PROBLEMA DE SINCRONIZACIÓN: El horario sigue apareciendo como disponible inmediatamente después de reservarlo");
      } else {
        console.log("✅ Sincronización inmediata correcta");
      }
    }

    // 4. Esperar y verificar nuevamente (para detectar problemas de caché)
    console.log("\n4️⃣ Esperando 5 segundos para verificar nuevamente...");
    await wait(5000);
    
    const delayedAvailability = await fetchUrl(`${BASE_URL}/api/disponibilidad?date=${testDate}&nocache=${Date.now()}`);
    
    if (delayedAvailability.status === 200) {
      const delayedData = JSON.parse(delayedAvailability.data);
      const slotAvailableDelayed = delayedData.availableSlots.includes(testTime);
      console.log(`Slot ${testTime} disponible después de esperar: ${slotAvailableDelayed ? 'Sí ❌' : 'No ✅'}`);
      
      if (slotAvailableDelayed) {
        console.log("⚠️ PROBLEMA DE CACHÉ: El horario sigue apareciendo como disponible después de esperar");
      } else {
        console.log("✅ Sincronización con retraso correcta");
      }
    }

    // 5. Verificar que la reserva existe en la lista de reservas
    console.log("\n5️⃣ Verificando que la reserva aparece en la lista de reservas...");
    const bookingsResponse = await fetchUrl(`${BASE_URL}/api/reservas?date=${testDate}`);
    
    if (bookingsResponse.status === 200) {
      const bookings = JSON.parse(bookingsResponse.data);
      const foundBooking = bookings.find(b => b.name === testName);
      
      if (foundBooking) {
        console.log("✅ La reserva se encontró correctamente en la lista");
      } else {
        console.log("❌ PROBLEMA DE SINCRONIZACIÓN: La reserva no aparece en la lista");
      }
    }
  } catch (error) {
    console.error("\n❌ Error al verificar sincronización de la API:", error.message);
  }
}

/**
 * Verifica los headers de caché en diferentes endpoints
 */
async function checkCacheHeaders() {
  console.log("\n📋 VERIFICANDO HEADERS DE CACHÉ EN ENDPOINTS\n");

  const endpoints = [
    { url: `${BASE_URL}/`, name: "Frontend" },
    { url: `${BASE_URL}/api/health`, name: "API Health" },
    { url: `${BASE_URL}/api/reservas`, name: "API Reservas" },
    { url: `${BASE_URL}/api/disponibilidad?date=2025-08-25`, name: "API Disponibilidad" }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Verificando headers de ${endpoint.name}...`);
      const response = await fetchUrl(endpoint.url);
      
      console.log(`Status: ${response.status}`);
      console.log(`Cache-Control: ${response.headers['cache-control'] || 'No especificado'}`);
      console.log(`ETag: ${response.headers['etag'] || 'No especificado'}`);
      console.log(`Last-Modified: ${response.headers['last-modified'] || 'No especificado'}`);
      
      // Análisis de la configuración de caché
      if (response.headers['cache-control']) {
        const cacheControl = response.headers['cache-control'];
        
        if (endpoint.name === "Frontend" && !cacheControl.includes('no-cache')) {
          console.log("⚠️ El frontend podría estar cacheando contenido. Considera ajustar los headers de caché.");
        }
        
        if (endpoint.name.startsWith("API") && !cacheControl.includes('no-cache') && !cacheControl.includes('no-store')) {
          console.log("⚠️ Los endpoints de API podrían estar cacheando respuestas. Considera ajustar los headers de caché.");
        }
      } else {
        console.log("⚠️ No se encontraron headers de control de caché. Considera agregarlos para mejor control.");
      }
    } catch (error) {
      console.error(`❌ Error al verificar ${endpoint.name}:`, error.message);
    }
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    // Verificar caché del frontend
    await checkFrontendCache();
    
    // Verificar sincronización de la API
    await checkApiSync();
    
    // Verificar headers de caché
    await checkCacheHeaders();
    
    console.log("\n🎉 VERIFICACIÓN DE CACHÉ Y SINCRONIZACIÓN COMPLETADA");
    console.log("\n📋 RECOMENDACIONES:");
    console.log("1. Si encontraste problemas de caché, considera ajustar los headers en el servidor");
    console.log("2. Para problemas de sincronización, verifica la lógica de actualización de disponibilidad");
    console.log("3. Asegúrate de que Vercel no esté cacheando agresivamente tus endpoints de API");
    console.log("4. Considera implementar un mecanismo de invalidación de caché después de actualizaciones");
  } catch (error) {
    console.error("\n❌ Error durante la verificación:", error.message);
  }
}

// Ejecutar el script
main().catch(console.error);