/**
 * ===================================================================
 * CONFIGURACIÓN DE HORARIOS - VERSIÓN OPTIMIZADA
 * ===================================================================
 *
 * Panel optimizado para funciones específicas de horarios que NO se solapan
 * con otros componentes del admin panel:
 * 
 * - Gestión de días especiales y feriados
 * - Análisis de ocupación y métricas avanzadas
 * - Sistema de optimización automática de horarios
 * - Dashboard analítico de disponibilidad
 * 
 * NOTA: La gestión básica de horarios por barbero se maneja en:
 * - GestionBarberosAvanzada (horarios individuales)
 * - AgendaDisponibilidad (vista calendario)
 */

import React, { useState, useEffect } from "react";
import {
  Calendar,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Zap,
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button, Card, Badge, EmptyState } from "../ui";
import { useToast } from "../../contexts/ToastContext";
import useBarberos from "../../hooks/useBarberos";

// ===================================================================
// TIPOS E INTERFACES - ENFOCADAS EN FUNCIONES ESPECÍFICAS
// ===================================================================

interface DiaEspecial {
  id: string;
  fecha: string;
  nombre: string;
  tipo: "feriado" | "promocion" | "evento" | "mantenimiento";
  configuracion: {
    cerrado: boolean;
    horarioEspecial?: {
      inicio: string;
      fin: string;
    };
    tarifaEspecial?: {
      tipo: "descuento" | "recargo";
      valor: number;
    };
    serviciosLimitados?: string[];
    notas?: string;
  };
  activo: boolean;
}

interface MetricasOcupacion {
  dia: string;
  porcentaje: number;
  totalHoras: number;
  horasOcupadas: number;
  ingresos: number;
  tendencia: "subiendo" | "bajando" | "estable";
}

type VistaOptimizada = "especiales" | "analiticas" | "optimizacion";

// ===================================================================
// DATOS SIMULADOS PARA DÍAS ESPECIALES
// ===================================================================

const diasEspecialesMock: DiaEspecial[] = [
  {
    id: "1",
    fecha: "2025-09-18",
    nombre: "Fiestas Patrias",
    tipo: "feriado",
    configuracion: {
      cerrado: true,
      notas: "Cerrado por feriado nacional",
    },
    activo: true,
  },
  {
    id: "2",
    fecha: "2025-12-25",
    nombre: "Navidad",
    tipo: "feriado",
    configuracion: {
      cerrado: true,
      notas: "Cerrado por Navidad",
    },
    activo: true,
  },
  {
    id: "3",
    fecha: "2025-10-31",
    nombre: "Halloween Especial",
    tipo: "promocion",
    configuracion: {
      cerrado: false,
      horarioEspecial: {
        inicio: "10:00",
        fin: "20:00",
      },
      tarifaEspecial: {
        tipo: "descuento",
        valor: 15,
      },
      serviciosLimitados: ["corte", "barba"],
      notas: "15% descuento en cortes temáticos",
    },
    activo: true,
  },
];

// ===================================================================
// COMPONENTE PRINCIPAL OPTIMIZADO
// ===================================================================

interface ConfiguracionHorariosOptimizadaProps {
  visible?: boolean;
  onClose?: () => void;
  context?: string;
}

