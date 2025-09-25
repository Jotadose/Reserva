'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTenant } from '@/hooks/use-tenant'
import { TenantHeader } from '@/components/tenant/tenant-header'
import { TenantInfo } from '@/components/tenant/tenant-info'
import { TenantServices } from '@/components/tenant/tenant-services'
import { TenantSchedule } from '@/components/tenant/tenant-schedule'
import { TenantPortfolio } from '@/components/tenant/tenant-portfolio'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Check,
  ArrowRight,
  ArrowLeft,
  User,
  Scissors
} from 'lucide-react'

type BookingStep = 'landing' | 'services' | 'datetime' | 'info' | 'confirmation'

interface BookingData {
  service?: any
  provider?: any
  date?: string
  time?: string
  clientInfo?: {
    name: string
    email: string
    phone: string
    notes?: string
  }
}

export default function BookingLandingPage() {
  const { tenant, isLoading, error } = useTenant()
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('landing')
  const [bookingData, setBookingData] = useState<BookingData>({})

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando...</h2>
          <p className="text-gray-600">Preparando tu experiencia de reserva</p>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Barbería no encontrada</h2>
          <p className="text-gray-600 mb-4">
            No pudimos encontrar la barbería que buscas. Verifica que el enlace sea correcto.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-red-600 hover:bg-red-700"
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'landing':
        return <LandingStep tenant={tenant} onNext={() => setCurrentStep('services')} />
      case 'services':
        return (
          <ServicesStep 
            tenant={tenant}
            onNext={(service) => {
              setBookingData({ ...bookingData, service })
              setCurrentStep('datetime')
            }}
            onBack={() => setCurrentStep('landing')}
          />
        )
      case 'datetime':
        return (
          <DateTimeStep 
            tenant={tenant}
            service={bookingData.service}
            onNext={(date, time, provider) => {
              setBookingData({ ...bookingData, date, time, provider })
              setCurrentStep('info')
            }}
            onBack={() => setCurrentStep('services')}
          />
        )
      case 'info':
        return (
          <ClientInfoStep 
            tenant={tenant}
            bookingData={bookingData}
            onNext={(clientInfo) => {
              setBookingData({ ...bookingData, clientInfo })
              setCurrentStep('confirmation')
            }}
            onBack={() => setCurrentStep('datetime')}
          />
        )
      case 'confirmation':
        return (
          <ConfirmationStep 
            tenant={tenant}
            bookingData={bookingData}
            onNewBooking={() => {
              setBookingData({})
              setCurrentStep('landing')
            }}
          />
        )
      default:
        return <LandingStep tenant={tenant} onNext={() => setCurrentStep('services')} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {renderStep()}
    </div>
  )
}

