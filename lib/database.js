/**
 * =============================================================================
 * CONFIGURACIÓN CENTRAL DE BASE DE DATOS
 * =============================================================================
 * Configuración centralizada para Supabase
 * Usado por APIs, funciones serverless y aplicaciones
 */

import { createClient } from "@supabase/supabase-js";

// =============================================================================
// CONFIGURACIÓN DE SUPABASE
// =============================================================================

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://qvxwfkbcrunaebahpmft.supabase.co";

const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eHdma2JjcnVuYWViYWhwbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5OTAzNTAsImV4cCI6MjA1MDU2NjM1MH0.cYa6R8XdIEqmgm3FGKj3nQZY3gB6WbELKhXsYy6XO08";

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan variables de entorno de Supabase. Configura SUPABASE_URL y SUPABASE_ANON_KEY"
  );
}

// =============================================================================
// CLIENTE SUPABASE
// =============================================================================

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// =============================================================================
// FUNCIONES HELPER
// =============================================================================

/**
 * Verifica la conexión con Supabase
 */
export async function testConnection() {
  try {
    const { error } = await supabase
      .from("usuarios")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ Error de conexión:", error.message);
      return false;
    }

    console.log("✅ Conexión a Supabase exitosa");
    return true;
  } catch (error) {
    console.error("❌ Error al conectar con Supabase:", error.message);
    return false;
  }
}

/**
 * Obtiene información del esquema de la base de datos
 */
export async function getDatabaseInfo() {
  try {
    const { data: tables, error } = await supabase.rpc("get_table_info");

    if (error) {
      console.error("Error obteniendo información de tablas:", error.message);
      return null;
    }

    return tables;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

// =============================================================================
// EXPORTS PARA COMPATIBILIDAD
// =============================================================================

export { supabaseUrl, supabaseKey };
export default supabase;
