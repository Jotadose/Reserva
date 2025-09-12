/**
 * ===================================================================
 * CONFIGURACIÓN AVANZADA DE SERVICIOS - CONTROL SUPREMO
 * ===================================================================
 *
 * Panel supremo para servicios con funcionalidades avanzadas:
 * - Categorías y subcategorías
 * - Precios dinámicos por barbero/horario
 * - Duración flexible y buffers
 * - Combos y paquetes especiales
 * - Análisis de popularidad y rentabilidad
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Scissors,
  Tag,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Save,
  Star,
  BarChart3,
} from "lucide-react";

import { Button, Card, Badge, Input, Select, EmptyState, Alert } from "../ui";

import { useToast } from "../../contexts/ToastContext";

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  precios: {
    base: number;
    barberos: { [barberoId: string]: number };
    horarios: {
      normal: number;
      premium: number; // viernes/sábado
      especial: number; // feriados
    };
  };
  duracion: {
    minima: number;
    promedio: number;
    maxima: number;
    buffer: number; // tiempo extra entre servicios
  };
  requisitos: {
    experienciaMinima: "junior" | "senior" | "master";
    herramientasEspeciales: string[];
    preparacionMinutos: number;
  };
  popularidad: {
    reservasMes: number;
    satisfaccionPromedio: number;
    tendencia: "subiendo" | "estable" | "bajando";
  };
  configuracion: {
    activo: boolean;
    visible: boolean;
    reservaOnline: boolean;
    requiereConsulta: boolean;
    descuentos: {
      primeraVez: number;
      frecuente: number;
      combo: number;
    };
  };
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  orden: number;
  activa: boolean;
}

type VistaServicios =
  | "lista"
  | "categorias"
  | "precios"
  | "combos"
  | "analiticas";

// ===================================================================
// DATOS SIMULADOS
// ===================================================================

const categoriasMock: Categoria[] = [
  {
    id: "1",
    nombre: "Cortes de Cabello",
    descripcion: "Cortes clásicos y modernos",
    icono: "scissors",
    color: "blue",
    orden: 1,
    activa: true,
  },
  {
    id: "2",
    nombre: "Arreglo de Barba",
    descripcion: "Perfilado y cuidado de barba",
    icono: "user",
    color: "green",
    orden: 2,
    activa: true,
  },
  {
    id: "3",
    nombre: "Servicios Premium",
    descripcion: "Tratamientos especializados",
    icono: "star",
    color: "purple",
    orden: 3,
    activa: true,
  },
];

const serviciosMock: Servicio[] = [
  {
    id: "1",
    nombre: "Corte Clásico",
    descripcion: "Corte tradicional con tijera y máquina",
    categoria: "Cortes de Cabello",
    subcategoria: "Clásicos",
    precios: {
      base: 15000,
      barberos: {
        "1": 18000, // Michael (premium)
        "2": 15000, // Carlos (standard)
      },
      horarios: {
        normal: 15000,
        premium: 18000,
        especial: 20000,
      },
    },
    duracion: {
      minima: 25,
      promedio: 35,
      maxima: 45,
      buffer: 5,
    },
    requisitos: {
      experienciaMinima: "junior",
      herramientasEspeciales: ["tijeras", "maquina"],
      preparacionMinutos: 5,
    },
    popularidad: {
      reservasMes: 89,
      satisfaccionPromedio: 4.6,
      tendencia: "estable",
    },
    configuracion: {
      activo: true,
      visible: true,
      reservaOnline: true,
      requiereConsulta: false,
      descuentos: {
        primeraVez: 10,
        frecuente: 5,
        combo: 15,
      },
    },
  },
  {
    id: "2",
    nombre: "Corte + Barba Premium",
    descripcion: "Servicio completo con productos premium",
    categoria: "Servicios Premium",
    precios: {
      base: 25000,
      barberos: {
        "1": 30000,
        "2": 25000,
      },
      horarios: {
        normal: 25000,
        premium: 30000,
        especial: 35000,
      },
    },
    duracion: {
      minima: 45,
      promedio: 60,
      maxima: 75,
      buffer: 10,
    },
    requisitos: {
      experienciaMinima: "senior",
      herramientasEspeciales: ["navaja", "productos-premium"],
      preparacionMinutos: 10,
    },
    popularidad: {
      reservasMes: 67,
      satisfaccionPromedio: 4.9,
      tendencia: "subiendo",
    },
    configuracion: {
      activo: true,
      visible: true,
      reservaOnline: true,
      requiereConsulta: true,
      descuentos: {
        primeraVez: 15,
        frecuente: 8,
        combo: 20,
      },
    },
  },
  {
    id: "3",
    nombre: "Arreglo de Barba",
    descripcion: "Perfilado y cuidado de barba",
    categoria: "Arreglo de Barba",
    precios: {
      base: 12000,
      barberos: {
        "1": 15000,
        "2": 12000,
      },
      horarios: {
        normal: 12000,
        premium: 14000,
        especial: 16000,
      },
    },
    duracion: {
      minima: 20,
      promedio: 30,
      maxima: 40,
      buffer: 5,
    },
    requisitos: {
      experienciaMinima: "junior",
      herramientasEspeciales: ["navaja", "aceites"],
      preparacionMinutos: 5,
    },
    popularidad: {
      reservasMes: 45,
      satisfaccionPromedio: 4.4,
      tendencia: "bajando",
    },
    configuracion: {
      activo: true,
      visible: true,
      reservaOnline: true,
      requiereConsulta: false,
      descuentos: {
        primeraVez: 8,
        frecuente: 5,
        combo: 12,
      },
    },
  },
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const ConfiguracionServiciosAvanzada: React.FC = () => {
  const [vista, setVista] = useState<VistaServicios>("lista");
  const [servicios, setServicios] = useState<Servicio[]>(serviciosMock);
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasMock);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<
    string | null
  >(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    categoria: "todas",
    estado: "todos",
    busqueda: "",
  });
  const { showToast } = useToast();

  const servicioActual = useMemo(
    () => servicios.find((s) => s.id === servicioSeleccionado),
    [servicios, servicioSeleccionado]
  );

  // Servicios filtrados memoizados
  const serviciosFiltrados = useMemo(() => {
    return servicios.filter(servicio => {
      const matchCategoria = filtros.categoria === "todas" || servicio.categoria === filtros.categoria;
      const matchEstado = filtros.estado === "todos" || 
        (filtros.estado === "activos" && servicio.configuracion.activo) ||
        (filtros.estado === "inactivos" && !servicio.configuracion.activo);
      const matchBusqueda = filtros.busqueda === "" || 
        servicio.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        servicio.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
      
      return matchCategoria && matchEstado && matchBusqueda;
    });
  }, [servicios, filtros]);

  // Estadísticas memoizadas
  const estadisticas = useMemo(() => {
    const serviciosActivos = servicios.filter(s => s.configuracion.activo);
    const ingresosTotales = servicios.reduce(
      (total, s) => total + s.precios.base * s.popularidad.reservasMes,
      0
    );
    const satisfaccionPromedio = servicios.reduce(
      (total, s) => total + s.popularidad.satisfaccionPromedio,
      0
    ) / servicios.length;
    const reservasTotales = servicios.reduce(
      (total, s) => total + s.popularidad.reservasMes,
      0
    );

    return {
      serviciosActivos: serviciosActivos.length,
      ingresosTotales,
      satisfaccionPromedio,
      reservasTotales
    };
  }, [servicios]);

  // Handlers memoizados
  const handleFiltroChange = useCallback((campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleEditarServicio = useCallback((servicioId: string) => {
    setServicioSeleccionado(servicioId);
    setEditando(servicioId);
  }, []);

  const handleEliminarServicio = useCallback((servicioId: string) => {
    setServicios(prev => prev.filter(s => s.id !== servicioId));
    showToast({
      title: "Servicio eliminado",
      message: "El servicio ha sido eliminado correctamente",
      type: "success"
    });
  }, [showToast]);

  const handleToggleActivo = useCallback((servicioId: string) => {
    setServicios((prev) =>
      prev.map((s) =>
        s.id === servicioId
          ? {
              ...s,
              configuracion: {
                ...s.configuracion,
                activo: !s.configuracion.activo,
              },
            }
          : s
      )
    );
    showToast({
      title: "Servicio actualizado",
      message: "El estado del servicio ha sido modificado",
      type: "success",
    });
  }, [showToast]);

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case "subiendo":
        return "text-green-400";
      case "bajando":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case "subiendo":
        return "↗️";
      case "bajando":
        return "↘️";
      default:
        return "→";
    }
  };

  const renderListaServicios = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">
            Configuración de Servicios
          </h3>
          <p className="text-slate-400">
            {servicios.length} servicios configurados
          </p>
        </div>
        <Button variant="primary" icon={Plus}>
          Nuevo Servicio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {serviciosFiltrados.map((servicio) => (
          <Card key={servicio.id} padding="lg">
            <div className="space-y-4">
              {/* Header del servicio */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white">
                    {servicio.nombre}
                  </h4>
                  <p className="text-slate-400 text-sm">{servicio.categoria}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        servicio.configuracion.activo ? "success" : "danger"
                      }
                    >
                      {servicio.configuracion.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge variant="secondary">
                      {servicio.popularidad.reservasMes} reservas/mes
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                    onClick={() => handleEditarServicio(servicio.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={servicio.configuracion.activo ? Trash2 : Star}
                    onClick={() => handleToggleActivo(servicio.id)}
                  />
                </div>
              </div>

              {/* Precios y duración */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Precio base:
                  </span>
                  <span className="text-white font-medium">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    }).format(servicio.precios.base)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Duración:
                  </span>
                  <span className="text-white">
                    {servicio.duracion.promedio} min
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Satisfacción:
                  </span>
                  <span className="text-yellow-400">
                    {servicio.popularidad.satisfaccionPromedio}/5
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Tendencia:
                  </span>
                  <span
                    className={`${getTendenciaColor(
                      servicio.popularidad.tendencia
                    )} flex items-center gap-1`}
                  >
                    {getTendenciaIcon(servicio.popularidad.tendencia)}
                    {servicio.popularidad.tendencia}
                  </span>
                </div>
              </div>

              {/* Configuración rápida */}
              <div className="pt-3 border-t border-slate-700">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={`p-2 rounded ${
                      servicio.configuracion.reservaOnline
                        ? "bg-green-900/20 text-green-400"
                        : "bg-red-900/20 text-red-400"
                    }`}
                  >
                    Reserva Online:{" "}
                    {servicio.configuracion.reservaOnline ? "Sí" : "No"}
                  </div>
                  <div
                    className={`p-2 rounded ${
                      servicio.configuracion.requiereConsulta
                        ? "bg-yellow-900/20 text-yellow-400"
                        : "bg-green-900/20 text-green-400"
                    }`}
                  >
                    Consulta:{" "}
                    {servicio.configuracion.requiereConsulta
                      ? "Requerida"
                      : "No"}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCategorias = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">
            Gestión de Categorías
          </h3>
          <p className="text-slate-400">
            {categorias.length} categorías definidas
          </p>
        </div>
        <Button variant="primary" icon={Plus}>
          Nueva Categoría
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((categoria) => (
          <Card key={categoria.id} padding="lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 bg-${categoria.color}-600 rounded-full flex items-center justify-center`}
                >
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    {categoria.nombre}
                  </h4>
                  <p className="text-slate-400 text-sm">
                    {categoria.descripcion}
                  </p>
                </div>
              </div>
              <Badge variant={categoria.activa ? "success" : "danger"}>
                {categoria.activa ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-slate-400">
                Servicios:{" "}
                {
                  servicios.filter((s) => s.categoria === categoria.nombre)
                    .length
                }
              </span>
              <span className="text-slate-400">Orden: {categoria.orden}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnaliticas = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">
          Analíticas de Servicios
        </h3>
        <p className="text-slate-400">Análisis de rendimiento y popularidad</p>
      </div>

      {/* Métricas globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card padding="lg">
          <div className="text-center">
            <Scissors className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {estadisticas.serviciosActivos}
            </div>
            <div className="text-slate-400">Servicios Activos</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                minimumFractionDigits: 0,
              }).format(estadisticas.ingresosTotales)}
            </div>
            <div className="text-slate-400">Ingresos Estimados</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {estadisticas.satisfaccionPromedio.toFixed(1)}
            </div>
            <div className="text-slate-400">Satisfacción Promedio</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {estadisticas.reservasTotales}
            </div>
            <div className="text-slate-400">Reservas Totales</div>
          </div>
        </Card>
      </div>

      {/* Top servicios */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Servicios Más Populares
        </h4>
        <div className="space-y-3">
          {servicios
            .sort(
              (a, b) => b.popularidad.reservasMes - a.popularidad.reservasMes
            )
            .slice(0, 5)
            .map((servicio, index) => (
              <div
                key={servicio.id}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="font-medium text-white">
                      {servicio.nombre}
                    </h5>
                    <p className="text-slate-400 text-sm">
                      {servicio.categoria}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {servicio.popularidad.reservasMes} reservas
                  </div>
                  <div className="text-yellow-400 text-sm">
                    {servicio.popularidad.satisfaccionPromedio}/5 ⭐
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );

  // Navegación principal
  const tabs = [
    { id: "lista", label: "Lista de Servicios", icon: Scissors },
    { id: "categorias", label: "Categorías", icon: Tag },
    { id: "precios", label: "Precios Dinámicos", icon: DollarSign },
    { id: "combos", label: "Combos y Paquetes", icon: Package },
    { id: "analiticas", label: "Analíticas", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setVista(tab.id as VistaServicios)}
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
      {vista === "lista" && renderListaServicios()}
      {vista === "categorias" && renderCategorias()}
      {vista === "analiticas" && renderAnaliticas()}

      {(vista === "precios" || vista === "combos") && (
        <div className="p-6">
          <EmptyState
            icon={vista === "precios" ? DollarSign : Package}
            title={`${
              vista === "precios" ? "Precios Dinámicos" : "Combos y Paquetes"
            }`}
            description={`Panel de ${vista} en desarrollo...`}
          />
        </div>
      )}
    </div>
  );
};

export default ConfiguracionServiciosAvanzada;
