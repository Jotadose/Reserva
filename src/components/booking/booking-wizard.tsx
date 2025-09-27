'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { usePublicServices } from '@/hooks/use-public-services'
import BookingConfirmation from './booking-confirmation'

// Tipos para el booking flow
interface BookingData {
  serviceId: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
  selectedDate: string
  selectedTime: string
  clientName: string
  clientPhone: string
  clientEmail: string
  notes: string
}

interface BookingStepProps {
  onNext: () => void
  onPrev?: () => void
  bookingData: BookingData
  setBookingData: (data: Partial<BookingData>) => void
  tenant: any
  onConfirmed?: () => void
}

// Paso 1: Selección de Servicio
function ServiceSelectionStep({ onNext, bookingData, setBookingData, tenant }: BookingStepProps) {
  const { services, isLoading } = usePublicServices(tenant?.id)

  const handleServiceSelect = (service: any) => {
    setBookingData({
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price || 0,
      serviceDuration: service.duration_minutes || 30
    })
    onNext() // Auto-avanzar al siguiente paso
  }

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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-300 mt-2">Cargando servicios...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">Selecciona tu Servicio</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 sm:p-6 border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all duration-200 hover:scale-[1.02] sm:hover:scale-105 active:scale-95"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                {service.is_featured && (
                  <span className="text-xs bg-yellow-600/20 text-yellow-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                    Destacado
                  </span>
                )}
              </div>
              {service.bookings_count && service.bookings_count > 10 && (
                <span className="text-xs bg-green-600/20 text-green-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  Popular
                </span>
              )}
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{service.name}</h3>
            {service.description && (
              <p className="text-gray-300 text-sm mb-3 sm:mb-4 line-clamp-2">{service.description}</p>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold text-sm sm:text-base">{formatPrice(service.price || 0)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium text-sm sm:text-base">{formatDuration(service.duration_minutes || 30)}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center">Toca para seleccionar</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Paso 2: Selección de Fecha y Hora
function DateTimeSelectionStep({ onNext, onPrev, bookingData, setBookingData, tenant }: BookingStepProps) {
  const [selectedDate, setSelectedDate] = useState(bookingData.selectedDate || '')
  const [selectedTime, setSelectedTime] = useState(bookingData.selectedTime || '')

  // Generar fechas disponibles (próximos 14 días, excluyendo domingos)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Excluir domingos (0 = domingo)
      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('es-CL', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })
        })
      }
    }
    return dates
  }

  // Generar horarios disponibles
  const getAvailableTimes = () => {
    const times = []
    const startHour = 9
    const endHour = 18
    const slotDuration = tenant?.slot_duration_minutes || 30

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(timeString)
      }
    }
    return times
  }

  const handleContinue = () => {
    setBookingData({
      selectedDate,
      selectedTime
    })
    onNext()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={onPrev}
          className="flex items-center space-x-1.5 sm:space-x-2 text-gray-400 hover:text-white transition-colors p-2 sm:p-0 -ml-2 sm:ml-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm sm:text-base">Volver</span>
        </button>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center flex-1">Selecciona Fecha y Hora</h2>
        <div className="w-16 sm:w-0"></div>
      </div>
      
      {bookingData.serviceName && (
        <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm sm:text-base">{bookingData.serviceName}</h3>
              <p className="text-gray-300 text-xs sm:text-sm">{formatDuration(bookingData.serviceDuration)}</p>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold text-sm sm:text-base">{formatPrice(bookingData.servicePrice)}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        {/* Date Selection */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Selecciona la Fecha</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-60 sm:max-h-80 overflow-y-auto">
            {getAvailableDates().map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`p-2.5 sm:p-3 rounded-lg text-left transition-all duration-200 active:scale-95 ${
                  selectedDate === date.value
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-transparent'
                }`}
              >
                <div className="text-xs sm:text-sm font-medium capitalize">
                  {date.label}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Time Selection */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Selecciona la Hora</h3>
          {selectedDate ? (
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-60 sm:max-h-80 overflow-y-auto">
              {getAvailableTimes().map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2.5 sm:p-3 rounded-lg text-center transition-all duration-200 active:scale-95 ${
                    selectedTime === time
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-transparent'
                  }`}
                >
                  <div className="font-medium text-xs sm:text-sm">{time}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-400">
              <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm sm:text-base">Primero selecciona una fecha</p>
            </div>
          )}
        </div>
      </div>
      
      {selectedDate && selectedTime && (
        <div className="mt-6 sm:mt-8">
          <button
            onClick={handleContinue}
            className="w-full sm:w-auto sm:mx-auto sm:block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium active:scale-95"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  )

  function formatPrice(price: number) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  function formatDuration(duration: number) {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
    }
    return `${minutes}min`
  }
}

// Paso 3: Información del Cliente
function ClientInfoStep({ onNext, onPrev, bookingData, setBookingData }: BookingStepProps) {
  const [formData, setFormData] = useState({
    clientName: bookingData.clientName || '',
    clientPhone: bookingData.clientPhone || '',
    clientEmail: bookingData.clientEmail || '',
    notes: bookingData.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'El nombre es obligatorio'
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'El teléfono es obligatorio'
    } else if (!/^\+?[0-9\s-]{8,}$/.test(formData.clientPhone)) {
      newErrors.clientPhone = 'Formato de teléfono inválido'
    }

    if (formData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (validateForm()) {
      setBookingData(formData)
      onNext()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrev}
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
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tu nombre completo"
              required
            />
            {errors.clientName && (
              <p className="text-red-400 text-sm mt-1">{errors.clientName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email (Opcional)
            </label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="tu@email.com"
            />
            {errors.clientEmail && (
              <p className="text-red-400 text-sm mt-1">{errors.clientEmail}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="+56 9 XXXX XXXX"
              required
            />
            {errors.clientPhone && (
              <p className="text-red-400 text-sm mt-1">{errors.clientPhone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas Adicionales (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Alguna preferencia o comentario especial..."
            />
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={handleContinue}
            disabled={!formData.clientName || !formData.clientPhone}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

// Paso 4: Confirmación
function ConfirmationStep({ onPrev, bookingData, tenant, onConfirmed }: BookingStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleConfirmBooking = async () => {
    setIsSubmitting(true)
    
    try {
      // Usar la función del componente padre para confirmar la reserva
      if (onConfirmed) {
        await onConfirmed()
      }
    } catch (error) {
      console.error('Error al confirmar reserva:', error)
      alert('Error al confirmar la reserva. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }



  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
    }
    return `${minutes}min`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrev}
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
              <span className="text-white font-medium">{bookingData.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duración:</span>
              <span className="text-white font-medium">{formatDuration(bookingData.serviceDuration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fecha:</span>
              <span className="text-white font-medium">{formatDate(bookingData.selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hora:</span>
              <span className="text-white font-medium">{bookingData.selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cliente:</span>
              <span className="text-white font-medium">{bookingData.clientName}</span>
            </div>
            {bookingData.clientEmail && (
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white font-medium">{bookingData.clientEmail}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Teléfono:</span>
              <span className="text-white font-medium">{bookingData.clientPhone}</span>
            </div>
            {bookingData.notes && (
              <div>
                <span className="text-gray-400">Notas:</span>
                <p className="text-white text-sm mt-1">{bookingData.notes}</p>
              </div>
            )}
            <hr className="border-gray-600" />
            <div className="flex justify-between text-lg">
              <span className="text-white font-semibold">Total:</span>
              <span className="text-green-400 font-bold">{formatPrice(bookingData.servicePrice)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleConfirmBooking}
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
            Al confirmar, se creará tu reserva en el sistema.
          </p>
        </div>
      </div>
    </div>
  )
}

interface BookingWizardProps {
  tenant: any
}

export default function BookingWizard({ tenant }: Readonly<BookingWizardProps>) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: '',
    serviceName: '',
    servicePrice: 0,
    serviceDuration: 30,
    selectedDate: '',
    selectedTime: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: ''
  })

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }))
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))
  
  const handleBookingConfirmed = async () => {
    try {
      console.log('🔄 BookingWizard: Iniciando confirmación de reserva...')
      
      // Preparar los datos para la API (provider_id será resuelto automáticamente por la API)
      const bookingAPIData = {
        tenant_id: tenant?.id,
        service_id: bookingData.serviceId,
        // provider_id no es necesario, la API encontrará uno automáticamente
        scheduled_date: bookingData.selectedDate,
        scheduled_time: bookingData.selectedTime,
        client_name: bookingData.clientName,
        client_phone: bookingData.clientPhone,
        client_email: bookingData.clientEmail || null,
        notes: bookingData.notes || null,
        status: 'confirmed',
        total_price: bookingData.servicePrice,
        duration_minutes: bookingData.serviceDuration
      }

      console.log('📤 BookingWizard: Enviando datos a API:', bookingAPIData)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingAPIData)
      })

      const result = await response.json()
      console.log('📨 BookingWizard: Respuesta de API:', result)

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear la reserva')
      }

      console.log('✅ BookingWizard: Reserva creada exitosamente')
      setIsConfirmed(true)
    } catch (error: any) {
      console.error('❌ BookingWizard: Error al confirmar reserva:', error)
      alert('Error al crear la reserva: ' + error.message)
    }
  }

  const handleNewBooking = () => {
    setIsConfirmed(false)
    setCurrentStep(1)
    setBookingData({
      serviceId: '',
      serviceName: '',
      servicePrice: 0,
      serviceDuration: 30,
      selectedDate: '',
      selectedTime: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      notes: ''
    })
  }

  // Si la reserva está confirmada, mostrar el componente de confirmación
  if (isConfirmed) {
    return (
      <BookingConfirmation
        booking={{
          id: `temp-${Date.now()}`,
          serviceName: bookingData.serviceName,
          servicePrice: bookingData.servicePrice,
          serviceDuration: bookingData.serviceDuration,
          selectedDate: bookingData.selectedDate,
          selectedTime: bookingData.selectedTime,
          clientName: bookingData.clientName,
          clientPhone: bookingData.clientPhone,
          clientEmail: bookingData.clientEmail,
          notes: bookingData.notes,
        }}
        tenant={tenant}
        onNewBooking={handleNewBooking}
      />
    )
  }

  if (!tenant) {
    return null // El loading será manejado por el componente padre
  }

  const steps = [
    { number: 1, title: 'Servicio', component: ServiceSelectionStep },
    { number: 2, title: 'Fecha y Hora', component: DateTimeSelectionStep },
    { number: 3, title: 'Tus Datos', component: ClientInfoStep },
    { number: 4, title: 'Confirmar', component: ConfirmationStep }
  ]

  const CurrentStepComponent = steps[currentStep - 1].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{tenant?.business_name || tenant?.name}</h1>
          {tenant?.instagram && (
            <div className="flex items-center justify-center space-x-2 text-purple-300">
              <Instagram className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-sm sm:text-base">{tenant.instagram}</span>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto pb-2">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-max px-2">
            {[
              { id: 1, label: 'Servicio', icon: Scissors },
              { id: 2, label: 'Fecha y Hora', icon: Calendar },
              { id: 3, label: 'Datos', icon: User },
              { id: 4, label: 'Confirmar', icon: CheckCircle }
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : isCompleted
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{step.label}</span>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-purple-500/20">
          <CurrentStepComponent
            onNext={nextStep}
            onPrev={currentStep > 1 ? prevStep : undefined}
            bookingData={bookingData}
            setBookingData={updateBookingData}
            tenant={tenant}
            onConfirmed={currentStep === 4 ? handleBookingConfirmed : undefined}
          />
        </div>
      </div>
    </div>
  )
}