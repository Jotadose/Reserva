import React, { useState } from 'react';
import { Search, Calendar, Filter, X, DollarSign, Tag, RotateCcw } from 'lucide-react';
import { useBookingFilters } from '../hooks/useBookingFilters';

interface AdvancedFiltersProps {
  filters: ReturnType<typeof useBookingFilters>['filters'];
  onSearchChange: (query: string) => void;
  onDateRangeChange: (range: { start: string; end: string } | null) => void;
  onServiceFilterChange: (services: string[]) => void;
  onPriceRangeChange: (range: { min: number; max: number } | null) => void;
  onClearFilters: () => void;
  availableServices: string[];
  totalResults: number;
  filteredResults: number;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onSearchChange,
  onDateRangeChange,
  onServiceFilterChange,
  onPriceRangeChange,
  onClearFilters,
  availableServices,
  totalResults,
  filteredResults,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceMin, setPriceMin] = useState(filters.priceRange?.min.toString() || '');
  const [priceMax, setPriceMax] = useState(filters.priceRange?.max.toString() || '');

  const handlePriceRangeSubmit = () => {
    const min = parseInt(priceMin) || 0;
    const max = parseInt(priceMax) || 999999;
    
    if (min <= max) {
      onPriceRangeChange({ min, max });
    }
  };

  const handleServiceToggle = (service: string) => {
    const current = filters.services;
    const updated = current.includes(service)
      ? current.filter(s => s !== service)
      : [...current, service];
    
    onServiceFilterChange(updated);
  };

  const hasActiveFilters = 
    filters.searchQuery ||
    filters.dateRange ||
    filters.services.length > 0 ||
    filters.priceRange;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-white">Filtros de Búsqueda</h3>
          <div className="text-sm text-gray-400">
            Mostrando {filteredResults} de {totalResults} reservas
            {filteredResults !== totalResults && (
              <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                Filtrado
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros Avanzados</span>
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Basic Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o email..."
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

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-700">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => {
                  const start = e.target.value;
                  const end = filters.dateRange?.end || start;
                  onDateRangeChange(start ? { start, end } : null);
                }}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => {
                  const end = e.target.value;
                  const start = filters.dateRange?.start || end;
                  onDateRangeChange(end ? { start, end } : null);
                }}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Services Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Servicios
            </label>
            <div className="flex flex-wrap gap-2">
              {availableServices.map(service => (
                <button
                  key={service}
                  onClick={() => handleServiceToggle(service)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.services.includes(service)
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {service}
                  {filters.services.includes(service) && (
                    <X className="inline h-3 w-3 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Rango de Precios
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Máx"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handlePriceRangeSubmit}
              className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-medium rounded-lg transition-colors"
            >
              Aplicar Filtro de Precio
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
          <span className="text-sm text-gray-400">Filtros activos:</span>
          
          {filters.searchQuery && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center">
              Búsqueda: "{filters.searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-2 hover:text-blue-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.dateRange && (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center">
              Fechas: {filters.dateRange.start} - {filters.dateRange.end}
              <button
                onClick={() => onDateRangeChange(null)}
                className="ml-2 hover:text-green-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.services.map(service => (
            <span
              key={service}
              className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center"
            >
              {service}
              <button
                onClick={() => handleServiceToggle(service)}
                className="ml-2 hover:text-purple-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          
          {filters.priceRange && (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm flex items-center">
              Precio: ${filters.priceRange.min} - ${filters.priceRange.max}
              <button
                onClick={() => onPriceRangeChange(null)}
                className="ml-2 hover:text-yellow-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
