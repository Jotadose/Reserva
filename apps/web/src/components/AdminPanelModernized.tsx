import React, { useState } from "react";
import {
  Calendar,
  Users,
  Scissors,
  DollarSign,
  TrendingUp,
  Clock,
  Settings,
  BarChart3,
  CheckCircle,
  Search,
} from "lucide-react";

// Hooks modernos
import { useBarberos } from "../hooks/useBarberos";
import { useServicios } from "../hooks/useServicios";
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";

// Componentes avanzados ya desarrollados
import { AgendaDisponibilidad } from "./admin/AgendaDisponibilidad";
import { ConfiguracionHorariosTotal } from "./admin/ConfiguracionHorariosTotal";
import { GestionBarberosAvanzada } from "./admin/GestionBarberosAvanzada";
import { GestionServicios } from "./admin/GestionServicios";
import { AdminBookingsView } from "./admin/AdminBookingsView";

// Sistema de diseño unificado
import { DESIGN_TOKENS, getButtonClass, getCardClass } from "../styles/designSystem";

// Tipos
interface Stats {
  reservasHoy: number;
  reservasSemana: number;
  reservasMes: number;
  ingresosHoy: number;
  ingresosSemana: number;
  ingresosMes: number;
  totalClientes: number;
  tasaAsistencia: number;
}

type TabType = 
  | "dashboard" 
  | "reservas" 
  | "barberos" 
  | "servicios" 
  | "agenda" 
  | "configuracion"
  | "reportes";

