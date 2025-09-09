/**
 * ===================================================================
 * ADMIN PANEL - COMPLETAMENTE RESPONSIVO PARA MOBILE
 * ===================================================================
 *
 * Panel de administración optimizado para mobile-first
 * con navegación adaptativa y componentes responsivos
 */

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
  Menu,
  X,
} from "lucide-react";

// Hooks modernos
import { useBarberos } from "../hooks/useBarberos";
import { useServicios } from "../hooks/useServicios";
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";

// Componentes responsivos
import { AgendaDisponibilidad } from "./admin/AgendaDisponibilidad";
import { ConfiguracionHorariosTotal } from "./admin/ConfiguracionHorariosTotal";
import { GestionBarberosMejorada } from "./admin/GestionBarberosMejorada";
import { GestionServiciosCorregida } from "./admin/GestionServiciosCorregida";
import { GestionReservasMejorada } from "./admin/GestionReservasMejorada";

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

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, emoji: "📊" },
  { id: "reservas", label: "Reservas", icon: Calendar, emoji: "📅" },
  { id: "barberos", label: "Barberos", icon: Users, emoji: "👨‍💼" },
  { id: "servicios", label: "Servicios", icon: Scissors, emoji: "✂️" },
  { id: "agenda", label: "Agenda", icon: Clock, emoji: "📋" },
  { id: "configuracion", label: "Config", icon: Settings, emoji: "⚙️" },
  { id: "reportes", label: "Reportes", icon: TrendingUp, emoji: "📈" },
];

export const AdminPanelResponsivo: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const completadas = reservas.filter(r => r.estado === "completada");
    const tasaAsistencia = reservas.length > 0 ? Math.round((completadas.length / reservas.length) * 100) : 0;

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
      tasaAsistencia,
    };
  }, [reservas, usuarios]);

  // Componente Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Estadísticas principales - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">Hoy</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{stats.reservasHoy}</p>
            </div>
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">Ingresos</p>
              <p className="text-lg sm:text-2xl font-bold text-green-400">
                ${stats.ingresosHoy.toLocaleString('es-CL')}
              </p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">Clientes</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{stats.totalClientes}</p>
            </div>
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">Asistencia</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-400">{stats.tasaAsistencia}%</p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Resúmenes semanales y mensuales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Resumen Semanal</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Reservas:</span>
              <span className="font-medium text-white">{stats.reservasSemana}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Ingresos:</span>
              <span className="font-medium text-green-400">
                ${stats.ingresosSemana.toLocaleString('es-CL')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Resumen Mensual</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Reservas:</span>
              <span className="font-medium text-white">{stats.reservasMes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Ingresos:</span>
              <span className="font-medium text-green-400">
                ${stats.ingresosMes.toLocaleString('es-CL')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">
              Barberos activos: <span className="text-white font-medium">{barberos?.length || 0}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">
              Servicios: <span className="text-white font-medium">{servicios?.length || 0}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span className="text-sm text-gray-300">Sistema operativo</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar contenido según tab activo
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "reservas":
        return <GestionReservasMejorada />;
      case "barberos":
        return <GestionBarberosMejorada />;
      case "servicios":
        return <GestionServiciosCorregida />;
      case "agenda":
        return <AgendaDisponibilidad />;
      case "configuracion":
        return <ConfiguracionHorariosTotal />;
      case "reportes":
        return <div className="text-center text-gray-400 py-12">Reportes en desarrollo</div>;
      default:
        return renderDashboard();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header principal - Mobile Responsive */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                <span className="hidden sm:inline">Panel de Administración</span>
                <span className="sm:hidden">Admin</span>
              </h1>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => refetchReservas?.()}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-md font-medium text-sm transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "..." : "↻"}
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación Mobile - Overlay Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="bg-gray-900 w-64 h-full shadow-xl">
            <div className="p-4 border-b border-gray-800">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Menú</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-yellow-500 text-black font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navegación Desktop - Tabs horizontales */}
      <div className="hidden sm:block bg-gray-800 border-b border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-all duration-200 whitespace-nowrap text-sm lg:text-base border-b-2 ${
                    isActive
                      ? 'bg-gray-900 border-yellow-500 text-yellow-500 font-semibold'
                      : 'border-transparent text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="hidden lg:inline">{tab.label}</span>
                  <span className="lg:hidden">{tab.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanelResponsivo;
