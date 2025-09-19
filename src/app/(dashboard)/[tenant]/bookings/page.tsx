'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, Plus, Edit, Trash2, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { bookingsAPI, providersAPI, servicesAPI } from '@/lib/supabase'
import { Booking } from '@/types/tenant'
import { BookingDialog } from '@/components/dashboard/booking-dialog'

interface ExtendedBooking extends Booking {
  providers?: {
    users: {
      name: string
      email: string
    }
  }
  services?: {
    name: string
    duration: number
    price: number
  }
  users?: {
    name: string
    email: string
    phone?: string
  }
}

const BOOKING_STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    icon: AlertCircle,
    color: 'bg-yellow-100 text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  confirmed: {
    label: 'Confirmada',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200'
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    borderColor: 'border-red-200'
  },
  completed: {
    label: 'Completada',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200'
  },
  no_show: {
    label: 'No se presentó',
    icon: XCircle,
    color: 'bg-gray-100 text-gray-800',
    borderColor: 'border-gray-200'
  }
}

const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800'
  },
  paid: {
    label: 'Pagado',
    color: 'bg-green-100 text-green-800'
  },
  refunded: {
    label: 'Reembolsado',
    color: 'bg-blue-100 text-blue-800'
  }
}

export default function BookingsPage() {
  const params = useParams()
  const tenantSlug = params.tenant as string
  
  const [bookings, setBookings] = useState<ExtendedBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<ExtendedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null)
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('')
  
  // TODO: Obtener tenant_id desde el contexto o API
  const tenantId = 'temp-tenant-id'

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await bookingsAPI.getAll(tenantId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      setBookings(data || [])
      setFilteredBookings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reservas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [tenantId])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...bookings]
    
    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }
    
    // Filtro por fecha
    if (dateFilter) {
      filtered = filtered.filter(booking => 
        booking.booking_datetime.startsWith(dateFilter)
      )
    }
    
    // Filtro por búsqueda (cliente o proveedor)
    if (searchFilter) {
      const search = searchFilter.toLowerCase()
      filtered = filtered.filter(booking => 
        booking.users?.name.toLowerCase().includes(search) ||
        booking.users?.email.toLowerCase().includes(search) ||
        booking.providers?.users?.name.toLowerCase().includes(search) ||
        booking.services?.name.toLowerCase().includes(search)
      )
    }
    
    setFilteredBookings(filtered)
  }, [bookings, statusFilter, dateFilter, searchFilter])

  const handleCreateBooking = () => {
    setSelectedBooking(null)
    setDialogOpen(true)
  }

  const handleEditBooking = (booking: ExtendedBooking) => {
    setSelectedBooking(booking)
    setDialogOpen(true)
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      return
    }

    try {
      const { error } = await bookingsAPI.delete(tenantId, bookingId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      await fetchBookings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar reserva')
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await bookingsAPI.update(tenantId, bookingId, {
        status: newStatus as any
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      await fetchBookings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado')
    }
  }

  const handleBookingSaved = () => {
    setDialogOpen(false)
    setSelectedBooking(null)
    fetchBookings()
  }

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime)
    return {
      date: date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getBookingStats = () => {
    const total = bookings.length
    const pending = bookings.filter(b => b.status === 'pending').length
    const confirmed = bookings.filter(b => b.status === 'confirmed').length
    const completed = bookings.filter(b => b.status === 'completed').length
    const cancelled = bookings.filter(b => b.status === 'cancelled').length
    
    const totalRevenue = bookings
      .filter(b => b.status === 'completed' && b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0)
    
    return { total, pending, confirmed, completed, cancelled, totalRevenue }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reservas...</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = getBookingStats()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-600 mt-2">
            Gestiona todas las reservas de tu negocio
          </p>
        </div>
        <Button onClick={handleCreateBooking}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(BOOKING_STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <Input
                placeholder="Cliente, proveedor o servicio..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reservas */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {bookings.length === 0 ? 'No hay reservas' : 'No se encontraron reservas'}
              </h3>
              <p className="text-gray-600 mb-6">
                {bookings.length === 0 
                  ? 'Comienza creando tu primera reserva'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
              {bookings.length === 0 && (
                <Button onClick={handleCreateBooking}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Reserva
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => {
            const statusConfig = BOOKING_STATUS_CONFIG[booking.status]
            const paymentConfig = PAYMENT_STATUS_CONFIG[booking.payment_status || 'pending']
            const StatusIcon = statusConfig.icon
            const dateTime = formatDateTime(booking.booking_datetime)

            return (
              <Card key={booking.id} className={`hover:shadow-md transition-shadow ${statusConfig.borderColor} border`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <StatusIcon className="w-5 h-5" />
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        <Badge className={paymentConfig.color}>
                          {paymentConfig.label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          #{booking.id.slice(-8)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {booking.users?.name || 'Cliente no especificado'}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            {booking.users?.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {booking.users.email}
                              </div>
                            )}
                            {booking.users?.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {booking.users.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span className="capitalize">{dateTime.date}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {dateTime.time}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">
                            {booking.services?.name || 'Servicio no especificado'}
                          </p>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {booking.providers?.users?.name || 'Proveedor no especificado'}
                            </div>
                            {booking.total_amount && (
                              <div className="flex items-center font-medium">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {formatPrice(booking.total_amount)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {booking.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {booking.status === 'pending' && (
                        <Select
                          value={booking.status}
                          onValueChange={(value) => handleStatusChange(booking.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Confirmar</SelectItem>
                            <SelectItem value="cancelled">Cancelar</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <Select
                          value={booking.status}
                          onValueChange={(value) => handleStatusChange(booking.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completar</SelectItem>
                            <SelectItem value="no_show">No se presentó</SelectItem>
                            <SelectItem value="cancelled">Cancelar</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBooking(booking)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        booking={selectedBooking}
        tenantId={tenantId}
        onSaved={handleBookingSaved}
      />
    </div>
  )
}