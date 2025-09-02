import React, { useState, useEffect } from "react";
import { Users, Search, Mail, Phone, Calendar, DollarSign, X, Plus } from "lucide-react";
import { Booking } from "../types/booking";
import { LoadingSpinner } from "./common/LoadingSpinner";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastVisit: string;
  firstVisit: string;
  status: "active" | "inactive" | "vip";
  notes?: string;
  preferences?: {
    preferredServices: string[];
    preferredTimes: string[];
    communicationMethod: "email" | "phone" | "sms";
  };
}

interface ClientManagementProps {
  bookings: Booking[];
}

export const ClientManagement: React.FC<ClientManagementProps> = ({ bookings }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "vip">("all");
  const [sortBy, setSortBy] = useState<"name" | "totalSpent" | "lastVisit" | "totalBookings">(
    "name",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Generar clientes a partir de las reservas
  useEffect(() => {
    const generateClients = () => {
      const clientMap = new Map<string, Client>();

      bookings.forEach((booking) => {
        const clientKey = booking.client.email.toLowerCase();
        const existing = clientMap.get(clientKey);

        if (existing) {
          // Actualizar cliente existente
          existing.totalBookings += 1;
          existing.totalSpent += booking.totalPrice;

          const bookingDate = new Date(booking.date);
          const lastVisitDate = new Date(existing.lastVisit);
          const firstVisitDate = new Date(existing.firstVisit);

          if (bookingDate > lastVisitDate) {
            existing.lastVisit = booking.date;
          }
          if (bookingDate < firstVisitDate) {
            existing.firstVisit = booking.date;
          }
        } else {
          // Crear nuevo cliente
          const client: Client = {
            id: `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name: booking.client.name,
            email: booking.client.email,
            phone: booking.client.phone,
            totalBookings: 1,
            totalSpent: booking.totalPrice,
            lastVisit: booking.date,
            firstVisit: booking.date,
            status: "active",
            notes: booking.client.notes,
            preferences: {
              preferredServices: [booking.services[0]?.name || ""],
              preferredTimes: [booking.time],
              communicationMethod: "email",
            },
          };

          clientMap.set(clientKey, client);
        }
      });

      // Determinar status VIP (clientes con más de $200k gastados o más de 5 visitas)
      const clientsList = Array.from(clientMap.values()).map((client) => {
        let clientStatus: "active" | "inactive" | "vip";

        if (client.totalSpent > 200000 || client.totalBookings > 5) {
          clientStatus = "vip";
        } else if (new Date(client.lastVisit) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)) {
          clientStatus = "active";
        } else {
          clientStatus = "inactive";
        }

        return {
          ...client,
          status: clientStatus,
        };
      });

      setClients(clientsList);
      setIsLoading(false);
    };

    if (bookings.length > 0) {
      generateClients();
    } else {
      setIsLoading(false);
    }
  }, [bookings]);

  // Filtrar y ordenar clientes
  useEffect(() => {
    let filtered = clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery);

      const matchesStatus = statusFilter === "all" || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "totalSpent":
          return b.totalSpent - a.totalSpent;
        case "lastVisit":
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        case "totalBookings":
          return b.totalBookings - a.totalBookings;
        default:
          return 0;
      }
    });

    setFilteredClients(filtered);
  }, [clients, searchQuery, statusFilter, sortBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Activo", class: "bg-green-100 text-green-800" },
      inactive: { label: "Inactivo", class: "bg-gray-100 text-gray-800" },
      vip: { label: "VIP", class: "bg-purple-100 text-purple-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${config?.class || "bg-gray-100 text-gray-800"}`}
      >
        {config?.label || status}
      </span>
    );
  };

  const exportClients = () => {
    const csvContent = [
      ["Nombre", "Email", "Teléfono", "Total Reservas", "Total Gastado", "Última Visita", "Estado"],
      ...filteredClients.map((client) => [
        client.name,
        client.email,
        client.phone,
        client.totalBookings.toString(),
        client.totalSpent.toString(),
        client.lastVisit,
        client.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    vip: clients.filter((c) => c.status === "vip").length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
            <p className="text-gray-600">Administra la información y historial de tus clientes</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Funcionalidad de agregar cliente se implementará más adelante
                alert("Funcionalidad en desarrollo");
              }}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes VIP</p>
              <p className="text-2xl font-bold text-purple-600">{stats.vip}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="client-search" className="mb-2 block text-sm font-medium text-gray-700">
              Buscar Cliente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                id="client-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre, email o teléfono..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status-filter" className="mb-2 block text-sm font-medium text-gray-700">
              Filtrar por Estado
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-by" className="mb-2 block text-sm font-medium text-gray-700">
              Ordenar por
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Nombre</option>
              <option value="totalSpent">Total Gastado</option>
              <option value="lastVisit">Última Visita</option>
              <option value="totalBookings">Total Reservas</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSortBy("name");
              }}
              className="w-full rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Clientes ({filteredClients.length})
          </h3>
        </div>

        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p>No se encontraron clientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Reservas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Gastado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Última Visita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-500">
                          Cliente desde {formatDate(client.firstVisit)}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{client.totalBookings}</p>
                        <p className="text-xs text-gray-500">reservas</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(client.totalSpent)}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(client.lastVisit)}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(client.status)}</td>
                    <td className="space-x-2 whitespace-nowrap px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          bookings={bookings.filter((b) => b.client.email === selectedClient.email)}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

// Client Detail Modal Component
interface ClientDetailModalProps {
  client: Client;
  bookings: Booking[];
  onClose: () => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, bookings, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
            <p className="text-sm text-gray-600">{client.email}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Client Info */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Información del Cliente</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Teléfono:</span>
                  <p className="text-gray-900">{client.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Estado:</span>
                  <div className="mt-1">
                    {(() => {
                      let statusClasses: string;
                      if (client.status === "vip") {
                        statusClasses = "bg-purple-100 text-purple-800";
                      } else if (client.status === "active") {
                        statusClasses = "bg-green-100 text-green-800";
                      } else {
                        statusClasses = "bg-gray-100 text-gray-800";
                      }

                      let statusText: string;
                      if (client.status === "vip") {
                        statusText = "VIP";
                      } else if (client.status === "active") {
                        statusText = "Activo";
                      } else {
                        statusText = "Inactivo";
                      }

                      return (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses}`}
                        >
                          {statusText}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Primera visita:</span>
                  <p className="text-gray-900">
                    {new Date(client.firstVisit).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Última visita:</span>
                  <p className="text-gray-900">
                    {new Date(client.lastVisit).toLocaleDateString("es-CO")}
                  </p>
                </div>
                {client.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Notas:</span>
                    <p className="text-gray-900">{client.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-600">Total Reservas</p>
                  <p className="text-2xl font-bold text-blue-900">{client.totalBookings}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-600">Total Gastado</p>
                  <p className="text-2xl font-bold text-green-900">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    }).format(client.totalSpent)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Historial de Reservas</h3>
            <div className="max-h-64 overflow-y-auto rounded-lg bg-gray-50 p-4">
              {bookings.length === 0 ? (
                <p className="text-center text-gray-500">No hay reservas registradas</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking, index) => (
                    <div key={booking.id || index} className="rounded border bg-white p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.services.map((s) => s.name).join(", ")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.date).toLocaleDateString("es-CO")} - {booking.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            }).format(booking.totalPrice)}
                          </p>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${(() => {
                              if (booking.status === "completed")
                                return "bg-green-100 text-green-800";
                              if (booking.status === "confirmed")
                                return "bg-blue-100 text-blue-800";
                              if (booking.status === "cancelled") return "bg-red-100 text-red-800";
                              return "bg-yellow-100 text-yellow-800";
                            })()}`}
                          >
                            {(() => {
                              if (booking.status === "completed") return "Completada";
                              if (booking.status === "confirmed") return "Confirmada";
                              if (booking.status === "cancelled") return "Cancelada";
                              return booking.status;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
