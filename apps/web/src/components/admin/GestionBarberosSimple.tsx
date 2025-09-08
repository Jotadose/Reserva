/**
 * GESTIÓN COMPLETA DE BARBEROS - DATOS REALES
 */

import React, { useState } from "react";
import { User, Clock, Calendar, Edit3, Plus, Save, X, Trash2, Check } from "lucide-react";
import { Card, Button, Input } from "../ui";
import { useBarberos } from "../../hooks/useBarberos";

// Tipos de datos
interface BarberoEditado {
  nombre: string;
  email: string;
  telefono: string;
  horario_inicio: string;
  horario_fin: string;
  dias_trabajo: string[];
  especialidades: string[];
  activo: boolean;
}

// Días de la semana disponibles
const DIAS_SEMANA = [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
];

// Especialidades disponibles
const ESPECIALIDADES_DISPONIBLES = [
  'corte', 'barba', 'afeitado', 'afeitado_tradicional', 'bigote', 'coloracion', 'styling', 'diseno'
];

export const GestionBarberosSimple: React.FC = () => {
  const { barberos, loading, error, refetch } = useBarberos();
  const [editandoBarbero, setEditandoBarbero] = useState<string | null>(null);
  const [agregandoBarbero, setAgregandoBarbero] = useState(false);
  const [datosEditados, setDatosEditados] = useState<BarberoEditado>({
    nombre: '',
    email: '',
    telefono: '',
    horario_inicio: '09:00',
    horario_fin: '18:00',
    dias_trabajo: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    especialidades: ['corte'],
    activo: true
  });

  // Función para actualizar barbero
  const handleActualizarBarbero = async (barberoId: string) => {
    try {
      const response = await fetch(`/api/consolidated?type=barberos&id=${barberoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEditados)
      });

      if (response.ok) {
        setEditandoBarbero(null);
        refetch && refetch(); // Recargar datos
        alert('Barbero actualizado exitosamente');
      } else {
        alert('Error al actualizar barbero');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar barbero');
    }
  };

  // Función para agregar barbero
  const handleAgregarBarbero = async () => {
    try {
      const response = await fetch('/api/consolidated?type=barberos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEditados)
      });

      if (response.ok) {
        setAgregandoBarbero(false);
        setDatosEditados({
          nombre: '',
          email: '',
          telefono: '',
          horario_inicio: '09:00',
          horario_fin: '18:00',
          dias_trabajo: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
          especialidades: ['corte'],
          activo: true
        });
        refetch && refetch(); // Recargar datos
        alert('Barbero agregado exitosamente');
      } else {
        alert('Error al agregar barbero');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar barbero');
    }
  };

  // Función para cambiar estado activo/inactivo
  const handleToggleActivo = async (barberoId: string, nuevoEstado: boolean) => {
    try {
      const response = await fetch(`/api/consolidated?type=barberos&id=${barberoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado })
      });

      if (response.ok) {
        refetch && refetch(); // Recargar datos
        alert(`Barbero ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      } else {
        alert('Error al cambiar estado del barbero');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar estado del barbero');
    }
  };

  // Función para eliminar barbero
  const handleEliminarBarbero = async (barberoId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este barbero?')) {
      try {
        const response = await fetch(`/api/consolidated?type=barberos&id=${barberoId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          refetch && refetch(); // Recargar datos
          alert('Barbero eliminado exitosamente');
        } else {
          alert('Error al eliminar barbero');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar barbero');
      }
    }
  };

  // Función para iniciar edición
  const handleIniciarEdicion = (barbero: any) => {
    setEditandoBarbero(barbero.id_barbero);
    setDatosEditados({
      nombre: barbero.nombre,
      email: barbero.email,
      telefono: barbero.telefono || '',
      horario_inicio: barbero.horario_inicio.slice(0, 5),
      horario_fin: barbero.horario_fin.slice(0, 5),
      dias_trabajo: barbero.dias_trabajo,
      especialidades: barbero.especialidades,
      activo: barbero.activo
    });
  };

  // Toggle día de trabajo
  const handleToggleDiaTrabajo = (dia: string) => {
    setDatosEditados(prev => ({
      ...prev,
      dias_trabajo: prev.dias_trabajo.includes(dia)
        ? prev.dias_trabajo.filter(d => d !== dia)
        : [...prev.dias_trabajo, dia]
    }));
  };

  // Toggle especialidad
  const handleToggleEspecialidad = (especialidad: string) => {
    setDatosEditados(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidad)
        ? prev.especialidades.filter(e => e !== especialidad)
        : [...prev.especialidades, especialidad]
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-white">Cargando barberos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  // Formulario de edición/agregar barbero
  const renderFormularioBarbero = (esNuevo: boolean = false) => (
    <Card className="bg-gray-800 border-gray-700 p-6 mb-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        {esNuevo ? 'Agregar Nuevo Barbero' : 'Editar Barbero'}
      </h3>

      <div className="space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
            <Input
              value={datosEditados.nombre}
              onChange={(e) => setDatosEditados(prev => ({ ...prev, nombre: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Nombre completo del barbero"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <Input
              type="email"
              value={datosEditados.email}
              onChange={(e) => setDatosEditados(prev => ({ ...prev, email: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
            <Input
              value={datosEditados.telefono}
              onChange={(e) => setDatosEditados(prev => ({ ...prev, telefono: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="+56999999999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <select
              value={datosEditados.activo ? 'activo' : 'inactivo'}
              onChange={(e) => setDatosEditados(prev => ({ ...prev, activo: e.target.value === 'activo' }))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Horarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Hora de inicio</label>
            <Input
              type="time"
              value={datosEditados.horario_inicio}
              onChange={(e) => setDatosEditados(prev => ({ ...prev, horario_inicio: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Hora de fin</label>
            <Input
              type="time"
              value={datosEditados.horario_fin}
              onChange={(e) => setDatosEditados(prev => ({ ...prev, horario_fin: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Días de trabajo */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Días de trabajo</label>
          <div className="flex flex-wrap gap-2">
            {DIAS_SEMANA.map((dia) => (
              <button
                key={dia}
                type="button"
                onClick={() => handleToggleDiaTrabajo(dia)}
                className={`px-3 py-1 text-sm rounded ${
                  datosEditados.dias_trabajo.includes(dia)
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Especialidades */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Especialidades</label>
          <div className="flex flex-wrap gap-2">
            {ESPECIALIDADES_DISPONIBLES.map((especialidad) => (
              <button
                key={especialidad}
                type="button"
                onClick={() => handleToggleEspecialidad(especialidad)}
                className={`px-3 py-1 text-sm rounded ${
                  datosEditados.especialidades.includes(especialidad)
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {especialidad.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3">
          <Button
            onClick={() => {
              setEditandoBarbero(null);
              setAgregandoBarbero(false);
            }}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={esNuevo ? handleAgregarBarbero : () => handleActualizarBarbero(editandoBarbero!)}
            className="bg-yellow-500 text-black hover:bg-yellow-400"
          >
            <Save className="w-4 h-4 mr-2" />
            {esNuevo ? 'Agregar' : 'Guardar'}
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Barberos</h2>
          <p className="text-gray-400">{barberos.length} barberos registrados</p>
        </div>
        <Button
          onClick={() => setAgregandoBarbero(true)}
          className="bg-yellow-500 text-black hover:bg-yellow-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Barbero
        </Button>
      </div>

      {/* Formulario para agregar barbero */}
      {agregandoBarbero && renderFormularioBarbero(true)}

      {/* Lista de barberos */}
      <div className="grid gap-4">
        {barberos.map((barbero) => (
          <Card key={barbero.id_barbero} className="bg-gray-800 border-gray-700 p-6">
            {editandoBarbero === barbero.id_barbero ? (
              renderFormularioBarbero(false)
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-yellow-500 rounded-full p-3">
                      <User className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {barbero.nombre}
                      </h3>
                      <p className="text-gray-400">{barbero.email}</p>
                      {barbero.telefono && (
                        <p className="text-gray-400 text-sm">{barbero.telefono}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className={`px-2 py-1 text-xs rounded ${barbero.activo ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
                    >
                      {barbero.activo ? "Activo" : "Inactivo"}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        onClick={() => handleIniciarEdicion(barbero)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleToggleActivo(barbero.id_barbero, !barbero.activo)}
                        size="sm"
                        className={barbero.activo ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
                      >
                        {barbero.activo ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => handleEliminarBarbero(barbero.id_barbero)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Horario</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {barbero.horario_inicio} - {barbero.horario_fin}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Días de trabajo</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {barbero.dias_trabajo.map((dia) => (
                        <span
                          key={dia}
                          className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                        >
                          {dia.charAt(0).toUpperCase() + dia.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {barbero.especialidades.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-300 mb-2">Especialidades</p>
                    <div className="flex flex-wrap gap-2">
                      {barbero.especialidades.map((especialidad) => (
                        <span
                          key={especialidad}
                          className="px-2 py-1 text-xs bg-yellow-500 text-black rounded"
                        >
                          {especialidad.replace('_', ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{barbero.total_cortes}</p>
                    <p className="text-xs text-gray-400">Total cortes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {barbero.calificacion_promedio.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400">Calificación</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{barbero.tiempo_descanso}m</p>
                    <p className="text-xs text-gray-400">Descanso</p>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
