/**
 * ===================================================================
 * GESTIÓN DE SERVICIOS - COMPONENTE PARA ADMIN
 * ===================================================================
 *
 * Componente para gestionar el catálogo de servicios de la barbería
 * con funcionalidades CRUD completas
 */

import React, { useState } from "react";
import {
  Scissors,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  ToggleLeft,
  ToggleRight,
  Clock,
  DollarSign,
  Tag,
} from "lucide-react";

import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Modal,
  LoadingSpinner,
  EmptyState,
} from "../ui";

import { useServicios } from "../../hooks/useApiHooks";
import { useToast } from "../../contexts/ToastContext";

// ===================================================================
// TIPOS
// ===================================================================

interface ServicioFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  categoria: string;
  color: string;
  activo: boolean;
}

// ===================================================================
// UTILIDADES
// ===================================================================

const categorias = [
  { value: "corte", label: "Cortes", color: "bg-blue-500" },
  { value: "barba", label: "Barba", color: "bg-green-500" },
  { value: "combo", label: "Combos", color: "bg-purple-500" },
  { value: "especial", label: "Especiales", color: "bg-yellow-500" },
  { value: "tratamiento", label: "Tratamientos", color: "bg-red-500" },
];

const colores = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const GestionServicios: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [editingServicio, setEditingServicio] = useState<any>(null);
  const [formData, setFormData] = useState<ServicioFormData>({
    nombre: "",
    descripcion: "",
    precio: 0,
    duracion: 30,
    categoria: "corte",
    color: colores[0],
    activo: true,
  });

  const {
    servicios,
    loading,
    error,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
  } = useServicios();

  const { showToast } = useToast();

  // ===================================================================
  // FILTRADO
  // ===================================================================

  const serviciosFiltrados = React.useMemo(() => {
    if (!servicios) return [];

    return servicios.filter((servicio) => {
      // Filtro por búsqueda
      if (busqueda) {
        const termino = busqueda.toLowerCase();
        if (
          !servicio.nombre.toLowerCase().includes(termino) &&
          !servicio.descripcion?.toLowerCase().includes(termino)
        ) {
          return false;
        }
      }

      // Filtro por categoría
      if (
        filtroCategoria !== "todas" &&
        servicio.categoria !== filtroCategoria
      ) {
        return false;
      }

      // Filtro por estado
      if (filtroEstado === "activos" && !servicio.activo) return false;
      if (filtroEstado === "inactivos" && servicio.activo) return false;

      return true;
    });
  }, [servicios, busqueda, filtroCategoria, filtroEstado]);

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleOpenModal = (servicio?: any) => {
    if (servicio) {
      setEditingServicio(servicio);
      setFormData({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || "",
        precio: servicio.precio,
        duracion: servicio.duracion,
        categoria: servicio.categoria || "corte",
        color: servicio.color || colores[0],
        activo: servicio.activo,
      });
    } else {
      setEditingServicio(null);
      setFormData({
        nombre: "",
        descripcion: "",
        precio: 0,
        duracion: 30,
        categoria: "corte",
        color: colores[0],
        activo: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingServicio(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingServicio) {
        await actualizarServicio(editingServicio.id_servicio, formData);
        showToast("Servicio actualizado correctamente", "success");
      } else {
        await crearServicio(formData);
        showToast("Servicio creado correctamente", "success");
      }
      handleCloseModal();
    } catch (error: any) {
      showToast(error.message || "Error al guardar el servicio", "error");
    }
  };

  const handleToggleEstado = async (servicio: any) => {
    try {
      await actualizarServicio(servicio.id_servicio, {
        activo: !servicio.activo,
      });
      showToast(
        `Servicio ${!servicio.activo ? "activado" : "desactivado"}`,
        "success"
      );
    } catch (error: any) {
      showToast(error.message || "Error al cambiar el estado", "error");
    }
  };

  const handleEliminar = async (servicio: any) => {
    if (
      !confirm(`¿Estás seguro de eliminar el servicio "${servicio.nombre}"?`)
    ) {
      return;
    }

    try {
      await eliminarServicio(servicio.id_servicio);
      showToast("Servicio eliminado correctamente", "success");
    } catch (error: any) {
      showToast(error.message || "Error al eliminar el servicio", "error");
    }
  };

  const getCategoriaInfo = (categoria: string) => {
    return categorias.find((c) => c.value === categoria) || categorias[0];
  };

  // ===================================================================
  // RENDERIZADO
  // ===================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Gestión de Servicios</h3>
          <p className="text-slate-400">
            {serviciosFiltrados.length} de {servicios?.length || 0} servicios
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => handleOpenModal()}>
          Nuevo Servicio
        </Button>
      </div>
      {/* Filtros */}
      <Card padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar servicios..."
            icon={Search}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <Select
            options={[
              { value: "todas", label: "Todas las categorías" },
              ...categorias.map((cat) => ({
                value: cat.value,
                label: cat.label,
              })),
            ]}
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          />

          <Select
            options={[
              { value: "todos", label: "Todos los estados" },
              { value: "activos", label: "Solo activos" },
              { value: "inactivos", label: "Solo inactivos" },
            ]}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          />
        </div>
      </Card>
      {/* Servicios Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Cargando servicios..." />
        </div>
      ) : (
        <>
          {error ? (
            <Card padding="lg">
              <div className="text-center text-red-400">
                Error al cargar servicios: {error}
              </div>
            </Card>
          ) : (
            <>
              {serviciosFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviciosFiltrados.map((servicio) => {
                    const categoriaInfo = getCategoriaInfo(
                      servicio.categoria || "corte"
                    );

                    return (
                      <Card key={servicio.id_servicio} padding="lg" hover>
                        <div className="space-y-4">
                          {/* Header del servicio */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                style={{
                                  backgroundColor:
                                    servicio.color || categoriaInfo.color,
                                }}
                              >
                                <Scissors className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-white">
                                  {servicio.nombre}
                                </h4>
                                <Badge
                                  variant={
                                    servicio.activo ? "success" : "secondary"
                                  }
                                  size="sm"
                                >
                                  {servicio.activo ? "Activo" : "Inactivo"}
                                </Badge>
                              </div>
                            </div>

                            <button
                              onClick={() => handleToggleEstado(servicio)}
                              className="text-slate-400 hover:text-white transition-colors"
                            >
                              {servicio.activo ? (
                                <ToggleRight className="h-6 w-6 text-green-500" />
                              ) : (
                                <ToggleLeft className="h-6 w-6" />
                              )}
                            </button>
                          </div>

                          {/* Descripción */}
                          {servicio.descripcion && (
                            <p className="text-sm text-slate-400">
                              {servicio.descripcion}
                            </p>
                          )}

                          {/* Detalles */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-400" />
                                <span className="text-slate-400">Precio:</span>
                              </div>
                              <span className="font-semibold text-green-400">
                                ${servicio.precio.toLocaleString("es-CL")}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-400" />
                                <span className="text-slate-400">
                                  Duración:
                                </span>
                              </div>
                              <span className="text-white">
                                {servicio.duracion} min
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-purple-400" />
                                <span className="text-slate-400">
                                  Categoría:
                                </span>
                              </div>
                              <Badge variant="primary" size="sm">
                                {categoriaInfo.label}
                              </Badge>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Eye}
                              fullWidth
                            >
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Edit3}
                              onClick={() => handleOpenModal(servicio)}
                              fullWidth
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleEliminar(servicio)}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Scissors}
                  title="No hay servicios"
                  description={
                    busqueda ||
                    filtroCategoria !== "todas" ||
                    filtroEstado !== "todos"
                      ? "No se encontraron servicios con los filtros aplicados"
                      : "Comienza agregando servicios para tu barbería"
                  }
                  action={
                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={() => handleOpenModal()}
                    >
                      Agregar Primer Servicio
                    </Button>
                  }
                />
              )}
            </>
          )}
        </>
      )}{" "}
      {/* Modal de Servicio */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingServicio ? "Editar Servicio" : "Nuevo Servicio"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del Servicio"
            placeholder="Ej: Corte Clásico"
            value={formData.nombre}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nombre: e.target.value }))
            }
            required
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio (CLP)"
              type="number"
              placeholder="15000"
              value={formData.precio}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  precio: Number(e.target.value),
                }))
              }
              required
              fullWidth
            />

            <Input
              label="Duración (minutos)"
              type="number"
              placeholder="30"
              value={formData.duracion}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duracion: Number(e.target.value),
                }))
              }
              required
              fullWidth
            />
          </div>

          <Select
            label="Categoría"
            options={categorias.map((cat) => ({
              value: cat.value,
              label: cat.label,
            }))}
            value={formData.categoria}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, categoria: e.target.value }))
            }
            fullWidth
          />

          <div>
            <div className="block text-sm font-medium text-slate-300 mb-2">
              Color
            </div>
            <div className="flex gap-2">
              {colores.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color
                      ? "border-white"
                      : "border-slate-600"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <Input
            label="Descripción (Opcional)"
            placeholder="Descripción del servicio..."
            value={formData.descripcion}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, descripcion: e.target.value }))
            }
            fullWidth
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, activo: e.target.checked }))
              }
              className="rounded bg-slate-700 border-slate-600"
            />
            <label htmlFor="activo" className="text-white">
              Servicio activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" fullWidth>
              {editingServicio ? "Actualizar" : "Crear"} Servicio
            </Button>
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GestionServicios;
