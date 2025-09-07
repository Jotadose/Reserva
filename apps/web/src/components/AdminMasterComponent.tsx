import React from 'react';
// DEPRECATED: AdminPanelModern moved to deprecated/
import { Settings, BarChart3, Users, Calendar, Layout, Grid, Layers } from 'lucide-react';
import { AdminProvider, useAdmin } from './admin/AdminContext';
import { AdminViewMode } from './admin/config';
import { formatCurrency } from './admin/utils';

// Componente interno que utiliza el contexto
const AdminMasterContent: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    stats, 
    reservas, 
    servicios,
    handleCancelBooking,
    handleCreateBooking
  } = useAdmin();
  
  // Navegación para el panel de administración
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Layout,
      description: 'Vista general del sistema'
    },
    {
      id: 'bookings',
      label: 'Reservas',
      icon: Calendar,
      description: 'Gestión de reservas'
    },
    {
      id: 'tabs',
      label: 'Admin Tabs',
      icon: Grid,
      description: 'Sistema de navegación por pestañas'
    },
    {
      id: 'professional',
      label: 'Professional',
      icon: BarChart3,
      description: 'Panel profesional completo'
    },
    {
      id: 'modern',
      label: 'Modern',
      icon: Calendar,
      description: 'Diseño moderno y funcional'
    },
    {
      id: 'simple',
      label: 'Simple',
      icon: Users,
      description: 'Panel simplificado'
    },
    {
      id: 'enhanced',
      label: 'Enhanced',
      icon: Layers,
      description: 'Panel con funciones avanzadas'
    },
    {
      id: 'advanced',
      label: 'Advanced',
      icon: Settings,
      description: 'Panel con todas las funcionalidades'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar de navegación */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Panel Admin</h1>
          <p className="text-gray-400 text-sm">Sistema integrado</p>
        </div>
        
        <nav className="space-y-1">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as AdminViewMode)}
              className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md transition-colors ${currentView === item.id ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="px-3 py-2">
            <h3 className="text-sm font-medium text-gray-400">Estadísticas</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Reservas hoy:</span>
                <span className="text-white font-medium">{stats.reservasHoy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total reservas:</span>
                <span className="text-white font-medium">{stats.totalReservas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ingresos mes:</span>
                <span className="text-white font-medium">{formatCurrency(stats.ingresosMes)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        {currentView === 'dashboard' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Dashboard General</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-300">Total Reservas</h3>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalReservas}</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-300">Reservas Hoy</h3>
                <p className="text-3xl font-bold text-white mt-2">{stats.reservasHoy}</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-300">Ingresos del Mes</h3>
                <p className="text-3xl font-bold text-white mt-2">{formatCurrency(stats.ingresosMes)}</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-300">Total Usuarios</h3>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalUsuarios}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-300 mb-4">Estado de Reservas</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-green-500 h-4 rounded-full" 
                        style={{ width: `${(stats.reservasCompletadas / stats.totalReservas) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-4 text-gray-300 min-w-[80px] text-right">
                      {stats.reservasCompletadas} / {stats.totalReservas}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-yellow-500 h-4 rounded-full" 
                        style={{ width: `${(stats.reservasPendientes / stats.totalReservas) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-4 text-gray-300 min-w-[80px] text-right">
                      {stats.reservasPendientes} / {stats.totalReservas}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-300 mb-4">Servicios Disponibles</h3>
                <div className="space-y-2">
                  {servicios.slice(0, 5).map(servicio => (
                    <div key={servicio.id_servicio} className="flex justify-between items-center">
                      <span className="text-gray-300">{servicio.nombre}</span>
                      <span className="text-white font-medium">{formatCurrency(servicio.precio)}</span>
                    </div>
                  ))}
                  {servicios.length > 5 && (
                    <div className="text-center mt-4">
                      <button 
                        onClick={() => setCurrentView('tabs')} 
                        className="text-yellow-500 hover:text-yellow-400 text-sm"
                      >
                        Ver todos los servicios
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'bookings' && <AdminBookingsView />}
        {currentView === 'tabs' && <AdminTabsNavigation />}
        {currentView === 'professional' && <AdminPanelProfessional />}
        {currentView === 'modern' && <AdminPanelModern />}
        {currentView === 'simple' && <AdminPanelSimpleUpdated />}
        {currentView === 'enhanced' && (
          <AdminPanelEnhanced 
            bookings={reservas || []} 
            onCancelBooking={handleCancelBooking}
            onCreateBooking={handleCreateBooking}
          />
        )}
        {currentView === 'advanced' && <AdminPanelAdvanced />}
      </div>
    </div>
  );
};

// Componente principal que proporciona el contexto
export const AdminMasterComponent: React.FC = () => {
  return (
    <AdminProvider>
      <AdminMasterContent />
    </AdminProvider>
  );
};

export default AdminMasterComponent;