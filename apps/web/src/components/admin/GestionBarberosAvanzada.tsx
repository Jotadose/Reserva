/**
 * ===================================================================
 * GESTIÓN AVANZADA DE BARBEROS - CONTROL TOTAL
 * ===================================================================
 *
 * Panel supremo para gestionar barberos con poder absoluto:
 * - Horarios personalizados por barbero
 * - Gestión de descansos y breaks
 * - Vacaciones y días libres
 * - Productividad y métricas individuales
 * - Comisiones y pagos
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
  Alert,
} from "../ui";

import { useToast } from "../../contexts/ToastContext";

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface Barbero {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  horarioPersonalizado: HorarioSemanal;
  descansos: Descanso[];
  vacaciones: Vacacion[];
  comisiones: {
    porcentaje: number;
    serviciosEspeciales: { [key: string]: number };
  };
  metricas: {
    reservasCompletadas: number;
    ingresosMes: number;
    satisfaccionCliente: number;
    puntualidad: number;
  };
}

interface HorarioSemanal {
  lunes: HorarioDia;
  martes: HorarioDia;
  miercoles: HorarioDia;
  jueves: HorarioDia;
  viernes: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}

interface HorarioDia {
  activo: boolean;
  horaInicio: string;
  horaFin: string;
  descanso?: {
    horaInicio: string;
    horaFin: string;
  };
}

interface Descanso {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  aprobado: boolean;
}

interface Vacacion {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  aprobado: boolean;
  diasTotales: number;
}

type VistaGestion =
  | "lista"
  | "horarios"
  | "descansos"
  | "vacaciones"
  | "metricas";

// ===================================================================
// DATOS SIMULADOS
// ===================================================================

const barberosMock: Barbero[] = [
  {
    id: "1",
    nombre: "Michael Rodriguez",
    email: "michael@barberia.cl",
    telefono: "+56912345678",
    activo: true,
    horarioPersonalizado: {
      lunes: {
        activo: true,
        horaInicio: "09:00",
        horaFin: "18:00",
        descanso: { horaInicio: "13:00", horaFin: "14:00" },
      },
      martes: {
        activo: true,
        horaInicio: "09:00",
        horaFin: "18:00",
        descanso: { horaInicio: "13:00", horaFin: "14:00" },
      },
      miercoles: {
        activo: true,
        horaInicio: "09:00",
        horaFin: "18:00",
        descanso: { horaInicio: "13:00", horaFin: "14:00" },
      },
      jueves: {
        activo: true,
        horaInicio: "09:00",
        horaFin: "18:00",
        descanso: { horaInicio: "13:00", horaFin: "14:00" },
      },
      viernes: {
        activo: true,
        horaInicio: "09:00",
        horaFin: "19:00",
        descanso: { horaInicio: "13:00", horaFin: "14:00" },
      },
      sabado: { activo: true, horaInicio: "09:00", horaFin: "16:00" },
      domingo: { activo: false, horaInicio: "", horaFin: "" },
    },
    descansos: [
      {
        id: "1",
        fecha: "2025-09-05",
        horaInicio: "10:30",
        horaFin: "11:00",
        motivo: "Cita médica",
        aprobado: true,
      },
    ],
    vacaciones: [
      {
        id: "1",
        fechaInicio: "2025-12-20",
        fechaFin: "2025-12-31",
        motivo: "Vacaciones de fin de año",
        aprobado: true,
        diasTotales: 12,
      },
    ],
    comisiones: {
      porcentaje: 45,
      serviciosEspeciales: {
        "barba-premium": 55,
        coloracion: 50,
      },
    },
    metricas: {
      reservasCompletadas: 156,
      ingresosMes: 1250000,
      satisfaccionCliente: 4.8,
      puntualidad: 95,
    },
  },
  {
    id: "2",
    nombre: "Carlos Mendoza",
    email: "carlos@barberia.cl",
    telefono: "+56987654321",
    activo: true,
    horarioPersonalizado: {
      lunes: {
        activo: true,
        horaInicio: "10:00",
        horaFin: "19:00",
        descanso: { horaInicio: "14:00", horaFin: "15:00" },
      },
      martes: {
        activo: true,
        horaInicio: "10:00",
        horaFin: "19:00",
        descanso: { horaInicio: "14:00", horaFin: "15:00" },
      },
      miercoles: { activo: false, horaInicio: "", horaFin: "" },
      jueves: {
        activo: true,
        horaInicio: "10:00",
        horaFin: "19:00",
        descanso: { horaInicio: "14:00", horaFin: "15:00" },
      },
      viernes: {
        activo: true,
        horaInicio: "10:00",
        horaFin: "20:00",
        descanso: { horaInicio: "14:00", horaFin: "15:00" },
      },
      sabado: { activo: true, horaInicio: "09:00", horaFin: "17:00" },
      domingo: { activo: false, horaInicio: "", horaFin: "" },
    },
    descansos: [],
    vacaciones: [],
    comisiones: {
      porcentaje: 40,
      serviciosEspeciales: {
        "corte-clasico": 45,
      },
    },
    metricas: {
      reservasCompletadas: 142,
      ingresosMes: 1100000,
      satisfaccionCliente: 4.6,
      puntualidad: 92,
    },
  },
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const GestionBarberosAvanzada: React.FC = () => {
  const [vista, setVista] = useState<VistaGestion>("lista");
  const [barberos, setBarberos] = useState<Barbero[]>(barberosMock);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string | null>(
    null
  );
  const [editando, setEditando] = useState<string | null>(null);
  const { showToast } = useToast();

  const barberoActual = useMemo(
    () => barberos.find((b) => b.id === barberoSeleccionado),
    [barberos, barberoSeleccionado]
  );

  const handleToggleActivo = (barberoId: string) => {
    setBarberos((prev) =>
      prev.map((b) => (b.id === barberoId ? { ...b, activo: !b.activo } : b))
    );
    showToast({
      title: "Estado actualizado",
      message: "El estado del barbero ha sido modificado",
      type: "success",
    });
  };

  const renderListaBarberos = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Gestión de Barberos</h3>
          <p className="text-slate-400">
            {barberos.length} barberos registrados
          </p>
        </div>
        <Button variant="primary" icon={Plus}>
          Nuevo Barbero
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {barberos.map((barbero) => (
          <Card key={barbero.id} padding="lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{barbero.nombre}</h4>
                  <p className="text-slate-400 text-sm">{barbero.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={barbero.activo ? "success" : "danger"}>
                      {barbero.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <span className="text-slate-400 text-xs">
                      {barbero.metricas.reservasCompletadas} reservas
                      completadas
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Clock}
                  onClick={() => {
                    setBarberoSeleccionado(barbero.id);
                    setVista("horarios");
                  }}
                >
                  Horarios
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={TrendingUp}
                  onClick={() => {
                    setBarberoSeleccionado(barbero.id);
                    setVista("metricas");
                  }}
                >
                  Métricas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={barbero.activo ? X : Check}
                  onClick={() => handleToggleActivo(barbero.id)}
                >
                  {barbero.activo ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-400">
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    minimumFractionDigits: 0,
                  }).format(barbero.metricas.ingresosMes)}
                </div>
                <div className="text-xs text-slate-400">Ingresos del mes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400">
                  {barbero.metricas.satisfaccionCliente}/5
                </div>
                <div className="text-xs text-slate-400">Satisfacción</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-400">
                  {barbero.metricas.puntualidad}%
                </div>
                <div className="text-xs text-slate-400">Puntualidad</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHorarios = () => {
    if (!barberoActual) return null;

    const dias = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
      "domingo",
    ];
    const diasLabels = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              Horarios - {barberoActual.nombre}
            </h3>
            <p className="text-slate-400">
              Configuración de horarios semanales
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setVista("lista")}>
              Volver
            </Button>
            <Button variant="primary" icon={Save}>
              Guardar Cambios
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {dias.map((dia, index) => {
            const horario =
              barberoActual.horarioPersonalizado[dia as keyof HorarioSemanal];
            return (
              <Card key={dia} padding="lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h4 className="font-semibold text-white w-20">
                      {diasLabels[index]}
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={horario.activo}
                        className="rounded"
                        onChange={() => {
                          // Lógica para actualizar horario
                        }}
                      />
                      <span className="text-slate-400 text-sm">Activo</span>
                    </div>
                  </div>

                  {horario.activo && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-slate-400 text-sm">
                          Inicio:
                        </label>
                        <Input
                          type="time"
                          value={horario.horaInicio}
                          onChange={() => {
                            // Lógica para actualizar hora
                          }}
                          className="w-24"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-slate-400 text-sm">Fin:</label>
                        <Input
                          type="time"
                          value={horario.horaFin}
                          onChange={() => {
                            // Lógica para actualizar hora
                          }}
                          className="w-24"
                        />
                      </div>

                      {horario.descanso && (
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-slate-400">
                            {horario.descanso.horaInicio} -{" "}
                            {horario.descanso.horaFin}
                          </span>
                          <Button variant="ghost" size="sm" icon={Edit3}>
                            Editar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <Alert
          type="info"
          title="Configuración de Horarios"
          message="Los cambios en los horarios se aplicarán a partir del próximo día hábil. Las reservas existentes no se verán afectadas."
        />
      </div>
    );
  };

  const renderMetricas = () => {
    if (!barberoActual) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              Métricas - {barberoActual.nombre}
            </h3>
            <p className="text-slate-400">
              Análisis de rendimiento y productividad
            </p>
          </div>
          <Button variant="secondary" onClick={() => setVista("lista")}>
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card padding="lg">
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(barberoActual.metricas.ingresosMes)}
              </div>
              <div className="text-slate-400">Ingresos del Mes</div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {barberoActual.metricas.reservasCompletadas}
              </div>
              <div className="text-slate-400">Reservas Completadas</div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {barberoActual.metricas.satisfaccionCliente}/5
              </div>
              <div className="text-slate-400">Satisfacción Cliente</div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="text-center">
              <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {barberoActual.metricas.puntualidad}%
              </div>
              <div className="text-slate-400">Puntualidad</div>
            </div>
          </Card>
        </div>

        <Card padding="lg">
          <h4 className="font-semibold text-white mb-4">Comisiones y Pagos</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Comisión base:</span>
              <span className="text-white">
                {barberoActual.comisiones.porcentaje}%
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-slate-400">Servicios especiales:</span>
              {Object.entries(barberoActual.comisiones.serviciosEspeciales).map(
                ([servicio, porcentaje]) => (
                  <div key={servicio} className="flex justify-between ml-4">
                    <span className="text-slate-500 capitalize">
                      {servicio.replace("-", " ")}:
                    </span>
                    <span className="text-white">{porcentaje}%</span>
                  </div>
                )
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Navegación principal
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
      {vista === "lista" && renderListaBarberos()}
      {vista === "horarios" && renderHorarios()}
      {vista === "metricas" && renderMetricas()}

      {(vista === "descansos" || vista === "vacaciones") && (
        <div className="p-6">
          <EmptyState
            icon={vista === "descansos" ? Coffee : Plane}
            title={`Gestión de ${
              vista === "descansos" ? "Descansos" : "Vacaciones"
            }`}
            description={`Panel de ${vista} en desarrollo...`}
          />
        </div>
      )}
    </div>
  );
};

export default GestionBarberosAvanzada;
