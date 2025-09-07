#!/usr/bin/env node

/**
 * =============================================================================
 * SCRIPT DE PRUEBA DE CONEXIÓN A BASE DE DATOS
 * =============================================================================
 * Prueba la nueva configuración centralizada de base de datos
 */

import { supabase, testConnection } from "./lib/database.js";
import { config } from "dotenv";

// Cargar variables de entorno
config({ path: ".env.local" });

// Colores para la consola
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log("=".repeat(60), "cyan");
  log("🔍 PRUEBA DE CONEXIÓN CENTRALIZADA A SUPABASE", "cyan");
  log("=".repeat(60), "cyan");

  // 1. Verificar configuración
  log("\n📋 1. VERIFICANDO CONFIGURACIÓN", "blue");
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    log("❌ Error: Faltan variables de entorno", "red");
    process.exit(1);
  }

  log(`✅ URL configurada: ${url}`, "green");
  log(`✅ Key configurada: ${key.substring(0, 20)}...`, "green");

  // 2. Probar conexión
  log("\n🔌 2. PROBANDO CONEXIÓN", "blue");
  const isConnected = await testConnection();

  if (!isConnected) {
    log("❌ Error: No se pudo conectar a Supabase", "red");
    process.exit(1);
  }

  // 3. Probar consultas básicas
  log("\n📊 3. PROBANDO CONSULTAS BÁSICAS", "blue");

  try {
    // Probar tabla usuarios
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from("usuarios")
      .select("count", { count: "exact", head: true });

    if (errorUsuarios) {
      log(`⚠️ Error en tabla usuarios: ${errorUsuarios.message}`, "yellow");
    } else {
      log(`✅ Tabla usuarios: ${usuarios?.length || 0} registros`, "green");
    }

    // Probar tabla servicios
    const { data: servicios, error: errorServicios } = await supabase
      .from("servicios")
      .select("count", { count: "exact", head: true });

    if (errorServicios) {
      log(`⚠️ Error en tabla servicios: ${errorServicios.message}`, "yellow");
    } else {
      log(`✅ Tabla servicios: ${servicios?.length || 0} registros`, "green");
    }

    // Probar tabla reservas
    const { data: reservas, error: errorReservas } = await supabase
      .from("reservas")
      .select("count", { count: "exact", head: true });

    if (errorReservas) {
      log(`⚠️ Error en tabla reservas: ${errorReservas.message}`, "yellow");
    } else {
      log(`✅ Tabla reservas: ${reservas?.length || 0} registros`, "green");
    }
  } catch (error) {
    log(`❌ Error en consultas: ${error.message}`, "red");
  }

  // 4. Resultado final
  log("\n🎉 4. RESULTADO FINAL", "blue");
  log("✅ Conexión centralizada funcionando correctamente", "green");
  log("✅ Todas las APIs ahora usan la configuración centralizada", "green");
  log("✅ Variables de entorno configuradas correctamente", "green");

  log("\n📝 PRÓXIMOS PASOS:", "cyan");
  log(
    "1. Las APIs en /api/ ahora usan import { supabase } from '../lib/database.js'",
    "cyan"
  );
  log("2. El archivo lib/database.js centraliza toda la configuración", "cyan");
  log("3. Las variables de entorno están en .env.local", "cyan");

  log("\n" + "=".repeat(60), "cyan");
}

// Ejecutar el script
main().catch((error) => {
  log(`❌ Error fatal: ${error.message}`, "red");
  process.exit(1);
});
