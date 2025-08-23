import React, { useMemo, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from "lucide-react";
import { TimeSlot, Booking } from "../types/booking";

interface BookingCalendarProps {
  selectedDate: string;
  selectedTime: TimeSlot | null;
  bookings?: Booking[];
  selectedServices?: Array<{ duration: number }>; // Para determinar duración del servicio
  onDateSelect: (date: string) => void;
  onTimeSelect: (timeSlot: TimeSlot) => void;
  onNext: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  bookings = [],
  selectedServices = [],
  onDateSelect,
  onTimeSelect,
  onNext,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Cargar slots disponibles desde la API cuando cambia la fecha seleccionada
  const fetchAvailableSlots = useCallback(async (date: string) => {
    if (!date) return;

    setLoadingBookings(true);
    try {
      console.log("Fetching available slots for date:", date); // Debug
      const resp = await fetch(
        `/api/availability?date=${encodeURIComponent(date)}`
      );
      if (resp.ok) {
        const payload = await resp.json();
        console.log("Availability payload:", payload);

        const slots = payload.availableSlots || [];
        console.log("Available slots from API:", slots);

        setAvailableSlots(slots);
      } else {
        console.error("Failed to fetch availability:", resp.status);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  // Cargar slots disponibles cuando cambia la fecha seleccionada
  React.useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, fetchAvailableSlots]);

  /** ---------- Utilidades ---------- **/
  const isValidDate = (date: Date) =>
    date instanceof Date && !isNaN(date.getTime());

  const formatDateString = useCallback((y: number, m: number, d: number) => {
    if (!y || !Number.isInteger(m) || !Number.isInteger(d)) return "";

    // Usar fechas locales para evitar problemas de zona horaria
    const localDate = new Date(y, m, d);
    return localDate.toISOString().slice(0, 10);
  }, []);

  const isDateAvailable = useCallback((date: string) => {
    const parsed = new Date(date + "T12:00:00"); // Usar mediodía para evitar problemas de zona horaria
    if (!isValidDate(parsed)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedDate = new Date(parsed);
    parsedDate.setHours(0, 0, 0, 0);

    // No permitir fechas pasadas
    if (parsedDate < today) return false;

    // No permitir domingos (día 0)
    if (parsed.getDay() === 0) return false;

    // No permitir reservas con menos de 2 horas de anticipación si es hoy
    if (parsedDate.getTime() === today.getTime()) {
      const now = new Date();
      const currentHour = now.getHours();

      // Si son después de las 17:00, no permitir reservas para hoy
      if (currentHour >= 17) return false;
    }

    return true;
  }, []);

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
  const timeSlots = useMemo(
    () => (selectedDate ? generateTimeSlots(selectedDate) : []),
    [selectedDate, generateTimeSlots]
  );
  const canProceed = Boolean(selectedDate && selectedTime?.time);

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
      {/* Calendar */}
      <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Selecciona una fecha
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => changeMonth(-1)}
              aria-label="Mes anterior"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold text-white min-w-[200px] text-center">
              {currentMonth.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() => changeMonth(1)}
              aria-label="Mes siguiente"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-gray-400 font-semibold text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((cell, idx) => {
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

            const isAvailable = isDateAvailable(dateString);
            const isSelected = selectedDate === dateString;
            const bookingCount = getBookingsForDate(dateString);

            // Determinar el tipo de restricción para mostrar diferentes estilos
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const cellDate = new Date(dateString + "T12:00:00"); // Usar mediodía para consistencia
            const cellDateOnly = new Date(cellDate);
            cellDateOnly.setHours(0, 0, 0, 0);

            const isPast = cellDateOnly < today;
            const isSunday = cellDate.getDay() === 0; // Ahora será consistente
            const isToday = cellDateOnly.getTime() === today.getTime();
            const isTodayTooLate = isToday && new Date().getHours() >= 17;

            // compute className without nested ternary
            let dayBtnClass =
              "p-3 rounded-lg font-semibold relative transition-all duration-200 ";

            if (isSelected) {
              dayBtnClass += "bg-yellow-500 text-black shadow-lg scale-105";
            } else if (isAvailable) {
              if (isToday && !isTodayTooLate) {
                dayBtnClass +=
                  "bg-blue-800 text-white hover:bg-blue-700 hover:scale-105 border border-blue-500";
              } else {
                dayBtnClass +=
                  "bg-gray-800 text-white hover:bg-gray-700 hover:scale-105";
              }
            } else if (isPast) {
              dayBtnClass +=
                "bg-gray-900 text-gray-600 cursor-not-allowed opacity-50";
            } else if (isSunday) {
              dayBtnClass += "bg-red-900/30 text-red-400 cursor-not-allowed";
            } else if (isTodayTooLate) {
              dayBtnClass +=
                "bg-orange-900/30 text-orange-400 cursor-not-allowed";
            } else {
              dayBtnClass += "bg-gray-900 text-gray-600 cursor-not-allowed";
            }

            // Generar título/tooltip según el estado
            let buttonTitle = `Seleccionar ${dateString}`;
            if (isPast) {
              buttonTitle = "Esta fecha ya pasó";
            } else if (isSunday) {
              buttonTitle = "Cerrado los domingos";
            } else if (isTodayTooLate) {
              buttonTitle =
                "Muy tarde para reservar hoy (se necesitan 2 horas de anticipación)";
            } else if (isToday) {
              buttonTitle =
                "Hoy - Horarios limitados (2 horas de anticipación mínima)";
            }

            return (
              <button
                key={(cell as any).key}
                onClick={() => handleDateSelect(dateString)}
                disabled={!isAvailable}
                aria-label={buttonTitle}
                title={buttonTitle}
                className={dayBtnClass}
              >
                {day}
                {/* Indicadores especiales */}
                {isToday && isAvailable && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                )}
                {isSunday && (
                  <div className="absolute top-1 right-1 text-red-400 text-xs">
                    ✕
                  </div>
                )}
                {bookingCount > 0 && isAvailable && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-xs rounded-full flex items-center justify-center font-bold">
                    {bookingCount > 9 ? "9+" : bookingCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Leyenda de información */}
        <div className="mt-4 bg-gray-800/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">
            ℹ️ Información importante:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-800 rounded border border-blue-500"></div>
              <span>Hoy (horarios limitados)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-900/30 rounded flex items-center justify-center">
                <span className="text-red-400 text-[8px]">✕</span>
              </div>
              <span>Cerrado (domingos)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-900 rounded opacity-50"></div>
              <span>Fechas pasadas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Con reservas</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            • Reservas del mismo día requieren mínimo 2 horas de anticipación •
            Horario de atención: Lunes a Sábado de 9:00 a 19:00
          </p>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-6">
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

            if (timeSlots.length > 0) {
              return (
                <>
                  {loadingBookings && (
                    <div className="text-center text-gray-400 mb-4">
                      Cargando horarios disponibles...
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                  <div className="mt-4 text-center text-gray-400 text-sm">
                    {timeSlots.length} horarios disponibles
                    {isToday && (
                      <div className="mt-2 text-yellow-500 text-xs">
                        ⚠️ Para reservas del día de hoy, necesitas al menos 2
                        horas de anticipación
                      </div>
                    )}
                  </div>
                </>
              );
            }
            if (loadingBookings) {
              return (
                <div className="text-center text-gray-400 py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  Consultando horarios disponibles...
                </div>
              );
            }

            // Mensajes específicos cuando no hay horarios
            if (isToday) {
              const currentHour = today.getHours();
              if (currentHour >= 17) {
                return (
                  <div className="text-center py-8">
                    <p className="text-red-400 mb-2">
                      ⏰ Ya es muy tarde para reservar hoy
                    </p>
                    <p className="text-gray-400 text-sm">
                      Selecciona una fecha futura para ver horarios disponibles
                    </p>
                  </div>
                );
              } else {
                return (
                  <div className="text-center py-8">
                    <p className="text-yellow-500 mb-2">
                      ⚠️ No hay horarios disponibles para hoy
                    </p>
                    <p className="text-gray-400 text-sm">
                      Los horarios de hoy requieren al menos 2 horas de
                      anticipación
                    </p>
                  </div>
                );
              }
            }

            return (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">
                  📅 No hay horarios disponibles para esta fecha
                </p>
                <p className="text-gray-500 text-sm">
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
            className="flex items-center space-x-2 bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 shadow-lg hover:shadow-xl transform hover:scale-105"
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
