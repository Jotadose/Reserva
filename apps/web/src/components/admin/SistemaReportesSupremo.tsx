/**
 * ===================================================================
 * SISTEMA DE REPORTES Y ANÁLISIS SUPREMO - INTELIGENCIA TOTAL
 * ===================================================================
 *
 * Panel supremo de reportes con funcionalidades avanzadas:
 * - Reportes financieros detallados
 * - Análisis de rendimiento por barbero
 * - Predicciones y tendencias
 * - Exportación en múltiples formatos
 * - Dashboard ejecutivo en tiempo real
 */

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Star,
  Target,
  Download,
  FileText,
  PieChart,
  Activity,
  Filter,
  RefreshCw,
  Zap,
  Award,
} from "lucide-react";

import { Button, Card, Badge, Select, EmptyState } from "../ui";

import { useToast } from "../../contexts/ToastContext";

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface ReporteFinanciero {
  periodo: string;
  ingresosBrutos: number;
  ingresosNetos: number;
  costos: number;
  margen: number;
  serviciosVendidos: number;
  ticketPromedio: number;
  crecimiento: number;
}

interface RendimientoBarbero {
  barberoId: string;
  nombre: string;
  serviciosRealizados: number;
  ingresoGenerado: number;
  horasTrabajadas: number;
  satisfaccionPromedio: number;
  eficiencia: number;
  comisiones: number;
  ranking: number;
}

interface MetricaNegocio {
  id: string;
  nombre: string;
  valor: number;
  unidad: string;
  tendencia: "up" | "down" | "stable";
  porcentajeCambio: number;
  meta?: number;
  categoria: "financiero" | "operacional" | "cliente" | "barbero";
}

interface DatosTendencia {
  fecha: string;
  ingresos: number;
  servicios: number;
  clientes: number;
  satisfaccion: number;
}

type TipoReporte =
  | "dashboard"
  | "financiero"
  | "operacional"
  | "barberos"
  | "clientes"
  | "predicciones";
type PeriodoReporte =
  | "hoy"
  | "semana"
  | "mes"
  | "trimestre"
  | "año"
  | "personalizado";

// ===================================================================
// DATOS SIMULADOS
// ===================================================================

const reportesFinancierosMock: ReporteFinanciero[] = [
  {
    periodo: "2024-01",
    ingresosBrutos: 2850000,
    ingresosNetos: 2280000,
    costos: 570000,
    margen: 80,
    serviciosVendidos: 165,
    ticketPromedio: 17272,
    crecimiento: 12.5,
  },
  {
    periodo: "2023-12",
    ingresosBrutos: 2540000,
    ingresosNetos: 2032000,
    costos: 508000,
    margen: 80,
    serviciosVendidos: 148,
    ticketPromedio: 17162,
    crecimiento: 8.3,
  },
  {
    periodo: "2023-11",
    ingresosBrutos: 2340000,
    ingresosNetos: 1872000,
    costos: 468000,
    margen: 80,
    serviciosVendidos: 142,
    ticketPromedio: 16478,
    crecimiento: 5.7,
  },
];

const rendimientoBarberosMock: RendimientoBarbero[] = [
  {
    barberoId: "1",
    nombre: "Michael Rodriguez",
    serviciosRealizados: 89,
    ingresoGenerado: 1650000,
    horasTrabajadas: 156,
    satisfaccionPromedio: 4.8,
    eficiencia: 92,
    comisiones: 247500,
    ranking: 1,
  },
  {
    barberoId: "2",
    nombre: "Carlos Martinez",
    serviciosRealizados: 76,
    ingresoGenerado: 1200000,
    horasTrabajadas: 144,
    satisfaccionPromedio: 4.5,
    eficiencia: 78,
    comisiones: 180000,
    ranking: 2,
  },
];

