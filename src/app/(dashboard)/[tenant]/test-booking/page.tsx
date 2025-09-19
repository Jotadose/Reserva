'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Phone, Check, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { bookingsAPI, servicesAPI, providersAPI } from '@/lib/supabase'
import { useTenant } from '@/hooks/use-tenant'
import { Booking, Service, Provider } from '@/types/tenant'

interface ProviderWithUser extends Provider {
  // Datos del usuario asociado
  user_name?: string
  user_email?: string  
}

interface BookingFormData {
  service_id: string
  provider_id: string
  client_name: string
  client_email: string
  client_phone: string
  booking_date: string
  booking_time: string
  notes: string
}

export default function TestBookingPage() {
  const { tenant } = useTenant()
  
  const [services, setServices] = useState<Service[]>([])
  const [providers, setProviders] = useState<ProviderWithUser[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<BookingFormData>({
    service_id: '',
    provider_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    booking_date: '',
    booking_time: '',
    notes: ''
  })

  useEffect(() => {
    loadInitialData()
  }, [tenant])

  const loadInitialData = async () => {
    if (!tenant?.id) {
      // Datos mock para desarrollo
      setServices([
        {
          id: 'service-1',
          tenant_id: 'demo-tenant-id',
          name: 'Corte de Cabello',
          description: 'Corte profesional',
          duration_minutes: 30,
          price: 2500,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      
      setProviders([
        {
          id: 'provider-1',
          tenant_id: 'demo-tenant-id',
          user_id: 'user-1',
          bio: 'Barbero profesional con 5 años de experiencia',
          specialties: ['Cortes', 'Barba'],
          commission_rate: 0.5,
          is_active: true,
          user_name: 'Demo Barbero',
          user_email: 'barbero@demo.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      return
    }

    try {
      // Cargar servicios
      const servicesResult = await servicesAPI.getAll(tenant.id)
      if (servicesResult.data) {
        setServices(servicesResult.data.filter(s => s.is_active))
      }

      // Cargar proveedores
      const providersResult = await providersAPI.getAll(tenant.id)
      if (providersResult.data) {
        setProviders(providersResult.data.filter(p => p.is_active))
      }

      // Cargar reservas recientes
      await loadRecentBookings()
    } catch (err) {
      console.error('Error loading initial data:', err)
      setError('Error al cargar datos iniciales')
    }
  }

  const loadRecentBookings = async () => {
    if (!tenant?.id) return

    try {
      const result = await bookingsAPI.getAll(tenant.id)
      if (result.data) {
        // Ordenar por fecha de creación descendente y tomar los últimos 5
        const sortedBookings = result.data.toSorted((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        const recentBookings = sortedBookings.slice(0, 5)
        setRecentBookings(recentBookings)
      }
    } catch (err) {
      console.error('Error loading recent bookings:', err)
    }
  }

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const validateForm = (): string | null => {
    if (!formData.service_id) return 'Debe seleccionar un servicio'
    if (!formData.provider_id) return 'Debe seleccionar un proveedor'
    if (!formData.client_name.trim()) return 'El nombre del cliente es requerido'
    if (!formData.client_email.trim()) return 'El email del cliente es requerido'
    if (!formData.client_phone.trim()) return 'El teléfono del cliente es requerido'
    if (!formData.booking_date) return 'La fecha de la reserva es requerida'
    if (!formData.booking_time) return 'La hora de la reserva es requerida'

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.client_email)) {
      return 'El formato del email no es válido'
    }

    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(`${formData.booking_date}T${formData.booking_time}`)
    if (selectedDate < new Date()) {
      return 'La fecha y hora debe ser en el futuro'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!tenant?.id) {
      setError('No hay tenant activo')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Encontrar el servicio seleccionado para obtener la duración
      const selectedService = services.find(s => s.id === formData.service_id)
      if (!selectedService) {
        throw new Error('Servicio no encontrado')
      }

      // Crear la fecha y hora de inicio
      const startDateTime = new Date(`${formData.booking_date}T${formData.booking_time}`)

      // Crear la reserva
      const bookingData = {
        tenant_id: tenant.id,
        service_id: formData.service_id,
        provider_id: formData.provider_id,
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        scheduled_date: formData.booking_date,
        scheduled_time: formData.booking_time,
        duration_minutes: selectedService.duration_minutes,
        status: 'confirmed' as const,
        service_price: selectedService.price,
        total_price: selectedService.price,
        confirmation_sent: false,
        reminder_sent_24h: false,
        reminder_sent_2h: false,
        payment_status: 'pending' as const,
        notes: formData.notes || null
      }

      const result = await bookingsAPI.create(tenant.id, bookingData)
      
      if (result.error) {
        throw new Error(result.error.message)
      }

      // Éxito
      const providerName = providers.find(p => p.id === formData.provider_id)?.user_name || 'Proveedor'
      setSuccess(
        `✅ Reserva creada exitosamente!\n` +
        `📅 Fecha: ${startDateTime.toLocaleDateString('es-CO')}\n` +
        `🕐 Hora: ${startDateTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}\n` +
        `👤 Cliente: ${formData.client_name}\n` +
        `💼 Servicio: ${selectedService.name}\n` +
        `👨‍💼 Proveedor: ${providerName}\n` +
        `💰 Precio: ${(selectedService.price / 100).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}`
      )

      // Limpiar el formulario
      setFormData({
        service_id: '',
        provider_id: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        booking_date: '',
        booking_time: '',
        notes: ''
      })

      // Recargar reservas recientes
      await loadRecentBookings()

    } catch (err) {
      console.error('Error creating booking:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la reserva')
    } finally {
      setIsLoading(false)
    }
  }

  const formatBookingStatus = (status: string) => {
    const statusMap = {
      confirmed: { label: 'Confirmada', variant: 'default' as const },
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const },
      completed: { label: 'Completada', variant: 'default' as const }
    }
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Prueba de Flujo de Reservas</h1>
        <p className="text-gray-600 mt-2">
          Crea una reserva de prueba y verifica que se guarde correctamente en la base de datos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Reserva */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Nueva Reserva</span>
            </CardTitle>
            <CardDescription>
              Completa el formulario para crear una reserva de prueba
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selección de Servicio */}
              <div className="space-y-2">
                <Label htmlFor="service">Servicio *</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => handleInputChange('service_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - {service.duration_minutes}min - ${(service.price / 100).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selección de Proveedor */}
              <div className="space-y-2">
                <Label htmlFor="provider">Proveedor *</Label>
                <Select
                  value={formData.provider_id}
                  onValueChange={(value) => handleInputChange('provider_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.user_name || `Proveedor ${provider.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Datos del Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Nombre del Cliente *</Label>
                  <Input
                    id="client_name"
                    placeholder="Juan Pérez"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client_phone">Teléfono *</Label>
                  <Input
                    id="client_phone"
                    placeholder="+57 300 123 4567"
                    value={formData.client_phone}
                    onChange={(e) => handleInputChange('client_phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_email">Email del Cliente *</Label>
                <Input
                  id="client_email"
                  type="email"
                  placeholder="juan@email.com"
                  value={formData.client_email}
                  onChange={(e) => handleInputChange('client_email', e.target.value)}
                />
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking_date">Fecha *</Label>
                  <Input
                    id="booking_date"
                    type="date"
                    value={formData.booking_date}
                    onChange={(e) => handleInputChange('booking_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="booking_time">Hora *</Label>
                  <Input
                    id="booking_time"
                    type="time"
                    value={formData.booking_time}
                    onChange={(e) => handleInputChange('booking_time', e.target.value)}
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Instrucciones especiales o comentarios..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Alertas */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <X className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 whitespace-pre-line">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Botón de Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creando Reserva...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Crear Reserva de Prueba
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Panel de Reservas Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Reservas Recientes</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadRecentBookings}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Últimas reservas creadas en el sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay reservas aún</p>
                  <p className="text-sm">Crea la primera reserva de prueba</p>
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.client_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.client_email}
                        </p>
                      </div>
                      <Badge variant={formatBookingStatus(booking.status).variant}>
                        {formatBookingStatus(booking.status).label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{booking.scheduled_date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{booking.scheduled_time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{booking.client_phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">
                          ${(booking.total_price / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <p className="text-xs text-gray-500 italic">
                        Nota: {booking.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}