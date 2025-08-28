/**
 * =============================================================================
 * CONFIGURACIÓN INICIAL DE SUPABASE
 * =============================================================================
 * Componente para configurar la conexión inicial y migrar datos
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Settings, Database, Users, CreditCard, Server } from 'lucide-react';
import { runDataMigration, MigrationProgress } from '../services/DataMigrationService';
import { supabase } from '../lib/supabaseClient';

interface SupabaseSetupProps {
  onSetupComplete: () => void;
}

export const SupabaseSetup: React.FC<SupabaseSetupProps> = ({ onSetupComplete }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isRunningMigration, setIsRunningMigration] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Verificar conexión con Supabase
  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('services').select('count').limit(1);
      
      if (error) {
        setError(`Error de conexión: ${error.message}`);
        setIsConnected(false);
      } else {
        setIsConnected(true);
        setError(null);
        
        // Verificar si ya hay datos
        if (data && data.length > 0) {
          setIsSetupComplete(true);
        }
      }
    } catch (err) {
      setError('No se pudo conectar con Supabase. Verifica tu configuración.');
      setIsConnected(false);
    }
  };

  const handleRunMigration = async () => {
    setIsRunningMigration(true);
    setError(null);

    try {
      await runDataMigration((progress) => {
        setMigrationProgress(progress);
      });

      setIsSetupComplete(true);
      setTimeout(() => {
        onSetupComplete();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error durante la migración');
    } finally {
      setIsRunningMigration(false);
    }
  };

  const getMigrationIcon = (step: string) => {
    switch (step) {
      case 'Migrando servicios':
        return <Database className="w-5 h-5" />;
      case 'Creando especialista':
        return <Users className="w-5 h-5" />;
      case 'Configurando métodos de pago':
        return <CreditCard className="w-5 h-5" />;
      case 'Configurando sistema':
        return <Settings className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Configuración Inicial
          </h1>
          <p className="text-gray-600">
            Configuremos tu base de datos Supabase
          </p>
        </div>

        {/* Estado de conexión */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 p-3 rounded-lg border">
            {isConnected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">Conectado a Supabase</p>
                  <p className="text-sm text-green-600">La conexión está funcionando correctamente</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-900">Error de conexión</p>
                  <p className="text-sm text-red-600">
                    {error || 'Verifica tu configuración de Supabase'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Configuración de variables de entorno */}
        {!isConnected && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-yellow-900 mb-2">Configuración requerida:</h3>
            <ol className="text-sm text-yellow-800 space-y-1">
              <li>1. Crea un proyecto en <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">Supabase</a></li>
              <li>2. Ejecuta el schema de <code className="bg-yellow-100 px-1 rounded">database/supabase-schema-normalized.sql</code></li>
              <li>3. Copia <code className="bg-yellow-100 px-1 rounded">.env.example</code> a <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
              <li>4. Configura las variables <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_URL</code> y <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
              <li>5. Reinicia el servidor de desarrollo</li>
            </ol>
          </div>
        )}

        {/* Progreso de migración */}
        {isRunningMigration && migrationProgress && (
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              {getMigrationIcon(migrationProgress.step)}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{migrationProgress.step}</p>
                <p className="text-sm text-gray-600">{migrationProgress.message}</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(migrationProgress.current / migrationProgress.total) * 100}%`
                }}
              />
            </div>
            
            <p className="text-xs text-gray-500 mt-1">
              {migrationProgress.current} de {migrationProgress.total} pasos completados
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          {!isConnected && (
            <button
              onClick={checkSupabaseConnection}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verificar Conexión
            </button>
          )}

          {isConnected && !isSetupComplete && !isRunningMigration && (
            <button
              onClick={handleRunMigration}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Ejecutar Configuración Inicial
            </button>
          )}

          {isRunningMigration && (
            <button
              disabled
              className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg cursor-not-allowed"
            >
              Configurando...
            </button>
          )}

          {isSetupComplete && (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-900 font-medium mb-2">¡Configuración completada!</p>
              <p className="text-sm text-green-600 mb-4">
                Tu base de datos está lista para usar
              </p>
              <button
                onClick={onSetupComplete}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Continuar a la Aplicación
              </button>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && !isRunningMigration && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">¿Qué se va a configurar?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Servicios básicos de barbería</li>
            <li>• Especialista por defecto</li>
            <li>• Métodos de pago (efectivo, tarjeta, etc.)</li>
            <li>• Configuración del sistema</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetup;
