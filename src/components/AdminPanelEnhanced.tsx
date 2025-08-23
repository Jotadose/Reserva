import React, { useState, useMemo } from 'react';
import { BarChart3, Download, Users, TrendingUp } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { Booking } from '../types/booking';
import { useBookingFilters } from '../hooks/useBookingFilters';
import { useBookingActions } from '../hooks/useBookingActions';
import { AdvancedFilters } from './AdvancedFilters';
import { BookingsTable } from './BookingsTable';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface AdminPanelEnhancedProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => Promise<void>;
}

type ViewMode = 'overview' | 'bookings' | 'analytics';

export const AdminPanelEnhanced: React.FC<AdminPanelEnhancedProps> = ({
  bookings,
  onCancelBooking,
}) => {
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  // Use custom hooks
  const bookingFilters = useBookingFilters(bookings);
  const { exportBookings, bulkCancelBookings, loading } = useBookingActions();

  // Get available services for filters
  const availableServices = useMemo(() => {
    const services = new Set<string>();
    bookings.forEach(booking => {
      booking.services?.forEach(service => {
        services.add(service.name);
      });
    });
    return Array.from(services);
  }, [bookings]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      total: bookings.length,
      today: bookings.filter(b => b.date === today).length,
      thisWeek: bookings.filter(b => b.date >= thisWeek).length,
      thisMonth: bookings.filter(b => b.date >= thisMonth).length,
      revenue: bookings.reduce((sum, b) => sum + (b.services?.reduce((s, svc) => s + svc.price, 0) || 0), 0),
      filtered: bookingFilters.filteredBookings.length,
    };
  }, [bookings, bookingFilters.filteredBookings]);

  const handleBulkAction = async (action: 'cancel' | 'export') => {
    if (action === 'cancel') {
      if (selectedBookings.length === 0) {
        addToast({
          type: 'warning',
          title: 'Ninguna reserva seleccionada',
          message: 'Selecciona al menos una reserva para cancelar',
        });
        return;
      }

      if (confirm(`¿Estás seguro de cancelar ${selectedBookings.length} reserva(s)?`)) {
        await bulkCancelBookings(selectedBookings);
        setSelectedBookings([]);
      }
    } else if (action === 'export') {
      const dataToExport = selectedBookings.length > 0 
        ? bookingFilters.filteredBookings.filter(b => selectedBookings.includes(b.id))
        : bookingFilters.filteredBookings;
      
      exportBookings(dataToExport, 'csv');
    }
  };

  const ViewSelector = () => (
    <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setViewMode('overview')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'overview' 
            ? 'bg-yellow-500 text-black' 
            : 'text-gray-300 hover:text-white'
        }`}
      >
        Resumen
      </button>
      <button
        onClick={() => setViewMode('bookings')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'bookings' 
            ? 'bg-yellow-500 text-black' 
            : 'text-gray-300 hover:text-white'
        }`}
      >
        Reservas
      </button>
      <button
        onClick={() => setViewMode('analytics')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'analytics' 
            ? 'bg-yellow-500 text-black' 
            : 'text-gray-300 hover:text-white'
        }`}
      >
        Analíticas
      </button>
    </div>
  );

  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-400 text-sm font-medium">Total Reservas</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <BarChart3 className="h-8 w-8 text-blue-400" />
        </div>
      </div>

      <div className="bg-green-900/20 border border-green-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-400 text-sm font-medium">Hoy</p>
            <p className="text-2xl font-bold text-white">{stats.today}</p>
          </div>
          <Users className="h-8 w-8 text-green-400" />
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-400 text-sm font-medium">Esta Semana</p>
            <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-yellow-400" />
        </div>
      </div>

      <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-400 text-sm font-medium">Este Mes</p>
            <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
          </div>
          <Users className="h-8 w-8 text-purple-400" />
        </div>
      </div>

      <div className="bg-emerald-900/20 border border-emerald-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-400 text-sm font-medium">Ingresos</p>
            <p className="text-2xl font-bold text-white">${stats.revenue.toLocaleString()}</p>
          </div>
          <BarChart3 className="h-8 w-8 text-emerald-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Panel de Administración</h2>
            <p className="text-gray-400">Gestiona las reservas y analiza el rendimiento</p>
          </div>
          <ViewSelector />
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          <AdvancedFilters
            filters={bookingFilters.filters}
            onSearchChange={bookingFilters.setSearchQuery}
            onDateRangeChange={bookingFilters.setDateRange}
            onServiceFilterChange={bookingFilters.setServiceFilter}
            onPriceRangeChange={bookingFilters.setPriceRange}
            onClearFilters={bookingFilters.clearFilters}
            availableServices={availableServices}
            totalResults={stats.total}
            filteredResults={stats.filtered}
          />
          
          {/* Quick Actions */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleBulkAction('export')}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Exportar Datos</span>
              </button>
              
              {selectedBookings.length > 0 && (
                <button
                  onClick={() => handleBulkAction('cancel')}
                  disabled={loading['bulk-cancel']}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
                >
                  <span>Cancelar Seleccionadas ({selectedBookings.length})</span>
                </button>
              )}
            </div>
          </div>

          <BookingsTable
            bookings={bookingFilters.filteredBookings}
            onBookingChange={async () => {
              // This would typically refresh data from parent
              // For now, we just clear selections
              setSelectedBookings([]);
            }}
            selectedBookings={selectedBookings}
            onSelectionChange={setSelectedBookings}
          />
        </div>
      )}

      {viewMode === 'bookings' && (
        <div className="space-y-6">
          <AdvancedFilters
            filters={bookingFilters.filters}
            onSearchChange={bookingFilters.setSearchQuery}
            onDateRangeChange={bookingFilters.setDateRange}
            onServiceFilterChange={bookingFilters.setServiceFilter}
            onPriceRangeChange={bookingFilters.setPriceRange}
            onClearFilters={bookingFilters.clearFilters}
            availableServices={availableServices}
            totalResults={stats.total}
            filteredResults={stats.filtered}
          />
          
          <BookingsTable
            bookings={bookingFilters.filteredBookings}
            onBookingChange={async () => {
              setSelectedBookings([]);
            }}
            selectedBookings={selectedBookings}
            onSelectionChange={setSelectedBookings}
          />
        </div>
      )}

      {viewMode === 'analytics' && (
        <AnalyticsDashboard bookings={bookings} />
      )}
    </div>
  );
};
