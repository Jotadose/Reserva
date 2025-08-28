import React, { useState, useMemo } from "react";
import { BarChart3, Download, Users, TrendingUp } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { Booking, AdminPanelState } from "../types/booking";
import { useBookingFilters } from "../hooks/useBookingFilters";
import { useBookingActions } from "../hooks/useBookingActions";
import { AdvancedFilters } from "./AdvancedFilters";
import { BookingsTable } from "./BookingsTable";
import { AdvancedAnalytics } from "./AdvancedAnalytics";

interface AdminPanelEnhancedProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => Promise<void>;
}

type ViewMode = "overview" | "bookings" | "analytics";

export const AdminPanelEnhanced: React.FC<AdminPanelEnhancedProps> = ({
  bookings = [], // Default a array vacío
  onCancelBooking,
}) => {
  const { addToast } = useToast();

  // Debug logs
  console.log("🛠️ AdminPanelEnhanced - Received bookings:", bookings.length);
  console.log("📊 AdminPanelEnhanced - Bookings data:", bookings);

  // Estado del panel administrativo usando el tipo definido
  const [panelState, setPanelState] = useState<
    Pick<AdminPanelState, "viewMode" | "selectedBookings" | "loading" | "error">
  >({
    viewMode: "overview",
    selectedBookings: [],
    loading: false,
    error: null,
  });

  // ✅ BARBERÍA-FRIENDLY: Validar solo campos esenciales
  const validBookings = bookings.filter((booking) => {
    const isValid =
      booking &&
      typeof booking === "object" &&
      booking.id &&
      booking.date &&
      booking.time &&
      booking.clientName; // Solo validar que existe clientName

    if (!isValid) {
      console.log("❌ Booking inválido:", booking);
    }
    return isValid;
  });

  console.log(
    `✅ Bookings válidos: ${validBookings.length} de ${bookings.length}`
  );

  // Use custom hooks
  const bookingFilters = useBookingFilters(validBookings);
  const { exportBookings, bulkCancelBookings, loading } = useBookingActions();

  // 🔧 SERVICIOS SIMPLIFICADOS (temporal)
  const availableServices = useMemo(() => {
    // Por ahora retornar servicios básicos hasta que se implemente correctamente
    return [
      "Corte de Cabello",
      "Corte + Barba",
      "Solo Barba",
      "Servicio General",
    ];
  }, []);

  // 📱 ESTADÍSTICAS SIMPLIFICADAS PARA BARBERÍA
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    return {
      total: validBookings.length,
      today: validBookings.filter((b) => b.date === today).length,
      thisWeek: validBookings.filter((b) => b.date >= thisWeek).length,
      thisMonth: validBookings.filter((b) => b.date >= thisMonth).length,
      // ✅ Calcular ingresos desde el campo 'total' directamente
      revenue: validBookings.reduce((sum, b) => sum + (b.total || 0), 0),
      filtered: bookingFilters.filteredBookings.length,
    };
  }, [validBookings, bookingFilters.filteredBookings]);

  const handleBulkAction = async (action: "cancel" | "export") => {
    if (action === "cancel") {
      if (panelState.selectedBookings.length === 0) {
        addToast({
          type: "warning",
          title: "Ninguna reserva seleccionada",
          message: "Selecciona al menos una reserva para cancelar",
        });
        return;
      }

      if (
        confirm(
          `¿Estás seguro de cancelar ${panelState.selectedBookings.length} reserva(s)?`
        )
      ) {
        await bulkCancelBookings(panelState.selectedBookings);
        setPanelState((prev) => ({ ...prev, selectedBookings: [] }));
      }
    } else if (action === "export") {
      const dataToExport =
        panelState.selectedBookings.length > 0
          ? bookingFilters.filteredBookings.filter((b) =>
              panelState.selectedBookings.includes(b.id)
            )
          : bookingFilters.filteredBookings;

      exportBookings(dataToExport, "csv");
    }
  };

  const ViewSelector = () => (
    <div className="flex space-x-1 rounded-lg bg-gray-800 p-1">
      <button
        onClick={() =>
          setPanelState((prev) => ({ ...prev, viewMode: "overview" }))
        }
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          panelState.viewMode === "overview"
            ? "bg-yellow-500 text-black"
            : "text-gray-300 hover:text-white"
        }`}
      >
        Resumen
      </button>
      <button
        onClick={() =>
          setPanelState((prev) => ({ ...prev, viewMode: "bookings" }))
        }
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          panelState.viewMode === "bookings"
            ? "bg-yellow-500 text-black"
            : "text-gray-300 hover:text-white"
        }`}
      >
        Reservas
      </button>
      <button
        onClick={() =>
          setPanelState((prev) => ({ ...prev, viewMode: "analytics" }))
        }
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          panelState.viewMode === "analytics"
            ? "bg-yellow-500 text-black"
            : "text-gray-300 hover:text-white"
        }`}
      >
        Analíticas
      </button>
    </div>
  );

  const StatsCards = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      <div className="rounded-xl border border-blue-700 bg-blue-900/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">Total Reservas</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <BarChart3 className="h-8 w-8 text-blue-400" />
        </div>
      </div>

      <div className="rounded-xl border border-green-700 bg-green-900/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-400">Hoy</p>
            <p className="text-2xl font-bold text-white">{stats.today}</p>
          </div>
          <Users className="h-8 w-8 text-green-400" />
        </div>
      </div>

      <div className="rounded-xl border border-yellow-700 bg-yellow-900/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-400">Esta Semana</p>
            <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-yellow-400" />
        </div>
      </div>

      <div className="rounded-xl border border-purple-700 bg-purple-900/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-400">Este Mes</p>
            <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
          </div>
          <Users className="h-8 w-8 text-purple-400" />
        </div>
      </div>

      <div className="rounded-xl border border-emerald-700 bg-emerald-900/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">Ingresos</p>
            <p className="text-2xl font-bold text-white">
              ${stats.revenue.toLocaleString()}
            </p>
          </div>
          <BarChart3 className="h-8 w-8 text-emerald-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              Panel de Administración
            </h2>
            <p className="text-gray-400">
              Gestiona las reservas y analiza el rendimiento
            </p>
          </div>
          <ViewSelector />
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Content based on view mode */}
      {panelState.viewMode === "overview" && (
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
          <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-xl font-bold text-white">
              Acciones Rápidas
            </h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleBulkAction("export")}
                className="flex items-center space-x-2 rounded-lg bg-yellow-600 px-6 py-3 font-semibold text-black transition-colors hover:bg-yellow-700"
              >
                <Download className="h-5 w-5" />
                <span>Exportar Datos</span>
              </button>

              {panelState.selectedBookings.length > 0 && (
                <button
                  onClick={() => handleBulkAction("cancel")}
                  disabled={loading["bulk-cancel"]}
                  className="flex items-center space-x-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
                >
                  <span>
                    Cancelar Seleccionadas ({panelState.selectedBookings.length}
                    )
                  </span>
                </button>
              )}
            </div>
          </div>

          <BookingsTable
            bookings={bookingFilters.filteredBookings}
            onBookingChange={async () => {
              // This would typically refresh data from parent
              // For now, we just clear selections
              setPanelState((prev) => ({ ...prev, selectedBookings: [] }));
            }}
            selectedBookings={panelState.selectedBookings}
            onSelectionChange={(selections) =>
              setPanelState((prev) => ({
                ...prev,
                selectedBookings: selections,
              }))
            }
          />
        </div>
      )}

      {panelState.viewMode === "bookings" && (
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
              setPanelState((prev) => ({ ...prev, selectedBookings: [] }));
            }}
            selectedBookings={panelState.selectedBookings}
            onSelectionChange={(selections) =>
              setPanelState((prev) => ({
                ...prev,
                selectedBookings: selections,
              }))
            }
          />
        </div>
      )}

      {panelState.viewMode === "analytics" && (
        <AdvancedAnalytics bookings={validBookings} />
      )}
    </div>
  );
};
