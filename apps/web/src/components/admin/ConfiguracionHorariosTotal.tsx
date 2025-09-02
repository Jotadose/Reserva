/**
 * ===================================================================
 * CONFIGURACIÓN DE HORARIOS Y DISPONIBILIDAD - CONTROL ABSOLUTO
 * ===================================================================
 *
 * Panel supremo para configuración de horarios con funcionalidades avanzadas:
 * - Horarios flexibles por barbero y día
 * - Gestión de disponibilidad en tiempo real
 * - Configuración de bloques especiales
 * - Feriados y días especiales
 * - Análisis de ocupación y optimización
 */

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Users,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Button, Card, Badge, Input, Select, EmptyState } from "../ui";

import { useToast } from "../../contexts/ToastContext";

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface HorarioBase {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  tipo: "barbero" | "general" | "especial";
}

interface HorarioBarbero extends HorarioBase {
  barberoId: string;
  configuracion: {
    [dia: string]: {
      activo: boolean;
      horarios: BloqueHorario[];
      descansos: Descanso[];
      notas?: string;
    };
  };
}

interface BloqueHorario {
  id: string;
  inicio: string; // HH:mm
  fin: string; // HH:mm
  tipo: "normal" | "premium" | "exclusivo";
  serviciosPermitidos: string[];
  duracionMinima: number;
  duracionMaxima: number;
  bufferAntes: number;
  bufferDespues: number;
  ocupacion?: {
    reservas: number;
    disponible: number;
    porcentaje: number;
  };
}

interface Descanso {
  id: string;
  inicio: string;
  fin: string;
  tipo: "almuerzo" | "descanso" | "personal";
  descripcion?: string;
}

interface DiaEspecial {
  id: string;
  fecha: string;
  nombre: string;
  tipo: "feriado" | "evento" | "cierre" | "promocion";
  configuracion: {
    cerrado: boolean;
    horarioEspecial?: {
      inicio: string;
      fin: string;
    };
    serviciosLimitados?: string[];
    tarifaEspecial?: number;
    notas?: string;
  };
}

type VistaHorarios =
  | "general"
  | "barberos"
  | "especiales"
  | "analiticas"
  | "optimizacion";

// ===================================================================
// DATOS SIMULADOS
// ===================================================================

const diasSemana = [
  { id: "lunes", nombre: "Lunes", abrev: "L" },
  { id: "martes", nombre: "Martes", abrev: "M" },
  { id: "miercoles", nombre: "Miércoles", abrev: "X" },
  { id: "jueves", nombre: "Jueves", abrev: "J" },
  { id: "viernes", nombre: "Viernes", abrev: "V" },
  { id: "sabado", nombre: "Sábado", abrev: "S" },
  { id: "domingo", nombre: "Domingo", abrev: "D" },
];

