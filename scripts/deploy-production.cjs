/**
 * Script para desplegar y verificar cambios en producción
 * Este script automatiza el proceso de despliegue a Vercel y verifica que los cambios
 * sean visibles y funcionen correctamente en el entorno de producción.
 */

const { execSync } = require('child_process');
const readline = require('readline');

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
async function fetchUrl(url) {
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

// URL base de producción - actualizar según corresponda
const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://tu-app-en-produccion.vercel.app";
const API_URL = `${PRODUCTION_URL}/api`;

// Crear interfaz para preguntas al usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Ejecuta un comando y muestra la salida
 */
function ejecutarComando(comando, mensaje) {
  console.log(chalk.blue(`\n🔄 ${mensaje}...`));
  try {
    const resultado = execSync(comando, { encoding: "utf8" });
    console.log(chalk.green("✅ Comando ejecutado correctamente"));
    return resultado;
  } catch (error) {
    console.error(
      chalk.red(`❌ Error al ejecutar el comando: ${error.message}`)
    );
    console.error(error.stdout || error.stderr);
    throw error;
  }
}

/**
 * Verifica que estemos en la rama correcta antes de desplegar
 */
function verificarRama() {
  console.log(chalk.blue("🔍 Verificando rama actual..."));

  try {
    const ramaActual = execSync("git branch --show-current", {
      encoding: "utf8",
    }).trim();
    console.log(chalk.cyan(`   Rama actual: ${ramaActual}`));

    return new Promise((resolve) => {
      rl.question(
        chalk.yellow(
          `¿Deseas desplegar la rama '${ramaActual}' a producción? (s/n): `
        ),
        (respuesta) => {
          if (respuesta.toLowerCase() === "s") {
            console.log(chalk.green("✅ Continuando con el despliegue..."));
            resolve(true);
          } else {
            console.log(chalk.red("❌ Despliegue cancelado por el usuario."));
            resolve(false);
          }
        }
      );
    });
  } catch (error) {
    console.error(chalk.red(`❌ Error al verificar la rama: ${error.message}`));
    return Promise.resolve(false);
  }
}

/**
 * Construye el proyecto para producción
 */
async function construirProyecto() {
  try {
    // Instalar dependencias
    ejecutarComando("pnpm install", "Instalando dependencias");

    // Construir el proyecto
    ejecutarComando(
      "pnpm run build",
      "Construyendo el proyecto para producción"
    );

    return true;
  } catch (error) {
    console.error(chalk.red("❌ Error durante la construcción del proyecto"));
    return false;
  }
}

/**
 * Despliega el proyecto a Vercel
 */
async function desplegarAVercel() {
  try {
    // Instalar dependencias en el paquete shared
    console.log(chalk.blue('📦 Instalando dependencias en el paquete shared...'));
    execSync('cd packages/shared && pnpm install', { stdio: 'inherit' });
    
    // Verificar si vercel CLI está instalado
    try {
      execSync("vercel --version", { encoding: "utf8" });
    } catch (error) {
      console.log(
        chalk.yellow("⚠️ Vercel CLI no está instalado. Instalando...")
      );
      execSync("npm install -g vercel", { encoding: "utf8" });
    }
    
    // Construir el proyecto
    console.log(chalk.blue('📦 Construyendo el proyecto...'));
    execSync('pnpm run build', { stdio: 'inherit' });

    // Desplegar a producción
    console.log(chalk.blue("\n🚀 Desplegando a Vercel producción..."));

    // Preguntar si se desea usar --prod
    const usarProd = await new Promise((resolve) => {
      rl.question(
        chalk.yellow(
          "¿Desplegar directamente a producción con --prod? (s/n): "
        ),
        (respuesta) => {
          resolve(respuesta.toLowerCase() === "s");
        }
      );
    });

    if (usarProd) {
      ejecutarComando("vercel --prod", "Desplegando directamente a producción");
    } else {
      const resultadoDespliegue = ejecutarComando(
        "vercel",
        "Creando despliegue de vista previa"
      );
      console.log(chalk.cyan("Resultado del despliegue:"));
      console.log(resultadoDespliegue);

      // Preguntar si se desea promover a producción
      const promoverAProduccion = await new Promise((resolve) => {
        rl.question(
          chalk.yellow("¿Promover este despliegue a producción? (s/n): "),
          (respuesta) => {
            resolve(respuesta.toLowerCase() === "s");
          }
        );
      });

      if (promoverAProduccion) {
        ejecutarComando("vercel --prod", "Promoviendo despliegue a producción");
      } else {
        console.log(
          chalk.yellow("⚠️ El despliegue no ha sido promovido a producción.")
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(
      chalk.red(`❌ Error durante el despliegue a Vercel: ${error.message}`)
    );
    return false;
  }
}

/**
 * Espera a que los cambios se propaguen
 */
async function esperarPropagacion() {
  console.log(chalk.blue("\n⏳ Esperando a que los cambios se propaguen..."));

  // Preguntar cuántos segundos esperar
  const segundosEspera = await new Promise((resolve) => {
    rl.question(
      chalk.yellow(
        "¿Cuántos segundos deseas esperar para la propagación? (recomendado: 30): "
      ),
      (respuesta) => {
        const segundos = parseInt(respuesta) || 30;
        resolve(segundos);
      }
    );
  });

  console.log(chalk.cyan(`   Esperando ${segundosEspera} segundos...`));

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(chalk.green("✅ Tiempo de espera completado."));
      resolve();
    }, segundosEspera * 1000);
  });
}

