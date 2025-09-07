/**
 * ===================================================================
 * PANEL ADMINISTRATIVO SUPREMO - PODER ABSOLUTO
 * ===================================================================
 *
 * Panel administrativo supremo con control total sobre:
 * - Gestión avanzada de barberos y horarios
 * - Sistema completo de servicios y precios
 * - Administración suprema de clientes
 * - Configuración total de horarios y disponibilidad
 * - Sistema de reportes y análisis supremo
 * - Dashboard ejecutivo en tiempo real
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Users,
  Scissors,
  Settings,
  Zap,
  Shield,
  Database,
  Activity,
  TrendingUp,
  RefreshCw,
  Monitor,
  Server,
  BarChart3,
  Crown,
  UserCog,
  FileBarChart,
  Clock,
  DollarSign,
} from "lucide-react";

import {
  Button,
  Card,
  Badge,
  LoadingSpinner,
  EmptyState,
  StatsCard,
  Alert,
} from "./ui";

import { NotificationProvider, NotificationButton } from "./NotificationSystem";
import {
  useBookings,
  useServices,
  useClients,
} from "../hooks/useSupabaseNormalized";
import { useToast } from "../contexts/ToastContext";

// Componentes de gestión básicos
import GestionReservas from "./admin/GestionReservas";
import GestionServicios from "./admin/GestionServicios";

// Componentes supremos
import { GestionBarberosAvanzada } from "./admin/GestionBarberosAvanzada";
import { ConfiguracionServiciosAvanzada } from "./admin/ConfiguracionServiciosAvanzada";
import { GestionClientesSuprema } from "./admin/GestionClientesSuprema";
import { ConfiguracionHorariosTotal } from "./admin/ConfiguracionHorariosTotal";
import { SistemaReportesSupremo } from "./admin/SistemaReportesSupremo";

// ===================================================================
// UTILIDADES Y HELPERS
// ===================================================================

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
    case "connected":
    case "active":
      return "bg-green-500";
    case "slow":
    case "warning":
      return "bg-yellow-500";
    default:
      return "bg-red-500";
  }
};

const getEstadoBadgeVariant = (estado: string) => {
  switch (estado) {
    case "confirmada":
      return "success";
    case "pendiente":
      return "warning";
    case "cancelada":
      return "danger";
    default:
      return "primary";
  }
};

const getPerformanceColor = (responseTime: number) => {
  if (responseTime < 300) return "bg-green-500";
  if (responseTime < 1000) return "bg-yellow-500";
  return "bg-red-500";
};

// ===================================================================
// INTERFACES
// ===================================================================

interface SystemHealth {
  api: "online" | "offline" | "slow";
  database: "connected" | "disconnected" | "slow";
  cache: "active" | "inactive";
  lastSync: string;
  responseTime: number;
}

type AdminView =
  | "dashboard"
  | "reservas"
  | "servicios"
  | "clientes"
  | "analiticas"
  | "sistema"
  | "barberos-supremo"
  | "servicios-supremo"
  | "clientes-supremo"
  | "horarios-supremo"
  | "reportes-supremo";

// ===================================================================
// COMPONENTES AUXILIARES
// ===================================================================

interface HeaderProps {
  systemHealth: SystemHealth;
  onRefresh: () => void;
}

const ProductionHeader: React.FC<HeaderProps> = ({
  systemHealth,
  onRefresh,
}) => (
  <div className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 p-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">BarberPro Admin</h1>
        <p className="text-slate-400 text-sm">
          {new Date().toLocaleDateString("es-CL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(
              systemHealth.api
            )}`}
          />
          <span className="text-sm text-slate-300">
            API: {systemHealth.responseTime}ms
          </span>
        </div>

        <NotificationButton />

        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={onRefresh}>
          Actualizar
        </Button>
      </div>
    </div>
  </div>
);

interface NavigationProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

const NavigationTabs: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
}) => {
  const tabsBasicos = [
    { id: "dashboard", label: "Dashboard", icon: Monitor },
    { id: "reservas", label: "Reservas", icon: Calendar },
    { id: "servicios", label: "Servicios", icon: Scissors },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "analiticas", label: "Analíticas", icon: BarChart3 },
    { id: "sistema", label: "Sistema", icon: Settings },
  ];

  const tabsSupremos = [
    { id: "barberos-supremo", label: "⚡ Barberos Supremo", icon: Crown },
    { id: "servicios-supremo", label: "⚡ Servicios Supremo", icon: UserCog },
    { id: "clientes-supremo", label: "⚡ Clientes Supremo", icon: Users },
    { id: "horarios-supremo", label: "⚡ Horarios Supremo", icon: Clock },
    {
      id: "reportes-supremo",
      label: "⚡ Reportes Supremo",
      icon: FileBarChart,
    },
  ];

  return (
    <div className="bg-slate-800 border-b border-slate-700">
      {/* Tabs básicos */}
      <div className="flex space-x-1 p-2 border-b border-slate-700">
        {tabsBasicos.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id as AdminView)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
              ${
                currentView === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs supremos */}
      <div className="flex space-x-1 p-2 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
        <div className="text-yellow-400 text-xs font-bold px-2 py-1 bg-yellow-900/30 rounded flex items-center gap-1">
          <Crown className="h-3 w-3" />
          PANEL SUPREMO
        </div>
        {tabsSupremos.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id as AdminView)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 text-sm
              ${
                currentView === tab.id
                  ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg"
                  : "text-yellow-300 hover:bg-yellow-900/30 hover:text-yellow-100"
              }
            `}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===================================================================
// COMPONENTE DE ANALÍTICAS AVANZADAS
// ===================================================================

const AnalyticasAvanzadas: React.FC = () => {
  const { showToast } = useToast();

  // Stats simulados (en producción vendrían de la API)
  const stats = useMemo(
    () => ({
      // Financieros
      ingresosMes: 2850000,
      ingresosSemana: 680000,
      ingresosHoy: 95000,

      // Productividad
      tasaAsistencia: 87,
      reservasCompletadas: 156,
      clientesRecurrentes: 42,

      // Servicios
      servicioMasPopular: "Corte + Barba",
      totalReservas: 203,

      // Estados de reservas
      reservasConfirmadas: 45,
      reservasPendientes: 12,
      reservasCanceladas: 8,

      // Rendimiento
      tiempoPromedioServicio: 35,
      clientesNuevos: 18,
      satisfaccionCliente: 4.7,
    }),
    []
  );

  const handleExportReport = () => {
    showToast({
      title: "Exportando reporte",
      message: "El reporte será descargado en unos momentos",
      type: "info",
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Analíticas Avanzadas
          </h2>
          <p className="text-slate-400 mt-1">
            Análisis detallado del rendimiento y métricas del negocio
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleExportReport}
          icon={TrendingUp}
        >
          Exportar Reporte
        </Button>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<Activity className="h-6 w-6" />}
          title="Ingresos del Mes"
          value={new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
          }).format(stats.ingresosMes)}
          change="+12%"
          changeType="positive"
          color="green"
        />
        <StatsCard
          icon={<Users className="h-6 w-6" />}
          title="Tasa Asistencia"
          value={`${stats.tasaAsistencia}%`}
          change="+5%"
          changeType="positive"
          color="blue"
        />
        <StatsCard
          icon={<Calendar className="h-6 w-6" />}
          title="Reservas Completadas"
          value={stats.reservasCompletadas.toString()}
          change="+8%"
          changeType="positive"
          color="purple"
        />
        <StatsCard
          icon={<TrendingUp className="h-6 w-6" />}
          title="Clientes Recurrentes"
          value={stats.clientesRecurrentes.toString()}
          change="+15%"
          changeType="positive"
          color="orange"
        />
      </div>

      {/* Sección de Análisis Detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen Financiero */}
        <Card padding="lg">
          <h4 className="font-semibold text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-400" />
            Resumen Financiero
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Ingresos Mes:</span>
              <span className="text-green-400 font-medium">
                {new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(stats.ingresosMes)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ingresos Semana:</span>
              <span className="text-green-400 font-medium">
                {new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(stats.ingresosSemana)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ingresos Hoy:</span>
              <span className="text-green-400 font-medium">
                {new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(stats.ingresosHoy)}
              </span>
            </div>
          </div>
        </Card>

        {/* Productividad */}
        <Card padding="lg">
          <h4 className="font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
            Productividad
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Tasa de Asistencia:</span>
              <span className="text-blue-400 font-medium">
                {stats.tasaAsistencia}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reservas Completadas:</span>
              <span className="text-blue-400 font-medium">
                {stats.reservasCompletadas}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Clientes Recurrentes:</span>
              <span className="text-blue-400 font-medium">
                {stats.clientesRecurrentes}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tiempo Promedio:</span>
              <span className="text-blue-400 font-medium">
                {stats.tiempoPromedioServicio} min
              </span>
            </div>
          </div>
        </Card>

        {/* Análisis de Servicios */}
        <Card padding="lg">
          <h4 className="font-semibold text-white mb-4 flex items-center">
            <Scissors className="h-5 w-5 mr-2 text-purple-400" />
            Análisis de Servicios
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Más Popular:</span>
              <span className="text-purple-400 font-medium">
                {stats.servicioMasPopular}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Reservas:</span>
              <span className="text-purple-400 font-medium">
                {stats.totalReservas}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Clientes Nuevos:</span>
              <span className="text-purple-400 font-medium">
                {stats.clientesNuevos}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Satisfacción:</span>
              <span className="text-purple-400 font-medium">
                {stats.satisfaccionCliente}/5
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Estados de Reservas */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-orange-400" />
          Estados de Reservas
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats.reservasConfirmadas}
            </div>
            <div className="text-sm text-slate-400">Confirmadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.reservasPendientes}
            </div>
            <div className="text-sm text-slate-400">Pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.reservasCompletadas}
            </div>
            <div className="text-sm text-slate-400">Completadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {stats.reservasCanceladas}
            </div>
            <div className="text-sm text-slate-400">Canceladas</div>
          </div>
        </div>
      </Card>

      {/* Tendencias y Proyecciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <h4 className="font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-cyan-400" />
            Tendencias del Mes
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Crecimiento mensual</span>
              <Badge variant="success">+12%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Retención de clientes</span>
              <Badge variant="primary">85%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Eficiencia operativa</span>
              <Badge variant="success">+8%</Badge>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <h4 className="font-semibold text-white mb-4 flex items-center">
            <Monitor className="h-5 w-5 mr-2 text-indigo-400" />
            Proyecciones
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ingresos proyectados (mes)</span>
              <span className="text-green-400 font-medium">$3.2M CLP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Nuevos clientes estimados</span>
              <span className="text-blue-400 font-medium">+25</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ocupación promedio</span>
              <span className="text-purple-400 font-medium">78%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Alertas y Recomendaciones */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-yellow-400" />
          Alertas y Recomendaciones
        </h4>
        <div className="space-y-3">
          <Alert
            type="info"
            title="Oportunidad de Crecimiento"
            message="La demanda de servicios los viernes ha aumentado 20%. Considera extender el horario."
          />
          <Alert
            type="warning"
            title="Atención Requerida"
            message="8 reservas canceladas esta semana. Revisa la política de cancelación."
          />
          <Alert
            type="success"
            title="Rendimiento Excelente"
            message="Tu tasa de satisfacción del cliente está por encima del promedio de la industria."
          />
        </div>
      </Card>
    </div>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const AdminDashboardOptimizado: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    api: "online",
    database: "connected",
    cache: "active",
    lastSync: new Date().toISOString(),
    responseTime: 120,
  });

  // Hooks de datos
  const {
    reservas,
    loading: loadingReservas,
    error: errorReservas,
    refetch: refetchReservas,
  } = useReservas();

  const {
    servicios,
    loading: loadingServicios,
    error: errorServicios,
    refetch: refetchServicios,
  } = useServicios();

  const {
    usuarios,
    error: errorClientes,
    refetch: refetchClientes,
  } = useUsuarios();

  const { showToast } = useToast();

  // ===================================================================
  // CÁLCULOS DE MÉTRICAS
  // ===================================================================

  const metrics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const reservasHoy =
      reservas?.filter((r) => r.fecha_reserva === today) || [];
    const reservasMes =
      reservas?.filter((r) => r.fecha_reserva?.startsWith(thisMonth)) || [];
    const clientesActivos =
      usuarios?.filter((u) => u.rol === "cliente" && u.activo).length || 0;

    const ingresosDia = reservasHoy.reduce(
      (sum, r) => sum + (r.precio_total || 0),
      0
    );
    const ingresosMes = reservasMes.reduce(
      (sum, r) => sum + (r.precio_total || 0),
      0
    );

    const horasDisponibles = 9;
    const horasOcupadas = reservasHoy.length * 0.5;
    const ocupacionPromedio = Math.min(
      (horasOcupadas / horasDisponibles) * 100,
      100
    );

    return {
      reservasHoy: reservasHoy.length,
      ingresosDia,
      ingresosMes,
      clientesActivos,
      ocupacionPromedio,
      serviciosActivos: servicios?.filter((s) => s.activo).length || 0,
    };
  }, [reservas, usuarios, servicios]);

  // ===================================================================
  // MONITOREO DEL SISTEMA
  // ===================================================================

  useEffect(() => {
    const monitorSystem = async () => {
      const startTime = Date.now();

      try {
        const response = await fetch("/api/health");
        const responseTime = Date.now() - startTime;

        let apiStatus: "online" | "offline" | "slow" = "offline";
        if (response.ok) {
          apiStatus = responseTime > 2000 ? "slow" : "online";
        }

        setSystemHealth((prev) => ({
          ...prev,
          api: apiStatus,
          database: response.ok ? "connected" : "disconnected",
          responseTime,
          lastSync: new Date().toISOString(),
        }));
      } catch {
        setSystemHealth((prev) => ({
          ...prev,
          api: "offline",
          database: "disconnected",
        }));
      }
    };

    monitorSystem();
    const interval = setInterval(monitorSystem, 30000);
    return () => clearInterval(interval);
  }, []);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleRefresh = () => {
    refetchReservas();
    refetchServicios();
    refetchClientes();
    showToast("Sistema actualizado", "success");
  };

  // ===================================================================
  // VISTA DASHBOARD
  // ===================================================================

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Reservas Hoy"
          value={metrics.reservasHoy}
          icon={Calendar}
          color="blue"
          change={{
            value: `${Math.round(metrics.ocupacionPromedio)}% ocupación`,
            type: "positive",
          }}
        />

        <StatsCard
          title="Ingresos Día"
          value={`$${metrics.ingresosDia.toLocaleString("es-CL")}`}
          icon={TrendingUp}
          color="green"
          change={{
            value: `$${metrics.ingresosMes.toLocaleString("es-CL")} este mes`,
            type: "positive",
          }}
        />

        <StatsCard
          title="Clientes Activos"
          value={metrics.clientesActivos}
          icon={Users}
          color="purple"
          change={{
            value: `${reservas?.length || 0} reservas totales`,
            type: "neutral",
          }}
        />

        <StatsCard
          title="Performance API"
          value={`${systemHealth.responseTime}ms`}
          icon={Zap}
          color={systemHealth.responseTime < 500 ? "green" : "yellow"}
          change={{
            value: "Sistema estable",
            type: "positive",
          }}
        />
      </div>

      {/* Estado del Sistema */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Estado del Sistema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-blue-400" />
              <span className="text-white">API Backend</span>
            </div>
            <Badge
              variant={systemHealth.api === "online" ? "success" : "danger"}
              dot
            >
              {systemHealth.api}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-green-400" />
              <span className="text-white">Base de Datos</span>
            </div>
            <Badge
              variant={
                systemHealth.database === "connected" ? "success" : "danger"
              }
              dot
            >
              {systemHealth.database}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-purple-400" />
              <span className="text-white">Servicios</span>
            </div>
            <Badge variant="success" dot>
              {metrics.serviciosActivos} activos
            </Badge>
          </div>
        </div>
      </Card>

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Reservas */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Reservas Recientes
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView("reservas")}
            >
              Ver todas
            </Button>
          </div>

          {loadingReservas ? (
            <LoadingSpinner size="md" text="Cargando..." />
          ) : (
            <>
              {reservas && reservas.length > 0 ? (
                <div className="space-y-3">
                  {reservas.slice(0, 5).map((reserva) => (
                    <div
                      key={reserva.id_reserva}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {reserva.cliente_info?.nombre || "Cliente"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {reserva.servicio_info?.nombre || "Servicio"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">
                          {reserva.fecha_reserva} - {reserva.hora_inicio}
                        </p>
                        <Badge
                          variant={getEstadoBadgeVariant(reserva.estado)}
                          size="sm"
                        >
                          {reserva.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No hay reservas"
                  description="Las reservas aparecerán aquí"
                />
              )}
            </>
          )}
        </Card>

        {/* Servicios Activos */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Servicios Disponibles
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView("servicios")}
            >
              Gestionar
            </Button>
          </div>

          {loadingServicios ? (
            <LoadingSpinner size="md" text="Cargando..." />
          ) : (
            <>
              {servicios && servicios.length > 0 ? (
                <div className="space-y-3">
                  {servicios
                    .filter((s) => s.activo)
                    .slice(0, 5)
                    .map((servicio) => (
                      <div
                        key={servicio.id_servicio}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {servicio.nombre}
                          </p>
                          <p className="text-sm text-slate-400">
                            {servicio.duracion} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">
                            ${servicio.precio.toLocaleString("es-CL")}
                          </p>
                          <Badge variant="success" size="sm">
                            Activo
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <EmptyState
                  icon={Scissors}
                  title="No hay servicios"
                  description="Configura servicios para comenzar"
                />
              )}
            </>
          )}
        </Card>
      </div>

      {/* Alertas */}
      {(errorReservas || errorServicios || errorClientes) && (
        <Alert type="error" title="Problemas de Conectividad">
          <p>
            Se detectaron problemas de conexión. Algunos datos pueden no estar
            actualizados.
          </p>
        </Alert>
      )}
    </div>
  );

  // ===================================================================
  // RENDERIZADO DE VISTAS
  // ===================================================================

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return renderDashboard();
      case "reservas":
        return <GestionReservas />;
      case "servicios":
        return <GestionServicios />;
      case "clientes":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Gestión de Clientes
            </h3>
            <p className="text-slate-400">Panel de clientes en desarrollo...</p>
          </div>
        );
      case "analiticas":
        return <AnalyticasAvanzadas />;

      // ===================================================================
      // COMPONENTES SUPREMOS - PODER ABSOLUTO
      // ===================================================================
      case "barberos-supremo":
        return (
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-400" />
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400">
                    GESTIÓN SUPREMA DE BARBEROS
                  </h2>
                  <p className="text-yellow-300">
                    Control total sobre personal, horarios, comisiones y
                    rendimiento
                  </p>
                </div>
              </div>
            </div>
            <GestionBarberosAvanzada />
          </div>
        );

      case "servicios-supremo":
        return (
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCog className="h-8 w-8 text-blue-400" />
                <div>
                  <h2 className="text-2xl font-bold text-blue-400">
                    CONFIGURACIÓN SUPREMA DE SERVICIOS
                  </h2>
                  <p className="text-blue-300">
                    Control absoluto sobre servicios, precios y categorías
                  </p>
                </div>
              </div>
            </div>
            <ConfiguracionServiciosAvanzada />
          </div>
        );

      case "clientes-supremo":
        return (
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
            <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-400" />
                <div>
                  <h2 className="text-2xl font-bold text-green-400">
                    GESTIÓN SUPREMA DE CLIENTES
                  </h2>
                  <p className="text-green-300">
                    Análisis completo, fidelización y comunicación directa
                  </p>
                </div>
              </div>
            </div>
            <GestionClientesSuprema />
          </div>
        );

      case "horarios-supremo":
        return (
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-purple-400" />
                <div>
                  <h2 className="text-2xl font-bold text-purple-400">
                    CONFIGURACIÓN TOTAL DE HORARIOS
                  </h2>
                  <p className="text-purple-300">
                    Control absoluto sobre disponibilidad y optimización
                  </p>
                </div>
              </div>
            </div>
            <ConfiguracionHorariosTotal />
          </div>
        );

      case "reportes-supremo":
        return (
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileBarChart className="h-8 w-8 text-orange-400" />
                <div>
                  <h2 className="text-2xl font-bold text-orange-400">
                    SISTEMA DE REPORTES SUPREMO
                  </h2>
                  <p className="text-orange-300">
                    Inteligencia de negocio y análisis ejecutivo en tiempo real
                  </p>
                </div>
              </div>
            </div>
            <SistemaReportesSupremo />
          </div>
        );

      case "sistema":
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Configuración del Sistema
            </h3>
            <div className="space-y-4">
              <Card padding="lg">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Métricas de Rendimiento
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">
                      Tiempo de Respuesta API
                    </span>
                    <span className="text-white">
                      {systemHealth.responseTime}ms
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getPerformanceColor(
                        systemHealth.responseTime
                      )}`}
                      style={{
                        width: `${Math.min(
                          (systemHealth.responseTime / 1000) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-slate-900">
        <ProductionHeader
          systemHealth={systemHealth}
          onRefresh={handleRefresh}
        />
        <NavigationTabs
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        <main className="min-h-[calc(100vh-120px)]">{renderCurrentView()}</main>
      </div>
    </NotificationProvider>
  );
};

export default AdminDashboardOptimizado;
