/**
 * ===================================================================
 * GESTIÓN DE BARBEROS - COMPONENTE ADMIN MEJORADO  
 * ===================================================================
 *
 * Componente para gestionar barberos de la barbería
 * Mejorado para trabajar con la API consolidada
 */

import React, { useState } from "react";
import {
  User,
  Clock,
  Calendar,
  Edit3,
  Plus,
  Save,
  X,
  Trash2,
  Check,
  Mail,
  Phone,
  Star,
  Users,
} from "lucide-react";

import { useBarberos } from "../../hooks/useBarberos";
import { useServicios } from "../../hooks/useApiHooks";

// ===================================================================
// TIPOS
// ===================================================================

interface BarberoFormData {
  nombre: string;
  email: string;
  telefono: string;
  horario_inicio: string;
  horario_fin: string;
  dias_trabajo: string[];
  servicios: string[]; // 🔄 CAMBIO: especialidades -> servicios
  activo: boolean;
}

// Constantes
const DIAS_SEMANA = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const GestionBarberosMejorada: React.FC = () => {
  // 🔄 Estados
  const { barberos, loading, error, crearBarbero, actualizarBarbero, eliminarBarbero } = useBarberos();
  const { servicios, loading: serviciosLoading } = useServicios(); // 🆕 Obtener servicios de la API

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const GestionBarberosMejorada: React.FC = () => {
  // Hooks de datos
  const { barberos, loading, error, crearBarbero, actualizarBarbero, eliminarBarbero } = useBarberos();

  // Estados locales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [barberoEditando, setBarberoEditando] = useState<any>(null);
  const [formData, setFormData] = useState<BarberoFormData>({
    nombre: '',
    email: '',
    telefono: '',
    horario_inicio: '09:00',
    horario_fin: '18:00',
    dias_trabajo: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    servicios: ['corte'], // 🔄 CAMBIO: especialidades -> servicios
    activo: true
  });

  // ===================================================================
  // FUNCIONES DE UTILIDAD
  // ===================================================================

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      horario_inicio: '09:00',
      horario_fin: '18:00',
      dias_trabajo: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
      servicios: ['corte'], // 🔄 CAMBIO: especialidades -> servicios
      activo: true
    });
    setBarberoEditando(null);
  };

  const abrirModalNuevo = () => {
    resetForm();
    setModalAbierto(true);
  };

  const abrirModalEditar = (barbero: any) => {
    setFormData({
      nombre: barbero.nombre || '',
      email: barbero.email || '',
      telefono: barbero.telefono || '',
      horario_inicio: barbero.horario_inicio || '09:00',
      horario_fin: barbero.horario_fin || '18:00',
      dias_trabajo: Array.isArray(barbero.dias_trabajo) 
        ? barbero.dias_trabajo 
        : ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
      servicios: Array.isArray(barbero.servicios) // 🔄 CAMBIO: especialidades -> servicios
        ? barbero.servicios
        : ['corte'],
      activo: barbero.activo !== false
    });
    setBarberoEditando(barbero);
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
      console.log('🚀 Enviando formulario de barbero:', formData);
      
      if (barberoEditando) {
        // Actualizar barbero existente
        await actualizarBarbero(barberoEditando.id_barbero, formData);
        console.log('✅ Barbero actualizado correctamente');
      } else {
        // Crear nuevo barbero
        await crearBarbero(formData);
        console.log('✅ Barbero creado correctamente');
      }
      cerrarModal();
    } catch (error: any) {
      console.error("❌ Error al guardar barbero:", error);
      const errorMessage = error?.message || "Error desconocido al guardar el barbero";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = async (barberoId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este barbero?")) {
      try {
        await eliminarBarbero(barberoId);
      } catch (error) {
        console.error("Error al eliminar barbero:", error);
        alert("Error al eliminar el barbero");
      }
    }
  };

  const handleToggleActivo = async (barbero: any) => {
    try {
      await actualizarBarbero(barbero.id_barbero, { activo: !barbero.activo });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error al cambiar el estado del barbero");
    }
  };

  // ===================================================================
  // MANEJADORES DE CHECKBOX
  // ===================================================================

  const handleDiaChange = (dia: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        dias_trabajo: [...prev.dias_trabajo, dia]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dias_trabajo: prev.dias_trabajo.filter(d => d !== dia)
      }));
    }
  };

  const handleServicioChange = (servicio: string, checked: boolean) => { // 🔄 CAMBIO: especialidad -> servicio
    if (checked) {
      setFormData(prev => ({
        ...prev,
        servicios: [...prev.servicios, servicio] // 🔄 CAMBIO: especialidades -> servicios
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        servicios: prev.servicios.filter(s => s !== servicio) // 🔄 CAMBIO: especialidades -> servicios
      }));
    }
  };

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
        Error al cargar barberos: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-yellow-500" />
          <span className="hidden sm:inline">Gestión de Barberos</span>
          <span className="sm:hidden">Barberos</span>
        </h2>
        <button
          onClick={abrirModalNuevo}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-3 rounded-md font-semibold flex items-center justify-center transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nuevo Barbero</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      {/* Lista de barberos - Mobile Optimized */}
      {!barberos || barberos.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 sm:p-12 text-center">
          <Users className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-base sm:text-lg">No hay barberos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {barberos.map((barbero) => (
            <div
              key={barbero.id_barbero}
              className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-yellow-500/50 transition-colors"
            >
              {/* Header del barbero */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                      {barbero.nombre}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      barbero.activo !== false
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {barbero.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActivo(barbero)}
                    className={`p-2 rounded transition-colors ${
                      barbero.activo !== false
                        ? 'text-green-400 hover:bg-green-900/20'
                        : 'text-red-400 hover:bg-red-900/20'
                    }`}
                    title={barbero.activo !== false ? 'Desactivar' : 'Activar'}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => abrirModalEditar(barbero)}
                    className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(barbero.id_barbero)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="space-y-2 mb-4">
                {barbero.email && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{barbero.email}</span>
                  </div>
                )}
                {barbero.telefono && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span>{barbero.telefono}</span>
                  </div>
                )}
              </div>

              {/* Horario de trabajo */}
              <div className="mb-4">
                <div className="flex items-center text-gray-300 text-sm mb-2">
                  <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  Horario: {barbero.horario_inicio} - {barbero.horario_fin}
                </div>
                
                {/* Días de trabajo */}
                {barbero.dias_trabajo && barbero.dias_trabajo.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {barbero.dias_trabajo.map((dia: string) => (
                      <span
                        key={dia}
                        className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                      >
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Servicios */}
              {barbero.servicios && barbero.servicios.length > 0 && ( // 🔄 CAMBIO: especialidades -> servicios
                <div>
                  <div className="flex items-center text-gray-300 text-sm mb-2">
                    <Star className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    Servicios: {/* 🔄 CAMBIO: Especialidades -> Servicios */}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {barbero.servicios.map((servicio: string) => ( // 🔄 CAMBIO: especialidades -> servicios
                      <span
                        key={servicio}
                        className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded"
                      >
                        {servicio.charAt(0).toUpperCase() + servicio.slice(1).replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear/editar barbero - Mobile Responsive */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {barberoEditando ? 'Editar Barbero' : 'Nuevo Barbero'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-white transition-colors p-2 -m-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nombre Completo
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
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
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
                    Barbero activo
                  </label>
                </div>
              </div>

              {/* Horario de trabajo */}
              <div>
                <h4 className="text-base sm:text-lg font-medium text-white mb-3">Horario de Trabajo</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Hora inicio
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                      value={formData.horario_inicio}
                      onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Hora fin
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                      value={formData.horario_fin}
                      onChange={(e) => setFormData({ ...formData, horario_fin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Días de trabajo */}
              <div>
                <h4 className="text-base sm:text-lg font-medium text-white mb-3">Días de Trabajo</h4>
                <div className="grid grid-cols-2 gap-2">
                  {DIAS_SEMANA.map(dia => (
                    <label key={dia.value} className="flex items-center text-sm text-gray-300">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.dias_trabajo.includes(dia.value)}
                        onChange={(e) => handleDiaChange(dia.value, e.target.checked)}
                      />
                      {dia.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Servicios */}
              <div>
                <h4 className="text-base sm:text-lg font-medium text-white mb-3">Servicios</h4>
                {serviciosLoading ? (
                  <div className="text-gray-400">Cargando servicios...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {servicios.map((servicio: any) => (
                      <label key={servicio.id_servicio} className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          className="mr-2 rounded"
                          checked={formData.servicios.includes(servicio.id_servicio)}
                          onChange={(e) => handleServicioChange(servicio.id_servicio, e.target.checked)}
                        />
                        <span className="truncate" title={`${servicio.nombre} - $${servicio.precio}`}>
                          {servicio.nombre} <span className="text-xs text-gray-400">${servicio.precio}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
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
                  {barberoEditando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionBarberosMejorada;
