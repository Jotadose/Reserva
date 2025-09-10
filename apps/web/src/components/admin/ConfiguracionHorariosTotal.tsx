/**
 * ===================================================================
 * CONFIGURACIÓN DE HORARIOS - HUB INTELIGENTE
 * ===================================================================
 * 
 * Este componente actúa como un HUB inteligente que:
 * - Detecta qué funcionalidad específica se necesita
 * - Redirige a los componentes especializados apropiados
 * - Evita duplicación de código y funciones
 * 
 * FUNCIONES ESPECÍFICAS DELEGADAS:
 * - Horarios básicos por barbero → GestionBarberosAvanzada
 * - Vista de agenda y calendario → AgendaDisponibilidad  
 * - Días especiales y analíticas → ConfiguracionHorariosOptimizada
 */

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  AlertTriangle,
  BarChart3,
  Settings,
  ArrowRight,
  Clock,
  Activity,
  TrendingUp,
} from "lucide-react";

import { Button, Card, LoadingSpinner } from "../ui";
import { useToast } from "../../contexts/ToastContext";
import useBarberos from "../../hooks/useBarberos";
import { useReservasMVP } from "../../hooks/useReservasMVP";

// Importar el componente optimizado
import ConfiguracionHorariosOptimizada from "./ConfiguracionHorariosOptimizada";

// ===================================================================
// TIPOS SIMPLIFICADOS
// ===================================================================

type AccionHorarios = 
  | "barberos-horarios"
  | "agenda-disponibilidad" 
  | "dias-especiales"
  | "analiticas"
  | "configuracion-general";

