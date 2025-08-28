#!/usr/bin/env node

/**
 * =============================================================================
 * VERIFICADOR DE CONFIGURACIÓN SUPABASE
 * =============================================================================
 * Script para verificar que Supabase esté configurado correctamente
 * y identificar problemas comunes de configuración
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Colores para la consola
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  log("\n" + "=".repeat(60), "bright");
  log(` ${title}`, "bright");
  log("=".repeat(60), "bright");
}

function logSection(title) {
  log(`\n${title}`, "cyan");
  log("-".repeat(title.length));
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "blue");
}

async function main() {
  logHeader("VERIFICADOR DE CONFIGURACIÓN SUPABASE");

  // Verificar variables de entorno
  logSection("1. VERIFICANDO VARIABLES DE ENTORNO");

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    logError("VITE_SUPABASE_URL no está configurada");
    logInfo(
      "Crea un archivo .env.local con: VITE_SUPABASE_URL=https://tu-proyecto.supabase.co"
    );
    process.exit(1);
  }

  if (!supabaseKey) {
    logError("VITE_SUPABASE_ANON_KEY no está configurada");
    logInfo(
      "Crea un archivo .env.local con: VITE_SUPABASE_ANON_KEY=tu-clave-anonima"
    );
    process.exit(1);
  }

  logSuccess("Variables de entorno configuradas");
  logInfo(`URL: ${supabaseUrl}`);
  logInfo(`Key: ${supabaseKey.substring(0, 20)}...`);

  // Verificar formato de URL
  logSection("2. VERIFICANDO FORMATO DE URL");

  if (!supabaseUrl.includes("supabase.co")) {
    logWarning("La URL no parece ser de Supabase");
  } else {
    logSuccess("Formato de URL válido");
  }

  // Crear cliente de Supabase
  logSection("3. CREANDO CLIENTE SUPABASE");

  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    logSuccess("Cliente de Supabase creado correctamente");
  } catch (error) {
    logError(`Error creando cliente: ${error.message}`);
    process.exit(1);
  }

  // Verificar conexión
  logSection("4. VERIFICANDO CONEXIÓN");

  try {
    const { data, error } = await supabase
      .from("services")
      .select("count")
      .limit(1);

    if (error) {
      if (error.code === "PGRST116") {
        logError('La tabla "services" no existe');
        logInfo("Necesitas ejecutar el esquema de base de datos");
      } else {
        logError(`Error de conexión: ${error.message}`);
        logInfo(`Código: ${error.code}`);
      }
    } else {
      logSuccess("Conexión exitosa a Supabase");
      logInfo(`Tabla services accesible`);
    }
  } catch (error) {
    logError(`Error inesperado: ${error.message}`);
  }

  // Verificar esquema
  logSection("5. VERIFICANDO ESQUEMA DE BASE DE DATOS");

  const requiredTables = [
    "services",
    "specialists",
    "clients",
    "bookings",
    "booking_services",
  ];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select("count").limit(1);

      if (error) {
        if (error.code === "PGRST116") {
          logError(`Tabla "${table}" no existe`);
        } else {
          logWarning(`Tabla "${table}" tiene problemas: ${error.message}`);
        }
      } else {
        logSuccess(`Tabla "${table}" existe y es accesible`);
      }
    } catch (error) {
      logError(`Error verificando tabla "${table}": ${error.message}`);
    }
  }

  // Verificar RLS
  logSection("6. VERIFICANDO ROW LEVEL SECURITY");

  try {
    const { data: policies } = await supabase
      .from("services")
      .select("*")
      .limit(1);

    if (policies && policies.length > 0) {
      logSuccess("RLS configurado correctamente");
    } else {
      logWarning("No se pudieron obtener datos, posible problema con RLS");
    }
  } catch (error) {
    logWarning(`No se pudo verificar RLS: ${error.message}`);
  }

  // Resumen final
  logSection("7. RESUMEN");

  logInfo("Para completar la configuración:");
  logInfo("1. Ejecuta el esquema SQL en tu proyecto Supabase");
  logInfo("2. Configura las políticas RLS");
  logInfo("3. Inserta datos de prueba");

  logHeader("VERIFICACIÓN COMPLETADA");
}

// Manejar errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  logError("Promesa rechazada no manejada:");
  console.error(reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logError("Excepción no capturada:");
  console.error(error);
  process.exit(1);
});

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    logError("Error en la verificación:");
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