const metricasNegocioMock: MetricaNegocio[] = [
  {
    id: "1",
    nombre: "Ingresos Mensuales",
    valor: 2850000,
    unidad: "CLP",
    tendencia: "up",
    porcentajeCambio: 12.5,
    meta: 3000000,
    categoria: "financiero",
  },
  {
    id: "2",
    nombre: "Servicios por Día",
    valor: 8.2,
    unidad: "servicios",
    tendencia: "up",
    porcentajeCambio: 6.8,
    meta: 10,
    categoria: "operacional",
  },
  {
    id: "3",
    nombre: "Satisfacción Cliente",
    valor: 4.7,
    unidad: "/5",
    tendencia: "stable",
    porcentajeCambio: 1.2,
    meta: 4.8,
    categoria: "cliente",
  },
  {
    id: "4",
    nombre: "Tiempo Promedio por Servicio",
    valor: 42,
    unidad: "minutos",
    tendencia: "down",
    porcentajeCambio: -3.2,
    categoria: "operacional",
  },
  {
    id: "5",
    nombre: "Ocupación Sillas",
    valor: 78,
    unidad: "%",
    tendencia: "up",
    porcentajeCambio: 8.5,
    meta: 85,
    categoria: "operacional",
  },
  {
    id: "6",
    nombre: "Clientes Nuevos",
    valor: 23,
    unidad: "clientes",
    tendencia: "up",
    porcentajeCambio: 15.2,
    categoria: "cliente",
  },
];

