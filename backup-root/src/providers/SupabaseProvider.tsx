/**
 * =============================================================================
 * PROVIDER DE SUPABASE
 * =============================================================================
 * Proveedor de contexto para manejar la configuración de Supabase
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import SupabaseSetup from './SupabaseSetup';
import LoadingSpinner from './common/LoadingSpinner';

interface SupabaseContextType {
  isConnected: boolean;
  isReady: boolean;
  error: string | null;
}

const SupabaseContext = createContext<SupabaseContextType>({
  isConnected: false,
  isReady: false,
  error: null
});

export const useSupabase = () => useContext(SupabaseContext);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  const checkSupabaseStatus = async () => {
    try {
      setIsLoading(true);
      
      // Verificar si las variables de entorno están configuradas
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setError('Variables de entorno de Supabase no configuradas');
        setNeedsSetup(true);
        setIsConnected(false);
        setIsReady(false);
        return;
      }

      // Verificar conexión con Supabase
      const { data, error: connectionError } = await supabase
        .from('services')
        .select('count')
        .limit(1);

      if (connectionError) {
        console.error('Error de conexión Supabase:', connectionError);
        setError(`Error de conexión: ${connectionError.message}`);
        setNeedsSetup(true);
        setIsConnected(false);
        setIsReady(false);
        return;
      }

      setIsConnected(true);
      setError(null);

      // Verificar si hay datos iniciales
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .limit(1);

      const { data: specialistsData } = await supabase
        .from('specialists')
        .select('*')
        .limit(1);

      if (!servicesData || servicesData.length === 0 || !specialistsData || specialistsData.length === 0) {
        setNeedsSetup(true);
        setIsReady(false);
      } else {
        setNeedsSetup(false);
        setIsReady(true);
      }

    } catch (err) {
      console.error('Error verificando Supabase:', err);
      setError('Error verificando el estado de Supabase');
      setNeedsSetup(true);
      setIsConnected(false);
      setIsReady(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setNeedsSetup(false);
    setIsReady(true);
    checkSupabaseStatus(); // Verificar nuevamente
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return <SupabaseSetup onSetupComplete={handleSetupComplete} />;
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Configuración Pendiente</h2>
            <p className="text-gray-600 mb-4">
              La base de datos necesita configuración inicial.
            </p>
            <button
              onClick={() => setNeedsSetup(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Configurar Ahora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={{ isConnected, isReady, error }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export default SupabaseProvider;
