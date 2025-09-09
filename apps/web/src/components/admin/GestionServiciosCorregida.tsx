/**
 * ===================================================================
 * GESTIÓN DE SERVICIOS - COMPONENTE ADMIN CORREGIDO
 * ===================================================================
 *
 * Componente para gestionar el catálogo de servicios de la barbería
 * Corregido para trabajar con la API consolidada
 */

import React, { useState } from "react";
import {
  Scissors,
  Plus,
  Edit3,
  Trash2,
  Search,
  Clock,
  DollarSign,
  Tag,
  Save,
  X,
} from "lucide-react";

import { useServicios } from "../../hooks/useServicios";

// ===================================================================
// TIPOS
// ===================================================================

interface ServicioFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  categoria: string;
  activo: boolean;
}

const CATEGORIAS = [
  "Corte de Cabello",
  "Barba",
  "Combo",
  "Tratamiento",
  "Otros",
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const GestionServiciosCorregida: React.FC = () => {
  // Hooks de datos
  const { servicios, loading, error, crearServicio, actualizarServicio, eliminarServicio } = useServicios();

  // Estados locales
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<any>(null);
  const [formData, setFormData] = useState<ServicioFormData>({
    nombre: "",
    descripcion: "",
    precio: 0,
    duracion: 30,
    categoria: "Corte de Cabello",
    activo: true,
  });

  // ===================================================================
  // FUNCIONES DE UTILIDAD
  // ===================================================================

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      duracion: 30,
      categoria: "Corte de Cabello",
      activo: true,
    });
    setServicioEditando(null);
  };

  const abrirModalNuevo = () => {
    resetForm();
    setModalAbierto(true);
  };

  const abrirModalEditar = (servicio: any) => {
    setFormData({
      nombre: servicio.nombre || "",
      descripcion: servicio.descripcion || "",
      precio: servicio.precio || 0,
      duracion: servicio.duracion || 30,
      categoria: servicio.categoria || "Corte de Cabello",
      activo: servicio.activo !== false,
    });
    setServicioEditando(servicio);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    resetForm();
  };

  // ===================================================================
  // MANEJADORES DE EVENTOS
  // ===================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (servicioEditando) {
        // Actualizar servicio existente
        await actualizarServicio(servicioEditando.id_servicio, formData);
      } else {
        // Crear nuevo servicio
        await crearServicio(formData);
      }
      cerrarModal();
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      alert("Error al guardar el servicio");
    }
  };

  const handleDelete = async (servicioId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
      try {
        await eliminarServicio(servicioId);
      } catch (error) {
        console.error("Error al eliminar servicio:", error);
        alert("Error al eliminar el servicio");
      }
    }
  };

  // ===================================================================
  // FILTROS
  // ===================================================================

  const serviciosFiltrados = (servicios || []).filter((servicio) => {
    const matchesBusqueda = 
      servicio.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      servicio.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchesCategoria = 
      filtroCategoria === "todos" || servicio.categoria === filtroCategoria;

    return matchesBusqueda && matchesCategoria;
  });

  // ===================================================================
  // RENDERIZADO
  // ===================================================================

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded">
        Error al cargar servicios: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
          <Scissors className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-yellow-500" />
          <span className="hidden sm:inline">Gestión de Servicios</span>
          <span className="sm:hidden">Servicios</span>
        </h2>
        <button
          onClick={abrirModalNuevo}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-3 rounded-md font-semibold flex items-center justify-center transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nuevo Servicio</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      {/* Filtros - Mobile First */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="todos">Todas las categorías</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de servicios - Mobile Optimized */}
      {serviciosFiltrados.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 sm:p-12 text-center">
          <Scissors className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-base sm:text-lg">No hay servicios que mostrar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {serviciosFiltrados.map((servicio) => (
            <div
              key={servicio.id_servicio}
              className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-yellow-500/50 transition-colors"
            >
              {/* Header del servicio */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">
                    {servicio.nombre}
                  </h3>
                  <span className="inline-block px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                    <Tag className="h-3 w-3 inline mr-1" />
                    {servicio.categoria}
                  </span>
                </div>
                
                <div className="flex space-x-1 sm:space-x-2 ml-2">
                  <button
                    onClick={() => abrirModalEditar(servicio)}
                    className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(servicio.id_servicio)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Información del servicio */}
              <div className="space-y-3">
                <p className="text-gray-300 text-sm line-clamp-2">{servicio.descripcion}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-green-400 text-sm font-medium">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${servicio.precio?.toLocaleString('es-CL')}
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {servicio.duracion}min
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-xs text-gray-400">Estado:</span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    servicio.activo !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {servicio.activo !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear/editar servicio - Mobile Responsive */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {servicioEditando ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-white transition-colors p-2 -m-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    required
                    className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Categoría
                </label>
                <select
                  className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  {CATEGORIAS.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  className="mr-2"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                />
                <label htmlFor="activo" className="text-sm text-gray-300">
                  Servicio activo
                </label>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-3 rounded-md font-semibold flex items-center justify-center transition-colors text-sm sm:text-base"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {servicioEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionServiciosCorregida;
