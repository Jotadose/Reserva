/**
 * =============================================================================
 * APP WRAPPER - CONFIGURACIÓN INICIAL VS APLICACIÓN PRINCIPAL
 * =============================================================================
 * Este componente decide si mostrar la configuración inicial de Supabase
 * o la aplicación principal basándose en el estado de la base de datos
 */

import React, { useState, useEffect } from "react";
import { Database, Loader2 } from "lucide-react";
import App from "./App";
import SupabaseSetup from "./components/SupabaseSetup";
import { supabaseNormalized } from "./lib/supabaseNormalized";

// =============================================================================
// TIPOS
// =============================================================================

interface DatabaseStatus {
  isConnected: boolean;
  hasSchema: boolean;
  hasData: boolean;
  needsMigration: boolean;
  error?: string;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function AppWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    isConnected: false,
    hasSchema: false,
    hasData: false,
    needsMigration: false,
  });

  // =============================================================================
  // VERIFICACIÓN DE ESTADO DE LA BASE DE DATOS
  // =============================================================================

  const checkConnection = async (): Promise<boolean> => {
    try {
      const { error } = await supabaseNormalized
        .from("system_settings")
        .select("count")
        .limit(1);

      if (error) throw new Error(`Conexión fallida: ${error.message}`);

      console.log("✅ Conexión a Supabase establecida");
      return true;
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      return false;
    }
  };

  const checkSchema = async (): Promise<boolean> => {
    try {
      const requiredTables = [
        "services_new",
        "specialists",
        "clients_new",
        "bookings_new",
        "payment_methods",
      ];

      for (const table of requiredTables) {
        const { error } = await supabaseNormalized
          .from(table as any)
          .select("count")
          .limit(1);

        if (error) throw new Error(`Tabla '${table}' no encontrada`);
      }

      console.log("✅ Esquema normalizado detectado");
      return true;
    } catch (error) {
      console.warn("⚠️ Esquema no encontrado:", error);
      return false;
    }
  };

  const checkData = async (): Promise<boolean> => {
    try {
      const { data: services } = await supabaseNormalized
        .from("services_new")
        .select("count");
      const { data: specialists } = await supabaseNormalized
        .from("specialists")
        .select("count");
      const { data: paymentMethods } = await supabaseNormalized
        .from("payment_methods")
        .select("count");

      const hasBasicData =
        services &&
        services.length > 0 &&
        specialists &&
        specialists.length > 0 &&
        paymentMethods &&
        paymentMethods.length > 0;

      if (hasBasicData) {
        console.log("✅ Datos básicos encontrados");
      } else {
        console.log("⚠️ Faltan datos básicos para funcionamiento");
      }

      return hasBasicData;
    } catch (error) {
      console.warn("⚠️ Error verificando datos:", error);
      return false;
    }
  };

  const checkDatabaseStatus = async (): Promise<DatabaseStatus> => {
    const status: DatabaseStatus = {
      isConnected: false,
      hasSchema: false,
      hasData: false,
      needsMigration: false,
    };

    try {
      console.log("🔍 Verificando estado de la base de datos...");

      status.isConnected = await checkConnection();
      if (!status.isConnected) {
        status.error = "No se pudo conectar con Supabase";
        return status;
      }

      status.hasSchema = await checkSchema();
      if (!status.hasSchema) {
        status.error = "Esquema de base de datos incompleto";
        return status;
      }

      status.hasData = await checkData();
      status.needsMigration = !status.hasData;

      return status;
    } catch (error) {
      status.error =
        error instanceof Error ? error.message : "Error desconocido";
      console.error(
        "💥 Error general verificando base de datos:",
        status.error
      );
      return status;
    }
  };

  // =============================================================================
  // EFECTOS
  // =============================================================================

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);

      try {
        console.log("🚀 Inicializando aplicación...");

        const status = await checkDatabaseStatus();
        setDatabaseStatus(status);

        // Determinar si necesita configuración
        const needsConfiguration =
          !status.isConnected ||
          !status.hasSchema ||
          !status.hasData ||
          status.needsMigration;

        setNeedsSetup(needsConfiguration);

        if (needsConfiguration) {
          console.log("🔧 Configuración requerida");
        } else {
          console.log("🎉 Aplicación lista para usar");
        }
      } catch (error) {
        console.error("💥 Error inicializando aplicación:", error);
        setNeedsSetup(true);
        setDatabaseStatus((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Error de inicialización",
        }));
      } finally {
        // Mostrar loading por al menos 1 segundo para mejor UX
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    initializeApp();
  }, []);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSetupComplete = () => {
    console.log("🎉 Configuración completada, iniciando aplicación...");
    setNeedsSetup(false);
  };

  const handleRetryConnection = async () => {
    console.log("🔄 Reintentando conexión...");
    setIsLoading(true);

    try {
      const status = await checkDatabaseStatus();
      setDatabaseStatus(status);

      const needsConfiguration =
        !status.isConnected ||
        !status.hasSchema ||
        !status.hasData ||
        status.needsMigration;

      setNeedsSetup(needsConfiguration);
    } catch (error) {
      console.error("Error en reintento:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // RENDER - LOADING
  // =============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
            <Database className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Inicializando Michael The Barber
          </h2>
          <p className="text-gray-400 mb-6">
            Verificando configuración de la base de datos...
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
            <span className="text-gray-400">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================================
  // RENDER - ERROR DE CONEXIÓN
  // =============================================================================

  if (databaseStatus.error && !databaseStatus.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <Database className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Error de Configuración
          </h2>

          <p className="text-gray-400 mb-4">
            No se pudo conectar con la base de datos.
          </p>

          <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm">{databaseStatus.error}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetryConnection}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Reintentar Conexión
            </button>

            <div className="text-xs text-gray-500">
              <p>Verifica que:</p>
              <ul className="mt-1 text-left space-y-1">
                <li>• Las variables de entorno estén configuradas</li>
                <li>• El schema SQL haya sido ejecutado</li>
                <li>• Supabase esté accesible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================================
  // RENDER - CONFIGURACIÓN NECESARIA
  // =============================================================================

  if (needsSetup) {
    return <SupabaseSetup onSetupComplete={handleSetupComplete} />;
  }

  // =============================================================================
  // RENDER - APLICACIÓN PRINCIPAL
  // =============================================================================

  return <App />;
}
