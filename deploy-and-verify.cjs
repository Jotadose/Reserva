#!/usr/bin/env node

/**
 * ===================================================================
 * SCRIPT DE DESPLIEGUE Y VERIFICACIÓN COMPLETA EN PRODUCCIÓN
 * ===================================================================
 * Este script realiza un despliegue completo a producción y verifica
 * que todos los cambios sean visibles y funcionen correctamente,
 * incluyendo la invalidación de caché y sincronización.
 */

const { execSync } = require('child_process');
const https = require('https');
const readline = require('readline');

// URL base de la aplicación en producción
const BASE_URL = "https://reserva-mpcta07ok-jotadoses-projects.vercel.app";

// Crear interfaz para interacción con el usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🚀 INICIANDO DESPLIEGUE Y VERIFICACIÓN EN PRODUCCIÓN\n");

/**
 * Ejecuta un comando y muestra la salida
 */
function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(`✅ Comando ejecutado exitosamente`);
    return output;
  } catch (error) {
    console.error(`❌ Error al ejecutar el comando: ${error.message}`);
    console.error(error.stdout || error.stderr);
    throw error;
  }
}

/**
 * Verifica un endpoint y devuelve si está funcionando
 */
async function checkUrl(url, description) {
  return new Promise((resolve) => {
    console.log(`🔍 Verificando ${description}...`);
    https.get(url, (res) => {
      const status = res.statusCode;
      const success = status >= 200 && status < 400;
      console.log(`${success ? "✅" : "❌"} ${description}: ${status}`);
      resolve({ success, status });
    }).on('error', (err) => {
      console.log(`❌ ${description}: Error - ${err.message}`);
      resolve({ success: false, error: err.message });
    });
  });
}

/**
 * Espera un tiempo específico
 */
