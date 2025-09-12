import React, { useState, Suspense, lazy } from "react";
import {
  Calendar,
  Scissors,
  DollarSign,
  TrendingUp,
  Clock,
  Settings,
  BarChart3,
  CheckCircle,
  Search,
  User,
  Instagram,
} from "lucide-react";

// Hooks modernos
import { useServicios } from "../hooks/useServicios";
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";
import { useAuthIndividual } from "../hooks/useAuthIndividual";

// Datos específicos de Yerko
import { YERKO_SERVICES, YERKO_CONTACT, YERKO_SCHEDULE } from "../data/yerkoServices";

// Sistema de diseño unificado
import { DESIGN_TOKENS, getButtonClass, getCardClass } from "../styles/designSystem";

// ===================================================================
// LAZY LOADING - COMPONENTES PESADOS DEL ADMIN
// ===================================================================
const AgendaDisponibilidad = lazy(() => import("./admin/AgendaDisponibilidad").then(module => ({ default: module.AgendaDisponibilidad })));
const ConfiguracionYerko = lazy(() => import("./admin/ConfiguracionYerko").then(module => ({ default: module.ConfiguracionYerko })));
const GestionServiciosYerko = lazy(() => import("./admin/GestionServiciosYerko").then(module => ({ default: module.GestionServiciosYerko })));
const GestionReservasYerko = lazy(() => import("./admin/GestionReservasYerko").then(module => ({ default: module.GestionReservasYerko })));

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
  | "servicios" 
  | "agenda" 
  | "configuracion";

// ===================================================================
// COMPONENTE DE CARGA
// ===================================================================
const AdminLoadingFallback = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================
const AdminPanelYerko: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Hooks
  const { servicios } = useServicios();
  const { reservas } = useReservasMVP();
  const { usuarios } = useUsuarios();
  const { signOut, user } = useAuthIndividual();

  // ✅ CÁLCULO DE ESTADÍSTICAS EN TIEMPO REAL
  const stats: Stats = React.useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const reservasHoy = reservas.filter(r => r.fecha === hoy);
    const reservasSemana = reservas.filter(r => new Date(r.fecha) >= inicioSemana);
    const reservasMes = reservas.filter(r => new Date(r.fecha) >= inicioMes);

    const calcularIngresos = (reservasList: any[]) => {
      return reservasList
        .filter(r => r.estado === 'completada')
        .reduce((total, reserva) => {
          const servicio = YERKO_SERVICES.find(s => s.id === reserva.servicioId);
          return total + (servicio?.price || 0);
        }, 0);
    };

    return {
      reservasHoy: reservasHoy.length,
      reservasSemana: reservasSemana.length,
      reservasMes: reservasMes.length,
      ingresosHoy: calcularIngresos(reservasHoy),
      ingresosSemana: calcularIngresos(reservasSemana),
      ingresosMes: calcularIngresos(reservasMes),
      totalClientes: usuarios.length,
      tasaAsistencia: reservas.length > 0 
        ? (reservas.filter(r => r.estado === 'completada').length / reservas.length) * 100 
        : 0
    };
  }, [reservas, usuarios]);

  // ✅ CONFIGURACIÓN DE PESTAÑAS (SIN BARBEROS)
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "reservas", label: "Reservas", icon: Calendar },
    { id: "servicios", label: "Servicios", icon: Scissors },
    { id: "agenda", label: "Agenda", icon: Clock },
    { id: "configuracion", label: "Configuración", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{YERKO_CONTACT.businessName}</h1>
              <div className="flex items-center space-x-2 text-sm text-purple-300">
                <Instagram className="w-4 h-4" />
                <span>{YERKO_CONTACT.instagram}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-300">Sistema Activo</span>
            </div>

            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-white">Yerko</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-purple-300 hover:text-white transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20 px-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
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
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Reservas Hoy</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.reservasHoy}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Ingresos Hoy</p>
                    <p className="text-3xl font-bold text-white mt-2">${stats.ingresosHoy.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Reservas Semana</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.reservasSemana}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">Total Clientes</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.totalClientes}</p>
                  </div>
                  <User className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Resumen Semanal */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4">Resumen de la Semana</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Ingresos Semanales</p>
                  <p className="text-2xl font-bold text-green-400">${stats.ingresosSemana.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Tasa de Asistencia</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.tasaAsistencia.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Servicios Más Populares</p>
                  <p className="text-lg font-bold text-purple-400">Corte + Barba</p>
                </div>
              </div>
            </div>

            {/* Horarios de Trabajo */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4">Horarios de Trabajo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Horario General</p>
                  <p className="text-white font-medium">{YERKO_SCHEDULE.workingHours.start} - {YERKO_SCHEDULE.workingHours.end}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Almuerzo</p>
                  <p className="text-white font-medium">{YERKO_SCHEDULE.workingHours.lunchStart} - {YERKO_SCHEDULE.workingHours.lunchEnd}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lazy Loaded Components */}
        {activeTab === "reservas" && (
          <Suspense fallback={<AdminLoadingFallback message="Cargando gestión de reservas..." />}>
            <GestionReservasYerko />
          </Suspense>
        )}
        
        {activeTab === "servicios" && (
          <Suspense fallback={<AdminLoadingFallback message="Cargando gestión de servicios..." />}>
            <GestionServiciosYerko />
          </Suspense>
        )}
        
        {activeTab === "agenda" && (
          <Suspense fallback={<AdminLoadingFallback message="Cargando agenda y disponibilidad..." />}>
            <AgendaDisponibilidad />
          </Suspense>
        )}
        
        {activeTab === "configuracion" && (
          <Suspense fallback={<AdminLoadingFallback message="Cargando configuración..." />}>
            <ConfiguracionYerko />
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default AdminPanelYerko;