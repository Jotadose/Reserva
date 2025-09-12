import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Scissors,
  DollarSign,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Instagram,
  MessageCircle
} from 'lucide-react'

import { useServicios } from '../hooks/useServicios'
import { useReservasMVP } from '../hooks/useReservasMVP'
import { useUsuarios } from '../hooks/useUsuarios'
import { YERKO_SERVICES, YERKO_SCHEDULE, YERKO_CONTACT } from '../data/yerkoServices'

interface ClientData {
  nombre: string
  email: string
  telefono: string
  notas?: string
}

type BookingStep = 'service' | 'datetime' | 'client' | 'confirmation'

export const BookingSystemYerko: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service')
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [clientData, setClientData] = useState<ClientData>({
    nombre: '',
    email: '',
    telefono: '',
    notas: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  const { crearReserva } = useReservasMVP()
  const { crearUsuario } = useUsuarios()

  const selectedServiceData = YERKO_SERVICES.find(s => s.id === selectedService)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
    }
    return `${minutes}min`
  }

  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      
      // Verificar si el día está habilitado
      if (YERKO_SCHEDULE.workingDays.includes(dayName)) {
        dates.push(date.toISOString().split('T')[0])
      }
    }
    
    return dates
  }

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return []
    
    // Por ahora retornamos todos los slots disponibles
    // En una implementación real, se verificaría la disponibilidad contra reservas existentes
    return YERKO_SCHEDULE.timeSlots
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setCurrentStep('datetime')
  }

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setCurrentStep('client')
    }
  }

  const handleClientSubmit = () => {
    if (clientData.nombre && clientData.email && clientData.telefono) {
      setCurrentStep('confirmation')
    }
  }

  const handleBookingConfirm = async () => {
    if (!selectedServiceData) return
    
    setIsSubmitting(true)
    
    try {
      // 1. Crear cliente
      const clienteData = {
        nombre: clientData.nombre,
        email: clientData.email,
        telefono: clientData.telefono,
        rol: 'cliente' as const
      }
      
      const nuevoCliente = await crearUsuario(clienteData)
      
      // 2. Crear reserva
      const reservaData = {
        id_cliente: nuevoCliente.id_usuario,
        id_barbero: 'yerko-barber-id', // ID fijo de Yerko
        id_servicio: selectedService,
        fecha: selectedDate,
        hora: selectedTime,
        estado: 'pendiente' as const,
        precio_total: selectedServiceData.price,
        duracion_total: selectedServiceData.duration,
        notas: clientData.notas || ''
      }
      
      await crearReserva(reservaData)
      setBookingComplete(true)
      
    } catch (error) {
      console.error('Error al crear reserva:', error)
      alert('Error al crear la reserva. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetBooking = () => {
    setCurrentStep('service')
    setSelectedService('')
    setSelectedDate('')
    setSelectedTime('')
    setClientData({ nombre: '', email: '', telefono: '', notas: '' })
    setBookingComplete(false)
  }

  const goBack = () => {
    switch (currentStep) {
      case 'datetime':
        setCurrentStep('service')
        break
      case 'client':
        setCurrentStep('datetime')
        break
      case 'confirmation':
        setCurrentStep('client')
        break
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md text-center border border-green-500/30">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">¡Reserva Confirmada!</h2>
          <p className="text-gray-300 mb-6">
            Tu cita ha sido agendada exitosamente. Recibirás un email de confirmación en breve.
          </p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Servicio:</span>
                <span className="text-white font-medium">{selectedServiceData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fecha:</span>
                <span className="text-white font-medium">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hora:</span>
                <span className="text-white font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Precio:</span>
                <span className="text-green-400 font-semibold">{formatPrice(selectedServiceData?.price || 0)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-purple-300">
              <Instagram className="w-4 h-4" />
              <span className="text-sm">{YERKO_CONTACT.instagram}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-300">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{YERKO_CONTACT.whatsapp}</span>
            </div>
          </div>
          
          <button
            onClick={resetBooking}
            className="mt-6 w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Nueva Reserva
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{YERKO_CONTACT.businessName}</h1>
          <div className="flex items-center justify-center space-x-2 text-purple-300">
            <Instagram className="w-4 h-4" />
            <span>{YERKO_CONTACT.instagram}</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { id: 'service', label: 'Servicio', icon: Scissors },
              { id: 'datetime', label: 'Fecha y Hora', icon: Calendar },
              { id: 'client', label: 'Datos', icon: User },
              { id: 'confirmation', label: 'Confirmar', icon: CheckCircle }
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = [
                'service',
                currentStep === 'datetime' ? 'service' : '',
                currentStep === 'client' ? 'service' : '',
                currentStep === 'client' ? 'datetime' : '',
                currentStep === 'confirmation' ? 'service' : '',
                currentStep === 'confirmation' ? 'datetime' : '',
                currentStep === 'confirmation' ? 'client' : ''
              ].includes(step.id)
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : isCompleted
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
          {/* Step 1: Service Selection */}
          {currentStep === 'service' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Selecciona tu Servicio</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {YERKO_SERVICES.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      service.priority === 'alta' ? 'ring-2 ring-yellow-500/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Scissors className="w-5 h-5 text-purple-400" />
                        {service.priority === 'alta' && (
                          <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      {service.canApplyDiscount && (
                        <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                          Descuento
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold">{formatPrice(service.price)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-medium">{formatDuration(service.duration)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date and Time Selection */}
          {currentStep === 'datetime' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goBack}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <h2 className="text-2xl font-bold text-white">Selecciona Fecha y Hora</h2>
                <div></div>
              </div>
              
              {selectedServiceData && (
                <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{selectedServiceData.name}</h3>
                      <p className="text-gray-300 text-sm">{formatDuration(selectedServiceData.duration)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">{formatPrice(selectedServiceData.price)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Selecciona la Fecha</h3>
                  <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                    {getAvailableDates().slice(0, 14).map((date) => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 rounded-lg text-left transition-all duration-200 ${
                          selectedDate === date
                            ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-transparent'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {new Date(date).toLocaleDateString('es-CL', { 
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Time Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Selecciona la Hora</h3>
                  {selectedDate ? (
                    <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                      {getAvailableTimeSlots().map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg text-center transition-all duration-200 ${
                            selectedTime === time
                              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-transparent'
                          }`}
                        >
                          <div className="font-medium">{time}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Primero selecciona una fecha</p>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedDate && selectedTime && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleDateTimeSelect}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
                  >
                    Continuar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Client Information */}
          {currentStep === 'client' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goBack}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <h2 className="text-2xl font-bold text-white">Tus Datos</h2>
                <div></div>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={clientData.nombre}
                      onChange={(e) => setClientData({ ...clientData, nombre: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={clientData.email}
                      onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={clientData.telefono}
                      onChange={(e) => setClientData({ ...clientData, telefono: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+56 9 XXXX XXXX"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notas Adicionales (Opcional)
                    </label>
                    <textarea
                      value={clientData.notas}
                      onChange={(e) => setClientData({ ...clientData, notas: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Alguna preferencia o comentario especial..."
                    />
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={handleClientSubmit}
                    disabled={!clientData.nombre || !clientData.email || !clientData.telefono}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 'confirmation' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={goBack}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <h2 className="text-2xl font-bold text-white">Confirmar Reserva</h2>
                <div></div>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="bg-white/10 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Resumen de tu Cita</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Servicio:</span>
                      <span className="text-white font-medium">{selectedServiceData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duración:</span>
                      <span className="text-white font-medium">{formatDuration(selectedServiceData?.duration || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fecha:</span>
                      <span className="text-white font-medium">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hora:</span>
                      <span className="text-white font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cliente:</span>
                      <span className="text-white font-medium">{clientData.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white font-medium">{clientData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Teléfono:</span>
                      <span className="text-white font-medium">{clientData.telefono}</span>
                    </div>
                    {clientData.notas && (
                      <div>
                        <span className="text-gray-400">Notas:</span>
                        <p className="text-white text-sm mt-1">{clientData.notas}</p>
                      </div>
                    )}
                    <hr className="border-gray-600" />
                    <div className="flex justify-between text-lg">
                      <span className="text-white font-semibold">Total:</span>
                      <span className="text-green-400 font-bold">{formatPrice(selectedServiceData?.price || 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleBookingConfirm}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Confirmando...</span>
                      </div>
                    ) : (
                      'Confirmar Reserva'
                    )}
                  </button>
                  
                  <p className="text-gray-400 text-sm mt-4">
                    Al confirmar, recibirás un email con los detalles de tu cita.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingSystemYerko