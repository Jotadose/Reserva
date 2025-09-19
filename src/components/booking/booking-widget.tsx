'use client'

import { useState } from 'react'
import { Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatPrice, formatDuration } from '@/lib/utils'

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
  working_hours: any
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

const AVAILABLE_TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00'
]

export function BookingWidget({ tenant, services, providers }: BookingWidgetProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
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
      // Aquí iría la lógica para crear la reserva
      // Por ahora simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setStep(4)
    } catch (err) {
      setError('Error al crear la reserva. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
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
    <Card>
      <CardHeader>
        <CardTitle>Reservar Cita</CardTitle>
        <CardDescription>
          Paso {step} de 3 - {step === 1 ? 'Selecciona servicio' : step === 2 ? 'Elige fecha y hora' : 'Datos de contacto'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Paso 1: Seleccionar servicio y profesional */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="service">Servicio *</Label>
              <Select value={form.serviceId} onValueChange={(value) => handleInputChange('serviceId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{service.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatPrice(service.price)} • {formatDuration(service.duration_minutes)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="provider">Profesional *</Label>
              <Select value={form.providerId} onValueChange={(value) => handleInputChange('providerId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesional" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {provider.name} {provider.role === 'owner' && '(Propietario)'}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={nextStep} className="w-full">
              Continuar
            </Button>
          </div>
        )}

        {/* Paso 2: Seleccionar fecha y hora */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="time">Hora *</Label>
              <Select value={form.time} onValueChange={(value) => handleInputChange('time', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una hora" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_TIMES.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                Atrás
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3: Datos del cliente */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientName">Nombre completo *</Label>
              <Input
                value={form.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <Label htmlFor="clientPhone">Teléfono *</Label>
              <Input
                value={form.clientPhone}
                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div>
              <Label htmlFor="clientEmail">Email *</Label>
              <Input
                type="email"
                value={form.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Alguna preferencia o comentario especial..."
                rows={3}
              />
            </div>

            {/* Resumen */}
            {selectedService && selectedProvider && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Resumen de tu reserva:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Servicio:</strong> {selectedService.name}</p>
                  <p><strong>Profesional:</strong> {selectedProvider.name}</p>
                  <p><strong>Fecha:</strong> {form.date}</p>
                  <p><strong>Hora:</strong> {form.time}</p>
                  <p><strong>Duración:</strong> {formatDuration(selectedService.duration_minutes)}</p>
                  <p><strong>Precio:</strong> {formatPrice(selectedService.price)}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                Atrás
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
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