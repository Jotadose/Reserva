import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useReservasMVP } from '../../hooks/useReservasMVP';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useServicios } from '../../hooks/useServicios';
import { calculateBookingStats } from './utils';
import { AdminViewMode } from './config';

// Definición del contexto
interface AdminContextType {
  // Estado
  currentView: AdminViewMode;
  loading: boolean;
  error: string | null;
  stats: any;
  
  // Datos
  reservas: any[];
  usuarios: any[];
  servicios: any[];
  
  // Acciones
  setCurrentView: (view: AdminViewMode) => void;
  handleCancelBooking: (bookingId: string) => Promise<void>;
  handleCompleteBooking: (bookingId: string) => Promise<void>;
  handleCreateBooking: (booking: any) => Promise<void>;
  refreshData: () => Promise<void>;
  exportData: () => void;
}

// Crear el contexto
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Props para el proveedor
interface AdminProviderProps {
  children: ReactNode;
}

// Proveedor del contexto
export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  // Estado local
  const [currentView, setCurrentView] = useState<AdminViewMode>('dashboard');
  const [error, setError] = useState<string | null>(null);
  
  // Hooks para datos
  const { 
    reservas, 
    loading: loadingReservas, 
    error: errorReservas,
    refetch: refetchReservas,
    cancelarReserva,
    completarReserva,
    crearReserva
  } = useReservasMVP();
  
  const { 
    usuarios, 
    loading: loadingUsuarios, 
    error: errorUsuarios,
    refetch: refetchUsuarios 
  } = useUsuarios();
  
  const { 
    servicios, 
    loading: loadingServicios, 
    error: errorServicios,
    refetch: refetchServicios 
  } = useServicios();
  
  // Estado combinado
  const loading = loadingReservas || loadingUsuarios || loadingServicios;
  
  // Calcular estadísticas
  const stats = calculateBookingStats(reservas || []);
  
  // Manejar errores
  useEffect(() => {
    const errors = [errorReservas, errorUsuarios, errorServicios].filter(Boolean);
    if (errors.length > 0) {
      setError(errors.join(', '));
    } else {
      setError(null);
    }
  }, [errorReservas, errorUsuarios, errorServicios]);
  
  // Acciones
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelarReserva(bookingId);
      await refetchReservas();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      setError('Error al cancelar la reserva');
    }
  };
  
  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await completarReserva(bookingId);
      await refetchReservas();
    } catch (error) {
      console.error('Error al completar reserva:', error);
      setError('Error al completar la reserva');
    }
  };
  
  const handleCreateBooking = async (booking: any) => {
    try {
      await crearReserva(booking);
      await refetchReservas();
    } catch (error) {
      console.error('Error al crear reserva:', error);
      setError('Error al crear la reserva');
    }
  };
  
  const refreshData = async () => {
    try {
      await Promise.all([
        refetchReservas(),
        refetchUsuarios(),
        refetchServicios()
      ]);
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      setError('Error al actualizar los datos');
    }
  };
  
  const exportData = () => {
    const csv = reservas
      .map((r) => {
        // Buscar cliente por ID
        const cliente = usuarios.find(u => u.id_usuario === r.id_cliente);
        const servicio = servicios.find(s => s.id_servicio === r.id_servicio);
        
        return `${r.fecha_reserva},${r.hora_inicio},${cliente?.nombre || 'N/A'},${servicio?.nombre || 'N/A'},${r.estado}`;
      })
      .join('\n');

    const blob = new Blob([`Fecha,Hora,Cliente,Servicio,Estado\n${csv}`], {
      type: 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Valor del contexto
  const value = {
    currentView,
    loading,
    error,
    stats,
    reservas: reservas || [],
    usuarios: usuarios || [],
    servicios: servicios || [],
    setCurrentView,
    handleCancelBooking,
    handleCompleteBooking,
    handleCreateBooking,
    refreshData,
    exportData
  };
  
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin debe ser usado dentro de un AdminProvider');
  }
  return context;
};