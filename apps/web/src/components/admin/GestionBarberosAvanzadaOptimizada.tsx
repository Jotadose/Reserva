/**
 * ===================================================================
 * GESTIÓN AVANZADA DE BARBEROS - OPTIMIZADA
 * ===================================================================
 */

import React, { useState, useMemo } from "react";
import {
  User,
  Clock,
  Calendar,
  Coffee,
  Plane,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Check,
} from "lucide-react";

import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  LoadingSpinner,
  EmptyState,
} from "../ui";

import { useToast } from "../../contexts/ToastContext";
import useBarberos from "../../hooks/useBarberos";

// ===================================================================
// TIPOS E INTERFACES OPTIMIZADAS
// ===================================================================

interface BarberoForm {
  nombre: string;
  email: string;
  telefono: string;
  horario_inicio: string;
  horario_fin: string;
  dias_trabajo: string[];
  especialidades: string[];
  activo: boolean;
}

type VistaGestion = "lista" | "horarios" | "metricas" | "descansos" | "vacaciones";

// ===================================================================
// COMPONENTE PRINCIPAL OPTIMIZADO
// ===================================================================

export const GestionBarberosAvanzadaOptimizada: React.FC = () => {
  const [vista, setVista] = useState<VistaGestion>("lista");
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string | null>(null);
  
  const { 
    barberos, 
    loading, 
    error,
    crearBarbero,
    actualizarBarbero,
    refetch
  } = useBarberos();
  
  const { addToast } = useToast();

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleCrearBarbero = async (formData: BarberoForm) => {
    try {
      await crearBarbero(formData);
      setMostrandoFormulario(false);
      await refetch();
      addToast({
        title: "Barbero creado",
        message: "El nuevo barbero ha sido registrado exitosamente",
        type: "success",
      });
    } catch (error) {
      console.error('Error al crear barbero:', error);
      addToast({
        title: "Error",
        message: "No se pudo crear el barbero. Revisa los datos e intenta nuevamente.",
        type: "error",
      });
    }
  };

  const handleToggleActivo = async (barberoId: string) => {
    try {
      const barbero = barberos.find(b => b.id_barbero === barberoId);
      if (barbero) {
        await actualizarBarbero(barberoId, { activo: !barbero.activo });
        await refetch();
        addToast({
          title: "Estado actualizado",
          message: "El estado del barbero ha sido modificado",
          type: "success",
        });
      }
    } catch (error) {
      console.error('Error al actualizar barbero:', error);
      addToast({
        title: "Error",
        message: "No se pudo actualizar el estado del barbero",
        type: "error",
      });
    }
  };

  // ===================================================================
  // COMPONENTES DE RENDER
  // ===================================================================

  const FormularioNuevoBarbero = () => {
    const [formData, setFormData] = useState<BarberoForm>({
      nombre: '',
      email: '',
      telefono: '',
      horario_inicio: '09:00',
      horario_fin: '18:00',
      dias_trabajo: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
      especialidades: ['corte'],
      activo: true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCrearBarbero(formData);
    };

    return (
      <Card padding="lg" className="mb-6 border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-400" />
            Nuevo Barbero
          </h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMostrandoFormulario(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre completo *
              </label>
              <Input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Juan Pérez"
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="juan@barberia.com"
                required
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Teléfono
              </label>
              <Input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+56912345678"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Estado inicial
              </label>
              <select
                value={formData.activo ? 'activo' : 'inactivo'}
                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.value === 'activo' }))}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hora inicio
              </label>
              <Input
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_inicio: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hora fin
              </label>
              <Input
                type="time"
                value={formData.horario_fin}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_fin: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-slate-600">
            <Button type="submit" variant="primary" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Crear Barbero
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setMostrandoFormulario(false)}
              className="px-6"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    );
  };

  const ListaBarberos = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-400">Error: {error}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Reintentar
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Gestión de Barberos</h3>
            <p className="text-slate-400">
              {barberos.length} barbero{barberos.length !== 1 ? 's' : ''} registrado{barberos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setMostrandoFormulario(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Barbero
          </Button>
        </div>

        {mostrandoFormulario && <FormularioNuevoBarbero />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {barberos.map((barbero) => (
            <Card key={barbero.id_barbero} padding="lg" className="hover:border-blue-500/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">{barbero.nombre}</h4>
                    <p className="text-slate-400 text-sm">{barbero.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={barbero.activo ? "success" : "danger"}>
                        {barbero.activo ? "Activo" : "Inactivo"}
                      </Badge>
                      <span className="text-slate-400 text-xs">
                        {barbero.total_cortes || 0} cortes realizados
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActivo(barbero.id_barbero)}
                  className={barbero.activo ? "text-orange-400 hover:text-orange-300" : "text-green-400 hover:text-green-300"}
                >
                  {barbero.activo ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  {barbero.activo ? "Desactivar" : "Activar"}
                </Button>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-sm text-slate-400">Horario</div>
                    <div className="font-medium text-white">
                      {barbero.horario_inicio?.slice(0, 5)} - {barbero.horario_fin?.slice(0, 5)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Días de trabajo</div>
                    <div className="font-medium text-white">
                      {barbero.dias_trabajo?.length || 0} días
                    </div>
                  </div>
                </div>
                
                {barbero.especialidades && barbero.especialidades.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm text-slate-400 mb-1">Especialidades</div>
                    <div className="flex flex-wrap gap-1">
                      {barbero.especialidades.map((especialidad, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                        >
                          {especialidad}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {barberos.length === 0 && (
          <EmptyState
            icon={User}
            title="No hay barberos registrados"
            description="Comienza agregando el primer barbero a tu sistema"
          />
        )}
      </div>
    );
  };

  // ===================================================================
  // NAVEGACIÓN Y RENDER PRINCIPAL
  // ===================================================================

  const tabs = [
    { id: "lista", label: "Lista de Barberos", icon: User },
    { id: "horarios", label: "Horarios", icon: Clock },
    { id: "descansos", label: "Descansos", icon: Coffee },
    { id: "vacaciones", label: "Vacaciones", icon: Plane },
    { id: "metricas", label: "Métricas", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setVista(tab.id as VistaGestion)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md transition-all
              ${
                vista === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {vista === "lista" && <ListaBarberos />}
      
      {vista !== "lista" && (
        <div className="p-8">
          <EmptyState
            icon={vista === "horarios" ? Clock : vista === "descansos" ? Coffee : vista === "vacaciones" ? Plane : TrendingUp}
            title={`Gestión de ${tabs.find(t => t.id === vista)?.label}`}
            description={`Panel de ${vista} en desarrollo...`}
          />
        </div>
      )}
    </div>
  );
};

export default GestionBarberosAvanzadaOptimizada;
