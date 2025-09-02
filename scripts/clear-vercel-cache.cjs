/**
 * Script para limpiar la caché de Vercel después de un despliegue
 * Este script utiliza la API de Vercel para invalidar la caché de CDN
 * y asegurar que los cambios sean visibles inmediatamente.
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.production' });

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

// Configuración de Vercel
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

// Verificar configuración
if (!VERCEL_TOKEN) {
  console.error(
    chalk.red("❌ Error: VERCEL_TOKEN no está definido en .env.production")
  );
  console.error(
    chalk.yellow("Debes crear un token en https://vercel.com/account/tokens")
  );
  process.exit(1);
}

if (!VERCEL_PROJECT_ID) {
  console.error(
    chalk.red("❌ Error: VERCEL_PROJECT_ID no está definido en .env.production")
  );
  console.error(
    chalk.yellow(
      "Puedes encontrar el ID del proyecto en la URL de tu proyecto en Vercel"
    )
  );
  process.exit(1);
}

/**
 * Obtiene los despliegues recientes del proyecto
 */
async function obtenerDesplieguesRecientes() {
  console.log(chalk.blue("🔍 Obteniendo despliegues recientes..."));

  try {
    const url = `https://api.vercel.com/v6/deployments`;
    const queryParams = new URLSearchParams({
      projectId: VERCEL_PROJECT_ID,
      limit: '5',
      ...(VERCEL_TEAM_ID ? { teamId: VERCEL_TEAM_ID } : {}),
    }).toString();

    const headers = {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
    };

    const respuesta = await makeRequest(`${url}?${queryParams}`, { headers });

    const data = JSON.parse(respuesta.data);
    if (data && data.deployments) {
      console.log(
        chalk.green(
          `✅ Se encontraron ${data.deployments.length} despliegues recientes`
        )
      );
      return data.deployments;
    } else {
      console.error(chalk.red("❌ No se encontraron despliegues"));
      return [];
    }
  } catch (error) {
    console.error(
      chalk.red(`❌ Error al obtener despliegues: ${error.message}`)
    );
    if (error.response) {
      console.error(chalk.red(`   Código: ${error.response.status}`));
      console.error(
        chalk.red(`   Respuesta: ${JSON.stringify(error.response.data)}`)
      );
    }
    return [];
  }
}

/**
 * Invalida la caché para un despliegue específico
 */
async function invalidarCache(deploymentId) {
  console.log(
    chalk.blue(`🔄 Invalidando caché para el despliegue ${deploymentId}...`)
  );

  try {
    const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/deployments/${deploymentId}/cache`;

    const headers = {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    };

    const body = {
      ...(VERCEL_TEAM_ID ? { teamId: VERCEL_TEAM_ID } : {}),
    };

    const respuesta = await makeRequest(url, { 
      method: 'DELETE',
      headers,
      body
    });

    if (respuesta.status === 204) {
      console.log(chalk.green("✅ Caché invalidada correctamente"));
      return true;
    } else {
      console.error(
        chalk.red(`❌ Error al invalidar caché: Código ${respuesta.status}`)
      );
      return false;
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error al invalidar caché: ${error.message}`));
    if (error.response) {
      console.error(chalk.red(`   Código: ${error.response.status}`));
      console.error(
        chalk.red(`   Respuesta: ${JSON.stringify(error.response.data)}`)
      );
    }
    return false;
  }
}

/**
 * Purga la caché de CDN para una URL específica
 */
async function purgarCacheCDN(url) {
  console.log(chalk.blue(`🔄 Purgando caché de CDN para ${url}...`));

  try {
    const apiUrl = `https://api.vercel.com/v9/purge-cache`;

    const headers = {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    };

    const body = {
      urls: [url],
      ...(VERCEL_TEAM_ID ? { teamId: VERCEL_TEAM_ID } : {}),
    };

    const respuesta = await makeRequest(apiUrl, {
      method: 'POST',
      headers,
      body
    });

    if (respuesta.status === 200) {
      console.log(chalk.green("✅ Caché de CDN purgada correctamente"));
      return true;
    } else {
      console.error(
        chalk.red(`❌ Error al purgar caché de CDN: Código ${respuesta.status}`)
      );
      return false;
    }
  } catch (error) {
    console.error(
      chalk.red(`❌ Error al purgar caché de CDN: ${error.message}`)
    );
    if (error.response) {
      console.error(chalk.red(`   Código: ${error.response.status}`));
      console.error(
        chalk.red(`   Respuesta: ${JSON.stringify(error.response.data)}`)
      );
    }
    return false;
  }
}

/**
 * Función principal que ejecuta todo el proceso
 */
async function main() {
  console.log(chalk.bold.green("=== LIMPIEZA DE CACHÉ DE VERCEL ==="));
  console.log(chalk.cyan("Fecha y hora: " + new Date().toLocaleString()));
  console.log(chalk.cyan("====================================\n"));

  try {
    // Obtener despliegues recientes
    const despliegues = await obtenerDesplieguesRecientes();

    if (despliegues.length === 0) {
      console.error(
        chalk.red("❌ No se encontraron despliegues para limpiar la caché.")
      );
      process.exit(1);
    }

    // Obtener el despliegue más reciente en producción
    const despliegueProduccion = despliegues.find(
      (d) => d.target === "production"
    );

    if (!despliegueProduccion) {
      console.error(
        chalk.red("❌ No se encontró un despliegue de producción reciente.")
      );
      process.exit(1);
    }

    console.log(
      chalk.cyan(
        `Despliegue de producción encontrado: ${despliegueProduccion.url}`
      )
    );
    console.log(chalk.cyan(`ID: ${despliegueProduccion.id}`));
    console.log(
      chalk.cyan(
        `Creado: ${new Date(despliegueProduccion.createdAt).toLocaleString()}`
      )
    );

    // Invalidar caché para el despliegue
    const cacheInvalidada = await invalidarCache(despliegueProduccion.id);

    // Purgar caché de CDN para las URLs principales
    const urlBase = `https://${despliegueProduccion.url}`;
    const urlsParaPurgar = [
      urlBase,
      `${urlBase}/api/health`,
      `${urlBase}/api/bookings`,
      `${urlBase}/api/availability`,
    ];

    let todasPurgadas = true;

    for (const url of urlsParaPurgar) {
      const purgada = await purgarCacheCDN(url);
      todasPurgadas = todasPurgadas && purgada;
    }

    // Resumen final
    console.log(
      chalk.bold.green("\n✅ Proceso de limpieza de caché completado.")
    );
    console.log(chalk.cyan("Resumen:"));
    console.log(
      chalk.cyan(
        `- Caché de despliegue invalidada: ${
          cacheInvalidada ? "✅ Sí" : "❌ No"
        }`
      )
    );
    console.log(
      chalk.cyan(`- Caché de CDN purgada: ${todasPurgadas ? "✅ Sí" : "❌ No"}`)
    );

    if (!cacheInvalidada || !todasPurgadas) {
      console.log(
        chalk.yellow(
          "\n⚠️ Se recomienda verificar manualmente que los cambios sean visibles en producción."
        )
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.bold.red("\n❌ Error durante el proceso:"));
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar el script
main();
