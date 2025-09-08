/**
 * ===================================================================
 * AGENDA Y DISPONIBILIDAD - GESTIÓN COMPLETA DE HORARIOS
 * ===================================================================
 *
 * Sistema completo para gestionar:
 * - Horarios de disponibilidad por barbero
 * - Calendarios de trabajo
 * - Días libres y vacaciones
 * - Bloqueos de horarios
 * - Vista semanal/mensual
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Clock,
  X,
  Edit3,
  ChevronLeft,
  ChevronRight,
  User,
  AlertCircle,
  Ban,
} from "lucide-react";
import { useBarberos } from "../../hooks/useBarberos";
import { useReservasMVP } from "../../hooks/useReservasMVP";
import { useWorkingDays } from "../../hooks/useWorkingDays";
import {
  computeDayCapacity,
  isDateAvailable as sharedIsDateAvailable,
} from "shared";
import { BOOKING_RULES } from "../../config/bookingRules";
import { useBloqueos } from "../../hooks/useBloqueos";

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface BloqueoHorario {
  id: string;
  barbero_id: string | null;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  tipo: "vacaciones" | "bloqueo" | "mantenimiento" | "capacitacion" | "otro";
  motivo: string | null;
}

type VistaCalendario = "semana" | "mes";
type ModalTipo = "bloqueo" | "disponibilidad" | null;

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const AgendaDisponibilidad: React.FC = () => {
  const { barberos = [], loading: loadingBarberos } = useBarberos();
  const { reservas = [], loading: loadingReservas } = useReservasMVP();
  // Días laborables globales (aplican cierre de domingos centralizado)
  const { isWorkingDay } = useWorkingDays();

  const [vistaActual, setVistaActual] = useState<VistaCalendario>("semana");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [barberoSeleccionado, setBarberoSeleccionado] =
    useState<string>("todos");
  const [modalActual, setModalActual] = useState<ModalTipo>(null);

  const {
    bloqueos,
    fetchBloqueos,
    createBloqueo,
    deleteBloqueo,
    loading: loadingBloqueos,
  } = useBloqueos();

  // Estado formulario crear bloqueo
  const [nuevoBloqueo, setNuevoBloqueo] = useState({
    id_barbero: "todos",
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: "",
    tipo: "bloqueo" as BloqueoHorario["tipo"],
    motivo: "",
  });
  const [savingBloqueo, setSavingBloqueo] = useState(false);
  const [errorBloqueo, setErrorBloqueo] = useState<string | null>(null);
  const [successBloqueo, setSuccessBloqueo] = useState<string | null>(null);

  // Estado formulario disponibilidad (horario / días trabajo)
  const diasSemanaStr = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];
  const barberoActivo = useMemo(
    () => barberos.find((b) => b.id_barbero === barberoSeleccionado),
    [barberos, barberoSeleccionado]
  );
  const [disponibilidadForm, setDisponibilidadForm] = useState({
    horario_inicio: "09:00",
    horario_fin: "18:00",
    tiempo_descanso: 10,
    dias_trabajo: [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ] as string[],
  });
  const [savingDisponibilidad, setSavingDisponibilidad] = useState(false);
  const [successDisponibilidad, setSuccessDisponibilidad] = useState<
    string | null
  >(null);
  const [errorDisponibilidad, setErrorDisponibilidad] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (barberoActivo) {
      setDisponibilidadForm({
        horario_inicio: barberoActivo.horario_inicio?.slice(0, 5) || "09:00",
        horario_fin: barberoActivo.horario_fin?.slice(0, 5) || "18:00",
        tiempo_descanso: barberoActivo.tiempo_descanso || 10,
        dias_trabajo: barberoActivo.dias_trabajo?.length
          ? barberoActivo.dias_trabajo
          : ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"],
      });
    }
  }, [barberoActivo]);

  // Cargar bloqueos de la semana visible
  useEffect(() => {
    const from = diasSemana[0]?.toISOString().slice(0, 10);
    const to = diasSemana[6]?.toISOString().slice(0, 10);
    if (from && to)
      fetchBloqueos({
        from,
        to,
        barbero:
          barberoSeleccionado === "todos" ? undefined : barberoSeleccionado,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaSeleccionada, barberoSeleccionado]);

  // 📅 GENERAR DÍAS DE LA SEMANA
  const diasSemana = useMemo(() => {
    const inicio = new Date(fechaSeleccionada);
    inicio.setDate(inicio.getDate() - inicio.getDay()); // Lunes

    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + i);
      dias.push(dia);
    }
    return dias;
  }, [fechaSeleccionada]);

  // 🕐 HORARIOS DE TRABAJO
  const horariosDelDia = useMemo(() => {
    const horarios = [];
    for (let hora = 9; hora <= 18; hora++) {
      horarios.push(`${hora.toString().padStart(2, "0")}:00`);
      if (hora < 18) {
        horarios.push(`${hora.toString().padStart(2, "0")}:30`);
      }
    }
    return horarios;
  }, []);

  // 🔍 FILTRAR BARBEROS
  const barberosFiltrados = useMemo(() => {
    if (barberoSeleccionado === "todos") return barberos;
    return barberos.filter((b) => b.id_barbero === barberoSeleccionado);
  }, [barberos, barberoSeleccionado]);

  // 📊 OBTENER RESERVAS DEL DÍA
  const obtenerReservasDia = (fecha: Date, barberoId?: string) => {
    const fechaStr = fecha.toISOString().split("T")[0];
    return reservas.filter((r) => {
      const coincideFecha = r.fecha_reserva === fechaStr;
      const coincideBarbero = !barberoId || r.id_barbero === barberoId;
      return coincideFecha && coincideBarbero;
    });
  };

  // 🚫 OBTENER BLOQUEOS DEL DÍA
  const obtenerBloqueosDia = (fecha: Date, barberoId?: string) => {
    const fechaStr = fecha.toISOString().split("T")[0];
    return bloqueos.filter((b) => {
      const coincideFecha = b.fecha === fechaStr;
      const coincideBarbero = !barberoId || b.id_barbero === barberoId;
      return coincideFecha && coincideBarbero;
    });
  };

  // 🎨 OBTENER COLOR DEL MOTIVO
  const obtenerColorTipo = (tipo: BloqueoHorario["tipo"]) => {
    const colores: Record<string, string> = {
      vacaciones: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      bloqueo: "bg-red-500/20 text-red-400 border-red-500/30",
      mantenimiento: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      capacitacion: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      otro: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colores[tipo] || colores.otro;
  };

  // 🔧 HANDLERS
  const navegarSemana = (direccion: "anterior" | "siguiente") => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(
      nuevaFecha.getDate() + (direccion === "siguiente" ? 7 : -7)
    );
    setFechaSeleccionada(nuevaFecha);
  };

  const crearBloqueo = () => {
    setModalActual("bloqueo");
  };

  const editarDisponibilidad = () => {
    setModalActual("disponibilidad");
  };

  // ===================================================================
  // COMPONENTE: CELDA DE HORARIO
  // ===================================================================
  const renderCelda = useCallback(
    (fecha: Date, hora: string, barbero?: any) => {
      const esLaborable = isWorkingDay(fecha);
      if (!esLaborable) {
        return (
          <div
            title="Cerrado (domingo)"
            className="h-12 border border-slate-800 bg-slate-900/50 relative cursor-not-allowed select-none group"
          >
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-slate-600">
              Cerrado
            </div>
          </div>
        );
      }
      const reservasHora = obtenerReservasDia(
        fecha,
        barbero?.id_barbero
      ).filter((r) => r.hora_inicio <= hora && hora < r.hora_fin);

      const bloqueosHora = obtenerBloqueosDia(
        fecha,
        barbero?.id_barbero
      ).filter((b) => {
        if (!b.hora_inicio || !b.hora_fin) return true; // bloqueo día completo
        return b.hora_inicio <= hora && hora < b.hora_fin;
      });

      const tieneReserva = reservasHora.length > 0;
      const tieneBloqueo = bloqueosHora.length > 0;
      const reserva = reservasHora[0];
      const bloqueo = bloqueosHora[0];

      let celdaBgClass = "hover:bg-slate-700/30";
      if (tieneReserva) celdaBgClass = "bg-blue-500/10";
      if (tieneBloqueo) celdaBgClass = "bg-red-500/10";

      return (
        <div
          className={`h-12 border border-slate-700 relative cursor-pointer transition-colors ${celdaBgClass}`}
        >
          {tieneReserva && (
            <div className="absolute inset-1 bg-blue-600 text-white text-xs rounded p-1 overflow-hidden">
              <div className="font-medium truncate">Cliente</div>
              <div className="text-blue-200 truncate">{reserva.estado}</div>
            </div>
          )}

          {tieneBloqueo && (
            <div
              className={`absolute inset-1 rounded p-1 overflow-hidden border ${obtenerColorTipo(
                bloqueo.tipo
              )}`}
            >
              <div className="font-medium text-xs truncate">{bloqueo.tipo}</div>
              {bloqueo.motivo && (
                <div className="text-[10px] truncate opacity-75">
                  {bloqueo.motivo}
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
    [isWorkingDay, obtenerBloqueosDia, obtenerReservasDia]
  );

  // ===================================================================
  // COMPONENTE: VISTA SEMANAL
  // ===================================================================
  const VistaSemanal = () => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header con días */}
      <div className="grid grid-cols-8 border-b border-slate-700">
        <div className="p-4 bg-slate-700/50">
          <span className="text-sm font-medium text-slate-300">Hora</span>
        </div>
        {diasSemana.map((dia) => {
          const fechaStr = dia.toISOString().split("T")[0];
          const laborable = isWorkingDay(dia);
          const reservasDia = obtenerReservasDia(
            dia,
            barberosFiltrados[0]?.id_barbero
          ).map((r) => ({
            hora_inicio: r.hora_inicio,
            hora_fin: r.hora_fin,
            duracion_minutos: r.duracion_minutos || 0,
          }));
          const cap = computeDayCapacity(
            fechaStr,
            reservasDia as any,
            BOOKING_RULES.defaultServiceDuration
          );
          const available = sharedIsDateAvailable(
            fechaStr,
            {
              blockedDates: {},
              workingDays: laborable
                ? new Set<number>([dia.getDay()])
                : new Set<number>(),
              capacityMap: { [fechaStr]: cap },
            },
            BOOKING_RULES.defaultServiceDuration
          );
          const noGap = laborable && !cap.hasGap;
          let titleText: string | undefined;
          if (!laborable) titleText = "Cerrado (domingo)";
          else if (noGap)
            titleText = `Sin hueco ≥ ${BOOKING_RULES.defaultServiceDuration}m (máx ${cap.maxGap}m)`;
          else if (available)
            titleText = `Disponible (máx libre ${cap.maxGap}m)`;
          return (
            <div
              key={fechaStr}
              title={titleText}
              className={`p-4 bg-slate-700/50 text-center relative ${
                !laborable ? "opacity-40" : ""
              }`}
            >
              <div className="text-sm font-medium text-white flex items-center justify-center gap-1">
                {dia.toLocaleDateString("es-ES", { weekday: "short" })}
                {noGap && (
                  <span
                    className="text-[10px] text-orange-400 font-semibold"
                    title={`Capacidad máxima libre: ${cap.maxGap}m`}
                  >
                    •
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400">
                {dia.getDate()}/{dia.getMonth() + 1}
              </div>
              {!laborable && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-red-300/80">
                  Domingo
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grilla de horarios */}
      <div className="max-h-96 overflow-y-auto">
        {horariosDelDia.map((hora) => (
          <div
            key={hora}
            className="grid grid-cols-8 border-b border-slate-700 last:border-b-0"
          >
            <div className="p-2 bg-slate-700/30 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-300">{hora}</span>
            </div>
            {diasSemana.map((dia, index) => (
              <React.Fragment key={`${hora}-${index}`}>
                {renderCelda(dia, hora, barberosFiltrados[0])}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // ===================================================================
  // COMPONENTE: VISTA POR BARBERO
  // ===================================================================
  const VistaPorBarbero = () => (
    <div className="space-y-6">
      {barberosFiltrados.map((barbero) => (
        <div
          key={barbero.id_barbero}
          className="bg-slate-800 border border-slate-700 rounded-xl"
        >
          {/* Header del barbero */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                <User className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{barbero.nombre}</h3>
                <p className="text-sm text-slate-400">
                  {barbero.horario_inicio} - {barbero.horario_fin}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={editarDisponibilidad}
                className="text-blue-400 hover:text-blue-300 p-2"
                title="Editar disponibilidad"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={crearBloqueo}
                className="text-red-400 hover:text-red-300 p-2"
                title="Crear bloqueo"
              >
                <Ban className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Grilla semanal para este barbero */}
          <div className="p-4">
            <div className="grid grid-cols-8 gap-1 text-xs">
              <div></div>
              {diasSemana.map((dia) => (
                <div
                  key={dia.toISOString().split("T")[0]}
                  title={!isWorkingDay(dia) ? "Cerrado (domingo)" : undefined}
                  className={`text-center p-2 font-medium relative ${
                    isWorkingDay(dia)
                      ? "text-slate-300"
                      : "text-slate-500 opacity-40"
                  }`}
                >
                  {dia.toLocaleDateString("es-ES", { weekday: "short" })}
                  <br />
                  {dia.getDate()}/{dia.getMonth() + 1}
                  {!isWorkingDay(dia) && (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-red-300/80">
                      Domingo
                    </div>
                  )}
                </div>
              ))}

              {horariosDelDia.slice(0, 10).map((hora) => (
                <React.Fragment key={hora}>
                  <div className="p-2 text-slate-400 font-medium">{hora}</div>
                  {diasSemana.map((dia, index) => (
                    <React.Fragment
                      key={`${barbero.id_barbero}-${hora}-${index}`}
                    >
                      {renderCelda(dia, hora, barbero)}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ===================================================================
  // RENDER PRINCIPAL
  // ===================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Agenda y Disponibilidad
          </h2>
          <p className="text-slate-400">
            Gestiona horarios y disponibilidad de barberos
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={crearBloqueo}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Ban className="h-4 w-4" />
            <span>Crear Bloqueo</span>
          </button>

          <button
            onClick={editarDisponibilidad}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>Disponibilidad</span>
          </button>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Navegación de fecha */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navegarSemana("anterior")}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="font-semibold text-white">
                {fechaSeleccionada.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="text-sm text-slate-400">
                Semana del {diasSemana[0]?.getDate()}-{diasSemana[6]?.getDate()}
              </div>
            </div>

            <button
              onClick={() => navegarSemana("siguiente")}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Selector de barbero */}
          <div>
            <label
              htmlFor="select-barbero"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Barbero
            </label>
            <select
              id="select-barbero"
              value={barberoSeleccionado}
              onChange={(e) => setBarberoSeleccionado(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
            >
              <option value="todos">Todos los barberos</option>
              {barberos.map((barbero) => (
                <option key={barbero.id_barbero} value={barbero.id_barbero}>
                  {barbero.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de vista */}
          <div>
            <label
              htmlFor="select-vista"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Vista
            </label>
            <div className="flex rounded-lg overflow-hidden border border-slate-600">
              <button
                id="select-vista"
                onClick={() => setVistaActual("semana")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  vistaActual === "semana"
                    ? "bg-yellow-500 text-black"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setVistaActual("mes")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  vistaActual === "mes"
                    ? "bg-yellow-500 text-black"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                Mes
              </button>
            </div>
          </div>

          {/* Botón hoy */}
          <div className="flex justify-end">
            <button
              onClick={() => setFechaSeleccionada(new Date())}
              className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Hoy
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded"></div>
            <span className="text-slate-300">Reserva</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500/20 border border-red-500/30 rounded"></div>
            <span className="text-slate-300">Bloqueo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded"></div>
            <span className="text-slate-300">Vacaciones</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-700 border border-slate-600 rounded"></div>
            <span className="text-slate-300">Disponible</span>
          </div>
        </div>
      </div>

      {/* Vista principal */}
      {(() => {
        if (loadingBarberos || loadingReservas) {
          return (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          );
        }
        if (barberoSeleccionado === "todos") {
          return <VistaPorBarbero />;
        }
        return <VistaSemanal />;
      })()}

      {/* Modales */}
      {modalActual && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {modalActual === "bloqueo" && "Crear Bloqueo"}
                {modalActual === "disponibilidad" && "Editar Disponibilidad"}
              </h3>
              <button
                onClick={() => setModalActual(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {modalActual === "bloqueo" && (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setErrorBloqueo(null);
                  setSuccessBloqueo(null);
                  if (!nuevoBloqueo.fecha_inicio || !nuevoBloqueo.fecha_fin) {
                    setErrorBloqueo("Fechas requeridas");
                    return;
                  }
                  try {
                    setSavingBloqueo(true);
                    await createBloqueo({
                      id_barbero:
                        nuevoBloqueo.id_barbero === "todos"
                          ? null
                          : nuevoBloqueo.id_barbero,
                      fecha_inicio: nuevoBloqueo.fecha_inicio,
                      fecha_fin: nuevoBloqueo.fecha_fin,
                      hora_inicio: nuevoBloqueo.hora_inicio || null,
                      hora_fin: nuevoBloqueo.hora_fin || null,
                      tipo: nuevoBloqueo.tipo,
                      motivo: nuevoBloqueo.motivo || undefined,
                    });
                    // Refresh
                    const from = diasSemana[0]?.toISOString().slice(0, 10);
                    const to = diasSemana[6]?.toISOString().slice(0, 10);
                    if (from && to)
                      await fetchBloqueos({
                        from,
                        to,
                        barbero:
                          barberoSeleccionado === "todos"
                            ? undefined
                            : barberoSeleccionado,
                      });
                    setSuccessBloqueo("Bloqueo creado");
                  } catch (err: any) {
                    setErrorBloqueo(err.message);
                  } finally {
                    setSavingBloqueo(false);
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Barbero
                    </label>
                    <select
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      value={nuevoBloqueo.id_barbero}
                      onChange={(e) =>
                        setNuevoBloqueo((v) => ({
                          ...v,
                          id_barbero: e.target.value,
                        }))
                      }
                    >
                      <option value="todos">Todos / Global</option>
                      {barberos.map((b) => (
                        <option key={b.id_barbero} value={b.id_barbero}>
                          {b.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      value={nuevoBloqueo.fecha_inicio}
                      onChange={(e) =>
                        setNuevoBloqueo((v) => ({
                          ...v,
                          fecha_inicio: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      value={nuevoBloqueo.fecha_fin}
                      onChange={(e) =>
                        setNuevoBloqueo((v) => ({
                          ...v,
                          fecha_fin: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Hora inicio (opcional)
                    </label>
                    <input
                      type="time"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      value={nuevoBloqueo.hora_inicio}
                      onChange={(e) =>
                        setNuevoBloqueo((v) => ({
                          ...v,
                          hora_inicio: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Hora fin (opcional)
                    </label>
                    <input
                      type="time"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      value={nuevoBloqueo.hora_fin}
                      onChange={(e) =>
                        setNuevoBloqueo((v) => ({
                          ...v,
                          hora_fin: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Tipo
                    </label>
                    <select
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      value={nuevoBloqueo.tipo}
                      onChange={(e) =>
                        setNuevoBloqueo((v) => ({
                          ...v,
                          tipo: e.target.value as any,
                        }))
                      }
                    >
                      <option value="bloqueo">Bloqueo</option>
                      <option value="vacaciones">Vacaciones</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="capacitacion">Capacitación</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Motivo / Nota
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      value={nuevoBloqueo.motivo}
                      onChange={(e) =>
                        setNuevoBloqueo((v) => ({
                          ...v,
                          motivo: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                {errorBloqueo && (
                  <p className="text-xs text-red-400 mt-2">{errorBloqueo}</p>
                )}
                {successBloqueo && (
                  <p className="text-xs text-green-400 mt-2">
                    {successBloqueo}
                  </p>
                )}
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[11px] text-slate-500">
                    * Dejar horas vacías = día completo
                  </span>
                  <button
                    disabled={savingBloqueo}
                    type="submit"
                    className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold disabled:opacity-60"
                  >
                    {savingBloqueo ? "Guardando..." : "Guardar"}
                  </button>
                </div>
                <hr className="my-4 border-slate-700" />
                <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                  <h4 className="text-slate-300 font-semibold">
                    Bloqueos en rango
                  </h4>
                  {loadingBloqueos && (
                    <div className="text-slate-500">Cargando...</div>
                  )}
                  {!loadingBloqueos &&
                    bloqueos
                      .filter(
                        (b) =>
                          nuevoBloqueo.id_barbero === "todos" ||
                          b.id_barbero ===
                            (nuevoBloqueo.id_barbero === "todos"
                              ? null
                              : nuevoBloqueo.id_barbero)
                      )
                      .map((b) => (
                        <div
                          key={`${b.id}-${b.fecha}`}
                          className="flex items-center justify-between bg-slate-700/50 px-2 py-1 rounded border border-slate-600"
                        >
                          <div className="truncate mr-2">
                            <span className="text-slate-200">{b.fecha}</span>{" "}
                            <span className="text-slate-400">{b.tipo}</span>
                            {b.hora_inicio && b.hora_fin && (
                              <span className="text-slate-500">
                                {" "}
                                {b.hora_inicio}-{b.hora_fin}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await deleteBloqueo(b.id);
                              } catch (e: any) {
                                setErrorBloqueo(e.message);
                              }
                            }}
                            className="text-red-400 hover:text-red-300"
                            title="Eliminar bloqueo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  {!loadingBloqueos && bloqueos.length === 0 && (
                    <div className="text-slate-500">Sin bloqueos</div>
                  )}
                </div>
              </form>
            )}
            {modalActual === "disponibilidad" && (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!barberoActivo) {
                    setErrorDisponibilidad("Selecciona un barbero");
                    return;
                  }
                  setErrorDisponibilidad(null);
                  setSuccessDisponibilidad(null);
                  try {
                    setSavingDisponibilidad(true);
                    const resp = await fetch(
                      `/api/consolidated?type=barberos&id=${barberoActivo.id_barbero}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          horario_inicio:
                            disponibilidadForm.horario_inicio + ":00",
                          horario_fin: disponibilidadForm.horario_fin + ":00",
                          tiempo_descanso: disponibilidadForm.tiempo_descanso,
                          dias_trabajo: disponibilidadForm.dias_trabajo,
                        }),
                      }
                    );
                    const json = await resp.json();
                    if (!resp.ok)
                      throw new Error(
                        json.error || "Error actualizando disponibilidad"
                      );
                    setSuccessDisponibilidad("Disponibilidad actualizada");
                  } catch (err: any) {
                    setErrorDisponibilidad(err.message);
                  } finally {
                    setSavingDisponibilidad(false);
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Horario inicio
                    </label>
                    <input
                      type="time"
                      value={disponibilidadForm.horario_inicio}
                      onChange={(e) =>
                        setDisponibilidadForm((v) => ({
                          ...v,
                          horario_inicio: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Horario fin
                    </label>
                    <input
                      type="time"
                      value={disponibilidadForm.horario_fin}
                      onChange={(e) =>
                        setDisponibilidadForm((v) => ({
                          ...v,
                          horario_fin: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Descanso (min)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={disponibilidadForm.tiempo_descanso}
                      onChange={(e) =>
                        setDisponibilidadForm((v) => ({
                          ...v,
                          tiempo_descanso: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-slate-300">
                      Días de trabajo
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {diasSemanaStr.map((d) => {
                        const active =
                          disponibilidadForm.dias_trabajo.includes(d);
                        return (
                          <button
                            type="button"
                            key={d}
                            onClick={() =>
                              setDisponibilidadForm((v) => ({
                                ...v,
                                dias_trabajo: active
                                  ? v.dias_trabajo.filter((x) => x !== d)
                                  : [...v.dias_trabajo, d],
                              }))
                            }
                            className={`px-2 py-1 rounded text-xs border ${
                              active
                                ? "bg-yellow-500 text-black border-yellow-400"
                                : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                            }`}
                          >
                            {d.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {errorDisponibilidad && (
                  <p className="text-xs text-red-400 mt-2">
                    {errorDisponibilidad}
                  </p>
                )}
                {successDisponibilidad && (
                  <p className="text-xs text-green-400 mt-2">
                    {successDisponibilidad}
                  </p>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    disabled={savingDisponibilidad}
                    type="submit"
                    className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold disabled:opacity-60"
                  >
                    {savingDisponibilidad ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaDisponibilidad;