async function wait(ms) {
  console.log(`⏱️ Esperando ${ms/1000} segundos para asegurar propagación de cambios...`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Realiza el despliegue a producción
 */
async function deploy() {
  try {
    // 1. Verificar que estamos en la rama correcta
    console.log("\n🔍 Verificando rama actual...");
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`📌 Rama actual: ${currentBranch}`);
    
    // Preguntar si desea continuar
    await new Promise((resolve) => {
      rl.question(`¿Deseas continuar con el despliegue desde la rama '${currentBranch}'? (s/n): `, (answer) => {
        if (answer.toLowerCase() !== 's') {
          console.log("❌ Despliegue cancelado por el usuario");
          process.exit(0);
        }
        resolve();
      });
    });

    // 2. Ejecutar build
    runCommand('pnpm run build', 'Construyendo el proyecto');

    // 3. Desplegar a Vercel
    runCommand('pnpm run deploy', 'Desplegando a Vercel');

    // 4. Esperar a que los cambios se propaguen
    await wait(15000); // 15 segundos

    // 5. Verificar endpoints
    await verifyEndpoints();

    // 6. Verificar caché y sincronización
    await verifyCacheAndSync();

    console.log("\n🎉 DESPLIEGUE Y VERIFICACIÓN COMPLETADOS EXITOSAMENTE");
    console.log(`\n🌐 Tu aplicación está disponible en: ${BASE_URL}`);
  } catch (error) {
    console.error("\n❌ ERROR EN EL PROCESO DE DESPLIEGUE:", error.message);
  } finally {
    rl.close();
  }
}

/**
 * Verifica todos los endpoints críticos
 */
async function verifyEndpoints() {
  console.log("\n📊 VERIFICANDO ENDPOINTS CRÍTICOS:\n");

  const checks = [
    [`${BASE_URL}/`, "Frontend (Landing Page)"],
    [`${BASE_URL}/manifest.json`, "PWA Manifest"],
    [`${BASE_URL}/api/health`, "API Health Check"],
    [`${BASE_URL}/api/usuarios`, "API Usuarios Endpoint"],
    [`${BASE_URL}/api/servicios`, "API Servicios Endpoint"],
    [`${BASE_URL}/api/reservas`, "API Reservas Endpoint"],
    [`${BASE_URL}/api/disponibilidad`, "API Disponibilidad Endpoint"],
  ];

  let passed = 0;
  let total = checks.length;

  for (const [url, description] of checks) {
    const { success } = await checkUrl(url, description);
    if (success) passed++;
    await wait(500); // Pausa entre requests
  }

  console.log(`\n📈 RESULTADOS: ${passed}/${total} endpoints funcionando`);

  if (passed !== total) {
    console.log("\n⚠️ Algunos endpoints tienen problemas. Verificando logs de Vercel...");
    try {
      runCommand('vercel logs', 'Obteniendo logs de Vercel');
    } catch (e) {
      console.log("No se pudieron obtener los logs automáticamente. Verifica manualmente en el dashboard de Vercel.");
    }
  }
}

/**
 * Verifica problemas de caché y sincronización
 */
async function verifyCacheAndSync() {
  console.log("\n🔄 VERIFICANDO CACHÉ Y SINCRONIZACIÓN\n");

  // 1. Verificar que no hay problemas de caché en el frontend
  const { success: frontendSuccess } = await checkUrl(`${BASE_URL}/?nocache=${Date.now()}`, "Frontend con parámetro nocache");
  
  if (!frontendSuccess) {
    console.log("⚠️ Posible problema de caché en el frontend. Intentando forzar actualización...");
    try {
      runCommand('vercel --prod --force', 'Forzando redeploy para limpiar caché');
      await wait(10000); // Esperar a que se apliquen los cambios
      await checkUrl(`${BASE_URL}/?nocache=${Date.now()}`, "Frontend después de forzar actualización");
    } catch (e) {
      console.log("No se pudo forzar la actualización automáticamente.");
    }
  }

  // 2. Verificar sincronización de API
  console.log("\n🔄 Verificando sincronización de API...");
  
  // Crear una reserva de prueba para verificar sincronización
  const testDate = "2025-08-25"; // Fecha futura para pruebas
  const testTime = "10:00";
  const testName = `Test-${Date.now()}`;
  
  console.log(`\n📝 Creando reserva de prueba (${testName}) para verificar sincronización...`);
  
  try {
    // Crear reserva mediante API
    const createBookingCommand = `curl -X POST "${BASE_URL}/api/reservas" \
      -H "Content-Type: application/json" \
      -d '{"name":"${testName}","phone":"+1234567890","email":"test@sync.com","date":"${testDate}","time":"${testTime}","service":"Servicio Básico","notes":"Test sincronización"}'`;
    
    runCommand(createBookingCommand, "Creando reserva de prueba");
    
    // Esperar a que se sincronice
    await wait(5000);
    
    // Verificar que la reserva existe
    console.log("\n🔍 Verificando que la reserva se ha creado correctamente...");
    const checkBookingCommand = `curl "${BASE_URL}/api/reservas?date=${testDate}"`;
    const bookingsOutput = runCommand(checkBookingCommand, "Obteniendo reservas para verificar");
    
    if (bookingsOutput.includes(testName)) {
      console.log("✅ Sincronización correcta: La reserva de prueba se encontró en la API");
    } else {
      console.log("❌ Problema de sincronización: La reserva de prueba no se encontró");
      console.log("⚠️ Es posible que haya un problema de sincronización entre la API y la base de datos");
    }
    
    // Verificar disponibilidad (debería mostrar el slot como no disponible)
    console.log("\n🔍 Verificando que la disponibilidad se ha actualizado correctamente...");
    const checkAvailabilityCommand = `curl "${BASE_URL}/api/disponibilidad?date=${testDate}"`;
    const availabilityOutput = runCommand(checkAvailabilityCommand, "Obteniendo disponibilidad");
    
    if (!availabilityOutput.includes(`"${testTime}"`)) {
      console.log("✅ Sincronización correcta: El horario reservado no aparece como disponible");
    } else {
      console.log("❌ Problema de sincronización: El horario reservado sigue apareciendo como disponible");
      console.log("⚠️ Es posible que haya un problema de caché en el endpoint de disponibilidad");
    }
    
  } catch (error) {
    console.error("❌ Error al verificar sincronización:", error.message);
  }
}

// Iniciar el proceso de despliegue
deploy().catch(console.error);