import React, { useState } from "react";
import {
  Search,
  Calendar,
  Filter,
  X,
  DollarSign,
  Tag,
  RotateCcw,
} from "lucide-react";
import { useBookingFilters } from "../hooks/useBookingFilters";

interface AdvancedFiltersProps {
  filters: ReturnType<typeof useBookingFilters>["filters"];
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
  const [priceMin, setPriceMin] = useState(
    filters.priceRange?.min.toString() || ""
  );
  const [priceMax, setPriceMax] = useState(
    filters.priceRange?.max.toString() || ""
  );

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
      ? current.filter((s) => s !== service)
      : [...current, service];

    onServiceFilterChange(updated);
  };

  // 🔧 MEJOR DETECCIÓN: Solo mostrar "Filtrado" si hay filtros activos Y afectan los resultados
  const hasActiveFilters =
    (filters.searchQuery && filters.searchQuery.trim().length > 0) ||
    filters.dateRange ||
    filters.services.length > 0 ||
    filters.priceRange;

  const isActuallyFiltered =
    hasActiveFilters && filteredResults !== totalResults;

  // 🔍 DEBUG: Revisar estado de filtros
  console.log("🎯 AdvancedFilters DEBUG:", {
    hasActiveFilters,
    isActuallyFiltered,
    filteredResults,
    totalResults,
    filters: {
      searchQuery: filters.searchQuery,
      dateRange: filters.dateRange,
      services: filters.services,
      priceRange: filters.priceRange,
    },
  });

  return (
    <div className="space-y-4 rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-white">Filtros de Búsqueda</h3>
          <div className="text-sm text-gray-400">
            Mostrando {filteredResults} de {totalResults} reservas
            {isActuallyFiltered && (
              <span className="ml-2 rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400">
                Filtrado
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros Avanzados</span>
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Basic Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o email..."
          value={filters.searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-800 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 border-t border-gray-700 pt-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                <Calendar className="mr-1 inline h-4 w-4" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.dateRange?.start || ""}
                onChange={(e) => {
                  const start = e.target.value;
                  const end = filters.dateRange?.end || start;
                  onDateRangeChange(start ? { start, end } : null);
                }}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white focus:border-transparent focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                <Calendar className="mr-1 inline h-4 w-4" />
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.dateRange?.end || ""}
                onChange={(e) => {
                  const end = e.target.value;
                  const start = filters.dateRange?.start || end;
                  onDateRangeChange(end ? { start, end } : null);
                }}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white focus:border-transparent focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Services Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              <Tag className="mr-1 inline h-4 w-4" />
              Servicios
            </label>
            <div className="flex flex-wrap gap-2">
              {availableServices.map((service) => (
                <button
                  key={service}
                  onClick={() => handleServiceToggle(service)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    filters.services.includes(service)
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {service}
                  {filters.services.includes(service) && (
                    <X className="ml-1 inline h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              <DollarSign className="mr-1 inline h-4 w-4" />
              Rango de Precios
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="number"
                placeholder="Máx"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <button
              onClick={handlePriceRangeSubmit}
              className="mt-2 rounded-lg bg-yellow-600 px-4 py-2 font-medium text-black transition-colors hover:bg-yellow-700"
            >
              Aplicar Filtro de Precio
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 border-t border-gray-700 pt-4">
          <span className="text-sm text-gray-400">Filtros activos:</span>

          {filters.searchQuery && (
            <span className="flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400">
              Búsqueda: "{filters.searchQuery}"
              <button
                onClick={() => onSearchChange("")}
                className="ml-2 hover:text-blue-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.dateRange && (
            <span className="flex items-center rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
              Fechas: {filters.dateRange.start} - {filters.dateRange.end}
              <button
                onClick={() => onDateRangeChange(null)}
                className="ml-2 hover:text-green-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.services.map((service) => (
            <span
              key={service}
              className="flex items-center rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-400"
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
            <span className="flex items-center rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-400">
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
