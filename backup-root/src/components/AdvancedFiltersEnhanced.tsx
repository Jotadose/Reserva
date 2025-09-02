import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  X, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  Users,
  Clock
} from 'lucide-react';
import { Booking, BookingFilters } from '../types/booking';

interface AdvancedFiltersEnhancedProps {
  filters: BookingFilters;
  onSearchChange: (query: string) => void;
  onDateRangeChange: (range: BookingFilters['dateRange']) => void;
  onStatusFilterChange: (status: Booking['status'][]) => void;
  onServiceFilterChange: (services: string[]) => void;
  onPriceRangeChange: (range: BookingFilters['priceRange']) => void;
  onClearFilters: () => void;
  availableServices: string[];
  totalResults: number;
  filteredResults: number;
  hasActiveFilters?: boolean;
}

const BOOKING_STATUSES: { value: Booking['status']; label: string; color: string }[] = [
  { value: 'pending', label: 'Pendiente', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmada', color: 'bg-blue-500' },
  { value: 'in-progress', label: 'En Proceso', color: 'bg-purple-500' },
  { value: 'completed', label: 'Completada', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelada', color: 'bg-red-500' },
  { value: 'no-show', label: 'No Se Presentó', color: 'bg-gray-500' },
  { value: 'rescheduled', label: 'Reagendada', color: 'bg-orange-500' },
];

export const AdvancedFiltersEnhanced: React.FC<AdvancedFiltersEnhancedProps> = ({
  filters,
  onSearchChange,
  onDateRangeChange,
  onStatusFilterChange,
  onServiceFilterChange,
  onPriceRangeChange,
  onClearFilters,
  availableServices,
  totalResults,
  filteredResults,
  hasActiveFilters = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState({
    min: filters.priceRange?.min || 0,
    max: filters.priceRange?.max || 100000,
  });

  const handleStatusToggle = (status: Booking['status']) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    onStatusFilterChange(newStatuses);
  };

  const handleServiceToggle = (service: string) => {
    const currentServices = filters.services || [];
    const newServices = currentServices.includes(service)
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service];
    onServiceFilterChange(newServices);
  };

  const handlePriceRangeChange = () => {
    onPriceRangeChange({
      min: localPriceRange.min,
      max: localPriceRange.max,
    });
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    const currentRange = filters.dateRange || { start: '', end: '' };
    const newRange = {
      ...currentRange,
      [type]: value,
    };
    
    if (newRange.start && newRange.end) {
      onDateRangeChange(newRange);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.dateRange) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.services && filters.services.length > 0) count++;
    if (filters.priceRange) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
      {/* Header con estadísticas */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
              {activeFilterCount > 0 && (
                <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Total: {totalResults}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Search className="h-4 w-4" />
                <span>Filtrados: {filteredResults}</span>
              </div>
              {filteredResults !== totalResults && (
                <div className="text-yellow-400 font-medium">
                  ({((filteredResults / totalResults) * 100).toFixed(1)}%)
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Limpiar</span>
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors text-sm font-medium"
            >
              <span>{isExpanded ? 'Contraer' : 'Expandir'}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Búsqueda principal - siempre visible */}
      <div className="p-6 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, email o servicio..."
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros avanzados - colapsables */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Filtros de fecha */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Rango de Fechas</label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Desde</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Filtros de estado */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Estados</label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {BOOKING_STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusToggle(status.value)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
                    filters.status?.includes(status.value)
                      ? 'bg-yellow-500 border-yellow-500 text-black font-medium'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${status.color}`} />
                  <span>{status.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtros de servicios */}
          {availableServices.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Users className="h-4 w-4 text-gray-400" />
                <label className="text-sm font-medium text-gray-300">Servicios</label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableServices.map((service) => (
                  <button
                    key={service}
                    onClick={() => handleServiceToggle(service)}
                    className={`px-3 py-2 rounded-lg border transition-colors text-sm ${
                      filters.services?.includes(service)
                        ? 'bg-yellow-500 border-yellow-500 text-black font-medium'
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtro de rango de precios */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-300">Rango de Precios</label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={localPriceRange.min}
                  onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Máximo</label>
                <input
                  type="number"
                  min="0"
                  value={localPriceRange.max}
                  onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 100000 }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="100000"
                />
              </div>
              <button
                onClick={handlePriceRangeChange}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-medium rounded-lg transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags de filtros activos */}
      {hasActiveFilters && (
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {filters.searchQuery && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-full text-sm">
                <Search className="h-3 w-3" />
                <span>"{filters.searchQuery}"</span>
                <button
                  onClick={() => onSearchChange('')}
                  className="hover:text-blue-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.dateRange && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-500/20 border border-green-500 text-green-300 rounded-full text-sm">
                <Calendar className="h-3 w-3" />
                <span>{filters.dateRange.start} - {filters.dateRange.end}</span>
                <button
                  onClick={() => onDateRangeChange(null)}
                  className="hover:text-green-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.status?.map((status) => (
              <span
                key={status}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-full text-sm"
              >
                <Clock className="h-3 w-3" />
                <span>{BOOKING_STATUSES.find(s => s.value === status)?.label}</span>
                <button
                  onClick={() => handleStatusToggle(status)}
                  className="hover:text-purple-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {filters.services?.map((service) => (
              <span
                key={service}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-full text-sm"
              >
                <Users className="h-3 w-3" />
                <span>{service}</span>
                <button
                  onClick={() => handleServiceToggle(service)}
                  className="hover:text-yellow-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {filters.priceRange && (
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-full text-sm">
                <DollarSign className="h-3 w-3" />
                <span>${filters.priceRange.min} - ${filters.priceRange.max}</span>
                <button
                  onClick={() => onPriceRangeChange(null)}
                  className="hover:text-emerald-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