// Componente del paso inicial (Landing)
function LandingStep({ tenant, onNext }: { tenant: any, onNext: () => void }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <TenantHeader tenant={tenant} />
      
      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        {/* Información principal */}
        <div className="space-y-6">
          <TenantInfo tenant={tenant} />
          <TenantSchedule workingHours={tenant?.settings?.working_hours || {}} />
        </div>
        
        {/* Call to action */}
        <div className="space-y-6">
          <TenantServices tenant={tenant} preview={true} />
          <TenantPortfolio tenantSlug={tenant?.slug || ''} />
          
          {/* Botón principal de reserva */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¿Listo para tu nuevo look?
              </h3>
              <p className="text-gray-600 mb-6">
                Reserva tu cita en línea de forma rápida y sencilla
              </p>
              <Button 
                onClick={onNext}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Reservar Cita
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Componente para selección de servicios
function ServicesStep({ tenant, onNext, onBack }: { 
  tenant: any, 
  onNext: (service: any) => void,
  onBack: () => void 
}) {
  const [selectedService, setSelectedService] = useState<any>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header del paso */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecciona tu servicio
          </h1>
          <p className="text-gray-600">
            Elige el servicio que mejor se adapte a lo que necesitas
          </p>
        </div>

        {/* Servicios */}
        <TenantServices 
          tenant={tenant} 
          selectable={true}
          onServiceSelect={setSelectedService}
          selectedService={selectedService}
        />

        {/* Navegación */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Volver
          </Button>
          
          <Button 
            onClick={() => selectedService && onNext(selectedService)}
            disabled={!selectedService}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continuar
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Componente para selección de fecha y hora
function DateTimeStep({ tenant, service, onNext, onBack }: { 
  tenant: any,
  service: any,
  onNext: (date: string, time: string, provider: any) => void,
  onBack: () => void 
}) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<any>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header del paso */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¿Cuándo te viene mejor?
          </h1>
          <p className="text-gray-600">
            Selecciona la fecha y hora que más te convenga
          </p>
          
          {/* Servicio seleccionado */}
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm">
              {service?.name} - ${service?.price}
            </Badge>
          </div>
        </div>

        {/* Widget de booking */}
        <div className="space-y-6">
          {/* Calendario para seleccionar fecha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Selecciona una fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 14 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() + i + 1)
                  const dateStr = date.toISOString().split('T')[0]
                  const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' })
                  const dayNum = date.getDate()
                  const monthName = date.toLocaleDateString('es-ES', { month: 'short' })
                  
                  return (
                    <Button
                      key={dateStr}
                      variant={selectedDate === dateStr ? "default" : "outline"}
                      onClick={() => setSelectedDate(dateStr)}
                      className="h-auto p-3 flex flex-col"
                    >
                      <span className="text-xs uppercase">{dayName}</span>
                      <span className="text-lg font-bold">{dayNum}</span>
                      <span className="text-xs">{monthName}</span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Horarios disponibles */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Horarios disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
                    '17:00', '17:30', '18:00', '18:30'
                  ].map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => {
                        setSelectedTime(time)
                        setSelectedProvider({ id: '1', name: 'Barbero Principal' })
                      }}
                      className="h-12"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navegación */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Volver
          </Button>
          
          <Button 
            onClick={() => selectedDate && selectedTime && onNext(selectedDate, selectedTime, selectedProvider)}
            disabled={!selectedDate || !selectedTime}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continuar
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Componente para información del cliente
function ClientInfoStep({ tenant, bookingData, onNext, onBack }: { 
  tenant: any,
  bookingData: BookingData,
  onNext: (clientInfo: any) => void,
  onBack: () => void 
}) {
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(clientInfo)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header del paso */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Casi listo
          </h1>
          <p className="text-gray-600">
            Solo necesitamos algunos datos para confirmar tu reserva
          </p>
        </div>

        {/* Resumen de la reserva */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              Resumen de tu reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium">{bookingData.service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium">{bookingData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hora:</span>
              <span className="font-medium">{bookingData.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duración:</span>
              <span className="font-medium">{bookingData.service?.duration} min</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${bookingData.service?.price}</span>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de información del cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Tus datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="client-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  id="client-name"
                  type="text"
                  required
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div>
                <label htmlFor="client-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="client-email"
                  type="email"
                  required
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="client-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  id="client-phone"
                  type="tel"
                  required
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+56 9 1234 5678"
                />
              </div>
              
              <div>
                <label htmlFor="client-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  id="client-notes"
                  value={clientInfo.notes}
                  onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Alguna preferencia especial o comentario..."
                />
              </div>

              {/* Navegación */}
              <div className="flex justify-between pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={onBack}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Volver
                </Button>
                
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Confirmar Reserva
                  <Check className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente de confirmación
function ConfirmationStep({ tenant, bookingData, onNewBooking }: { 
  tenant: any,
  bookingData: BookingData,
  onNewBooking: () => void 
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Ícono de éxito */}
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Reserva confirmada!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Tu cita ha sido reservada exitosamente. Te hemos enviado un email de confirmación.
        </p>

        {/* Detalles de la reserva */}
        <Card className="text-left mb-8">
          <CardHeader>
            <CardTitle>Detalles de tu cita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-3" />
              <span>{bookingData.date} a las {bookingData.time}</span>
            </div>
            <div className="flex items-center">
              <Scissors className="w-5 h-5 text-gray-500 mr-3" />
              <span>{bookingData.service?.name}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-500 mr-3" />
              <span>{bookingData.service?.duration} minutos</span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-500 mr-3" />
              <span>{bookingData.clientInfo?.name}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-500 mr-3" />
              <span>{bookingData.clientInfo?.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Información de contacto de la barbería */}
        <Card className="text-left mb-8">
          <CardHeader>
            <CardTitle>Información de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-500 mr-3" />
              <span>{tenant.settings?.business?.address || 'Dirección no disponible'}</span>
            </div>
            {tenant.contact_phone && (
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-500 mr-3" />
                <span>{tenant.contact_phone}</span>
              </div>
            )}
            {tenant.contact_email && (
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-500 mr-3" />
                <span>{tenant.contact_email}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="space-y-4">
          <Button 
            onClick={onNewBooking}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Hacer otra reserva
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.print()}
            className="w-full"
          >
            Imprimir confirmación
          </Button>
        </div>
      </div>
    </div>
  )
}