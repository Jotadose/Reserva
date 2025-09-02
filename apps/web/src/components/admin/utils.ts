// Utilidades para el módulo de administración

import { bookingStatuses } from './config';

/**
 * Obtiene el color asociado a un estado de reserva
 * @param status Estado de la reserva
 * @returns Color asociado al estado
 */
export const getStatusColor = (status: string): string => {
  const statusConfig = bookingStatuses.find(s => s.value === status);
  return statusConfig?.color || 'gray';
};

/**
 * Formatea una fecha en formato legible
 * @param dateString Fecha en formato ISO
 * @returns Fecha formateada
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

/**
 * Formatea un precio en formato de moneda
 * @param price Precio a formatear
 * @returns Precio formateado
 */
export const formatCurrency = (price: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(price);
};

/**
 * Calcula estadísticas básicas de reservas
 * @param reservas Lista de reservas
 * @returns Objeto con estadísticas
 */
export const calculateBookingStats = (reservas: any[]) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const reservasHoy = reservas.filter(r => r.fecha_reserva === today);
  const reservasMes = reservas.filter(r => {
    const fechaReserva = new Date(r.fecha_reserva);
    return fechaReserva >= startMonth && fechaReserva <= endMonth;
  });
  
  const ingresosMes = reservasMes
    .filter(r => r.estado === 'completada')
    .reduce((sum, r) => sum + (r.precio_total || 0), 0);
  
  const reservasCompletadas = reservas.filter(r => r.estado === 'completada');
  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente');
  const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada');
  const reservasCanceladas = reservas.filter(r => r.estado === 'cancelada');
  
  return {
    totalReservas: reservas.length,
    reservasHoy: reservasHoy.length,
    ingresosMes,
    reservasCompletadas: reservasCompletadas.length,
    reservasPendientes: reservasPendientes.length,
    reservasConfirmadas: reservasConfirmadas.length,
    reservasCanceladas: reservasCanceladas.length,
  };
};

/**
 * Exporta datos de reservas a CSV
 * @param reservas Lista de reservas
 * @param usuarios Lista de usuarios
 * @param servicios Lista de servicios
 */
export const exportToCSV = (reservas: any[], usuarios: any[], servicios: any[]): void => {
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