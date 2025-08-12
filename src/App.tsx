import React, { useState } from 'react';
import { Calendar, Clock, Scissors, Users, Settings, CheckCircle } from 'lucide-react';
import BookingCalendar from './components/BookingCalendar';
import ServiceSelection from './components/ServiceSelection';
import ClientForm from './components/ClientForm';
import AdminPanel from './components/AdminPanel';
import BookingConfirmation from './components/BookingConfirmation';
import { Booking, Service, TimeSlot } from './types/booking';

function App() {
  const [currentView, setCurrentView] = useState<'booking' | 'admin'>('booking');
  const [bookingStep, setBookingStep] = useState<'calendar' | 'service' | 'form' | 'confirmation'>('calendar');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  const handleBookingComplete = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
    setCurrentBooking(booking);
    setBookingStep('confirmation');
  };

  const handleNewBooking = () => {
    setBookingStep('calendar');
    setSelectedDate('');
    setSelectedTime(null);
    setSelectedServices([]);
    setCurrentBooking(null);
  };

  const handleBookingCancel = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-xl">
                <Scissors className="h-8 w-8 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Michael The Barber</h1>
                <p className="text-sm text-gray-400">Sistema de Reservas</p>
              </div>
            </div>
            
            <nav className="flex space-x-1">
              <button
                onClick={() => setCurrentView('booking')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentView === 'booking'
                    ? 'bg-yellow-500 text-black shadow-lg transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Reservas</span>
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  currentView === 'admin'
                    ? 'bg-yellow-500 text-black shadow-lg transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Admin</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'booking' ? (
          <div className="space-y-8">
            {/* Progress Steps */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-3 ${
                  bookingStep === 'calendar' ? 'text-yellow-500' : 
                  ['service', 'form', 'confirmation'].includes(bookingStep) ? 'text-green-500' : 'text-gray-500'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    bookingStep === 'calendar' ? 'border-yellow-500 bg-yellow-500/20' :
                    ['service', 'form', 'confirmation'].includes(bookingStep) ? 'border-green-500 bg-green-500/20' : 'border-gray-500'
                  }`}>
                    {['service', 'form', 'confirmation'].includes(bookingStep) ? 
                      <CheckCircle className="h-5 w-5" /> : 
                      <Calendar className="h-5 w-5" />
                    }
                  </div>
                  <span className="font-semibold">Fecha y Hora</span>
                </div>
                
                <div className="h-px bg-gray-600 flex-1 mx-4"></div>
                
                <div className={`flex items-center space-x-3 ${
                  bookingStep === 'service' ? 'text-yellow-500' : 
                  ['form', 'confirmation'].includes(bookingStep) ? 'text-green-500' : 'text-gray-500'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    bookingStep === 'service' ? 'border-yellow-500 bg-yellow-500/20' :
                    ['form', 'confirmation'].includes(bookingStep) ? 'border-green-500 bg-green-500/20' : 'border-gray-500'
                  }`}>
                    {['form', 'confirmation'].includes(bookingStep) ? 
                      <CheckCircle className="h-5 w-5" /> : 
                      <Scissors className="h-5 w-5" />
                    }
                  </div>
                  <span className="font-semibold">Servicios</span>
                </div>
                
                <div className="h-px bg-gray-600 flex-1 mx-4"></div>
                
                <div className={`flex items-center space-x-3 ${
                  bookingStep === 'form' ? 'text-yellow-500' : 
                  bookingStep === 'confirmation' ? 'text-green-500' : 'text-gray-500'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    bookingStep === 'form' ? 'border-yellow-500 bg-yellow-500/20' :
                    bookingStep === 'confirmation' ? 'border-green-500 bg-green-500/20' : 'border-gray-500'
                  }`}>
                    {bookingStep === 'confirmation' ? 
                      <CheckCircle className="h-5 w-5" /> : 
                      <Users className="h-5 w-5" />
                    }
                  </div>
                  <span className="font-semibold">Datos</span>
                </div>
              </div>
            </div>

            {/* Content */}
            {bookingStep === 'calendar' && (
              <BookingCalendar
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                bookings={bookings}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedTime}
                onNext={() => setBookingStep('service')}
              />
            )}
            
            {bookingStep === 'service' && (
              <ServiceSelection
                selectedServices={selectedServices}
                onServicesChange={setSelectedServices}
                onBack={() => setBookingStep('calendar')}
                onNext={() => setBookingStep('form')}
              />
            )}
            
            {bookingStep === 'form' && (
              <ClientForm
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedServices={selectedServices}
                onBack={() => setBookingStep('service')}
                onSubmit={handleBookingComplete}
              />
            )}
            
            {bookingStep === 'confirmation' && currentBooking && (
              <BookingConfirmation
                booking={currentBooking}
                onNewBooking={handleNewBooking}
              />
            )}
          </div>
        ) : (
          <AdminPanel
            bookings={bookings}
            onCancelBooking={handleBookingCancel}
          />
        )}
      </main>
    </div>
  );
}

export default App;