/**
 * Verifica que los endpoints críticos estén funcionando
 */
async function verificarEndpoints() {
  console.log(chalk.blue("\n🔍 Verificando endpoints críticos..."));

  const endpoints = [
    { url: PRODUCTION_URL, nombre: "Frontend principal" },
    { url: `${API_URL}/health`, nombre: "API Health" },
    { url: `${API_URL}/bookings`, nombre: "API Reservas" },
    { url: `${API_URL}/availability`, nombre: "API Disponibilidad" },
  ];

  let todosOk = true;

  for (const endpoint of endpoints) {
    try {
      console.log(chalk.cyan(`   Verificando ${endpoint.nombre}...`));
      const respuesta = await axios.get(endpoint.url);
      console.log(
        chalk.green(
          `   ✅ ${endpoint.nombre}: ${respuesta.status} ${respuesta.statusText}`
        )
      );
    } catch (error) {
      console.error(chalk.red(`   ❌ ${endpoint.nombre}: ${error.message}`));
      todosOk = false;
    }
  }

  return todosOk;
}

/**
 * Verifica problemas de caché y sincronización
 */
async function verificarCacheYSincronizacion() {
  console.log(
    chalk.blue("\n🔍 Verificando problemas de caché y sincronización...")
  );

  try {
    // Ejecutar script de verificación de caché
    console.log(chalk.cyan("   Ejecutando script de verificación de caché..."));
    ejecutarComando(
      "node scripts/verify-production-cache.js",
      "Verificando caché y sincronización"
    );
    return true;
  } catch (error) {
    console.error(
      chalk.red(
        `❌ Error al verificar caché y sincronización: ${error.message}`
      )
    );
    return false;
  }
}

/**
 * Función principal que ejecuta todo el proceso
 */
async function main() {
  console.log(
    chalk.bold.green("=== DESPLIEGUE Y VERIFICACIÓN EN PRODUCCIÓN ===")
  );
  console.log(chalk.cyan(`URL de producción: ${PRODUCTION_URL}`));
  console.log(chalk.cyan("Fecha y hora: " + new Date().toLocaleString()));
  console.log(chalk.cyan("==============================================\n"));

  try {
    // Verificar rama
    const continuarDespliegue = await verificarRama();
    if (!continuarDespliegue) {
      process.exit(0);
    }

    // Construir proyecto
    const construccionExitosa = await construirProyecto();
    if (!construccionExitosa) {
      console.error(
        chalk.red(
          "❌ La construcción del proyecto falló. Abortando despliegue."
        )
      );
      process.exit(1);
    }

    // Desplegar a Vercel
    const despliegueExitoso = await desplegarAVercel();
    if (!despliegueExitoso) {
      console.error(
        chalk.red("❌ El despliegue a Vercel falló. Verificación cancelada.")
      );
      process.exit(1);
    }

    // Esperar propagación
    await esperarPropagacion();

    // Verificar endpoints
    const endpointsOk = await verificarEndpoints();
    if (!endpointsOk) {
      console.error(
        chalk.yellow(
          "⚠️ Algunos endpoints no están respondiendo correctamente."
        )
      );
    }

    // Verificar caché y sincronización
    const cacheOk = await verificarCacheYSincronizacion();
    if (!cacheOk) {
      console.error(
        chalk.yellow(
          "⚠️ Se detectaron posibles problemas de caché o sincronización."
        )
      );
    }

    // Resumen final
    console.log(
      chalk.bold.green("\n✅ Proceso de despliegue y verificación completado.")
    );
    console.log(chalk.cyan("Resumen:"));
    console.log(
      chalk.cyan(
        `- Construcción: ${construccionExitosa ? "✅ Exitosa" : "❌ Fallida"}`
      )
    );
    console.log(
      chalk.cyan(
        `- Despliegue: ${despliegueExitoso ? "✅ Exitoso" : "❌ Fallido"}`
      )
    );
    console.log(
      chalk.cyan(
        `- Endpoints: ${
          endpointsOk ? "✅ Todos funcionando" : "⚠️ Algunos con problemas"
        }`
      )
    );
    console.log(
      chalk.cyan(
        `- Caché/Sincronización: ${
          cacheOk ? "✅ Sin problemas detectados" : "⚠️ Posibles problemas"
        }`
      )
    );

    if (!endpointsOk || !cacheOk) {
      console.log(
        chalk.yellow(
          "\n⚠️ Se recomienda revisar los problemas detectados antes de considerar el despliegue como exitoso."
        )
      );
    }
  } catch (error) {
    console.error(chalk.bold.red("\n❌ Error durante el proceso:"));
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Ejecutar el script
main();