export const ConfiguracionHorariosOptimizada: React.FC<ConfiguracionHorariosOptimizadaProps> = ({
  visible = true,
  onClose,
  context = "horarios",
}) => {
  // Estados
  const [vista, setVista] = useState<VistaOptimizada>("especiales");
  const [diasEspeciales, setDiasEspeciales] = useState<DiaEspecial[]>([]);
  const [metricas, setMetricas] = useState<MetricasOcupacion[]>([]);
  const [loading, setLoading] = useState(false);

  // Hooks
  const { showToast } = useToast();
  const { barberos } = useBarberos();

  // Cargar datos reales al montar
  useEffect(() => {
    if (visible && context === "horarios") {
      cargarDiasEspeciales();
      cargarMetricas();
    }
  }, [visible, context]);

  // ===================================================================
  // FUNCIONES DE DATOS REALES
  // ===================================================================

  const cargarDiasEspeciales = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada a la API real
      // const response = await fetch('/api/consolidated?type=dias-especiales');
      // const data = await response.json();
      
      // Por ahora usar datos mock
      setDiasEspeciales(diasEspecialesMock);
    } catch (error) {
      console.error('Error cargando días especiales:', error);
      showToast({
        title: "Error",
        message: "No se pudieron cargar los días especiales",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarMetricas = async () => {
    try {
      // TODO: Implementar llamada a la API real para métricas
      // Simular datos de ocupación por ahora
      const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
      const metricasSimuladas = diasSemana.map(dia => ({
        dia,
        porcentaje: Math.floor(Math.random() * 40) + 60,
        totalHoras: 8,
        horasOcupadas: Math.floor(Math.random() * 3) + 5,
        ingresos: Math.floor(Math.random() * 200000) + 100000,
        tendencia: ["subiendo", "bajando", "estable"][Math.floor(Math.random() * 3)] as any,
      }));
      setMetricas(metricasSimuladas);
    } catch (error) {
      console.error('Error cargando métricas:', error);
    }
  };

  const agregarDiaEspecial = async (diaData: Omit<DiaEspecial, 'id'>) => {
    try {
      // TODO: Implementar llamada a la API
      const nuevoDia = {
        ...diaData,
        id: Date.now().toString(),
      };
      
      setDiasEspeciales(prev => [...prev, nuevoDia]);
      showToast({
        title: "Día especial agregado",
        message: `${nuevoDia.nombre} fue agregado correctamente`,
        type: "success",
      });
    } catch (error) {
      console.error('Error agregando día especial:', error);
      showToast({
        title: "Error",
        message: "No se pudo agregar el día especial",
        type: "error",
      });
    }
  };

  // ===================================================================
  // COMPONENTES DE RENDERIZADO
  // ===================================================================

  const renderDiasEspeciales = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg lg:text-xl font-bold text-white">Días Especiales</h3>
          <p className="text-slate-400 text-sm lg:text-base">
            Feriados, promociones y configuraciones especiales
          </p>
        </div>
        <Button 
          variant="primary" 
          icon={Plus}
          className="w-full sm:w-auto"
        >
          Agregar Día Especial
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {diasEspeciales.map((dia) => (
          <Card key={dia.id} padding="lg" className="relative">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-slate-400">
                      {new Date(dia.fecha).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white text-sm lg:text-base">
                    {dia.nombre}
                  </h4>
                  <Badge 
                    variant={
                      dia.tipo === 'feriado' ? 'danger' : 
                      dia.tipo === 'promocion' ? 'success' : 'warning'
                    }
                    size="sm"
                  >
                    {dia.tipo}
                  </Badge>
                </div>
                
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="sm" icon={Edit3} />
                  <Button variant="ghost" size="sm" icon={Trash2} />
                </div>
              </div>

              {/* Configuración */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estado:</span>
                  <Badge
                    variant={dia.configuracion.cerrado ? "danger" : "success"}
                    size="sm"
                  >
                    {dia.configuracion.cerrado ? (
                      <><XCircle className="h-3 w-3 mr-1" />Cerrado</>
                    ) : (
                      <><CheckCircle className="h-3 w-3 mr-1" />Abierto</>
                    )}
                  </Badge>
                </div>

                {!dia.configuracion.cerrado && dia.configuracion.horarioEspecial && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Horario:</span>
                    <span className="text-white">
                      {dia.configuracion.horarioEspecial.inicio} - {dia.configuracion.horarioEspecial.fin}
                    </span>
                  </div>
                )}

                {dia.configuracion.tarifaEspecial && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tarifa:</span>
                    <Badge 
                      variant={dia.configuracion.tarifaEspecial.tipo === 'descuento' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {dia.configuracion.tarifaEspecial.tipo === 'descuento' ? '-' : '+'}
                      {dia.configuracion.tarifaEspecial.valor}%
                    </Badge>
                  </div>
                )}

                {dia.configuracion.serviciosLimitados && (
                  <div>
                    <span className="text-slate-400 block mb-1">Servicios limitados:</span>
                    <div className="flex flex-wrap gap-1">
                      {dia.configuracion.serviciosLimitados.map((servicio) => (
                        <Badge key={servicio} variant="secondary" size="sm">
                          {servicio}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {dia.configuracion.notas && (
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-300 text-xs">
                      {dia.configuracion.notas}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnaliticas = () => (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h3 className="text-lg lg:text-xl font-bold text-white">Analíticas de Horarios</h3>
        <p className="text-slate-400 text-sm lg:text-base">
          Análisis de ocupación y optimización
        </p>
      </div>

      {/* Métricas globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card padding="lg" className="text-center">
          <BarChart3 className="h-6 lg:h-8 w-6 lg:w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-lg lg:text-2xl font-bold text-white">78%</div>
          <div className="text-slate-400 text-xs lg:text-sm">Ocupación Promedio</div>
        </Card>

        <Card padding="lg" className="text-center">
          <TrendingUp className="h-6 lg:h-8 w-6 lg:w-8 text-green-400 mx-auto mb-2" />
          <div className="text-lg lg:text-2xl font-bold text-white">156</div>
          <div className="text-slate-400 text-xs lg:text-sm">Horas Semanales</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Zap className="h-6 lg:h-8 w-6 lg:w-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-lg lg:text-2xl font-bold text-white">92%</div>
          <div className="text-slate-400 text-xs lg:text-sm">Eficiencia Viernes</div>
        </Card>

        <Card padding="lg" className="text-center">
          <Clock className="h-6 lg:h-8 w-6 lg:w-8 text-purple-400 mx-auto mb-2" />
          <div className="text-lg lg:text-2xl font-bold text-white">45</div>
          <div className="text-slate-400 text-xs lg:text-sm">Min/Servicio</div>
        </Card>
      </div>

      {/* Análisis por día */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Ocupación por Día de la Semana
        </h4>
        <div className="space-y-3">
          {metricas.map((metrica) => {
            const color = metrica.porcentaje >= 90 
              ? "text-red-400" 
              : metrica.porcentaje >= 75 
                ? "text-yellow-400" 
                : "text-green-400";

            return (
              <div
                key={metrica.dia}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs lg:text-sm">
                    {metrica.dia.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-medium text-sm lg:text-base">
                    {metrica.dia.charAt(0).toUpperCase() + metrica.dia.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-20 lg:w-32 bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metrica.porcentaje >= 90
                          ? "bg-red-400"
                          : metrica.porcentaje >= 75
                          ? "bg-yellow-400"
                          : "bg-green-400"
                      }`}
                      style={{ width: `${metrica.porcentaje}%` }}
                    />
                  </div>
                  <span className={`font-medium text-sm lg:text-base ${color}`}>
                    {metrica.porcentaje}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recomendaciones */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Recomendaciones de Optimización
        </h4>
        <div className="space-y-3">
          <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-yellow-400 font-medium text-sm lg:text-base">
                  Alta demanda los viernes
                </div>
                <div className="text-yellow-300 text-xs lg:text-sm">
                  Considera extender horarios o agregar otro barbero los viernes por la tarde
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-green-400 font-medium text-sm lg:text-base">
                  Distribución equilibrada
                </div>
                <div className="text-green-300 text-xs lg:text-sm">
                  Los martes y jueves tienen buena distribución de carga de trabajo
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderOptimizacion = () => (
    <div className="p-6">
      <EmptyState
        icon={Zap}
        title="Sistema de Optimización"
        description="Panel de optimización automática en desarrollo..."
      />
    </div>
  );

  // Control de visibilidad
  if (!visible || context !== "horarios") return null;

  // ===================================================================
  // RENDER PRINCIPAL
  // ===================================================================

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Navegación */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-slate-800 p-1 rounded-lg">
        {[
          { id: "especiales", label: "Días Especiales", icon: AlertTriangle },
          { id: "analiticas", label: "Analíticas", icon: BarChart3 },
          { id: "optimizacion", label: "Optimización", icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setVista(tab.id as VistaOptimizada)}
            className={`
              flex items-center justify-center gap-2 px-3 lg:px-4 py-2 rounded-md transition-all text-sm lg:text-base
              ${
                vista === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      {vista === "especiales" && renderDiasEspeciales()}
      {vista === "analiticas" && renderAnaliticas()}
      {vista === "optimizacion" && renderOptimizacion()}
    </div>
  );
};

export default ConfiguracionHorariosOptimizada;