const horariosBarberoMock: HorarioBarbero[] = [
  {
    id: "1",
    nombre: "Horario Michael - Principal",
    descripcion: "Horario principal para Michael con servicios premium",
    activo: true,
    tipo: "barbero",
    barberoId: "1",
    configuracion: {
      lunes: {
        activo: true,
        horarios: [
          {
            id: "1",
            inicio: "09:00",
            fin: "13:00",
            tipo: "normal",
            serviciosPermitidos: ["todos"],
            duracionMinima: 30,
            duracionMaxima: 90,
            bufferAntes: 5,
            bufferDespues: 10,
            ocupacion: { reservas: 6, disponible: 8, porcentaje: 75 },
          },
          {
            id: "2",
            inicio: "14:00",
            fin: "19:00",
            tipo: "premium",
            serviciosPermitidos: ["todos"],
            duracionMinima: 30,
            duracionMaxima: 120,
            bufferAntes: 5,
            bufferDespues: 15,
            ocupacion: { reservas: 8, disponible: 10, porcentaje: 80 },
          },
        ],
        descansos: [
          {
            id: "1",
            inicio: "13:00",
            fin: "14:00",
            tipo: "almuerzo",
            descripcion: "Almuerzo",
          },
        ],
        notas: "Horario estándar con alta demanda",
      },
      martes: {
        activo: true,
        horarios: [
          {
            id: "3",
            inicio: "09:00",
            fin: "18:00",
            tipo: "normal",
            serviciosPermitidos: ["todos"],
            duracionMinima: 30,
            duracionMaxima: 90,
            bufferAntes: 5,
            bufferDespues: 10,
            ocupacion: { reservas: 12, disponible: 16, porcentaje: 75 },
          },
        ],
        descansos: [
          {
            id: "2",
            inicio: "13:00",
            fin: "14:00",
            tipo: "almuerzo",
          },
          {
            id: "3",
            inicio: "16:00",
            fin: "16:15",
            tipo: "descanso",
          },
        ],
      },
      miercoles: {
        activo: false,
        horarios: [],
        descansos: [],
        notas: "Día de descanso semanal",
      },
      jueves: {
        activo: true,
        horarios: [
          {
            id: "4",
            inicio: "10:00",
            fin: "19:00",
            tipo: "premium",
            serviciosPermitidos: ["corte-premium", "barba-premium"],
            duracionMinima: 45,
            duracionMaxima: 120,
            bufferAntes: 10,
            bufferDespues: 15,
            ocupacion: { reservas: 10, disponible: 12, porcentaje: 83 },
          },
        ],
        descansos: [
          {
            id: "4",
            inicio: "14:00",
            fin: "15:00",
            tipo: "almuerzo",
          },
        ],
      },
      viernes: {
        activo: true,
        horarios: [
          {
            id: "5",
            inicio: "09:00",
            fin: "20:00",
            tipo: "exclusivo",
            serviciosPermitidos: ["todos"],
            duracionMinima: 30,
            duracionMaxima: 150,
            bufferAntes: 10,
            bufferDespues: 20,
            ocupacion: { reservas: 18, disponible: 20, porcentaje: 90 },
          },
        ],
        descansos: [
          {
            id: "5",
            inicio: "14:00",
            fin: "15:00",
            tipo: "almuerzo",
          },
        ],
        notas: "Día de mayor demanda - servicios premium",
      },
      sabado: {
        activo: true,
        horarios: [
          {
            id: "6",
            inicio: "08:00",
            fin: "18:00",
            tipo: "exclusivo",
            serviciosPermitidos: ["todos"],
            duracionMinima: 30,
            duracionMaxima: 180,
            bufferAntes: 15,
            bufferDespues: 20,
            ocupacion: { reservas: 22, disponible: 24, porcentaje: 92 },
          },
        ],
        descansos: [
          {
            id: "6",
            inicio: "13:00",
            fin: "14:00",
            tipo: "almuerzo",
          },
        ],
        notas: "Día premium - tarifas especiales",
      },
      domingo: {
        activo: false,
        horarios: [],
        descansos: [],
        notas: "Cerrado",
      },
    },
  },
];

