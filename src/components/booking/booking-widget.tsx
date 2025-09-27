'use client'

import { useState, useEffect } from 'react'
import { Clock, User, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatPrice, formatDuration } from '@/lib/utils'
import { availabilityAPI } from '@/lib/supabase'

interface Tenant {
  id: string
  slug: string
  name: string
  description?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  instagram?: string
  whatsapp?: string
  working_hours: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }
  subscription_status: string
}

interface Service {
  id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  is_active: boolean
}

interface Provider {
  id: string
  name: string
  email: string
  role: string
  status: string
}

interface BookingWidgetProps {
  tenant: Tenant
  services: Service[]
  providers: Provider[]
  compact?: boolean
}

interface BookingForm {
  serviceId: string
  providerId: string
  date: string
  time: string
  clientName: string
  clientPhone: string
  clientEmail: string
  notes: string
}

interface AvailableSlot {
  time: string
  available: boolean
}

export function BookingWidget({ tenant, services, providers, compact = false }: BookingWidgetProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  
  const [form, setForm] = useState<BookingForm>({
    serviceId: '',
    providerId: '',
    date: '',
    time: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: ''
  })

  const selectedService = services.find(s => s.id === form.serviceId)
  const selectedProvider = providers.find(p => p.id === form.providerId)

  // Cargar horarios disponibles cuando se selecciona fecha y proveedor
  useEffect(() => {
    if (form.date && form.providerId) {
      loadAvailableSlots()
    }
  }, [form.date, form.providerId])

  const loadAvailableSlots = async () => {
    if (!form.date || !form.providerId) return

    setLoadingSlots(true)
    try {
      // Obtener bloques de disponibilidad del proveedor para la fecha seleccionada
      const startDate = `${form.date} 00:00:00`
      const endDate = `${form.date} 23:59:59`
      
      const { data: availabilityBlocks } = await availabilityAPI.getByProvider(
        tenant.id, 
        form.providerId, 
        startDate, 
        endDate
      )

      // TODO: Obtener reservas existentes para verificar disponibilidad
      // Por ahora asumimos que todos los slots están disponibles
      const existingBookings: any[] = []

      // Generar slots disponibles (cada 30 minutos de 9:00 a 19:00)
      const slots: AvailableSlot[] = []
      const startHour = 9
      const endHour = 19
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minutes of [0, 30]) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
          
          // Verificar si está en horario de trabajo
          let isWorkingHour = true // Por defecto asumimos que sí trabaja
          
          // Verificar disponibilidad específica del proveedor
          let isAvailable = true
          if (availabilityBlocks && availabilityBlocks.length > 0) {
            // Si hay bloques de disponibilidad, verificar si este horario está permitido
            const slotDateTime = new Date(`${form.date} ${timeString}:00`)
            isAvailable = availabilityBlocks.some(block => {
              const blockStart = new Date(block.start_datetime)
              const blockEnd = new Date(block.end_datetime)
              return block.block_type === 'available' && 
                     slotDateTime >= blockStart && 
                     slotDateTime < blockEnd
            })
          }
          
          // Verificar si ya hay una reserva en ese horario
          const hasBooking = existingBookings?.some(booking => 
            booking.scheduled_time === timeString && 
            booking.status !== 'cancelled'
          )
          
          slots.push({
            time: timeString,
            available: isWorkingHour && isAvailable && !hasBooking
          })
        }
      }
      
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error loading available slots:', error)
      setError('Error al cargar horarios disponibles')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!form.serviceId && !!form.providerId
      case 2:
        return !!form.date && !!form.time
      case 3:
        return !!form.clientName && !!form.clientPhone && !!form.clientEmail
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    } else {
      setError('Por favor completa todos los campos requeridos')
    }
  }

  const prevStep = () => {
    setStep(prev => prev - 1)
    setError('')
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Crear la reserva usando la API pública
      const bookingData = {
        tenant_id: tenant.id,
        service_id: form.serviceId,
        provider_id: form.providerId,
        scheduled_date: form.date,
        scheduled_time: form.time,
        client_name: form.clientName,
        client_phone: form.clientPhone,
        client_email: form.clientEmail,
        notes: form.notes || null,
        status: 'confirmed',
        total_price: selectedService?.price || 0,
        duration_minutes: selectedService?.duration_minutes || 30
      }

      console.log('📤 BookingWidget: Enviando datos a API:', bookingData)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })

      console.log('📨 BookingWidget: Respuesta de API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const result = await response.json()
      console.log('📋 BookingWidget: Resultado parseado:', result)

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear la reserva')
      }

      // Reserva creada exitosamente
      console.log('✅ BookingWidget: Reserva creada exitosamente')
      setSuccess(true)
      setStep(4)
    } catch (error: any) {
      console.error('Error creating booking:', error)
      setError(error.message || 'Error al crear la reserva. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }



  const getStepDescription = (currentStep: number): string => {
    if (currentStep === 1) return 'Selecciona servicio'
    if (currentStep === 2) return 'Elige fecha y hora'
    return 'Datos de contacto'
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">¡Reserva Confirmada!</CardTitle>
          <CardDescription>
            Tu reserva ha sido creada exitosamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Detalles de tu reserva:</h3>
            <div className="space-y-1 text-sm text-green-700">
              <p><strong>Servicio:</strong> {selectedService?.name}</p>
              <p><strong>Profesional:</strong> {selectedProvider?.name}</p>
              <p><strong>Fecha:</strong> {form.date}</p>
              <p><strong>Hora:</strong> {form.time}</p>
              <p><strong>Precio:</strong> {selectedService && formatPrice(selectedService.price)}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Recibirás un email de confirmación en {form.clientEmail}
          </p>
          <Button 
            onClick={() => {
              setStep(1)
              setSuccess(false)
              setForm({
                serviceId: '',
                providerId: '',
                date: '',
                time: '',
                clientName: '',
                clientPhone: '',
                clientEmail: '',
                notes: ''
              })
            }}
            className="w-full"
          >
            Hacer otra reserva
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl md:text-2xl">Reservar Cita</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Paso {step} de 3 - {getStepDescription(step)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Paso 1: Seleccionar servicio y proveedor */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="service" className="text-sm font-medium">Servicio *</Label>
              <Select value={form.serviceId} onValueChange={(value) => handleInputChange('serviceId', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex flex-col items-start w-full py-1">
                        <span className="font-medium">{service.name}</span>
                        <span className="text-xs text-gray-600">
                          {formatPrice(service.price)} • {formatDuration(service.duration_minutes)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="provider" className="text-sm font-medium">Profesional *</Label>
              <Select value={form.providerId} onValueChange={(value) => handleInputChange('providerId', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona un profesional" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={nextStep} className="w-full h-12 text-base font-medium">
              Continuar
            </Button>
          </div>
        )}        {/* Paso 2: Seleccionar fecha y hora */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="date" className="text-sm font-medium">Fecha *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="time" className="text-sm font-medium">Hora *</Label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Cargando horarios...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      type="button"
                      variant={form.time === slot.time ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => handleInputChange('time', slot.time)}
                      className={`h-12 text-base font-medium ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {slot.time}
                    </Button>
                  ))}
                </div>
              )}
              {availableSlots.length === 0 && !loadingSlots && (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-base">No hay horarios disponibles para esta fecha.</p>
                  <p className="text-sm">Selecciona otra fecha.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={prevStep} className="h-12 text-base font-medium sm:flex-1">
                Atrás
              </Button>
              <Button onClick={nextStep} className="h-12 text-base font-medium sm:flex-1">
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3: Datos del cliente */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="clientName" className="text-sm font-medium">Nombre completo *</Label>
              <Input
                value={form.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Tu nombre completo"
                className="h-12 text-base"
                autoComplete="name"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="clientPhone" className="text-sm font-medium">Teléfono *</Label>
              <Input
                value={form.clientPhone}
                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                placeholder="+56 9 1234 5678"
                className="h-12 text-base"
                type="tel"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="clientEmail" className="text-sm font-medium">Email *</Label>
              <Input
                type="email"
                value={form.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                placeholder="tu@email.com"
                className="h-12 text-base"
                autoComplete="email"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-sm font-medium">Notas adicionales</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Alguna preferencia o comentario especial..."
                rows={4}
                className="text-base resize-none"
              />
            </div>

            {/* Resumen */}
            {selectedService && selectedProvider && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 text-base">Resumen de tu reserva:</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Servicio:</span>
                    <span className="text-sm">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Profesional:</span>
                    <span className="text-sm">{selectedProvider.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Fecha:</span>
                    <span className="text-sm">{form.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Hora:</span>
                    <span className="text-sm">{form.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Duración:</span>
                    <span className="text-sm">{formatDuration(selectedService.duration_minutes)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2 mt-3">
                    <span className="font-semibold text-lg">Precio:</span>
                    <span className="font-bold text-lg text-green-600">{formatPrice(selectedService.price)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={prevStep} className="h-12 text-base font-medium sm:flex-1">
                Atrás
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="h-12 text-base font-medium sm:flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Creando reserva...' : 'Confirmar Reserva'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}