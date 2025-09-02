/**
 * ===================================================================
 * ADMIN DASHBOARD OPTIMIZADO - VERSIÓN PRODUCCIÓN
 * ===================================================================
 *
 * Panel administrativo simplificado y optimizado para pruebas en producción
 * sin autenticación ni pagos, enfocado en funcionalidades core
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

// Componentes de gestión
import GestionReservas from "./admin/GestionReservas";
import GestionServicios from "./admin/GestionServicios";

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
  | "sistema";

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
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Monitor },
    { id: "reservas", label: "Reservas", icon: Calendar },
    { id: "servicios", label: "Servicios", icon: Scissors },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "sistema", label: "Sistema", icon: Settings },
  ];

  return (
    <div className="bg-slate-800 border-b border-slate-700">
      <div className="flex space-x-1 p-2">
        {tabs.map((tab) => (
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
