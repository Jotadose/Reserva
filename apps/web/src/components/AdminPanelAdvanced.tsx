import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Settings,
  BarChart3,
  Download,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  UserPlus,
  Scissors,
  DollarSign,
  Home,
  Bell,
  Shield,
  Database,
  Activity,
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";
import { useServicios } from "../hooks/useServicios";

interface AdminPanelAdvancedProps {}

type ViewMode = 
  | "overview" 
  | "reservas" 
  | "barberos" 
  | "servicios" 
  | "clientes" 
  | "agenda" 
  | "reportes" 
  | "configuracion";

type FilterOptions = {
  fecha?: string;
  estado?: string;
  barbero?: string;
  cliente?: string;
  servicio?: string;
};

export const AdminPanelAdvanced: React.FC<AdminPanelAdvancedProps> = () => {
  const { addToast } = useToast();
  const [currentView, setCurrentView] = useState<ViewMode>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // 🔧 HOOKS MVP PARA DATOS REALES
  const { reservas, loading: loadingReservas, refetch, actualizarReserva, crearReserva } = useReservasMVP();
  const { usuarios, loading: loadingUsuarios } = useUsuarios();
  const { servicios, loading: loadingServicios, formatearPrecio } = useServicios();

  const loading = loadingReservas || loadingUsuarios || loadingServicios;

  // 🔧 CALCULAR ESTADÍSTICAS AVANZADAS
  const stats = {
    // Reservas
    totalReservas: reservas.length,
    reservasHoy: reservas.filter((r) => {
      const today = new Date().toISOString().split("T")[0];
      return r.fecha_reserva === today;
    }).length,
    reservasSemana: reservas.filter((r) => {
      const now = new Date();
      const startWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      const fechaReserva = new Date(r.fecha_reserva);
      return fechaReserva >= startWeek && fechaReserva <= endWeek;
    }).length,
    reservasMes: reservas.filter((r) => {
      const now = new Date();
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const fechaReserva = new Date(r.fecha_reserva);
      return fechaReserva >= startMonth && fechaReserva <= endMonth;
    }).length,
    
    // Estados
    reservasConfirmadas: reservas.filter((r) => r.estado === "confirmada").length,
    reservasCompletadas: reservas.filter((r) => r.estado === "completada").length,
    reservasCanceladas: reservas.filter((r) => r.estado === "cancelada").length,
    reservasPendientes: reservas.filter((r) => r.estado === "pendiente").length,
    
    // Ingresos
    ingresosHoy: reservas
      .filter(r => {
        const today = new Date().toISOString().split("T")[0];
        return r.fecha_reserva === today && r.estado === "completada";
      })
      .reduce((sum, r) => sum + (r.precio_total || 0), 0),
    ingresosSemana: reservas
      .filter(r => {
        const now = new Date();
        const startWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        const fechaReserva = new Date(r.fecha_reserva);
        return fechaReserva >= startWeek && fechaReserva <= endWeek && r.estado === "completada";
      })
      .reduce((sum, r) => sum + (r.precio_total || 0), 0),
    ingresosMes: reservas
      .filter(r => {
        const now = new Date();
        const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const fechaReserva = new Date(r.fecha_reserva);
        return fechaReserva >= startMonth && fechaReserva <= endMonth && r.estado === "completada";
      })
      .reduce((sum, r) => sum + (r.precio_total || 0), 0),
    
    // Clientes
    totalClientes: usuarios.length,
    clientesRecurrentes: usuarios.filter(u => 
      reservas.filter(r => r.id_cliente === u.id_usuario).length > 1
    ).length,
    
    // Servicios más populares
    servicioMasPopular: (() => {
      const serviciosCount = reservas.reduce((acc, r) => {
        acc[r.id_servicio] = (acc[r.id_servicio] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const maxCount = Math.max(...Object.values(serviciosCount));
      const servicioId = Object.keys(serviciosCount).find(id => serviciosCount[id] === maxCount);
      return servicios.find(s => s.id_servicio === servicioId)?.nombre || "N/A";
    })(),
    
    // Tasa de asistencia
    tasaAsistencia: reservas.length > 0 
      ? Math.round((reservas.filter(r => r.estado === "completada").length / reservas.length) * 100)
      : 0,
  };

  // 🔧 FILTROS Y BÚSQUEDA
  const filteredReservas = reservas.filter(reserva => {
    const cliente = usuarios.find(u => u.id_usuario === reserva.id_cliente);
    const servicio = servicios.find(s => s.id_servicio === reserva.id_servicio);
    
    // Búsqueda por texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesClient = cliente?.nombre?.toLowerCase().includes(searchLower) ||
                           cliente?.email?.toLowerCase().includes(searchLower) ||
                           cliente?.telefono?.includes(searchTerm);
      const matchesService = servicio?.nombre?.toLowerCase().includes(searchLower);
      const matchesId = reserva.id_reserva.toLowerCase().includes(searchLower);
      
      if (!matchesClient && !matchesService && !matchesId) {
        return false;
      }
    }
    
    // Filtros específicos
    if (filters.fecha && reserva.fecha_reserva !== filters.fecha) return false;
    if (filters.estado && reserva.estado !== filters.estado) return false;
    if (filters.servicio && reserva.id_servicio !== filters.servicio) return false;
    
    return true;
  });

  // 🔧 HANDLERS PARA ACCIONES
  const handleEstadoChange = async (reservaId: string, nuevoEstado: string) => {
    try {
      await actualizarReserva(reservaId, { estado: nuevoEstado });
      addToast(`Reserva ${nuevoEstado} exitosamente`, "success");
      await refetch();
    } catch (error) {
      console.error("Error actualizando estado:", error);
      addToast("Error al actualizar la reserva", "error");
    }
  };

  const exportToCSV = () => {
    const csvData = filteredReservas.map(r => {
      const cliente = usuarios.find(u => u.id_usuario === r.id_cliente);
      const servicio = servicios.find(s => s.id_servicio === r.id_servicio);
      
      return [
        r.id_reserva,
        r.fecha_reserva,
        r.hora_inicio,
        cliente?.nombre || 'N/A',
        cliente?.email || 'N/A',
        cliente?.telefono || 'N/A',
        servicio?.nombre || 'N/A',
        r.precio_total || 0,
        r.estado,
        r.notas || '',
        r.created_at
      ].join(',');
    });

    const headers = [
      'ID Reserva',
      'Fecha',
      'Hora',
      'Cliente',
      'Email',
      'Teléfono',
      'Servicio',
      'Precio Total',
      'Estado',
      'Notas',
      'Fecha Creación'
    ].join(',');

    const csv = [headers, ...csvData].join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    addToast("Datos exportados exitosamente", "success");
  };

  // 🔧 COMPONENTE DE NAVEGACIÓN SIDEBAR
  const Sidebar = () => (
    <div className="w-64 bg-slate-800 border-r border-slate-700 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white mb-8">Admin Panel Pro</h1>
        
        <nav className="space-y-2">
          <SidebarItem 
            icon={<Home className="h-5 w-5" />}
            label="Resumen General"
            isActive={currentView === "overview"}
            onClick={() => setCurrentView("overview")}
          />
          <SidebarItem 
            icon={<Calendar className="h-5 w-5" />}
            label="Gestión de Reservas"
            isActive={currentView === "reservas"}
            onClick={() => setCurrentView("reservas")}
          />
          <SidebarItem 
            icon={<Users className="h-5 w-5" />}
            label="Gestión de Barberos"
            isActive={currentView === "barberos"}
            onClick={() => setCurrentView("barberos")}
          />
          <SidebarItem 
            icon={<Scissors className="h-5 w-5" />}
            label="Gestión de Servicios"
            isActive={currentView === "servicios"}
            onClick={() => setCurrentView("servicios")}
          />
          <SidebarItem 
            icon={<UserPlus className="h-5 w-5" />}
            label="Gestión de Clientes"
            isActive={currentView === "clientes"}
            onClick={() => setCurrentView("clientes")}
          />
          <SidebarItem 
            icon={<Clock className="h-5 w-5" />}
            label="Agenda y Disponibilidad"
            isActive={currentView === "agenda"}
            onClick={() => setCurrentView("agenda")}
          />
          <SidebarItem 
            icon={<BarChart3 className="h-5 w-5" />}
            label="Reportes y Analítica"
            isActive={currentView === "reportes"}
            onClick={() => setCurrentView("reportes")}
          />
          <SidebarItem 
            icon={<Settings className="h-5 w-5" />}
            label="Configuración"
            isActive={currentView === "configuracion"}
            onClick={() => setCurrentView("configuracion")}
          />
        </nav>
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, isActive, onClick }: {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        isActive 
          ? "bg-blue-600 text-white" 
          : "text-slate-300 hover:bg-slate-700 hover:text-white"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  // 🔧 COMPONENTE PRINCIPAL
  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {currentView === "overview" && "Resumen General"}
                {currentView === "reservas" && "Gestión de Reservas"}
                {currentView === "barberos" && "Gestión de Barberos"}
                {currentView === "servicios" && "Gestión de Servicios"}
                {currentView === "clientes" && "Gestión de Clientes"}
                {currentView === "agenda" && "Agenda y Disponibilidad"}
                {currentView === "reportes" && "Reportes y Analítica"}
                {currentView === "configuracion" && "Configuración del Sistema"}
              </h2>
              <p className="text-slate-400 text-sm">
                {new Date().toLocaleDateString('es-CL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {currentView === "reservas" && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar reservas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Reserva</span>
                  </button>
                </>
              )}
              
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {currentView === "overview" && <OverviewSection stats={stats} reservas={reservas} usuarios={usuarios} servicios={servicios} />}
          {currentView === "reservas" && <ReservasSection reservas={filteredReservas} usuarios={usuarios} servicios={servicios} onEstadoChange={handleEstadoChange} />}
          {currentView === "barberos" && <BarberosSection />}
          {currentView === "servicios" && <ServiciosSection servicios={servicios} />}
          {currentView === "clientes" && <ClientesSection usuarios={usuarios} reservas={reservas} />}
          {currentView === "agenda" && <AgendaSection />}
          {currentView === "reportes" && <ReportesSection stats={stats} />}
          {currentView === "configuracion" && <ConfiguracionSection />}
        </div>
      </div>
    </div>
  );
};

// 🔧 SECCIONES INDIVIDUALES
const OverviewSection = ({ stats, reservas, usuarios, servicios }: any) => (
  <div className="space-y-6">
    {/* Stats Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard 
        icon={<Calendar className="h-6 w-6" />}
        title="Reservas Hoy"
        value={stats.reservasHoy}
        change="+12%"
        changeType="positive"
        color="blue"
      />
      <StatsCard 
        icon={<DollarSign className="h-6 w-6" />}
        title="Ingresos Hoy"
        value={new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
          minimumFractionDigits: 0,
        }).format(stats.ingresosHoy)}
        change="+8%"
        changeType="positive"
        color="green"
      />
      <StatsCard 
        icon={<Users className="h-6 w-6" />}
        title="Total Clientes"
        value={stats.totalClientes}
        change="+3%"
        changeType="positive"
        color="purple"
      />
      <StatsCard 
        icon={<TrendingUp className="h-6 w-6" />}
        title="Tasa Asistencia"
        value={`${stats.tasaAsistencia}%`}
        change="+5%"
        changeType="positive"
        color="orange"
      />
    </div>

    {/* Detailed Analytics Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Reservas por Estado */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Reservas por Estado</h3>
        <div className="space-y-3">
          <EstadoItem label="Confirmadas" count={stats.reservasConfirmadas} color="green" />
          <EstadoItem label="Pendientes" count={stats.reservasPendientes} color="yellow" />
          <EstadoItem label="Completadas" count={stats.reservasCompletadas} color="blue" />
          <EstadoItem label="Canceladas" count={stats.reservasCanceladas} color="red" />
        </div>
      </div>

      {/* Ingresos del Mes */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ingresos del Mes</h3>
        <div className="text-3xl font-bold text-white mb-2">
          {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
          }).format(stats.ingresosMes)}
        </div>
        <div className="text-sm text-slate-400">
          Semana actual: {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
          }).format(stats.ingresosSemana)}
        </div>
      </div>

      {/* Servicio Popular */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Servicio Más Popular</h3>
        <div className="text-xl font-bold text-white mb-2">
          {stats.servicioMasPopular}
        </div>
        <div className="text-sm text-slate-400">
          Cliente recurrente: {stats.clientesRecurrentes} clientes
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
      <div className="space-y-3">
        {reservas.slice(0, 5).map((reserva: any) => {
          const cliente = usuarios.find((u: any) => u.id_usuario === reserva.id_cliente);
          const servicio = servicios.find((s: any) => s.id_servicio === reserva.id_servicio);
          
          return (
            <div key={reserva.id_reserva} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-black font-medium text-sm">
                    {cliente?.nombre?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {cliente?.nombre || 'Cliente no encontrado'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {servicio?.nombre || 'Servicio no encontrado'} • {reserva.fecha_reserva}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    minimumFractionDigits: 0,
                  }).format(reserva.precio_total || 0)}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  reserva.estado === "confirmada" ? "bg-green-500/20 text-green-400" :
                  reserva.estado === "pendiente" ? "bg-yellow-500/20 text-yellow-400" :
                  reserva.estado === "completada" ? "bg-blue-500/20 text-blue-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {reserva.estado}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const StatsCard = ({ icon, title, value, change, changeType, color }: any) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {change && (
          <p className={`text-sm mt-1 ${
            changeType === "positive" ? "text-green-400" : "text-red-400"
          }`}>
            {change} vs mes anterior
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${
        color === "blue" ? "bg-blue-500/20" :
        color === "green" ? "bg-green-500/20" :
        color === "purple" ? "bg-purple-500/20" :
        color === "orange" ? "bg-orange-500/20" :
        "bg-gray-500/20"
      }`}>
        <div className={
          color === "blue" ? "text-blue-400" :
          color === "green" ? "text-green-400" :
          color === "purple" ? "text-purple-400" :
          color === "orange" ? "text-orange-400" :
          "text-gray-400"
        }>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

const EstadoItem = ({ label, count, color }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${
        color === "green" ? "bg-green-400" :
        color === "yellow" ? "bg-yellow-400" :
        color === "blue" ? "bg-blue-400" :
        "bg-red-400"
      }`}></div>
      <span className="text-slate-300">{label}</span>
    </div>
    <span className="text-white font-medium">{count}</span>
  </div>
);

const ReservasSection = ({ reservas, usuarios, servicios, onEstadoChange }: any) => (
  <div className="space-y-6">
    {/* Filtros */}
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        
        <input
          type="date"
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
        />
        
        <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
          <option value="">Todos los servicios</option>
          {servicios.map((servicio: any) => (
            <option key={servicio.id_servicio} value={servicio.id_servicio}>
              {servicio.nombre}
            </option>
          ))}
        </select>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition-colors">
          Aplicar Filtros
        </button>
      </div>
    </div>

    {/* Tabla de Reservas */}
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Fecha & Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {reservas.map((reserva: any) => {
              const cliente = usuarios.find((u: any) => u.id_usuario === reserva.id_cliente);
              const servicio = servicios.find((s: any) => s.id_servicio === reserva.id_servicio);
              
              return (
                <tr key={reserva.id_reserva} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-black font-medium text-sm">
                          {cliente?.nombre?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {cliente?.nombre || 'Cliente no encontrado'}
                        </div>
                        <div className="text-sm text-slate-400">
                          {cliente?.telefono || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{reserva.fecha_reserva}</div>
                    <div className="text-sm text-slate-400">{reserva.hora_inicio}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {servicio?.nombre || 'Servicio no encontrado'}
                    </div>
                    <div className="text-sm text-slate-400">
                      {reserva.duracion_minutos} min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    }).format(reserva.precio_total || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={reserva.estado}
                      onChange={(e) => onEstadoChange(reserva.id_reserva, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-slate-700 border ${
                        reserva.estado === "confirmada" ? "border-green-500/30 text-green-400" :
                        reserva.estado === "completada" ? "border-blue-500/30 text-blue-400" :
                        reserva.estado === "pendiente" ? "border-yellow-500/30 text-yellow-400" :
                        "border-red-500/30 text-red-400"
                      }`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 p-1">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-400 hover:text-green-300 p-1">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="text-orange-400 hover:text-orange-300 p-1">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// 🔧 SECCIONES ADICIONALES (PLACEHOLDER)
const BarberosSection = () => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Gestión de Barberos</h3>
    <p className="text-slate-400">Funcionalidad en desarrollo...</p>
  </div>
);

const ServiciosSection = ({ servicios }: any) => (
  <div className="space-y-6">
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Catálogo de Servicios</h3>
        <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nuevo Servicio</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicios.map((servicio: any) => (
          <div key={servicio.id_servicio} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">{servicio.nombre}</h4>
              <div className="flex space-x-1">
                <button className="text-blue-400 hover:text-blue-300 p-1">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-3">{servicio.descripcion}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-400 font-medium">
                {new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(servicio.precio)}
              </span>
              <span className="text-slate-400">{servicio.duracion} min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ClientesSection = ({ usuarios, reservas }: any) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-white">Base de Clientes</h3>
      <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium transition-colors flex items-center space-x-2">
        <UserPlus className="h-4 w-4" />
        <span>Nuevo Cliente</span>
      </button>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-700/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Cliente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Contacto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Reservas</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Última Visita</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {usuarios.map((usuario: any) => {
            const clienteReservas = reservas.filter((r: any) => r.id_cliente === usuario.id_usuario);
            const ultimaReserva = clienteReservas.sort((a: any, b: any) => 
              new Date(b.fecha_reserva).getTime() - new Date(a.fecha_reserva).getTime()
            )[0];
            
            return (
              <tr key={usuario.id_usuario} className="hover:bg-slate-700/30">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-black font-medium text-sm">
                        {usuario.nombre?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-white">{usuario.nombre}</div>
                      <div className="text-sm text-slate-400">Cliente desde {new Date(usuario.created_at).getFullYear()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-white">{usuario.email}</div>
                  <div className="text-sm text-slate-400">{usuario.telefono}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-white">{clienteReservas.length} reservas</div>
                  <div className="text-sm text-slate-400">
                    {clienteReservas.length > 1 ? "Cliente recurrente" : "Cliente nuevo"}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-white">
                    {ultimaReserva ? ultimaReserva.fecha_reserva : "Nunca"}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 p-1">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-green-400 hover:text-green-300 p-1">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const AgendaSection = () => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-white mb-4">Agenda y Disponibilidad</h3>
    <p className="text-slate-400">Vista de calendario en desarrollo...</p>
  </div>
);

const ReportesSection = ({ stats }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h4 className="font-semibold text-white mb-4">Resumen Financiero</h4>
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
      </div>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h4 className="font-semibold text-white mb-4">Productividad</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Tasa de Asistencia:</span>
            <span className="text-blue-400 font-medium">{stats.tasaAsistencia}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Reservas Completadas:</span>
            <span className="text-blue-400 font-medium">{stats.reservasCompletadas}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Clientes Recurrentes:</span>
            <span className="text-blue-400 font-medium">{stats.clientesRecurrentes}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h4 className="font-semibold text-white mb-4">Análisis de Servicios</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Más Popular:</span>
            <span className="text-purple-400 font-medium">{stats.servicioMasPopular}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Reservas:</span>
            <span className="text-purple-400 font-medium">{stats.totalReservas}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ConfiguracionSection = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Horarios de Operación
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Lunes - Viernes:</span>
            <span className="text-white">09:00 - 18:00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Sábado:</span>
            <span className="text-white">09:00 - 16:00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Domingo:</span>
            <span className="text-red-400">Cerrado</span>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notificaciones
        </h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="mr-3 rounded" defaultChecked />
            <span className="text-slate-300">Email de confirmación</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-3 rounded" defaultChecked />
            <span className="text-slate-300">SMS recordatorio</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-3 rounded" />
            <span className="text-slate-300">WhatsApp notificaciones</span>
          </label>
        </div>
      </div>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Seguridad
        </h4>
        <div className="space-y-3">
          <button className="w-full text-left text-slate-300 hover:text-white transition-colors">
            Cambiar contraseña
          </button>
          <button className="w-full text-left text-slate-300 hover:text-white transition-colors">
            Configurar 2FA
          </button>
          <button className="w-full text-left text-slate-300 hover:text-white transition-colors">
            Historial de accesos
          </button>
        </div>
      </div>
      
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h4 className="font-semibold text-white mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Base de Datos
        </h4>
        <div className="space-y-3">
          <button className="w-full text-left text-slate-300 hover:text-white transition-colors">
            Respaldo automático
          </button>
          <button className="w-full text-left text-slate-300 hover:text-white transition-colors">
            Exportar datos
          </button>
          <button className="w-full text-left text-slate-300 hover:text-white transition-colors">
            Limpiar registros antiguos
          </button>
        </div>
      </div>
    </div>
  </div>
);
