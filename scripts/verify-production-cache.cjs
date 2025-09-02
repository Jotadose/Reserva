/**
 * Script para verificar problemas de caché y sincronización en producción
 * Este script debe ejecutarse después de un despliegue para asegurar que los cambios
 * sean visibles inmediatamente y no haya problemas de caché.
 */

// Funciones para colorear la salida sin dependencias externas
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const chalk = {
  green: (text) => `${colors.green}${text}${colors.reset}`,
  blue: (text) => `${colors.blue}${text}${colors.reset}`,
  yellow: (text) => `${colors.yellow}${text}${colors.reset}`,
  red: (text) => `${colors.red}${text}${colors.reset}`,
  cyan: (text) => `${colors.cyan}${text}${colors.reset}`,
  bold: {
    green: (text) => `${colors.bold}${colors.green}${text}${colors.reset}`,
    blue: (text) => `${colors.bold}${colors.blue}${text}${colors.reset}`,
    yellow: (text) => `${colors.bold}${colors.yellow}${text}${colors.reset}`,
    red: (text) => `${colors.bold}${colors.red}${text}${colors.reset}`,
    cyan: (text) => `${colors.bold}${colors.cyan}${text}${colors.reset}`
  }
};

// Función simple para hacer peticiones HTTP
async function fetchUrl(url, options = {}) {
  try {
    const https = require('https');
    const http = require('http');
    
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const request = client.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve({
            status: response.statusCode,
            data,
            headers: response.headers
          });
        });
      });
      
      request.on('error', (err) => {
        reject(err);
      });
      
      request.end();
    });
  } catch (error) {
    console.error(`Error al hacer fetch a ${url}:`, error);
    throw error;
  }
}

// Función para hacer peticiones HTTP con más opciones
async function makeRequest(url, options = {}) {
  try {
    const https = require('https');
    const http = require('http');
    
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const reqOptions = new URL(url);
      if (options.headers) {
        reqOptions.headers = options.headers;
      }
      if (options.method) {
        reqOptions.method = options.method;
      }
      
      const request = client.request(reqOptions, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve({
            status: response.statusCode,
            data,
            headers: response.headers
          });
        });
      });
      
      request.on('error', (err) => {
        reject(err);
      });
      
      if (options.body) {
        request.write(JSON.stringify(options.body));
      }
      
      request.end();
    });
  } catch (error) {
    console.error(`Error al hacer request a ${url}:`, error);
    throw error;
  }
}

// URL base de producción - actualizar según corresponda
const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://tu-app-en-produccion.vercel.app";
const API_URL = `${PRODUCTION_URL}/api`;

/**
 * Verifica que los cambios en el frontend sean visibles inmediatamente
 * Compara respuestas con y sin parámetros anti-caché
 */
async function verificarCacheFrontend() {
  console.log(chalk.blue("🔍 Verificando caché del frontend..."));

  try {
    // Petición normal
    const respuestaNormal = await fetchUrl(PRODUCTION_URL);

    // Petición con parámetro anti-caché
    const respuestaAntiCache = await fetchUrl(
      `${PRODUCTION_URL}?t=${Date.now()}`
    );

    // Verificar si las respuestas son idénticas (deberían serlo si no hay caché)
    const sonIdenticas = respuestaNormal.data === respuestaAntiCache.data;

    if (sonIdenticas) {
      console.log(
        chalk.green(
          "✅ El frontend no tiene problemas de caché. Los cambios son visibles inmediatamente."
        )
      );
    } else {
      console.log(
        chalk.red(
          "❌ Posible problema de caché en el frontend. Las respuestas con y sin parámetro anti-caché son diferentes."
        )
      );
      console.log(
        chalk.yellow(
          "   Recomendación: Verifica la configuración de caché en vercel.json y los encabezados de respuesta."
        )
      );
    }

    // Verificar encabezados de caché
    console.log(chalk.blue("📋 Encabezados de caché del frontend:"));
    console.log(
      `   Cache-Control: ${
        respuestaNormal.headers["cache-control"] || "No definido"
      }`
    );
    console.log(`   ETag: ${respuestaNormal.headers["etag"] || "No definido"}`);
    console.log(
      `   Last-Modified: ${
        respuestaNormal.headers["last-modified"] || "No definido"
      }`
    );
  } catch (error) {
    console.error(
      chalk.red(`❌ Error al verificar caché del frontend: ${error.message}`)
    );
  }
}

/**
 * Verifica que la API responda correctamente y sin caché
 */
