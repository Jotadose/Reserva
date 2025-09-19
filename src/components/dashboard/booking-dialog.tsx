'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { providersAPI, servicesAPI, bookingsAPI, usersAPI } from '@/lib/supabase'
import { Provider, Service, Booking, User } from '@/types/tenant'

interface ExtendedProvider extends Provider {
  users?: {
    name: string
    email: string
  }
}

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking?: Booking | null
  tenantId: string
  onSaved: () => void
}

interface BookingFormData {
  user_id?: string
  provider_id: string
  service_id: string
  booking_datetime: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'cancelled' | 'completed' | 'no_show'
  payment_status?: string
  payment_method?: string
  total_amount?: number
  deposit_amount?: number
  notes?: string
  reminder_sent: boolean
  cancellation_reason?: string
}

const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'completed', label: 'Completada' },
  { value: 'no_show', label: 'No se presentó' }
]

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'refunded', label: 'Reembolsado' }
]

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'online', label: 'Pago Online' }
]

export function BookingDialog({
  open,
  onOpenChange,
  booking,
  tenantId,
  onSaved
}: BookingDialogProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    user_id: '',
    provider_id: '',
    service_id: '',
    booking_datetime: '',
    status: 'pending',
    payment_status: 'pending',
    payment_method: '',
    total_amount: 0,
    deposit_amount: 0,
    notes: '',
    reminder_sent: false,
    cancellation_reason: ''
  })
  
  const [providers, setProviders] = useState<ExtendedProvider[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const isEditing = !!booking

  // Cargar datos necesarios
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true)
        
        const [providersResult, servicesResult, usersResult] = await Promise.all([
          providersAPI.getAll(tenantId),
          servicesAPI.getAll(tenantId),
          usersAPI.getAll(tenantId)
        ])
        
        if (providersResult.error) throw new Error(providersResult.error.message)
        if (servicesResult.error) throw new Error(servicesResult.error.message)
        if (usersResult.error) throw new Error(usersResult.error.message)
        
        setProviders(providersResult.data || [])
        setServices(servicesResult.data || [])
        setUsers(usersResult.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos')
      } finally {
        setLoadingData(false)
      }
    }
    
    if (open) {
      loadData()
    }
  }, [open, tenantId])

  useEffect(() => {
    if (booking) {
      // Combinar scheduled_date y scheduled_time para crear datetime
      const bookingDateTime = `${booking.scheduled_date}T${booking.scheduled_time}`
      const bookingDate = new Date(bookingDateTime)
      const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        user_id: booking.client_id,
        provider_id: booking.provider_id,
        service_id: booking.service_id,
        booking_datetime: formatDateTimeLocal(bookingDate),
        status: booking.status,
        payment_status: booking.payment_status || 'pending',
        payment_method: booking.payment_method || '',
        total_amount: booking.total_price || 0,
        deposit_amount: booking.deposit_amount || 0,
        notes: booking.notes || '',
        reminder_sent: booking.reminder_sent || false,
        cancellation_reason: booking.cancellation_reason || ''
      })
    } else {
      // Valores por defecto para nueva reserva
      const now = new Date()
      const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        user_id: '',
        provider_id: '',
        service_id: '',
        booking_datetime: formatDateTimeLocal(now),
        status: 'pending',
        payment_status: 'pending',
        payment_method: '',
        total_amount: 0,
        deposit_amount: 0,
        notes: '',
        reminder_sent: false,
        cancellation_reason: ''
      })
    }
    setError(null)
  }, [booking, open])

  // Actualizar precio total cuando cambia el servicio
  useEffect(() => {
    if (formData.service_id) {
      const selectedService = services.find(s => s.id === formData.service_id)
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          total_amount: selectedService.price
        }))
      }
    }
  }, [formData.service_id, services])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validaciones
      if (!formData.user_id || !formData.provider_id || !formData.service_id || !formData.booking_datetime) {
        throw new Error('Todos los campos obligatorios deben ser completados')
      }

      const bookingDate = new Date(formData.booking_datetime)
      if (bookingDate < new Date()) {
        throw new Error('La fecha de la reserva no puede ser en el pasado')
      }

      // Preparar datos para la API
      const bookingData = {
        user_id: formData.user_id,
        provider_id: formData.provider_id,
        service_id: formData.service_id,
        booking_datetime: bookingDate.toISOString(),
        status: formData.status,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method || null,
        total_amount: formData.total_amount || null,
        deposit_amount: formData.deposit_amount || null,
        notes: formData.notes || null,
        reminder_sent: formData.reminder_sent,
        cancellation_reason: formData.cancellation_reason || null
      }

      let result
      if (isEditing && booking) {
        result = await bookingsAPI.update(tenantId, booking.id, bookingData)
      } else {
        result = await bookingsAPI.create(tenantId, bookingData)
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la reserva')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loadingData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los detalles de la reserva'
              : 'Crea una nueva reserva para un cliente'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">Cliente *</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => handleInputChange('user_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider_id">Proveedor *</Label>
              <Select
                value={formData.provider_id}
                onValueChange={(value) => handleInputChange('provider_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.users?.name || 'Proveedor sin nombre'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_id">Servicio *</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) => handleInputChange('service_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {service.price}€ ({service.duration_minutes}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking_datetime">Fecha y Hora *</Label>
              <Input
                id="booking_datetime"
                type="datetime-local"
                value={formData.booking_datetime}
                onChange={(e) => handleInputChange('booking_datetime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">Estado de Pago</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => handleInputChange('payment_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pago</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleInputChange('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona método" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Precio Total (€)</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount}
                onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit_amount">Depósito (€)</Label>
              <Input
                id="deposit_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.deposit_amount}
                onChange={(e) => handleInputChange('deposit_amount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre la reserva..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {formData.status === 'cancelled' && (
            <div className="space-y-2">
              <Label htmlFor="cancellation_reason">Razón de Cancelación</Label>
              <Textarea
                id="cancellation_reason"
                placeholder="Describe la razón de la cancelación..."
                value={formData.cancellation_reason}
                onChange={(e) => handleInputChange('cancellation_reason', e.target.value)}
                rows={2}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reminder_sent"
              checked={formData.reminder_sent}
              onChange={(e) => handleInputChange('reminder_sent', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="reminder_sent">Recordatorio enviado</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}