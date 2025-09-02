/**
 * =============================================================================
 * COMPONENTE DE TRANSICIÓN DE DATOS
 * =============================================================================
 * Permite al usuario elegir entre datos mock y datos reales
 * Muestra el estado de migración y progreso
 */

import React, { useState, useEffect } from "react";
import {
  Database,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  useDataTransition,
  useMigrationControls,
} from "../hooks/useDataTransition";

// =============================================================================
// TIPOS
// =============================================================================

interface DataTransitionBannerProps {
  onForceReal?: () => void;
  onForceMock?: () => void;
  className?: string;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function DataTransitionBanner({
  onForceReal,
  onForceMock,
  className = "",
}: Readonly<DataTransitionBannerProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userChoice, setUserChoice] = useState<"auto" | "mock" | "real">(
    "auto"
  );

  // Hooks para verificar estado de datos
  const services = useDataTransition("services", { fallbackToMock: true });
  const bookings = useDataTransition("bookings", { fallbackToMock: true });
  const migration = useMigrationControls();

  // =============================================================================
  // ESTADO CALCULADO
  // =============================================================================

  const allUsingMock = services.isUsingMockData && bookings.isUsingMockData;
  const allUsingReal = !services.isUsingMockData && !bookings.isUsingMockData;
  const mixed = services.isUsingMockData !== bookings.isUsingMockData;

  const hasErrors = !!(services.error || bookings.error);
  const isLoading =
    services.isLoading || bookings.isLoading || migration.isMigrating;

  // =============================================================================
  // EFECTOS
  // =============================================================================

  useEffect(() => {
    // Auto-expandir si hay problemas o estado mixto
    if (hasErrors || mixed) {
      setIsExpanded(true);
    }
  }, [hasErrors, mixed]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleToggleMockData = () => {
    if (allUsingMock) {
      // Cambiar a datos reales
      setUserChoice("real");
      onForceReal?.();
    } else {
      // Cambiar a datos mock
      setUserChoice("mock");
      onForceMock?.();
    }
  };

  const handleMigrateData = async () => {
    if (allUsingMock) {
      await migration.migrateMockToReal("services");
      await migration.migrateMockToReal("bookings");
      setUserChoice("real");
    }
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getStatusIcon = () => {
    if (isLoading)
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    if (hasErrors) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (allUsingReal) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (mixed) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <Database className="w-5 h-5 text-gray-500" />;
  };

  const getStatusText = () => {
    if (isLoading) return "Cargando datos...";
    if (hasErrors) return "Error en conexión de datos";
    if (allUsingReal) return "Usando base de datos Supabase";
    if (allUsingMock) return "Usando datos de demostración";
    if (mixed) return "Estado mixto de datos";
    return "Verificando estado de datos";
  };

  const getBadgeColor = () => {
    if (hasErrors) return "bg-red-100 text-red-800 border-red-200";
    if (allUsingReal) return "bg-green-100 text-green-800 border-green-200";
    if (allUsingMock) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Banner functionality: automatically hide when production data is working correctly
  if (allUsingReal && !hasErrors && userChoice !== "mock") {
    return null;
  }

  const getBadgeText = () => {
    if (allUsingMock) return "Demo";
    if (allUsingReal) return "Producción";
    return "Mixto";
  };

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleExpandToggle();
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div
      className={`bg-gray-900/50 border border-gray-700 rounded-lg ${className}`}
    >
      {/* Header compacto */}
      <button
        className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-inset"
        onClick={handleExpandToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls="data-transition-details"
      >
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-medium text-white">Estado de Datos</h3>
            <p className="text-sm text-gray-400">{getStatusText()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-2 py-1 text-xs rounded-full border ${getBadgeColor()}`}
          >
            {getBadgeText()}
          </span>

          <ArrowRight
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Panel expandido */}
      {isExpanded && (
        <div
          id="data-transition-details"
          className="border-t border-gray-700 p-4 space-y-4"
        >
          {/* Estado detallado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  Servicios
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    services.isUsingMockData
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-green-500/20 text-green-300"
                  }`}
                >
                  {services.isUsingMockData ? "Mock" : "Supabase"}
                </span>
              </div>
              {services.error && (
                <p className="text-xs text-red-400 mt-1">{services.error}</p>
              )}
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">
                  Reservas
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    bookings.isUsingMockData
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-green-500/20 text-green-300"
                  }`}
                >
                  {bookings.isUsingMockData ? "Mock" : "Supabase"}
                </span>
              </div>
              {bookings.error && (
                <p className="text-xs text-red-400 mt-1">{bookings.error}</p>
              )}
            </div>
          </div>

          {/* Información contextual */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Database className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-200 font-medium mb-1">
                  ¿Qué significa esto?
                </p>
                {allUsingMock && (
                  <p className="text-blue-300">
                    Estás viendo datos de demostración. Configura Supabase para
                    usar datos reales.
                  </p>
                )}
                {allUsingReal && (
                  <p className="text-blue-300">
                    Conectado a tu base de datos Supabase. Todos los datos son
                    reales.
                  </p>
                )}
                {mixed && (
                  <p className="text-blue-300">
                    Algunas partes usan datos reales y otras datos de
                    demostración.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progreso de migración */}
          {migration.isMigrating && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">
                  Migrando datos...
                </span>
                <span className="text-xs text-gray-400">
                  {migration.migrationProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${migration.migrationProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-2">
            {allUsingMock && !migration.isMigrating && (
              <>
                <button
                  onClick={handleMigrateData}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Configurar Supabase</span>
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Continuar con Demo
                </button>
              </>
            )}

            {allUsingReal && (
              <button
                onClick={handleToggleMockData}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Demo</span>
              </button>
            )}

            {hasErrors && (
              <button
                onClick={() => {
                  services.refetch();
                  bookings.refetch();
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Loader2 className="w-4 h-4" />
                <span>Reintentar</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTransitionBanner;
