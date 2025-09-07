import React, { useState } from 'react';
import { AdminPanelModern } from './AdminPanelModern';
import AdminPanelProfessional from './AdminPanelProfessional';
import { AdminPanelSimpleUpdated } from './AdminPanelSimpleUpdated';
import { AdminPanelEnhanced } from './AdminPanelEnhanced';
import { AdminPanelAdvanced } from './AdminPanelAdvanced';
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";
import { useServicios } from "../hooks/useServicios";

interface AdminTabsNavigationProps {}

type AdminPanelType = 'modern' | 'professional' | 'simple' | 'enhanced' | 'advanced';

export const AdminTabsNavigation: React.FC<AdminTabsNavigationProps> = () => {
  const [activeTab, setActiveTab] = useState<AdminPanelType>('modern');
  
  // Hooks para proporcionar datos reales a los componentes
  const { reservas, cancelarReserva, completarReserva, crearReserva } = useReservasMVP();
  const { usuarios } = useUsuarios();
  const { servicios } = useServicios();
  
  // Datos para AdminPanelEnhanced que requiere props
  const handleCancelBooking = async (bookingId: string) => {
    console.log('Cancelando reserva:', bookingId);
    await cancelarReserva(bookingId);
  };
  
  const handleCreateBooking = async (booking: any) => {
    console.log('Creando reserva:', booking);
    await crearReserva(booking);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Encabezado */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-gray-400">Sistema de navegación por pestañas</p>
        </div>
      </header>

      {/* Navegación por pestañas */}
      <div className="bg-gray-800 text-white border-b border-gray-700">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('modern')}
              className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'modern' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-white'}`}
            >
              Admin Modern
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'professional' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-white'}`}
            >
              Admin Professional
            </button>
            <button
              onClick={() => setActiveTab('simple')}
              className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'simple' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-white'}`}
            >
              Admin Simple
            </button>
            <button
              onClick={() => setActiveTab('enhanced')}
              className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'enhanced' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-white'}`}
            >
              Admin Enhanced
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'advanced' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-white'}`}
            >
              Admin Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del panel */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'modern' && <AdminPanelModern />}
        {activeTab === 'professional' && <AdminPanelProfessional />}
        {activeTab === 'simple' && <AdminPanelSimpleUpdated />}
        {activeTab === 'enhanced' && (
          <AdminPanelEnhanced 
            bookings={reservas || []} 
            onCancelBooking={handleCancelBooking}
            onCreateBooking={handleCreateBooking}
          />
        )}
        {activeTab === 'advanced' && <AdminPanelAdvanced />}
      </div>

      {/* Pie de página */}
      <footer className="bg-gray-800 text-gray-400 p-4 text-center text-sm">
        <p>© 2025 Michael The Barber Studios. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default AdminTabsNavigation;