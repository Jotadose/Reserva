'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Phone, Mail, MessageCircle, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useTenant } from '@/hooks/use-tenant'
import { usePublicServices } from '@/hooks/use-public-services'

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
}

// Paso 1: Selección de Servicio
function ServiceSelectionStep({ onNext, bookingData, setBookingData, tenant }: BookingStepProps) {
  const { services, isLoading } = usePublicServices(tenant?.slug)

  const handleServiceSelect = (service: any) => {
    setBookingData({
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price || 0,
      serviceDuration: service.duration_minutes || 30
    })
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
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Cargando servicios...</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Selecciona tu Servicio</h3>
        <p className="text-gray-300">Elige el servicio que deseas reservar</p>
      </div>

      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {services.map((service) => (
          <Card 
            key={service.id}
            className={`p-4 cursor-pointer transition-all bg-white/5 border-white/10 hover:bg-white/10 ${
              bookingData.serviceId === service.id ? 'ring-2 ring-purple-500 bg-purple-500/20' : ''
            }`}
            onClick={() => handleServiceSelect(service)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{service.name}</h4>
                {service.description && (
                  <p className="text-sm text-gray-300 mb-2">{service.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(service.duration_minutes || 30)}
                  </div>
                  {service.category && (
                    <Badge variant="secondary" className="text-xs">
                      {service.category}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  {formatPrice(service.price || 0)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button 
        onClick={onNext} 
        disabled={!bookingData.serviceId}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
      >
        Continuar
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
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
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Selecciona Fecha y Hora</h3>
        <p className="text-gray-300">Elige cuándo quieres tu cita</p>
      </div>

      {/* Selección de Fecha */}
      <div>
        <Label className="text-white mb-3 block">Fecha disponible</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {getAvailableDates().map((date) => (
            <Button
              key={date.value}
              variant={selectedDate === date.value ? "default" : "outline"}
              className={`justify-start p-3 h-auto ${
                selectedDate === date.value 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
              }`}
              onClick={() => setSelectedDate(date.value)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="capitalize">{date.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Selección de Hora */}
      {selectedDate && (
        <div>
          <Label className="text-white mb-3 block">Hora disponible</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {getAvailableTimes().map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                className={`${
                  selectedTime === time 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                }`}
                onClick={() => setSelectedTime(time)}
              >
                <Clock className="w-4 h-4 mr-1" />
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onPrev}
          className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={!selectedDate || !selectedTime}
          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
        >
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
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
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Tus Datos</h3>
        <p className="text-gray-300">Necesitamos algunos datos para confirmar tu reserva</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-white">Nombre completo *</Label>
          <Input
            id="name"
            value={formData.clientName}
            onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            placeholder="Ingresa tu nombre completo"
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
          />
          {errors.clientName && (
            <p className="text-red-400 text-sm mt-1">{errors.clientName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-white">Teléfono *</Label>
          <Input
            id="phone"
            value={formData.clientPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
            placeholder="+56 9 0000 0000"
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
          />
          {errors.clientPhone && (
            <p className="text-red-400 text-sm mt-1">{errors.clientPhone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-white">Email (opcional)</Label>
          <Input
            id="email"
            type="email"
            value={formData.clientEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
            placeholder="tu@email.com"
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
          />
          {errors.clientEmail && (
            <p className="text-red-400 text-sm mt-1">{errors.clientEmail}</p>
          )}
        </div>

        <div>
          <Label htmlFor="notes" className="text-white">Notas adicionales (opcional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="¿Alguna preferencia o comentario especial?"
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onPrev}
          className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <Button 
          onClick={handleContinue}
          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
        >
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// Paso 4: Confirmación
function ConfirmationStep({ onPrev, bookingData, tenant }: BookingStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

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
      // Simular envío (aquí implementarías la lógica real)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Por ahora, redirigir a WhatsApp con los datos
      const message = `¡Hola! Quiero reservar una cita:
      
📅 Servicio: ${bookingData.serviceName}
💰 Precio: ${formatPrice(bookingData.servicePrice)}
📆 Fecha: ${formatDate(bookingData.selectedDate)}
⏰ Hora: ${bookingData.selectedTime}
👤 Nombre: ${bookingData.clientName}
📞 Teléfono: ${bookingData.clientPhone}
${bookingData.clientEmail ? `📧 Email: ${bookingData.clientEmail}` : ''}
${bookingData.notes ? `📝 Notas: ${bookingData.notes}` : ''}

¿Puedes confirmar mi reserva?`

      const whatsappUrl = `https://wa.me/${tenant.contact_phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      
      setIsConfirmed(true)
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank')
      }, 1500)
      
    } catch (error) {
      console.error('Error al confirmar reserva:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isConfirmed) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">¡Reserva Enviada!</h3>
          <p className="text-gray-300">
            Tu solicitud de reserva ha sido enviada por WhatsApp. 
            Te confirmaremos la disponibilidad en breve.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Confirma tu Reserva</h3>
        <p className="text-gray-300">Revisa los detalles antes de confirmar</p>
      </div>

      <Card className="bg-white/5 border-white/10 p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start pb-4 border-b border-white/10">
            <div>
              <h4 className="font-semibold text-white">{bookingData.serviceName}</h4>
              <p className="text-sm text-gray-300">Duración: {bookingData.serviceDuration} minutos</p>
            </div>
            <p className="text-lg font-bold text-white">
              {formatPrice(bookingData.servicePrice)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Fecha</p>
              <p className="text-white capitalize">{formatDate(bookingData.selectedDate)}</p>
            </div>
            <div>
              <p className="text-gray-400">Hora</p>
              <p className="text-white">{bookingData.selectedTime}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Nombre:</span>
                <span className="text-white">{bookingData.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Teléfono:</span>
                <span className="text-white">{bookingData.clientPhone}</span>
              </div>
              {bookingData.clientEmail && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{bookingData.clientEmail}</span>
                </div>
              )}
              {bookingData.notes && (
                <div>
                  <p className="text-gray-400 mb-1">Notas:</p>
                  <p className="text-white text-xs bg-white/5 p-2 rounded">
                    {bookingData.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onPrev}
          disabled={isSubmitting}
          className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <Button 
          onClick={handleConfirmBooking}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4 mr-2" />
              Confirmar por WhatsApp
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default function BookingWizard() {
  const { tenant, isLoading, error } = useTenant()
  const [currentStep, setCurrentStep] = useState(1)
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

  if (isLoading || !tenant) {
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
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step.number 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-gray-400'
              }
            `}>
              {step.number}
            </div>
            <div className="ml-2 hidden sm:block">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-white' : 'text-gray-400'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-purple-600' : 'bg-white/10'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="glass-card p-6">
        <CurrentStepComponent
          onNext={nextStep}
          onPrev={currentStep > 1 ? prevStep : undefined}
          bookingData={bookingData}
          setBookingData={updateBookingData}
          tenant={tenant}
        />
      </Card>
    </div>
  )
}