const datosTendenciaMock: DatosTendencia[] = [
  {
    fecha: "2024-01-01",
    ingresos: 85000,
    servicios: 12,
    clientes: 10,
    satisfaccion: 4.6,
  },
  {
    fecha: "2024-01-02",
    ingresos: 92000,
    servicios: 14,
    clientes: 12,
    satisfaccion: 4.7,
  },
  {
    fecha: "2024-01-03",
    ingresos: 78000,
    servicios: 11,
    clientes: 9,
    satisfaccion: 4.5,
  },
  {
    fecha: "2024-01-04",
    ingresos: 105000,
    servicios: 16,
    clientes: 14,
    satisfaccion: 4.8,
  },
  {
    fecha: "2024-01-05",
    ingresos: 118000,
    servicios: 18,
    clientes: 16,
    satisfaccion: 4.9,
  },
  {
    fecha: "2024-01-06",
    ingresos: 124000,
    servicios: 19,
    clientes: 17,
    satisfaccion: 4.8,
  },
  {
    fecha: "2024-01-07",
    ingresos: 89000,
    servicios: 13,
    clientes: 11,
    satisfaccion: 4.6,
  },
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const SistemaReportesSupremo: React.FC = () => {
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>("dashboard");
  const [periodo, setPeriodo] = useState<PeriodoReporte>("mes");
  const [actualizando, setActualizando] = useState(false);
  const { showToast } = useToast();

  const reporteActual = useMemo(() => reportesFinancierosMock[0], []);

  const metricasFiltradas = useMemo(
    () =>
      metricasNegocioMock.filter((m) => {
        if (tipoReporte === "dashboard") return true;
        if (tipoReporte === "financiero") return m.categoria === "financiero";
        if (tipoReporte === "operacional") return m.categoria === "operacional";
        if (tipoReporte === "clientes") return m.categoria === "cliente";
        return false;
      }),
    [tipoReporte]
  );

  const handleActualizar = async () => {
    setActualizando(true);
    // Simular actualización de datos
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setActualizando(false);
    showToast({
      title: "Datos actualizados",
      message:
        "Los reportes han sido actualizados con la información más reciente",
      type: "success",
    });
  };

  const handleExportar = (formato: string) => {
    showToast({
      title: "Exportando reporte",
      message: `Generando reporte en formato ${formato.toUpperCase()}...`,
      type: "info",
    });
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case "up":
        return "text-green-400";
      case "down":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const renderDashboardEjecutivo = () => (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-green-400" />
              <Badge variant="success">+12.5%</Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(reporteActual.ingresosBrutos)}
              </div>
              <div className="text-slate-400">Ingresos Brutos</div>
            </div>
            <div className="text-sm text-green-400">
              +{formatCurrency(reporteActual.ingresosBrutos - 2540000)} vs mes
              anterior
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <BarChart3 className="h-8 w-8 text-blue-400" />
              <Badge variant="success">+11.5%</Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {reporteActual.serviciosVendidos}
              </div>
              <div className="text-slate-400">Servicios Vendidos</div>
            </div>
            <div className="text-sm text-blue-400">
              +{reporteActual.serviciosVendidos - 148} servicios vs mes anterior
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Target className="h-8 w-8 text-purple-400" />
              <Badge variant="secondary">{reporteActual.margen}%</Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(reporteActual.ticketPromedio)}
              </div>
              <div className="text-slate-400">Ticket Promedio</div>
            </div>
            <div className="text-sm text-purple-400">
              Margen de ganancia del {reporteActual.margen}%
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Star className="h-8 w-8 text-yellow-400" />
              <Badge variant="warning">4.7/5</Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">4.7</div>
              <div className="text-slate-400">Satisfacción Promedio</div>
            </div>
            <div className="text-sm text-yellow-400">
              Excelente calidad de servicio
            </div>
          </div>
        </Card>
      </div>

      {/* Métricas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {metricasFiltradas.map((metrica) => (
          <Card key={metrica.id} padding="lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h4 className="font-medium text-white">{metrica.nombre}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {metrica.unidad === "CLP"
                      ? formatCurrency(metrica.valor)
                      : `${metrica.valor}${
                          metrica.unidad !== "servicios" &&
                          metrica.unidad !== "clientes"
                            ? metrica.unidad
                            : ""
                        }`}
                  </span>
                  {getTendenciaIcon(metrica.tendencia)}
                </div>
                <div
                  className={`text-sm ${getTendenciaColor(metrica.tendencia)}`}
                >
                  {metrica.porcentajeCambio > 0 ? "+" : ""}
                  {metrica.porcentajeCambio}% vs anterior
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    metrica.categoria === "financiero"
                      ? "success"
                      : metrica.categoria === "operacional"
                      ? "primary"
                      : metrica.categoria === "cliente"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {metrica.categoria}
                </Badge>
                {metrica.meta && (
                  <div className="text-slate-400 text-sm mt-2">
                    Meta:{" "}
                    {metrica.unidad === "CLP"
                      ? formatCurrency(metrica.meta)
                      : `${metrica.meta}${metrica.unidad}`}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gráfico de tendencias simulado */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Tendencias de los Últimos 7 Días
        </h4>
        <div className="space-y-4">
          {datosTendenciaMock.map((dato, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="text-slate-400 text-sm w-20">
                  {new Date(dato.fecha).toLocaleDateString("es-CL", {
                    weekday: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-green-400 font-medium">
                      {formatCurrency(dato.ingresos)}
                    </div>
                    <div className="text-slate-400 text-xs">Ingresos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-medium">
                      {dato.servicios}
                    </div>
                    <div className="text-slate-400 text-xs">Servicios</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-medium">
                      {dato.clientes}
                    </div>
                    <div className="text-slate-400 text-xs">Clientes</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-medium">
                  {dato.satisfaccion}
                </div>
                <div className="text-slate-400 text-xs">Satisfacción</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Alertas y recomendaciones */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Alertas y Recomendaciones
        </h4>
        <div className="space-y-3">
          <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <div className="text-green-400 font-medium">
                  Meta de ingresos superada
                </div>
                <div className="text-green-300 text-sm">
                  Has superado la meta mensual en un 12.5%. ¡Excelente trabajo!
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <div className="text-yellow-400 font-medium">
                  Oportunidad de optimización
                </div>
                <div className="text-yellow-300 text-sm">
                  Los viernes muestran alta demanda. Considera extender
                  horarios.
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-blue-400 font-medium">
                  Proyección positiva
                </div>
                <div className="text-blue-300 text-sm">
                  Al ritmo actual, proyectamos un crecimiento del 15% para el
                  próximo mes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderReporteFinanciero = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">
          Reporte Financiero Detallado
        </h3>
        <p className="text-slate-400">
          Análisis completo de ingresos, costos y rentabilidad
        </p>
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="lg">
          <div className="text-center space-y-3">
            <DollarSign className="h-10 w-10 text-green-400 mx-auto" />
            <div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(reporteActual.ingresosBrutos)}
              </div>
              <div className="text-slate-400">Ingresos Brutos</div>
            </div>
            <Badge variant="success">+{reporteActual.crecimiento}%</Badge>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center space-y-3">
            <Target className="h-10 w-10 text-blue-400 mx-auto" />
            <div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(reporteActual.ingresosNetos)}
              </div>
              <div className="text-slate-400">Ingresos Netos</div>
            </div>
            <Badge variant="primary">{reporteActual.margen}% margen</Badge>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center space-y-3">
            <BarChart3 className="h-10 w-10 text-purple-400 mx-auto" />
            <div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(reporteActual.costos)}
              </div>
              <div className="text-slate-400">Costos Operacionales</div>
            </div>
            <Badge variant="secondary">20% del ingreso</Badge>
          </div>
        </Card>
      </div>

      {/* Desglose detallado */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Desglose de Ingresos por Categoría
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div>
              <div className="font-medium text-white">Servicios de Corte</div>
              <div className="text-slate-400 text-sm">
                89 servicios realizados
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-medium">
                {formatCurrency(1650000)}
              </div>
              <div className="text-slate-400 text-sm">58% del total</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div>
              <div className="font-medium text-white">Servicios de Barba</div>
              <div className="text-slate-400 text-sm">
                45 servicios realizados
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-medium">
                {formatCurrency(675000)}
              </div>
              <div className="text-slate-400 text-sm">24% del total</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div>
              <div className="font-medium text-white">Servicios Premium</div>
              <div className="text-slate-400 text-sm">
                31 servicios realizados
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-medium">
                {formatCurrency(525000)}
              </div>
              <div className="text-slate-400 text-sm">18% del total</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Comparación histórica */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Comparación Histórica (Últimos 3 Meses)
        </h4>
        <div className="space-y-3">
          {reportesFinancierosMock.map((reporte, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="text-white font-medium">
                  {new Date(reporte.periodo + "-01").toLocaleDateString(
                    "es-CL",
                    { month: "long", year: "numeric" }
                  )}
                </div>
                <Badge variant={index === 0 ? "success" : "secondary"}>
                  {index === 0 ? "Actual" : "Histórico"}
                </Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-green-400 font-medium">
                    {formatCurrency(reporte.ingresosBrutos)}
                  </div>
                  <div className="text-slate-400 text-xs">Bruto</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-medium">
                    {reporte.serviciosVendidos}
                  </div>
                  <div className="text-slate-400 text-xs">Servicios</div>
                </div>
                <div className="text-center">
                  <div
                    className={`font-medium ${
                      reporte.crecimiento > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {reporte.crecimiento > 0 ? "+" : ""}
                    {reporte.crecimiento}%
                  </div>
                  <div className="text-slate-400 text-xs">Crecimiento</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderRendimientoBarberos = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">
          Rendimiento por Barbero
        </h3>
        <p className="text-slate-400">
          Análisis detallado del desempeño individual
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rendimientoBarberosMock.map((barbero) => (
          <Card key={barbero.barberoId} padding="lg">
            <div className="space-y-4">
              {/* Header del barbero */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                    #{barbero.ranking}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {barbero.nombre}
                    </h4>
                    <Badge
                      variant={barbero.ranking === 1 ? "warning" : "secondary"}
                    >
                      {barbero.ranking === 1
                        ? "Top Performer"
                        : `Ranking ${barbero.ranking}`}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold text-lg">
                    {formatCurrency(barbero.ingresoGenerado)}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Ingresos generados
                  </div>
                </div>
              </div>

              {/* Métricas principales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {barbero.serviciosRealizados}
                  </div>
                  <div className="text-slate-400 text-sm">Servicios</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {barbero.horasTrabajadas}h
                  </div>
                  <div className="text-slate-400 text-sm">Horas</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-400">
                    {barbero.satisfaccionPromedio}
                  </div>
                  <div className="text-slate-400 text-sm">Satisfacción</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-xl font-bold text-blue-400">
                    {barbero.eficiencia}%
                  </div>
                  <div className="text-slate-400 text-sm">Eficiencia</div>
                </div>
              </div>

              {/* Comisiones y extras */}
              <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-green-400 font-medium">
                      Comisiones Ganadas
                    </div>
                    <div className="text-green-300 text-sm">
                      15% de ingresos generados
                    </div>
                  </div>
                  <div className="text-green-400 font-bold text-lg">
                    {formatCurrency(barbero.comisiones)}
                  </div>
                </div>
              </div>

              {/* Indicadores de rendimiento */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ingreso por hora:</span>
                  <span className="text-white font-medium">
                    {formatCurrency(
                      Math.round(
                        barbero.ingresoGenerado / barbero.horasTrabajadas
                      )
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Servicios por hora:</span>
                  <span className="text-white font-medium">
                    {(
                      barbero.serviciosRealizados / barbero.horasTrabajadas
                    ).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ticket promedio:</span>
                  <span className="text-white font-medium">
                    {formatCurrency(
                      Math.round(
                        barbero.ingresoGenerado / barbero.serviciosRealizados
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparación y rankings */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">Ranking Comparativo</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
              <Award className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-yellow-400 font-medium">Más Servicios</div>
              <div className="text-white font-bold">Michael Rodriguez</div>
              <div className="text-yellow-300 text-sm">89 servicios</div>
            </div>

            <div className="text-center p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-medium">Más Ingresos</div>
              <div className="text-white font-bold">Michael Rodriguez</div>
              <div className="text-green-300 text-sm">
                {formatCurrency(1650000)}
              </div>
            </div>

            <div className="text-center p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <Star className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-blue-400 font-medium">
                Mejor Satisfacción
              </div>
              <div className="text-white font-bold">Michael Rodriguez</div>
              <div className="text-blue-300 text-sm">4.8/5 estrellas</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // Navegación principal
  const tabs = [
    { id: "dashboard", label: "Dashboard Ejecutivo", icon: BarChart3 },
    { id: "financiero", label: "Reporte Financiero", icon: DollarSign },
    { id: "barberos", label: "Rendimiento Barberos", icon: Users },
    { id: "operacional", label: "Métricas Operacionales", icon: Activity },
    { id: "clientes", label: "Análisis Clientes", icon: Star },
    { id: "predicciones", label: "Predicciones", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Sistema de Reportes Supremo
          </h2>
          <p className="text-slate-400">
            Inteligencia de negocio y análisis avanzado
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={periodo}
            onChange={(value) => setPeriodo(value as PeriodoReporte)}
            options={[
              { value: "hoy", label: "Hoy" },
              { value: "semana", label: "Esta Semana" },
              { value: "mes", label: "Este Mes" },
              { value: "trimestre", label: "Este Trimestre" },
              { value: "año", label: "Este Año" },
            ]}
          />
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={handleActualizar}
            disabled={actualizando}
            className={actualizando ? "animate-spin" : ""}
          >
            {actualizando ? "Actualizando..." : "Actualizar"}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              icon={Download}
              onClick={() => handleExportar("pdf")}
            >
              PDF
            </Button>
            <Button
              variant="ghost"
              icon={FileText}
              onClick={() => handleExportar("excel")}
            >
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTipoReporte(tab.id as TipoReporte)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md transition-all whitespace-nowrap
              ${
                tipoReporte === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tipoReporte === "dashboard" && renderDashboardEjecutivo()}
      {tipoReporte === "financiero" && renderReporteFinanciero()}
      {tipoReporte === "barberos" && renderRendimientoBarberos()}

      {(tipoReporte === "operacional" ||
        tipoReporte === "clientes" ||
        tipoReporte === "predicciones") && (
        <div className="p-6">
          <EmptyState
            icon={
              tipoReporte === "operacional"
                ? Activity
                : tipoReporte === "clientes"
                ? Star
                : TrendingUp
            }
            title={`${
              tipoReporte === "operacional"
                ? "Métricas Operacionales"
                : tipoReporte === "clientes"
                ? "Análisis de Clientes"
                : "Sistema de Predicciones"
            }`}
            description={`Panel de ${tipoReporte} en desarrollo...`}
          />
        </div>
      )}
    </div>
  );
};

export default SistemaReportesSupremo;