export const AdminPanelModernized: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  // Hooks para datos
  const { barberos, loading: loadingBarberos } = useBarberos();
  const { servicios, loading: loadingServicios } = useServicios();
  const { reservas, loading: loadingReservas, refetch: refetchReservas } = useReservasMVP();
  const { usuarios, loading: loadingUsuarios } = useUsuarios();

  // Loading state general
  const isLoading = loadingBarberos || loadingServicios || loadingReservas || loadingUsuarios;

  // Calcular estadísticas en tiempo real
  const stats: Stats = React.useMemo(() => {
    if (!reservas || reservas.length === 0) {
      return {
        reservasHoy: 0,
        reservasSemana: 0,
        reservasMes: 0,
        ingresosHoy: 0,
        ingresosSemana: 0,
        ingresosMes: 0,
        totalClientes: usuarios?.length || 0,
        tasaAsistencia: 0,
      };
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const startWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      reservasHoy: reservas.filter(r => r.fecha_reserva === today).length,
      reservasSemana: reservas.filter(r => {
        const fechaReserva = new Date(r.fecha_reserva);
        return fechaReserva >= startWeek && fechaReserva <= endWeek;
      }).length,
      reservasMes: reservas.filter(r => {
        const fechaReserva = new Date(r.fecha_reserva);
        return fechaReserva >= startMonth && fechaReserva <= endMonth;
      }).length,
      ingresosHoy: reservas
        .filter(r => r.fecha_reserva === today && r.estado === "completada")
        .reduce((sum, r) => sum + (r.precio_total || 0), 0),
      ingresosSemana: reservas
        .filter(r => {
          const fechaReserva = new Date(r.fecha_reserva);
          return fechaReserva >= startWeek && fechaReserva <= endWeek && r.estado === "completada";
        })
        .reduce((sum, r) => sum + (r.precio_total || 0), 0),
      ingresosMes: reservas
        .filter(r => {
          const fechaReserva = new Date(r.fecha_reserva);
          return fechaReserva >= startMonth && fechaReserva <= endMonth && r.estado === "completada";
        })
        .reduce((sum, r) => sum + (r.precio_total || 0), 0),
      totalClientes: usuarios?.length || 0,
      tasaAsistencia: reservas.length > 0
        ? Math.round((reservas.filter(r => r.estado === "completada").length / reservas.length) * 100)
        : 0,
    };
  }, [reservas, usuarios]);

  // Navegación de pestañas
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "reservas", label: "Reservas", icon: Calendar },
    { id: "barberos", label: "Barberos", icon: Users },
    { id: "servicios", label: "Servicios", icon: Scissors },
    { id: "agenda", label: "Agenda", icon: Clock },
    { id: "configuracion", label: "Configuración", icon: Settings },
  ];

  // Componente Dashboard
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${DESIGN_TOKENS.text.secondary}`}>Reservas Hoy</p>
              <p className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary}`}>{stats.reservasHoy}</p>
            </div>
            <Calendar className={`h-8 w-8 ${DESIGN_TOKENS.text.accent}`} />
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${DESIGN_TOKENS.text.secondary}`}>Ingresos Hoy</p>
              <p className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary}`}>${stats.ingresosHoy.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${DESIGN_TOKENS.text.secondary}`}>Total Clientes</p>
              <p className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary}`}>{stats.totalClientes}</p>
            </div>
            <Users className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${DESIGN_TOKENS.text.secondary}`}>Tasa Asistencia</p>
              <p className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary}`}>{stats.tasaAsistencia}%</p>
            </div>
            <TrendingUp className={`h-8 w-8 ${DESIGN_TOKENS.text.accent}`} />
          </div>
        </div>
      </div>

      {/* Estadísticas semanales y mensuales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={getCardClass()}>
          <h3 className={`text-lg font-semibold ${DESIGN_TOKENS.text.primary} mb-4`}>Resumen Semanal</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={DESIGN_TOKENS.text.secondary}>Reservas:</span>
              <span className={`font-medium ${DESIGN_TOKENS.text.primary}`}>{stats.reservasSemana}</span>
            </div>
            <div className="flex justify-between">
              <span className={DESIGN_TOKENS.text.secondary}>Ingresos:</span>
              <span className={`font-medium ${DESIGN_TOKENS.text.primary}`}>${stats.ingresosSemana.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={getCardClass()}>
          <h3 className={`text-lg font-semibold ${DESIGN_TOKENS.text.primary} mb-4`}>Resumen Mensual</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={DESIGN_TOKENS.text.secondary}>Reservas:</span>
              <span className={`font-medium ${DESIGN_TOKENS.text.primary}`}>{stats.reservasMes}</span>
            </div>
            <div className="flex justify-between">
              <span className={DESIGN_TOKENS.text.secondary}>Ingresos:</span>
              <span className={`font-medium ${DESIGN_TOKENS.text.primary}`}>${stats.ingresosMes.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status del sistema */}
      <div className={getCardClass()}>
        <h3 className={`text-lg font-semibold ${DESIGN_TOKENS.text.primary} mb-4`}>Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className={`text-sm ${DESIGN_TOKENS.text.secondary}`}>Barberos activos: {barberos?.length || 0}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className={`text-sm ${DESIGN_TOKENS.text.secondary}`}>Servicios disponibles: {servicios?.length || 0}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className={`text-sm ${DESIGN_TOKENS.text.secondary}`}>Sistema operativo</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={`${DESIGN_TOKENS.background.admin} flex items-center justify-center h-64`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${DESIGN_TOKENS.border.accent}`}></div>
        <span className={`ml-2 ${DESIGN_TOKENS.text.secondary}`}>Cargando panel de administración...</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${DESIGN_TOKENS.background.admin}`}>
      {/* Header */}
      <div className={`${DESIGN_TOKENS.background.elevated} shadow-sm ${DESIGN_TOKENS.border.default} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className={`text-2xl font-bold ${DESIGN_TOKENS.text.primary}`}>
              Panel de Administración
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${DESIGN_TOKENS.text.muted} h-4 w-4`} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 bg-gray-800 ${DESIGN_TOKENS.border.default} border rounded-lg ${DESIGN_TOKENS.text.primary} placeholder-gray-400 ${DESIGN_TOKENS.state.focus}`}
                />
              </div>
              <button
                onClick={() => refetchReservas()}
                className={getButtonClass('primary')}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <div className={`${DESIGN_TOKENS.background.elevated} ${DESIGN_TOKENS.border.default} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? `${DESIGN_TOKENS.border.accent} ${DESIGN_TOKENS.text.accent}`
                      : `border-transparent ${DESIGN_TOKENS.text.secondary} ${DESIGN_TOKENS.state.hover}`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "reservas" && <AdminBookingsView />}
        {activeTab === "barberos" && <GestionBarberosAvanzada />}
        {activeTab === "servicios" && <GestionServicios />}
        {activeTab === "agenda" && <AgendaDisponibilidad />}
        {activeTab === "configuracion" && <ConfiguracionHorariosTotal />}
      </div>
    </div>
  );
};

export default AdminPanelModernized;
