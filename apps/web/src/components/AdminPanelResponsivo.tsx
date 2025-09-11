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
import useBarberos from "../hooks/useBarberos";
import { useServicios } from "../hooks/useServicios";
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";

// Componentes responsivos
import { AgendaDisponibilidad } from "./admin/AgendaDisponibilidad";
import { ConfiguracionHorariosTotal } from "./admin/ConfiguracionHorariosTotal";
import { GestionBarberosMejorada } from "./admin/GestionBarberosMejorada";
import { GestionServiciosCorregida } from "./admin/GestionServiciosCorregida";
import { GestionReservasMejorada } from "./admin/GestionReservasMejorada";
import { StatCard } from "./admin/StatCard";
import { SummaryCard } from "./admin/SummaryCard";
import { SystemStatus } from "./admin/SystemStatus";
import { MobileMenu } from "./admin/MobileMenu";
import { DesktopTabs } from "./admin/DesktopTabs";
import { Dashboard } from "./admin/Dashboard";

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
    <Dashboard 
      stats={stats} 
      barberosCount={barberos?.length || 0} 
      serviciosCount={servicios?.length || 0} 
    />
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
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        tabs={TABS}
        activeTab={activeTab}
        onTabClick={(tabId) => setActiveTab(tabId as TabType)}
      />

      {/* Navegación Desktop - Tabs horizontales */}
      <DesktopTabs 
        tabs={TABS}
        activeTab={activeTab}
        onTabClick={(tabId) => setActiveTab(tabId as TabType)}
      />

      {/* Contenido principal */}
      <div className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanelResponsivo;
