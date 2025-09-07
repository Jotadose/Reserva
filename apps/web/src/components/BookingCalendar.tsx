import React, { useMemo, useCallback, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from "lucide-react";
import { TimeSlot, Booking } from "../types/booking";
import { useDisponibilidad } from "../hooks/useDisponibilidad";
import { useBloqueos } from "../hooks/useBloqueos";
import { isDateAvailable as sharedIsDateAvailable } from "shared";
import { useBarberos } from "../hooks/useBarberos";
import { useAppStore } from "../store/appStore";

interface BookingCalendarProps {
  selectedDate: string;
  selectedTime: TimeSlot | null;
  bookings?: Booking[];
  selectedService?: Service | null; // Para determinar duración del servicio
  selectedBarberId?: string; // ID del barbero seleccionado (requerido)
  onDateSelect: (date: string) => void;
  onTimeSelect: (timeSlot: TimeSlot) => void;
  onNext: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  bookings = [],
  selectedService = null,
  selectedBarberId,
  onDateSelect,
  onTimeSelect,
  onNext,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // 🔥 HOOKS DISPONIBILIDAD
  const { barberos } = useBarberos();
  const { setBarberId } = useAppStore() as any;
  const { getSlotsDisponibles, loading } = useDisponibilidad();
  const { bloqueos, fetchBloqueos } = useBloqueos();

  // Requerir selección explícita del barbero
  const barberoId = selectedBarberId || null;

  // 🔥 FUNCIÓN MVP PARA CARGAR DISPONIBILIDAD
  const loadAvailabilityForDate = useCallback(
    async (date: string) => {
      if (!date || !barberoId || !selectedService) return [];

      try {
        const duracion = selectedService.duration;

        const slots = await getSlotsDisponibles(barberoId, date, duracion);
        return slots
          .filter((slot) => slot.disponible)
          .map((slot) => slot.hora_inicio.slice(0, 5)); // Formato HH:MM
      } catch (error) {
        console.error("Error cargando disponibilidad MVP:", error);
        return [];
      }
    },
    [getSlotsDisponibles, barberoId, selectedService]
  );

  // Obtener slots disponibles para la fecha seleccionada
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Cargar disponibilidad cuando cambia la fecha
  React.useEffect(() => {
    if (selectedDate && barberoId) {
      loadAvailabilityForDate(selectedDate).then(setAvailableSlots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, barberoId, loadAvailabilityForDate]);

  /** ---------- Utilidades ---------- **/
  const isValidDate = (date: Date) =>
    date instanceof Date && !isNaN(date.getTime());

  const formatDateString = useCallback((y: number, m: number, d: number) => {
    if (!y || !Number.isInteger(m) || !Number.isInteger(d)) return "";

    // Usar fechas locales para evitar problemas de zona horaria
    const localDate = new Date(y, m, d);
    return localDate.toISOString().slice(0, 10);
  }, []);

  // Construir mapa de días bloqueados (vacaciones o bloqueo de día completo)
  const blockedDatesMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const b of bloqueos) {
      const fullDay =
        (!b.hora_inicio && !b.hora_fin) ||
        (b.hora_inicio === "00:00" && (!b.hora_fin || b.hora_fin === "23:59"));
      if (fullDay || b.tipo === "vacaciones") map[b.fecha] = true;
    }
    return map;
  }, [bloqueos]);

  const isDateAvailable = useCallback(
    (date: string) =>
      sharedIsDateAvailable(date, {
        blockedDates: blockedDatesMap,
        workingDays: new Set([1, 2, 3, 4, 5, 6]), // Lunes-Sábado (0=Domingo excluido)
      }),
    [blockedDatesMap]
  );

  const getBookingsForDate = useCallback(
    (date: string) =>
      bookings.filter((b) => b?.date === date && b?.status === "confirmed")
        .length,
    [bookings]
  );

  const generateTimeSlots = useCallback(
    (date: string) => {
      if (!date || availableSlots.length === 0) return [];

      // Aplicar filtros adicionales para fechas pasadas y regla de 2 horas
      const today = new Date();
      const selectedDateObj = new Date(date + "T12:00:00"); // Usar mediodía para consistencia
      const isToday = today.toDateString() === selectedDateObj.toDateString();
      const currentHourMinutes = isToday
        ? today.getHours() * 60 + today.getMinutes()
        : 0;

      return availableSlots
        .map((time) => {
          let available = true;

          // Si es hoy, no mostrar slots que ya pasaron o están muy cerca (menos de 2 horas)
          if (isToday) {
            const [hour, minute] = time.split(":").map(Number);
            const slotMinutes = hour * 60 + minute;
            const minimumAdvanceMinutes = currentHourMinutes + 120; // 2 horas de anticipación
            if (slotMinutes <= minimumAdvanceMinutes) {
              available = false;
            }
          }

          return { time, available };
        })
        .filter((slot) => slot.available); // Solo devolver slots verdaderamente disponibles
    },
    [availableSlots]
  );

  const getDaysInMonth = useCallback((date: Date) => {
    if (!isValidDate(date)) return [];
    const year = date.getFullYear(),
      month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const leading = Array.from({ length: firstDay.getDay() }).map((_, i) => ({
      day: null,
      key: `empty-${year}-${month}-${i}`,
    }));
    const days = Array.from({ length: totalDays }, (_, i) => {
      const d = i + 1;
      const k = `${year}-${month + 1}-${d}`;
      return { day: d, key: k };
    });
    return [...leading, ...days];
  }, []);

  /** ---------- Navegación ---------- **/
  const changeMonth = (offset: number) =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );

  /** ---------- Memos ---------- **/
  const daysInMonth = useMemo(
    () => getDaysInMonth(currentMonth),
    [currentMonth, getDaysInMonth]
  );

  // Cargar bloqueos del mes visible
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const from = new Date(year, month, 1).toISOString().slice(0, 10);
    const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    fetchBloqueos({ from, to, barbero: barberoId || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, barberoId]);
  const timeSlots = useMemo(
    () => (selectedDate ? generateTimeSlots(selectedDate) : []),
    [selectedDate, generateTimeSlots]
  );
  const canProceed = Boolean(selectedDate && selectedTime?.time && barberoId);

  /** ---------- Handlers ---------- **/
  const handleDateSelect = useCallback(
    (date: string) => isDateAvailable(date) && onDateSelect(date),
    [isDateAvailable, onDateSelect]
  );

  const handleTimeSelect = useCallback(
    (slot: TimeSlot) => onTimeSelect(slot),
    [onTimeSelect]
  );

  /** ---------- Render ---------- **/
  return (
    <div className="space-y-6">
      {/* Barber Selection Inline (fallback if user reached calendar without step) */}
      {!barberoId && (
        <div className="rounded-2xl border border-rose-700 bg-rose-900/40 p-4 mb-4">
          <p className="text-sm text-rose-100 mb-2 font-semibold">
            Debes seleccionar un barbero para ver el calendario.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {barberos.map((b) => (
              <button
                key={b.id_barbero}
                onClick={() => setBarberId(b.id_barbero)}
                className="p-2 rounded-lg bg-rose-800 hover:bg-rose-700 text-sm font-medium text-white"
              >
                {b.nombre}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Calendar */}
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Selecciona una fecha
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => changeMonth(-1)}
              aria-label="Mes anterior"
              className="rounded-lg bg-gray-800 p-2 text-white hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="min-w-[200px] text-center text-xl font-semibold text-white">
              {currentMonth.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() => changeMonth(1)}
              aria-label="Mes siguiente"
              className="rounded-lg bg-gray-800 p-2 text-white hover:bg-gray-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="mb-4 grid grid-cols-7 gap-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((cell) => {
            const { day } = cell as any;
            if (!day) return <div key={(cell as any).key} className="p-3" />;

            const dateString = formatDateString(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            );
            if (!dateString)
              return (
                <div key={`invalid-${(cell as any).key}`} className="p-3" />
              );

            // Helpers
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const cellDate = new Date(dateString + "T12:00:00");
            const cellDateOnly = new Date(cellDate);
            cellDateOnly.setHours(0, 0, 0, 0);
            const isPast = cellDateOnly < today;
            const isSunday = cellDate.getDay() === 0;
            const isToday = cellDateOnly.getTime() === today.getTime();
            const isTodayTooLate = isToday && new Date().getHours() >= 17;
            const isSelected = selectedDate === dateString;
            const isAvailable = isDateAvailable(dateString);
            const bookingCount = getBookingsForDate(dateString);

            const getButtonTitle = () => {
              if (isPast) return "Esta fecha ya pasó";
              if (isSunday) return "Cerrado los domingos";
              if (isTodayTooLate)
                return "Muy tarde para reservar hoy (mínimo 2 horas)";
              if (isToday)
                return "Hoy - Horarios limitados (mínimo 2 horas anticipación)";
              return `Seleccionar ${dateString}`;
            };

            const baseClass =
              "p-3 rounded-lg font-semibold relative transition-all duration-200 ";
            const dayBtnClass = (() => {
              if (isSelected) {
                return (
                  baseClass + "bg-yellow-500 text-black shadow-lg scale-105"
                );
              }
              if (!isAvailable) {
                let disabledClass =
                  "bg-gray-900 text-gray-600 cursor-not-allowed";
                if (isPast) disabledClass += " opacity-50";
                else if (isSunday)
                  disabledClass =
                    "bg-red-900/30 text-red-400 cursor-not-allowed";
                else if (isTodayTooLate)
                  disabledClass =
                    "bg-orange-900/30 text-orange-400 cursor-not-allowed";
                return baseClass + disabledClass;
              }
              if (isToday && !isTodayTooLate) {
                return (
                  baseClass +
                  "bg-blue-800 text-white hover:bg-blue-700 hover:scale-105 border border-blue-500"
                );
              }
              return (
                baseClass +
                "bg-gray-800 text-white hover:bg-gray-700 hover:scale-105"
              );
            })();

            return (
              <button
                key={(cell as any).key}
                onClick={() => handleDateSelect(dateString)}
                disabled={!isAvailable || !barberoId}
                aria-label={getButtonTitle()}
                title={getButtonTitle()}
                className={dayBtnClass}
              >
                {day}
                {isToday && isAvailable && (
                  <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-400" />
                )}
                {isSunday && (
                  <div className="absolute right-1 top-1 text-xs text-red-400">
                    ✕
                  </div>
                )}
                {bookingCount > 0 && isAvailable && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
                    {bookingCount > 9 ? "9+" : bookingCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Leyenda de información */}
        <div className="mt-4 rounded-xl bg-gray-800/30 p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-300">
            ℹ️ Información importante:
          </h4>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-400 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded border border-blue-500 bg-blue-800"></div>
              <span>Hoy (horarios limitados)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex h-3 w-3 items-center justify-center rounded bg-red-900/30">
                <span className="text-[8px] text-red-400">✕</span>
              </div>
              <span>Cerrado (domingos)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded bg-gray-900 opacity-50"></div>
              <span>Fechas pasadas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded bg-yellow-500"></div>
              <span>Con reservas</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            • Reservas del mismo día requieren mínimo 2 horas de anticipación •
            Horario de atención: Lunes a Sábado de 9:00 a 19:00
          </p>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && barberoId && (
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center space-x-2">
            <Clock className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">
              Horarios disponibles -{" "}
              {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                "es-ES",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </h2>
          </div>

          {(() => {
            const today = new Date();
            const selectedDateObj = new Date(selectedDate + "T12:00:00");
            const isToday =
              today.toDateString() === selectedDateObj.toDateString();

            if (timeSlots && timeSlots.length > 0) {
              return (
                <>
                  {loading && (
                    <div className="mb-4 text-center text-gray-400">
                      Cargando horarios disponibles...
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {timeSlots.map((slot) => {
                      const isSelectedSlot = selectedTime?.time === slot.time;
                      const slotClass = isSelectedSlot
                        ? "p-3 rounded-lg font-semibold transition-all duration-200 bg-yellow-500 text-black shadow-lg scale-105"
                        : "p-3 rounded-lg font-semibold transition-all duration-200 bg-gray-800 text-white hover:bg-gray-700 hover:scale-105";

                      return (
                        <button
                          key={slot.time}
                          onClick={() => handleTimeSelect(slot)}
                          aria-label={`Seleccionar horario ${slot.time}`}
                          className={slotClass}
                        >
                          <span>{slot.time}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-400">
                    {timeSlots.length} horarios disponibles
                    {isToday && (
                      <div className="mt-2 text-xs text-yellow-500">
                        ⚠️ Para reservas del día de hoy, necesitas al menos 2
                        horas de anticipación
                      </div>
                    )}
                  </div>
                </>
              );
            }
            if (loading) {
              return (
                <div className="py-8 text-center text-gray-400">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                  Consultando horarios disponibles...
                </div>
              );
            }

            // Mensajes específicos cuando no hay horarios
            if (isToday) {
              const currentHour = today.getHours();
              if (currentHour >= 17) {
                return (
                  <div className="py-8 text-center">
                    <p className="mb-2 text-red-400">
                      ⏰ Ya es muy tarde para reservar hoy
                    </p>
                    <p className="text-sm text-gray-400">
                      Selecciona una fecha futura para ver horarios disponibles
                    </p>
                  </div>
                );
              } else {
                return (
                  <div className="py-8 text-center">
                    <p className="mb-2 text-yellow-500">
                      ⚠️ No hay horarios disponibles para hoy
                    </p>
                    <p className="text-sm text-gray-400">
                      Los horarios de hoy requieren al menos 2 horas de
                      anticipación
                    </p>
                  </div>
                );
              }
            }

            return (
              <div className="py-8 text-center">
                <p className="mb-2 text-gray-400">
                  📅 No hay horarios disponibles para esta fecha
                </p>
                <p className="text-sm text-gray-500">
                  Todos los slots están ocupados. Intenta con otra fecha.
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Next Button */}
      {canProceed && (
        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="flex transform items-center space-x-2 rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-black shadow-lg hover:scale-105 hover:bg-yellow-400 hover:shadow-xl"
          >
            <span>Continuar</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
