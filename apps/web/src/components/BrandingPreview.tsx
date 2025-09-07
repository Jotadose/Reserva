/**
 * ===================================================================
 * PREVIEW DE BRANDING UNIFICADO
 * ===================================================================
 * 
 * Componente de demostración que muestra la mejora visual
 */

import React from "react";
import { Calendar, Users, Scissors, DollarSign, CheckCircle } from "lucide-react";
import { Card, Button, StatusBadge, DESIGN_TOKENS } from "./ui/UnifiedComponents";

export const BrandingPreview: React.FC = () => {
  return (
    <div className={`min-h-screen ${DESIGN_TOKENS.background.admin} p-8`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${DESIGN_TOKENS.text.primary} mb-4`}>
            🎨 Unificación de Branding Completada
          </h1>
          <p className={`text-xl ${DESIGN_TOKENS.text.secondary}`}>
            Sistema de diseño coherente para Michael The Barber
          </p>
        </div>

        {/* Comparación Antes/Después */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* ANTES */}
          <div>
            <h2 className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary} mb-4`}>
              ❌ Antes: Inconsistente
            </h2>
            <div className="space-y-4">
              {/* Botones inconsistentes */}
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded">
                  Botón Azul
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded">
                  Botón Verde  
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded">
                  Botón Rojo
                </button>
              </div>
              
              {/* Cards inconsistentes */}
              <div className="bg-white p-4 rounded shadow-md">
                <h3 className="text-black font-semibold">Card Blanco</h3>
                <p className="text-gray-600">Con texto gris inconsistente</p>
              </div>
              
              <div className="bg-blue-100 p-4 rounded border-blue-300 border">
                <h3 className="text-blue-900 font-semibold">Card Azul</h3>
                <p className="text-blue-700">Paleta de colores diferente</p>
              </div>
            </div>
          </div>

          {/* DESPUÉS */}
          <div>
            <h2 className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary} mb-4`}>
              ✅ Después: Unificado
            </h2>
            <div className="space-y-4">
              {/* Botones unificados */}
              <div className="flex gap-2">
                <Button variant="primary">Primario</Button>
                <Button variant="secondary">Secundario</Button>
                <Button variant="outline">Outline</Button>
              </div>
              
              {/* Cards unificados */}
              <Card title="Sistema Unificado">
                <p className={DESIGN_TOKENS.text.secondary}>
                  Colores coherentes con el branding
                </p>
              </Card>
              
              <Card title="Consistencia Visual" elevated>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className={DESIGN_TOKENS.text.secondary}>
                    Experiencia profesional
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Dashboard Unificado */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary} mb-6`}>
            📊 Dashboard con Diseño Unificado
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${DESIGN_TOKENS.text.secondary}`}>
                    Reservas Hoy
                  </p>
                  <p className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary}`}>
                    12
                  </p>
                </div>
                <Calendar className={`h-8 w-8 ${DESIGN_TOKENS.text.accent}`} />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${DESIGN_TOKENS.text.secondary}`}>
                    Ingresos
                  </p>
                  <p className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary}`}>
                    $340.000
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${DESIGN_TOKENS.text.secondary}`}>
                    Clientes
                  </p>
                  <p className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary}`}>
                    89
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${DESIGN_TOKENS.text.secondary}`}>
                    Servicios
                  </p>
                  <p className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary}`}>
                    6
                  </p>
                </div>
                <Scissors className={`h-8 w-8 ${DESIGN_TOKENS.text.accent}`} />
              </div>
            </Card>
          </div>
        </div>

        {/* Estados y Badges */}
        <div className="mb-12">
          <h2 className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary} mb-6`}>
            🏷️ Estados Semánticos Unificados
          </h2>
          
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="confirmed">Confirmado</StatusBadge>
            <StatusBadge status="pending">Pendiente</StatusBadge>
            <StatusBadge status="completed">Completado</StatusBadge>
            <StatusBadge status="cancelled">Cancelado</StatusBadge>
            <StatusBadge status="active">Activo</StatusBadge>
            <StatusBadge status="inactive">Inactivo</StatusBadge>
          </div>
        </div>

        {/* Paleta de Colores */}
        <div>
          <h2 className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary} mb-6`}>
            🎨 Paleta de Colores Oficial
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500 rounded-lg mx-auto mb-2"></div>
              <p className={`text-sm ${DESIGN_TOKENS.text.secondary}`}>Primario</p>
              <p className={`text-xs ${DESIGN_TOKENS.text.muted}`}>yellow-500</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-lg mx-auto mb-2"></div>
              <p className={`text-sm ${DESIGN_TOKENS.text.secondary}`}>Base</p>
              <p className={`text-xs ${DESIGN_TOKENS.text.muted}`}>black</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900 rounded-lg mx-auto mb-2"></div>
              <p className={`text-sm ${DESIGN_TOKENS.text.secondary}`}>Surface</p>
              <p className={`text-xs ${DESIGN_TOKENS.text.muted}`}>gray-900</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-lg mx-auto mb-2"></div>
              <p className={`text-sm ${DESIGN_TOKENS.text.secondary}`}>Elevated</p>
              <p className={`text-xs ${DESIGN_TOKENS.text.muted}`}>gray-800</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-800">
          <p className={`text-lg ${DESIGN_TOKENS.text.primary} font-semibold`}>
            🚀 Sistema de Diseño Completo
          </p>
          <p className={`${DESIGN_TOKENS.text.secondary} mt-2`}>
            Consistencia visual en toda la aplicación de Michael The Barber
          </p>
        </div>

      </div>
    </div>
  );
};

export default BrandingPreview;