interface OpcionHorarios {
  id: AccionHorarios;
  titulo: string;
  descripcion: string;
  icon: any;
  componente?: string;
  disponible: boolean;
}

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const ConfiguracionHorariosTotal: React.FC = () => {
  const [accionSeleccionada, setAccionSeleccionada] = useState<AccionHorarios | null>(null);
  const { showToast } = useToast();
  
  // Hooks para datos reales
  const { barberos, loading: loadingBarberos } = useBarberos();
  const { reservas, loading: loadingReservas } = useReservasMVP();

  // Configuración de opciones disponibles con métricas reales
  const opcionesHorarios: OpcionHorarios[] = [
    {
      id: "barberos-horarios",
      titulo: "Horarios por Barbero",
      descripcion: `Configura horarios individuales para ${barberos?.length || 0} barbero(s) activo(s)`,
      icon: Users,
      componente: "GestionBarberosAvanzada",
      disponible: true,
    },
    {
      id: "agenda-disponibilidad", 
      titulo: "Vista de Agenda",
      descripcion: `Calendario semanal con ${reservas?.length || 0} reservas registradas`,
      icon: Calendar,
      componente: "AgendaDisponibilidad",
      disponible: true,
    },
    {
      id: "dias-especiales",
      titulo: "Días Especiales",
      descripcion: "Feriados, promociones y configuraciones especiales",
      icon: AlertTriangle,
      componente: "ConfiguracionHorariosOptimizada",
      disponible: true,
    },
    {
      id: "analiticas",
      titulo: "Analíticas de Ocupación",
      descripcion: "Métricas, tendencias y optimización de horarios",
      icon: BarChart3,
      componente: "ConfiguracionHorariosOptimizada",
      disponible: true,
    },
    {
      id: "configuracion-general",
      titulo: "Configuración General",
      descripcion: "Configuraciones globales de horarios y disponibilidad",
      icon: Settings,
      disponible: false, // En desarrollo
    },
  ];

  const handleRedireccion = (opcion: OpcionHorarios) => {
    if (!opcion.disponible) {
      showToast({
        title: "Función en desarrollo",
        message: `${opcion.titulo} estará disponible próximamente`,
        type: "info",
      });
      return;
    }

    switch (opcion.id) {
      case "dias-especiales":
      case "analiticas":
        setAccionSeleccionada(opcion.id);
        break;
        
      case "barberos-horarios":
        showToast({
          title: "Redirigiendo...",
          message: "Ve a Gestión de Barberos → Vista Avanzada → Horarios",
          type: "info",
        });
        break;
        
      case "agenda-disponibilidad":
        showToast({
          title: "Redirigiendo...", 
          message: "Ve a Agenda → Disponibilidad para ver el calendario completo",
          type: "info",
        });
        break;
        
      default:
        showToast({
          title: "Función no implementada",
          message: "Esta función estará disponible pronto",
          type: "info",
        });
    }
  };

  // Si hay una acción seleccionada, mostrar el componente específico
  if (accionSeleccionada === "dias-especiales" || accionSeleccionada === "analiticas") {
    return (
      <div className="space-y-4">
        {/* Header con botón de regreso */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-white">
              {accionSeleccionada === "dias-especiales" ? "Días Especiales" : "Analíticas de Horarios"}
            </h2>
            <p className="text-slate-400 text-sm">
              Panel especializado para gestión avanzada
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setAccionSeleccionada(null)}
            className="w-full sm:w-auto"
          >
            ← Volver al Hub
          </Button>
        </div>
        
        {/* Componente especializado */}
        <ConfiguracionHorariosOptimizada 
          visible={true}
          context="horarios"
          onClose={() => setAccionSeleccionada(null)}
        />
      </div>
    );
  }

  // Vista principal del HUB
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-blue-400" />
          <h2 className="text-lg lg:text-xl font-bold text-white">
            Centro de Configuración de Horarios
          </h2>
        </div>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Accede a todas las herramientas de gestión de horarios desde un lugar centralizado. 
          Cada función está optimizada para una tarea específica.
        </p>
      </div>

      {/* Grid de opciones mejorado - completamente responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {(loadingBarberos || loadingReservas) ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="flex items-center gap-3">
              <LoadingSpinner />
              <span className="text-slate-400">Cargando datos...</span>
            </div>
          </div>
        ) : (
          opcionesHorarios.map((opcion) => (
            <Card 
              key={opcion.id} 
              padding="lg" 
              className={`
                relative cursor-pointer transition-all duration-300
                ${opcion.disponible 
                  ? "hover:bg-slate-700/50 hover:border-blue-500/50 hover:scale-[1.02] hover:shadow-lg" 
                  : "opacity-60 cursor-not-allowed"
                }
              `}
              onClick={() => handleRedireccion(opcion)}
            >
              <div className="space-y-3 lg:space-y-4">
                {/* Icon y título mejorados */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`
                      p-2 lg:p-3 rounded-lg flex-shrink-0 transition-colors
                      ${opcion.disponible 
                        ? "bg-blue-500/20 text-blue-400" 
                        : "bg-slate-600/50 text-slate-500"
                      }
                    `}>
                      <opcion.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-sm lg:text-base mb-1 truncate">
                        {opcion.titulo}
                      </h3>
                      {opcion.componente && opcion.disponible && (
                        <p className="text-xs text-slate-500 truncate hidden sm:block">
                          → {opcion.componente}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {opcion.disponible && (
                    <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400 flex-shrink-0 ml-2 transition-transform group-hover:translate-x-1" />
                  )}
                </div>

                {/* Descripción mejorada */}
                <p className="text-slate-400 text-xs lg:text-sm line-clamp-2 leading-relaxed">
                  {opcion.descripcion}
                </p>

                {/* Status badge mejorado */}
                <div className="flex justify-end">
                  <span className={`
                    px-2 py-1 text-xs rounded-full font-medium transition-colors
                    ${opcion.disponible 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-yellow-500/20 text-yellow-400"
                    }
                  `}>
                    {opcion.disponible ? "Disponible" : "En desarrollo"}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Información adicional */}
      <Card padding="lg" className="bg-blue-900/20 border-blue-700/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
            <Settings className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-blue-400 text-sm lg:text-base mb-2">
              Sistema Modular Inteligente
            </h4>
            <p className="text-blue-300 text-xs lg:text-sm">
              Este sistema elimina la duplicación de código delegando cada función a componentes 
              especializados. Cada herramienta está optimizada para su tarea específica, 
              mejorando el rendimiento y la experiencia de usuario.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfiguracionHorariosTotal;
