import React from 'react';
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { TimeSlot, Booking } from '../types/booking';

interface BookingCalendarProps {
  selectedDate: string;
  selectedTime: TimeSlot | null;
  bookings: Booking[];
  onDateSelect: (date: string) => void;
  onTimeSelect: (timeSlot: TimeSlot) => void;
  onNext: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  bookings,
  onDateSelect,
  onTimeSelect,
  onNext
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const generateTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 19;
    const slotDuration = 30; // minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot is already booked
        const isBooked = bookings.some(booking => 
          booking.date === date && booking.time === time && booking.status === 'confirmed'
        );
        
        slots.push({
          time,
          available: !isBooked
        });
      }
    }
    
    return slots;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const formatDateString = (year: number, month: number, day: number): string => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const isDateAvailable = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the future
    if (selectedDate < today) return false;
    
    // Check if it's Sunday (0) - closed on Sundays
    if (selectedDate.getDay() === 0) return false;
    
    return true;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const canProceed = selectedDate && selectedTime;

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Selecciona una fecha</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={previousMonth}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold text-white min-w-[200px] text-center">
              {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center text-gray-400 font-semibold text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth(currentMonth).map((day, index) => {
            if (!day) {
              return <div key={index} className="p-3"></div>;
            }

            const dateString = formatDateString(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            );
            const isAvailable = isDateAvailable(dateString);
            const isSelected = selectedDate === dateString;

            return (
              <button
                key={day}
                onClick={() => isAvailable && onDateSelect(dateString)}
                disabled={!isAvailable}
                className={`p-3 rounded-lg font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-yellow-500 text-black shadow-lg transform scale-105'
                    : isAvailable
                    ? 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-105'
                    : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">
              Horarios disponibles - {new Date(selectedDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && onTimeSelect(slot)}
                disabled={!slot.available}
                className={`p-3 rounded-lg font-semibold transition-all duration-200 ${
                  selectedTime?.time === slot.time
                    ? 'bg-yellow-500 text-black shadow-lg transform scale-105'
                    : slot.available
                    ? 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-105'
                    : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>

          {timeSlots.filter(slot => slot.available).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">No hay horarios disponibles para esta fecha</p>
              <p className="text-gray-500 text-sm mt-2">Por favor, selecciona otra fecha</p>
            </div>
          )}
        </div>
      )}

      {/* Next Button */}
      {canProceed && (
        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="flex items-center space-x-2 bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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