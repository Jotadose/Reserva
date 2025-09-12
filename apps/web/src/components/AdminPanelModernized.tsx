import React, { useState, Suspense, lazy } from "react";
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
import useBarberos from "../hooks/useBarberos";
import { useServicios } from "../hooks/useServicios";
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";

// Sistema de diseño unificado
import { DESIGN_TOKENS, getButtonClass, getCardClass } from "../styles/designSystem";

// ===================================================================
// LAZY LOADING - COMPONENTES PESADOS DEL ADMIN
// ===================================================================
const AgendaDisponibilidad = lazy(() => import("./admin/AgendaDisponibilidad").then(module => ({ default: module.AgendaDisponibilidad })));
const ConfiguracionHorariosTotal = lazy(() => import("./admin/ConfiguracionHorariosTotal").then(module => ({ default: module.ConfiguracionHorariosTotal })));
const GestionBarberosMejorada = lazy(() => import("./admin/GestionBarberosMejorada").then(module => ({ default: module.GestionBarberosMejorada })));
const GestionServiciosCorregida = lazy(() => import("./admin/GestionServiciosCorregida").then(module => ({ default: module.GestionServiciosCorregida })));
const GestionReservasMejorada = lazy(() => import("./admin/GestionReservasMejorada").then(module => ({ default: module.GestionReservasMejorada })));

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

// Componente de Loading optimizado
const AdminLoadingFallback: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center min-h-[400px] bg-gray-900 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-3"></div>
      <p className="text-gray-300 text-sm">{message}</p>
    </div>
  </div>
);

export const AdminPanelModernized: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ HOOKS MVP INTEGRADOS
  const { barberos, loading: barberosLoading } = useBarberos();
  const { servicios, loading: serviciosLoading } = useServicios();
  const { reservas, loading: reservasLoading } = useReservasMVP();
  const { usuarios, loading: usuariosLoading } = useUsuarios();

  // ✅ ESTADÍSTICAS EN TIEMPO REAL
  const stats: Stats = React.useMemo(() => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const reservasHoy = reservas.filter(r => {
      const fechaReserva = new Date(r.fecha);
      return fechaReserva.toDateString() === new Date().toDateString();
    }).length;

    const reservasSemana = reservas.filter(r => {
      const fechaReserva = new Date(r.fecha);
      return fechaReserva >= inicioSemana;
    }).length;

    const reservasMes = reservas.filter(r => {
      const fechaReserva = new Date(r.fecha);
      return fechaReserva >= inicioMes;
    }).length;

    const calcularIngresos = (reservasFiltradas: any[]) => {
      return reservasFiltradas
        .filter(r => r.estado === 'completada')
        .reduce((total, r) => {
          const servicio = servicios.find(s => s.id === r.servicio_id);
          return total + (servicio?.precio || 0);
        }, 0);
    };

    return {
      reservasHoy,
      reservasSemana,
      reservasMes,
      ingresosHoy: calcularIngresos(reservas.filter(r => {
        const fechaReserva = new Date(r.fecha);
        return fechaReserva.toDateString() === new Date().toDateString();
      })),
      ingresosSemana: calcularIngresos(reservas.filter(r => {
        const fechaReserva = new Date(r.fecha);
        return fechaReserva >= inicioSemana;
      })),
      ingresosMes: calcularIngresos(reservas.filter(r => {
        const fechaReserva = new Date(r.fecha);
        return fechaReserva >= inicioMes;
      })),
      totalClientes: usuarios.length,
      tasaAsistencia: reservas.length > 0 
        ? (reservas.filter(r => r.estado === 'completada').length / reservas.length) * 100 
        : 0
    };
  }, [reservas, servicios, usuarios]);

  // ✅ CONFIGURACIÓN DE PESTAÑAS
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "reservas", label: "Reservas", icon: Calendar },
    { id: "barberos", label: "Barberos", icon: Users },
    { id: "servicios", label: "Servicios", icon: Scissors },
    { id: "agenda", label: "Agenda", icon: Clock },
    { id: "configuracion", label: "Configuración", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
            <p className="text-gray-400 text-sm mt-1">Michael The Barber - Sistema de Gestión</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-300">Sistema Activo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-yellow-500 text-black"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Reservas Hoy</p>
                    <p className="text-2xl font-bold text-white">{stats.reservasHoy}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ingresos Hoy</p>
                    <p className="text-2xl font-bold text-white">${stats.ingresosHoy.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Clientes</p>
                    <p className="text-2xl font-bold text-white">{stats.totalClientes}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Tasa Asistencia</p>
                    <p className="text-2xl font-bold text-white">{stats.tasaAsistencia.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Resumen Semanal */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Resumen Semanal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Reservas</p>
                  <p className="text-xl font-bold text-white">{stats.reservasSemana}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Ingresos</p>
                  <p className="text-xl font-bold text-white">${stats.ingresosSemana.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Barberos Activos</p>
                  <p className="text-xl font-bold text-white">{barberos.filter(b => b.activo).length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lazy Loaded Components */}
        {activeTab === "reservas" && (
          <Suspense fallback={<AdminLoadingFallback message="Cargando gestión de reservas..." />}>
            <GestionReservasMejorada />
          </Suspense>
        )}
        
        {activeTab === "barberos" && (
          <Suspense fallback={<AdminLoadingFallback message="Cargando gestión de barberos..." />}>
            <GestionBarberosMejorada />
          </Suspense>
        )}
        
        {activeTab === "servicios" && (
          <Suspense fallback={<AdminLoadingFallback message="Cargando gestión de servicios..." />}>
            <GestionServiciosCorregida />
          </Suspense>
        )}
        
        {activeTab === "agenda" && (
          <Suspense fallback={<AdminLoadingFallback message="Cargando agenda y disponibilidad..." />}>
            <AgendaDisponibilidad />
          </Suspense>
        )}
        
        {activeTab === "configuracion" && (
          <Suspense fallback={<AdminLoadingFallback message="Cargando configuración de horarios..." />}>
            <ConfiguracionHorariosTotal />
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default AdminPanelModernized;