const diasEspecialesMock: DiaEspecial[] = [
  {
    id: "1",
    fecha: "2024-02-14",
    nombre: "San Valentín",
    tipo: "promocion",
    configuracion: {
      cerrado: false,
      horarioEspecial: {
        inicio: "08:00",
        fin: "20:00",
      },
      serviciosLimitados: ["corte-premium", "barba-premium"],
      tarifaEspecial: 20,
      notas: "Promoción especial parejas - 20% descuento",
    },
  },
  {
    id: "2",
    fecha: "2024-05-01",
    nombre: "Día del Trabajador",
    tipo: "feriado",
    configuracion: {
      cerrado: true,
      notas: "Feriado nacional - barbería cerrada",
    },
  },
  {
    id: "3",
    fecha: "2024-06-21",
    nombre: "Día del Padre",
    tipo: "promocion",
    configuracion: {
      cerrado: false,
      horarioEspecial: {
        inicio: "07:00",
        fin: "21:00",
      },
      tarifaEspecial: 15,
      notas: "Día del Padre - horario extendido",
    },
  },
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const ConfiguracionHorariosTotal: React.FC = () => {
  const [vista, setVista] = useState<VistaHorarios>("general");
  const [horariosBarbero, setHorariosBarbero] =
    useState<HorarioBarbero[]>(horariosBarberoMock);
  const [diasEspeciales, setDiasEspeciales] =
    useState<DiaEspecial[]>(diasEspecialesMock);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string>("1");
  const [editando, setEditando] = useState<string | null>(null);
  const { showToast } = useToast();

  const horarioActual = useMemo(
    () => horariosBarbero.find((h) => h.barberoId === barberoSeleccionado),
    [horariosBarbero, barberoSeleccionado]
  );

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "normal":
        return "bg-blue-600";
      case "premium":
        return "bg-purple-600";
      case "exclusivo":
        return "bg-yellow-600";
      default:
        return "bg-slate-600";
    }
  };

  const getOcupacionColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "text-red-400";
    if (porcentaje >= 75) return "text-yellow-400";
    if (porcentaje >= 50) return "text-green-400";
    return "text-slate-400";
  };

  const handleToggleDia = (dia: string) => {
    if (!horarioActual) return;

    setHorariosBarbero((prev) =>
      prev.map((h) =>
        h.id === horarioActual.id
          ? {
              ...h,
              configuracion: {
                ...h.configuracion,
                [dia]: {
                  ...h.configuracion[dia],
                  activo: !h.configuracion[dia].activo,
                },
              },
            }
          : h
      )
    );

    showToast({
      title: "Horario actualizado",
      message: `${dia} ${
        horarioActual.configuracion[dia].activo ? "desactivado" : "activado"
      }`,
      type: "success",
    });
  };

  const renderVistaGeneral = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">
            Configuración General de Horarios
          </h3>
          <p className="text-slate-400">
            Gestión centralizada de disponibilidad
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Copy}>
            Clonar Configuración
          </Button>
          <Button variant="primary" icon={Plus}>
            Nuevo Horario
          </Button>
        </div>
      </div>

      {/* Resumen de estado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card padding="lg">
          <div className="text-center">
            <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {horariosBarbero.filter((h) => h.activo).length}
            </div>
            <div className="text-slate-400">Horarios Activos</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {horariosBarbero.reduce((total, h) => {
                return (
                  total +
                  Object.values(h.configuracion).filter((c) => c.activo).length
                );
              }, 0)}
            </div>
            <div className="text-slate-400">Días Laborales</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {new Set(horariosBarbero.map((h) => h.barberoId)).size}
            </div>
            <div className="text-slate-400">Barberos Configurados</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {
                diasEspeciales.filter((d) => new Date(d.fecha) >= new Date())
                  .length
              }
            </div>
            <div className="text-slate-400">Días Especiales</div>
          </div>
        </Card>
      </div>

      {/* Vista calendario semanal */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">Vista Semanal Global</h4>
        <div className="grid grid-cols-8 gap-2">
          {/* Header */}
          <div className="font-medium text-slate-400 text-sm">Barbero</div>
          {diasSemana.map((dia) => (
            <div
              key={dia.id}
              className="font-medium text-slate-400 text-sm text-center"
            >
              {dia.abrev}
            </div>
          ))}

          {/* Filas de barberos */}
          {horariosBarbero.map((horario) => (
            <React.Fragment key={horario.id}>
              <div className="font-medium text-white text-sm py-2">
                {horario.nombre.split(" - ")[0]}
              </div>
              {diasSemana.map((dia) => {
                const config = horario.configuracion[dia.id];
                const isActive = config?.activo;
                const bloques = config?.horarios?.length || 0;

                return (
                  <div key={dia.id} className="text-center py-2">
                    {isActive ? (
                      <div className="space-y-1">
                        <Badge variant="success" size="sm">
                          {bloques} bloque{bloques !== 1 ? "s" : ""}
                        </Badge>
                        {config.horarios.map((bloque) => (
                          <div
                            key={bloque.id}
                            className="text-xs text-slate-400"
                          >
                            {bloque.inicio}-{bloque.fin}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="danger" size="sm">
                        Cerrado
                      </Badge>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderVistaBarberos = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">
            Configuración por Barbero
          </h3>
          <p className="text-slate-400">
            Horarios personalizados y disponibilidad detallada
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={barberoSeleccionado}
            onChange={setBarberoSeleccionado}
            options={[
              { value: "1", label: "Michael Rodriguez" },
              { value: "2", label: "Carlos Martinez" },
            ]}
          />
          <Button variant="primary" icon={Plus}>
            Agregar Bloque
          </Button>
        </div>
      </div>

      {horarioActual && (
        <div className="space-y-6">
          {/* Header del barbero */}
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">
                  {horarioActual.nombre}
                </h4>
                <p className="text-slate-400">{horarioActual.descripcion}</p>
              </div>
              <Badge variant={horarioActual.activo ? "success" : "danger"}>
                {horarioActual.activo ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </Card>

          {/* Configuración por día */}
          <div className="grid grid-cols-1 gap-6">
            {diasSemana.map((dia) => {
              const config = horarioActual.configuracion[dia.id];
              const isActive = config?.activo;

              return (
                <Card key={dia.id} padding="lg">
                  <div className="space-y-4">
                    {/* Header del día */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h5 className="font-medium text-white">{dia.nombre}</h5>
                        <button
                          onClick={() => handleToggleDia(dia.id)}
                          className={`w-12 h-6 rounded-full transition-all ${
                            isActive ? "bg-green-600" : "bg-slate-600"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-all ${
                              isActive ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      {isActive && (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" icon={Plus}>
                            Agregar Bloque
                          </Button>
                          <Button variant="ghost" size="sm" icon={Edit3}>
                            Editar
                          </Button>
                        </div>
                      )}
                    </div>

                    {isActive ? (
                      <div className="space-y-4">
                        {/* Bloques de horario */}
                        {config.horarios.length > 0 ? (
                          <div className="space-y-3">
                            <h6 className="text-sm font-medium text-slate-400">
                              Bloques de Horario
                            </h6>
                            {config.horarios.map((bloque) => (
                              <div
                                key={bloque.id}
                                className="p-4 bg-slate-700/50 rounded-lg"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                      <span className="text-white font-medium">
                                        {bloque.inicio} - {bloque.fin}
                                      </span>
                                      <Badge
                                        variant="secondary"
                                        className={getTipoColor(bloque.tipo)}
                                      >
                                        {bloque.tipo}
                                      </Badge>
                                      {bloque.ocupacion && (
                                        <span
                                          className={`text-sm ${getOcupacionColor(
                                            bloque.ocupacion.porcentaje
                                          )}`}
                                        >
                                          {bloque.ocupacion.porcentaje}% ocupado
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                      Duración: {bloque.duracionMinima}-
                                      {bloque.duracionMaxima} min • Buffer:{" "}
                                      {bloque.bufferAntes}min antes,{" "}
                                      {bloque.bufferDespues}min después
                                    </div>
                                    {bloque.ocupacion && (
                                      <div className="text-sm text-slate-300">
                                        {bloque.ocupacion.reservas} reservas de{" "}
                                        {bloque.ocupacion.disponible} slots
                                        disponibles
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={Edit3}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={Trash2}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            No hay bloques configurados para este día
                          </div>
                        )}

                        {/* Descansos */}
                        {config.descansos.length > 0 && (
                          <div className="space-y-3">
                            <h6 className="text-sm font-medium text-slate-400">
                              Descansos
                            </h6>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {config.descansos.map((descanso) => (
                                <div
                                  key={descanso.id}
                                  className="p-3 bg-slate-700/30 rounded-lg"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="text-white text-sm font-medium">
                                        {descanso.inicio} - {descanso.fin}
                                      </div>
                                      <div className="text-slate-400 text-xs capitalize">
                                        {descanso.tipo}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={Trash2}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notas */}
                        {config.notas && (
                          <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                            <div className="text-blue-400 text-sm font-medium mb-1">
                              Notas del día:
                            </div>
                            <div className="text-blue-300 text-sm">
                              {config.notas}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                        <div className="text-slate-400">Día no laborable</div>
                        <div className="text-slate-500 text-sm">
                          {config.notas || "Sin notas"}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderDiasEspeciales = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Días Especiales</h3>
          <p className="text-slate-400">
            Feriados, promociones y configuraciones especiales
          </p>
        </div>
        <Button variant="primary" icon={Plus}>
          Agregar Día Especial
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {diasEspeciales.map((dia) => (
          <Card key={dia.id} padding="lg">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white">{dia.nombre}</h4>
                  <p className="text-slate-400">
                    {new Date(dia.fecha).toLocaleDateString("es-CL")}
                  </p>
                  <Badge
                    variant={
                      dia.tipo === "feriado"
                        ? "danger"
                        : dia.tipo === "promocion"
                        ? "success"
                        : dia.tipo === "evento"
                        ? "warning"
                        : "secondary"
                    }
                    className="mt-2"
                  >
                    {dia.tipo}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" icon={Edit3} />
                  <Button variant="ghost" size="sm" icon={Trash2} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estado:</span>
                  <Badge
                    variant={dia.configuracion.cerrado ? "danger" : "success"}
                  >
                    {dia.configuracion.cerrado ? "Cerrado" : "Abierto"}
                  </Badge>
                </div>

                {!dia.configuracion.cerrado &&
                  dia.configuracion.horarioEspecial && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Horario especial:</span>
                      <span className="text-white">
                        {dia.configuracion.horarioEspecial.inicio} -{" "}
                        {dia.configuracion.horarioEspecial.fin}
                      </span>
                    </div>
                  )}

                {dia.configuracion.tarifaEspecial && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tarifa especial:</span>
                    <span className="text-green-400">
                      {dia.configuracion.tarifaEspecial > 0 ? "+" : ""}
                      {dia.configuracion.tarifaEspecial}%
                    </span>
                  </div>
                )}

                {dia.configuracion.serviciosLimitados && (
                  <div>
                    <span className="text-slate-400">Servicios limitados:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dia.configuracion.serviciosLimitados.map(
                        (servicio, index) => (
                          <Badge key={index} variant="secondary" size="sm">
                            {servicio}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

                {dia.configuracion.notas && (
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-slate-300 text-sm">
                      {dia.configuracion.notas}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnaliticas = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Analíticas de Horarios</h3>
        <p className="text-slate-400">Análisis de ocupación y optimización</p>
      </div>

      {/* Métricas globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card padding="lg">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">78%</div>
            <div className="text-slate-400">Ocupación Promedio</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">156</div>
            <div className="text-slate-400">Horas Semanales</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">92%</div>
            <div className="text-slate-400">Eficiencia Viernes</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <Clock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">45</div>
            <div className="text-slate-400">Min. Promedio/Servicio</div>
          </div>
        </Card>
      </div>

      {/* Análisis por día */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Ocupación por Día de la Semana
        </h4>
        <div className="space-y-4">
          {diasSemana.map((dia) => {
            // Simular datos de ocupación
            const ocupacion = Math.floor(Math.random() * 40) + 60; // 60-100%
            const color = getOcupacionColor(ocupacion);

            return (
              <div
                key={dia.id}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {dia.abrev}
                  </div>
                  <span className="text-white font-medium">{dia.nombre}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        ocupacion >= 90
                          ? "bg-red-400"
                          : ocupacion >= 75
                          ? "bg-yellow-400"
                          : "bg-green-400"
                      }`}
                      style={{ width: `${ocupacion}%` }}
                    />
                  </div>
                  <span className={`font-medium ${color}`}>{ocupacion}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recomendaciones */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Recomendaciones de Optimización
        </h4>
        <div className="space-y-3">
          <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <div className="text-yellow-400 font-medium">
                  Alta demanda los viernes
                </div>
                <div className="text-yellow-300 text-sm">
                  Considera extender horarios o agregar otro barbero los viernes
                  por la tarde
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <div className="text-green-400 font-medium">
                  Distribución equilibrada
                </div>
                <div className="text-green-300 text-sm">
                  Los martes y jueves tienen buena distribución de carga de
                  trabajo
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-blue-400 font-medium">
                  Oportunidad de crecimiento
                </div>
                <div className="text-blue-300 text-sm">
                  Los domingos podrían aprovecharse para servicios especiales o
                  promociones
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // Navegación principal
  const tabs = [
    { id: "general", label: "Vista General", icon: Calendar },
    { id: "barberos", label: "Por Barbero", icon: Users },
    { id: "especiales", label: "Días Especiales", icon: AlertTriangle },
    { id: "analiticas", label: "Analíticas", icon: BarChart3 },
    { id: "optimizacion", label: "Optimización", icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setVista(tab.id as VistaHorarios)}
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
      {vista === "general" && renderVistaGeneral()}
      {vista === "barberos" && renderVistaBarberos()}
      {vista === "especiales" && renderDiasEspeciales()}
      {vista === "analiticas" && renderAnaliticas()}

      {vista === "optimizacion" && (
        <div className="p-6">
          <EmptyState
            icon={Zap}
            title="Sistema de Optimización"
            description="Panel de optimización automática en desarrollo..."
          />
        </div>
      )}
    </div>
  );
};

export default ConfiguracionHorariosTotal;
