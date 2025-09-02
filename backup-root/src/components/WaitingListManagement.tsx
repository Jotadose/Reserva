import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Search,
  Plus,
  Minus,
} from "lucide-react";
import { Booking } from "../types/booking";
import { LoadingSpinner } from "./common/LoadingSpinner";

interface WaitingListEntry {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  desiredDate: string;
  desiredTime: string;
  services: string[];
  priority: "low" | "medium" | "high";
  notes?: string;
  dateAdded: string;
  status: "waiting" | "contacted" | "scheduled" | "cancelled";
  contactAttempts: number;
  lastContactDate?: string;
}

interface WaitingListManagementProps {
  bookings: Booking[];
  onAddToWaitingList?: (entry: Omit<WaitingListEntry, "id" | "dateAdded">) => void;
  onUpdateWaitingListEntry?: (id: string, updates: Partial<WaitingListEntry>) => void;
  onRemoveFromWaitingList?: (id: string) => void;
}

export const WaitingListManagement: React.FC<WaitingListManagementProps> = ({
  bookings,
  onAddToWaitingList,
  onUpdateWaitingListEntry,
  onRemoveFromWaitingList,
}) => {
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [filteredList, setFilteredList] = useState<WaitingListEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "waiting" | "contacted" | "scheduled" | "cancelled"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [sortBy, setSortBy] = useState<"dateAdded" | "priority" | "desiredDate">("dateAdded");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<WaitingListEntry | null>(null);

  // Simular datos de lista de espera (en un caso real vendría de la API)
  useEffect(() => {
    const generateMockWaitingList = (): WaitingListEntry[] => {
      const mockEntries: WaitingListEntry[] = [
        {
          id: "wl_1",
          clientName: "María García",
          clientEmail: "maria.garcia@email.com",
          clientPhone: "+57 300 123 4567",
          desiredDate: "2024-12-25",
          desiredTime: "10:00",
          services: ["Corte de Cabello", "Manicura"],
          priority: "high",
          notes: "Cliente VIP, prefiere cita temprano",
          dateAdded: "2024-12-15T10:00:00Z",
          status: "waiting",
          contactAttempts: 0,
        },
        {
          id: "wl_2",
          clientName: "Carlos Rodríguez",
          clientEmail: "carlos.rodriguez@email.com",
          clientPhone: "+57 310 987 6543",
          desiredDate: "2024-12-24",
          desiredTime: "14:00",
          services: ["Corte de Cabello"],
          priority: "medium",
          notes: "Flexible con el horario",
          dateAdded: "2024-12-14T15:30:00Z",
          status: "contacted",
          contactAttempts: 1,
          lastContactDate: "2024-12-16T09:00:00Z",
        },
        {
          id: "wl_3",
          clientName: "Ana López",
          clientEmail: "ana.lopez@email.com",
          clientPhone: "+57 320 456 7890",
          desiredDate: "2024-12-26",
          desiredTime: "16:00",
          services: ["Pedicura", "Manicura"],
          priority: "low",
          dateAdded: "2024-12-13T12:00:00Z",
          status: "waiting",
          contactAttempts: 0,
        },
      ];

      return mockEntries;
    };

    // Simular carga de datos
    setTimeout(() => {
      setWaitingList(generateMockWaitingList());
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtrar y ordenar lista de espera
  useEffect(() => {
    let filtered = waitingList.filter((entry) => {
      const matchesSearch =
        entry.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.clientPhone.includes(searchQuery) ||
        entry.services.some((service) => service.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || entry.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dateAdded":
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case "priority": {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case "desiredDate":
          return new Date(a.desiredDate).getTime() - new Date(b.desiredDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredList(filtered);
  }, [waitingList, searchQuery, statusFilter, priorityFilter, sortBy]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CO");
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { label: "Alta", class: "bg-red-100 text-red-800" },
      medium: { label: "Media", class: "bg-yellow-100 text-yellow-800" },
      low: { label: "Baja", class: "bg-green-100 text-green-800" },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${config?.class || "bg-gray-100 text-gray-800"}`}
      >
        {config?.label || priority}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      waiting: { label: "En Espera", class: "bg-blue-100 text-blue-800", icon: Clock },
      contacted: { label: "Contactado", class: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      scheduled: { label: "Programado", class: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { label: "Cancelado", class: "bg-red-100 text-red-800", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config?.icon || Clock;

    return (
      <div className="flex items-center space-x-1">
        <IconComponent className="h-3 w-3" />
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${config?.class || "bg-gray-100 text-gray-800"}`}
        >
          {config?.label || status}
        </span>
      </div>
    );
  };

  const handleContactClient = (entry: WaitingListEntry) => {
    const updatedEntry = {
      ...entry,
      status: "contacted" as const,
      contactAttempts: entry.contactAttempts + 1,
      lastContactDate: new Date().toISOString(),
    };

    setWaitingList((prev) => prev.map((item) => (item.id === entry.id ? updatedEntry : item)));

    if (onUpdateWaitingListEntry) {
      onUpdateWaitingListEntry(entry.id, updatedEntry);
    }

    // Simular envío de notificación
    alert(`Contactando a ${entry.clientName} al ${entry.clientPhone}`);
  };

  const handleScheduleClient = (entry: WaitingListEntry) => {
    const updatedEntry = {
      ...entry,
      status: "scheduled" as const,
    };

    setWaitingList((prev) => prev.map((item) => (item.id === entry.id ? updatedEntry : item)));

    if (onUpdateWaitingListEntry) {
      onUpdateWaitingListEntry(entry.id, updatedEntry);
    }

    alert(`${entry.clientName} ha sido programado para una cita`);
  };

  const handleRemoveFromList = (entry: WaitingListEntry) => {
    if (
      window.confirm(
        `¿Está seguro de que desea eliminar a ${entry.clientName} de la lista de espera?`,
      )
    ) {
      setWaitingList((prev) => prev.filter((item) => item.id !== entry.id));

      if (onRemoveFromWaitingList) {
        onRemoveFromWaitingList(entry.id);
      }
    }
  };

  const stats = {
    total: waitingList.length,
    waiting: waitingList.filter((e) => e.status === "waiting").length,
    contacted: waitingList.filter((e) => e.status === "contacted").length,
    highPriority: waitingList.filter((e) => e.priority === "high").length,
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
            <h2 className="text-2xl font-bold text-gray-900">Lista de Espera</h2>
            <p className="text-gray-600">Gestiona los clientes en espera de citas disponibles</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Funcionalidad de agregar a lista de espera se implementará más adelante
                alert("Funcionalidad en desarrollo");
              }}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar a Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total en Lista</p>
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
              <p className="text-sm font-medium text-gray-600">En Espera</p>
              <p className="text-2xl font-bold text-blue-600">{stats.waiting}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contactados</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alta Prioridad</p>
              <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div>
            <label
              htmlFor="waiting-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Buscar Cliente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                id="waiting-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre, email, teléfono..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status-filter" className="mb-2 block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="waiting">En Espera</option>
              <option value="contacted">Contactados</option>
              <option value="scheduled">Programados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority-filter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Prioridad
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
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
              <option value="dateAdded">Fecha de Registro</option>
              <option value="priority">Prioridad</option>
              <option value="desiredDate">Fecha Deseada</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setSortBy("dateAdded");
              }}
              className="w-full rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Waiting List Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Espera ({filteredList.length})
          </h3>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p>No hay clientes en la lista de espera</p>
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
                    Fecha/Hora Deseada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Servicios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredList.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{entry.clientName}</p>
                        <p className="text-sm text-gray-500">{entry.clientEmail}</p>
                        <p className="text-sm text-gray-500">{entry.clientPhone}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <p>{formatDate(entry.desiredDate)}</p>
                          <p className="text-xs text-gray-500">{entry.desiredTime}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {entry.services.map((service) => (
                          <span
                            key={`${entry.id}-service-${service}`}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getPriorityBadge(entry.priority)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(entry.status)}
                      {entry.contactAttempts > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          {entry.contactAttempts} contacto{entry.contactAttempts > 1 ? "s" : ""}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(entry.dateAdded)}
                    </td>
                    <td className="space-x-2 whitespace-nowrap px-6 py-4 text-sm">
                      {entry.status === "waiting" && (
                        <button
                          onClick={() => handleContactClient(entry)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Contactar
                        </button>
                      )}
                      {(entry.status === "waiting" || entry.status === "contacted") && (
                        <button
                          onClick={() => handleScheduleClient(entry)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Programar
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Detalles
                      </button>
                      <button
                        onClick={() => handleRemoveFromList(entry)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <WaitingListEntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onUpdate={(updates) => {
            setWaitingList((prev) =>
              prev.map((item) => (item.id === selectedEntry.id ? { ...item, ...updates } : item)),
            );
            setSelectedEntry(null);
          }}
        />
      )}
    </div>
  );
};

// Waiting List Entry Detail Modal
interface WaitingListEntryModalProps {
  entry: WaitingListEntry;
  onClose: () => void;
  onUpdate: (updates: Partial<WaitingListEntry>) => void;
}

const WaitingListEntryModal: React.FC<WaitingListEntryModalProps> = ({
  entry,
  onClose,
  onUpdate,
}) => {
  const [editedEntry, setEditedEntry] = useState(entry);

  const handleSave = () => {
    onUpdate(editedEntry);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Detalles de Lista de Espera</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="client-name" className="mb-2 block text-sm font-medium text-gray-700">
                Nombre del Cliente
              </label>
              <input
                id="client-name"
                type="text"
                value={editedEntry.clientName}
                onChange={(e) => setEditedEntry({ ...editedEntry, clientName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="client-email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="client-email"
                type="email"
                value={editedEntry.clientEmail}
                onChange={(e) => setEditedEntry({ ...editedEntry, clientEmail: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="client-phone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Teléfono
              </label>
              <input
                id="client-phone"
                type="tel"
                value={editedEntry.clientPhone}
                onChange={(e) => setEditedEntry({ ...editedEntry, clientPhone: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="desired-date"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Fecha Deseada
              </label>
              <input
                id="desired-date"
                type="date"
                value={editedEntry.desiredDate}
                onChange={(e) => setEditedEntry({ ...editedEntry, desiredDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="desired-time"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Hora Deseada
              </label>
              <input
                id="desired-time"
                type="time"
                value={editedEntry.desiredTime}
                onChange={(e) => setEditedEntry({ ...editedEntry, desiredTime: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="priority" className="mb-2 block text-sm font-medium text-gray-700">
                Prioridad
              </label>
              <select
                id="priority"
                value={editedEntry.priority}
                onChange={(e) =>
                  setEditedEntry({ ...editedEntry, priority: e.target.value as any })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
              Notas
            </label>
            <textarea
              id="notes"
              value={editedEntry.notes || ""}
              onChange={(e) => setEditedEntry({ ...editedEntry, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Información de Contacto</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Intentos de Contacto:</span>
                <span className="ml-2 font-medium">{entry.contactAttempts}</span>
              </div>
              {entry.lastContactDate && (
                <div>
                  <span className="text-gray-600">Último Contacto:</span>
                  <span className="ml-2 font-medium">
                    {new Date(entry.lastContactDate).toLocaleString("es-CO")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