async function verificarCacheAPI() {
  console.log(chalk.blue("\n🔍 Verificando caché de la API..."));

  try {
    // Verificar endpoint de salud
    const respuestaSalud = await fetchUrl(`${API_URL}/health`);
    console.log(
      chalk.green(
        `✅ API health check: ${respuestaSalud.status}`
      )
    );

    // Verificar encabezados de caché de la API
    console.log(chalk.blue("📋 Encabezados de caché de la API:"));
    console.log(
      `   Cache-Control: ${
        respuestaSalud.headers["cache-control"] || "No definido"
      }`
    );

    // Verificar que la API tenga los encabezados correctos para evitar caché
    const tieneNoCache =
      respuestaSalud.headers["cache-control"] &&
      (respuestaSalud.headers["cache-control"].includes("no-cache") ||
        respuestaSalud.headers["cache-control"].includes("no-store"));

    if (tieneNoCache) {
      console.log(
        chalk.green("✅ La API tiene configuración correcta para evitar caché.")
      );
    } else {
      console.log(
        chalk.yellow(
          "⚠️ La API podría no tener configuración óptima para evitar caché."
        )
      );
      console.log(
        chalk.yellow(
          "   Recomendación: Asegúrate de que los endpoints de la API incluyan encabezados no-cache."
        )
      );
    }
  } catch (error) {
    console.error(
      chalk.red(`❌ Error al verificar caché de la API: ${error.message}`)
    );
  }
}

/**
 * Prueba de sincronización: crea una reserva y verifica inmediatamente la disponibilidad
 * para asegurar que los cambios se reflejen sin retraso
 */
async function probarSincronizacion() {
  console.log(chalk.blue("\n🔄 Probando sincronización de datos..."));

  try {
    // Obtener fecha actual en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split("T")[0];

    // Verificar disponibilidad inicial
    const disponibilidadInicial = await fetchUrl(
      `${API_URL}/availability?date=${hoy}`
    );
    console.log(
      chalk.green("✅ Disponibilidad inicial obtenida correctamente.")
    );

    // Si hay horarios disponibles, crear una reserva de prueba
    if (disponibilidadInicial.data && disponibilidadInicial.data.length > 0) {
      const horarioDisponible = disponibilidadInicial.data[0];
      console.log(
        chalk.blue(`   Creando reserva de prueba para ${horarioDisponible}...`)
      );

      // Crear reserva de prueba
      const reservaPrueba = {
        name: "Test Sincronización",
        email: "test@example.com",
        phone: "123456789",
        date: hoy,
        time: horarioDisponible,
        duration: 45,
        service_id: 1,
      };

      await makeRequest(`${API_URL}/bookings`, {
        method: 'POST',
        body: reservaPrueba,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(chalk.green("✅ Reserva de prueba creada correctamente."));

      // Verificar disponibilidad inmediatamente después
      const disponibilidadDespues = await fetchUrl(
        `${API_URL}/availability?date=${hoy}`
      );

      // Verificar que el horario reservado ya no esté disponible
      const horarioSigueDisponible =
        disponibilidadDespues.data.includes(horarioDisponible);

      if (!horarioSigueDisponible) {
        console.log(
          chalk.green(
            "✅ Sincronización correcta: el horario reservado ya no aparece como disponible."
          )
        );
      } else {
        console.log(
          chalk.red(
            "❌ Problema de sincronización: el horario reservado sigue apareciendo como disponible."
          )
        );
        console.log(
          chalk.yellow(
            "   Recomendación: Verifica la lógica de actualización de disponibilidad y asegúrate de que no haya caché."
          )
        );
      }
    } else {
      console.log(
        chalk.yellow(
          "⚠️ No hay horarios disponibles para probar la sincronización."
        )
      );
    }
  } catch (error) {
    console.error(
      chalk.red(`❌ Error al probar sincronización: ${error.message}`)
    );
  }
}

/**
 * Función principal que ejecuta todas las verificaciones
 */
async function main() {
  console.log(
    chalk.bold.green(
      "=== VERIFICACIÓN DE CACHÉ Y SINCRONIZACIÓN EN PRODUCCIÓN ==="
    )
  );
  console.log(chalk.cyan(`URL de producción: ${PRODUCTION_URL}`));
  console.log(chalk.cyan(`URL de API: ${API_URL}`));
  console.log(chalk.cyan("Fecha y hora: " + new Date().toLocaleString()));
  console.log(
    chalk.cyan("=========================================================\n")
  );

  try {
    // Ejecutar todas las verificaciones
    await verificarCacheFrontend();
    await verificarCacheAPI();
    await probarSincronizacion();

    console.log(chalk.bold.green("\n✅ Verificación completada."));
    console.log(chalk.cyan("Recomendaciones generales:"));
    console.log(
      chalk.cyan(
        "1. Si encontraste problemas de caché, verifica la configuración en vercel.json"
      )
    );
    console.log(
      chalk.cyan(
        "2. Para problemas de sincronización, revisa la lógica de actualización de disponibilidad"
      )
    );
    console.log(
      chalk.cyan(
        "3. Considera implementar un sistema de invalidación de caché para cambios críticos"
      )
    );
  } catch (error) {
    console.error(chalk.bold.red("\n❌ Error durante la verificación:"));
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar el script
main();
