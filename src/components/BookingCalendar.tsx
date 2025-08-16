import React, { useMemo, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from "lucide-react";
import { TimeSlot, Booking } from "../types/booking";

interface BookingCalendarProps {
  selectedDate: string;
  selectedTime: TimeSlot | null;
  bookings?: Booking[];
  onDateSelect: (date: string) => void;
  onTimeSelect: (timeSlot: TimeSlot) => void;
  onNext: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  bookings = [],
  onDateSelect,
  onTimeSelect,
  onNext,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  /** ---------- Utilidades ---------- **/
  const isValidDate = (date: Date) =>
    date instanceof Date && !isNaN(date.getTime());

  const formatDateString = useCallback(
    (y: number, m: number, d: number) =>
      y && Number.isInteger(m) && Number.isInteger(d)
        ? `${y}-${(m + 1).toString().padStart(2, "0")}-${d
            .toString()
            .padStart(2, "0")}`
        : "",
    []
  );

  const isDateAvailable = useCallback((date: string) => {
    const parsed = new Date(date);
    if (!isValidDate(parsed)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);

    return parsed >= today && parsed.getDay() !== 0;
  }, []);

  const getBookingsForDate = useCallback(
    (date: string) =>
      bookings.filter((b) => b?.date === date && b?.status === "confirmed")
        .length,
    [bookings]
  );

  const generateTimeSlots = useCallback(
    (date: string) => {
      if (!date) return [];

      const startHour = 9,
        endHour = 19,
        slotDuration = 30;
      return Array.from(
        { length: (endHour - startHour) * (60 / slotDuration) },
        (_, i) => {
          const hour = startHour + Math.floor((i * slotDuration) / 60);
          const minute = (i * slotDuration) % 60;
          const time = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          const booked = bookings.some(
            (b) =>
              b?.date === date && b?.time === time && b?.status === "confirmed"
          );
          return { time, available: !booked };
        }
      );
    },
    [bookings]
  );

  const getDaysInMonth = useCallback((date: Date) => {
    if (!isValidDate(date)) return [];
    const year = date.getFullYear(),
      month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(firstDay.getDay()).fill(null),
      ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
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
    (slot: TimeSlot) => slot?.available && onTimeSelect(slot),
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
          {daysInMonth.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="p-3" />;
            const dateString = formatDateString(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            );
            if (!dateString)
              return <div key={`invalid-${idx}`} className="p-3" />;

            const isAvailable = isDateAvailable(dateString);
            const isSelected = selectedDate === dateString;
            const bookingCount = getBookingsForDate(dateString);

            return (
              <button
                key={`day-${day}`}
                onClick={() => handleDateSelect(dateString)}
                disabled={!isAvailable}
                aria-label={`Seleccionar ${dateString}`}
                className={`p-3 rounded-lg font-semibold relative transition-all duration-200 ${
                  isSelected
                    ? "bg-yellow-500 text-black shadow-lg scale-105"
                    : isAvailable
                    ? "bg-gray-800 text-white hover:bg-gray-700 hover:scale-105"
                    : "bg-gray-900 text-gray-600 cursor-not-allowed"
                }`}
              >
                {day}
                {bookingCount > 0 && isAvailable && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-xs rounded-full flex items-center justify-center font-bold">
                    {bookingCount > 9 ? "9+" : bookingCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">
              Horarios disponibles -{" "}
              {new Date(selectedDate).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
          </div>

          {timeSlots.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSelect(slot)}
                    disabled={!slot.available}
                    aria-label={`${
                      slot.available ? "Seleccionar" : "No disponible"
                    } horario ${slot.time}`}
                    className={`p-3 rounded-lg font-semibold transition-all duration-200 relative ${
                      selectedTime?.time === slot.time
                        ? "bg-yellow-500 text-black shadow-lg scale-105"
                        : slot.available
                        ? "bg-gray-800 text-white hover:bg-gray-700 hover:scale-105"
                        : "bg-gray-900 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {slot.time}
                    {!slot.available && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-center text-gray-400 text-sm">
                {timeSlots.filter((s) => s.available).length} de{" "}
                {timeSlots.length} horarios disponibles
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400">
              No hay horarios disponibles para esta fecha
            </p>
          )}
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
