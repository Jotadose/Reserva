'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Clock, DollarSign, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getSupabaseClient } from '@/lib/supabase'
import { useTenant } from '@/hooks/use-tenant'

interface Service {
  id: string
  tenant_id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  is_active: boolean
  is_featured?: boolean
  category?: string
  image_url?: string
  average_rating?: number
  bookings_count?: number
  created_at: string
  updated_at: string
}

interface ServiceFormData {
  name: string
  description: string
  duration_minutes: number
  price: number
  category: string
  is_featured: boolean
  image_url: string
}

const initialFormData: ServiceFormData = {
  name: '',
  description: '',
  duration_minutes: 30,
  price: 0,
  category: 'basico',
  is_featured: false,
  image_url: ''
}

export default function ServicesPage() {
  const { tenant } = useTenant()
  
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (tenant?.id) {
      fetchServices()
    }
  }, [tenant])

  const fetchServices = async () => {
    if (!tenant?.id) return

    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      setServices(data || [])
    } catch (err) {
      console.error('Error fetching services:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar servicios')
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateForm = () => {
    setEditingService(null)
    setFormData(initialFormData)
    setIsFormOpen(true)
  }

  const openEditForm = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: service.price,
      category: service.category || 'basico',
      is_featured: service.is_featured || false,
      image_url: service.image_url || ''
    })
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingService(null)
    setFormData(initialFormData)
  }

  const handleSaveService = async () => {
    if (!tenant?.id) return

    if (!formData.name.trim()) {
      setError('El nombre del servicio es obligatorio')
      return
    }

    if (formData.price <= 0) {
      setError('El precio debe ser mayor a 0')
      return
    }

    if (formData.duration_minutes <= 0) {
      setError('La duración debe ser mayor a 0')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      
      const serviceData = {
        tenant_id: tenant.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        duration_minutes: formData.duration_minutes,
        price: formData.price,
        category: formData.category,
        is_featured: formData.is_featured,
        image_url: formData.image_url.trim() || null,
        is_active: true,
        updated_at: new Date().toISOString()
      }

      if (editingService) {
        // Actualizar servicio existente
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id)

        if (error) throw error
      } else {
        // Crear nuevo servicio
        const { error } = await supabase
          .from('services')
          .insert([{
            ...serviceData,
            created_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      await fetchServices()
      closeForm()
    } catch (err) {
      console.error('Error saving service:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar servicio')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteService = async (service: Service) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${service.name}"?`)) {
      return
    }

    if (!tenant?.id) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', service.id)

      if (error) throw error

      await fetchServices()
    } catch (err) {
      console.error('Error deleting service:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar servicio')
    }
  }

  const toggleServiceStatus = async (service: Service) => {
    if (!tenant?.id) return

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('services')
        .update({ 
          is_active: !service.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', service.id)

      if (error) throw error

      await fetchServices()
    } catch (err) {
      console.error('Error toggling service status:', err)
      setError(err instanceof Error ? err.message : 'Error al cambiar estado del servicio')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getCategoryLabel = (category?: string) => {
    switch(category) {
      case 'basico': return 'Básico'
      case 'premium': return 'Premium'
      case 'color': return 'Color'
      default: return 'Especial'
    }
  }

  const getCategoryBadge = (category?: string) => {
    switch(category) {
      case 'basico': return 'bg-blue-100 text-blue-800'
      case 'premium': return 'bg-purple-100 text-purple-800'
      case 'color': return 'bg-orange-100 text-orange-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los servicios de {tenant?.name || 'la barbería'}
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {service.is_featured && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        Destacado
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    {service.description || 'Sin descripción'}
                  </CardDescription>
                  {service.category && (
                    <Badge 
                      variant="secondary" 
                      className={`mt-2 text-xs ${getCategoryBadge(service.category)}`}
                    >
                      {getCategoryLabel(service.category)}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {service.bookings_count !== undefined && (
                    <span className="text-xs text-gray-500">
                      {service.bookings_count} reservas
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {service.duration_minutes} minutos
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-lg font-semibold text-green-600">
                    {formatPrice(service.price)}
                  </span>
                </div>
                
                {service.average_rating && service.average_rating > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-sm">
                          {star <= (service.average_rating || 0) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({service.average_rating.toFixed(1)})
                    </span>
                  </div>
                )}
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(service)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleServiceStatus(service)}
                    className="px-2"
                  >
                    {service.is_active ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteService(service)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300 px-2"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No hay servicios configurados</p>
          <Button onClick={openCreateForm}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Servicio
          </Button>
        </div>
      )}

      {/* Aquí iría el modal/formulario que implementaremos después */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <p className="text-gray-600 mb-4">
              El formulario completo será implementado en la siguiente iteración.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
              <Button onClick={handleSaveService} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}