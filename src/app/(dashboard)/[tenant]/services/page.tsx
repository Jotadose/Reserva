'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { servicesAPI } from '@/lib/supabase'
import { Service } from '@/types/tenant'
import { useTenant } from '@/hooks/use-tenant'

export default function ServicesPage() {
  const { tenant } = useTenant()
  
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tenant?.id) {
      fetchServices()
    } else {
      // Usar datos mock si no hay tenant
      setServices([
        {
          id: 'service-1',
          tenant_id: 'demo-tenant-id',
          name: 'Corte de Cabello',
          description: 'Corte de cabello profesional',
          duration_minutes: 30,
          price: 2500,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'service-2',
          tenant_id: 'demo-tenant-id',
          name: 'Barba',
          description: 'Recorte y arreglo de barba',
          duration_minutes: 20,
          price: 1500,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'service-3',
          tenant_id: 'demo-tenant-id',
          name: 'Combo Completo',
          description: 'Corte + Barba + Lavado',
          duration_minutes: 60,
          price: 3500,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      setIsLoading(false)
    }
  }, [tenant])

  const fetchServices = async () => {
    if (!tenant?.id) return

    try {
      setIsLoading(true)
      setError(null)
      
      const result = await servicesAPI.getAll(tenant.id)
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      setServices(result.data || [])
    } catch (err) {
      console.error('Error fetching services:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar servicios')
      
      // Si hay error, usar servicios mock para desarrollo
      setServices([
        {
          id: 'service-1',
          tenant_id: tenant.id,
          name: 'Corte de Cabello',
          description: 'Corte de cabello profesional',
          duration_minutes: 30,
          price: 2500,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'service-2',
          tenant_id: tenant.id,
          name: 'Barba',
          description: 'Recorte y arreglo de barba',
          duration_minutes: 20,
          price: 1500,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'service-3',
          tenant_id: tenant.id,
          name: 'Combo Completo',
          description: 'Corte + Barba + Lavado',
          duration_minutes: 60,
          price: 3500,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP'
    })
  }

  const handleCreateService = () => {
    alert('Función de crear servicio: será implementada en futuras versiones')
    console.log('Crear nuevo servicio')
  }

  const handleEditService = (service: Service) => {
    alert(`Función de editar servicio "${service.name}": será implementada en futuras versiones`)
    console.log('Editar servicio:', service)
  }

  const handleDeleteService = async (service: Service) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${service.name}"?`)) {
      return
    }

    if (!tenant?.id) {
      alert('Error: No hay tenant activo')
      return
    }

    try {
      const result = await servicesAPI.delete(tenant.id, service.id)
      
      if (result.error) {
        throw new Error(result.error.message)
      }
      
      // Refrescar la lista
      fetchServices()
    } catch (err) {
      console.error('Error deleting service:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar servicio')
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los servicios de {tenant?.name || 'la barbería'}
          </p>
        </div>
        <Button onClick={handleCreateService}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>
            {error}
            {error.includes('cargar') && (
              <span className="block mt-2 text-sm">
                Mostrando datos de ejemplo para desarrollo.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {service.description}
                  </CardDescription>
                </div>
                <Badge variant={service.is_active ? "default" : "secondary"}>
                  {service.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
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
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditService(service)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteService(service)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
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
          <Button onClick={handleCreateService}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Servicio
          </Button>
        </div>
      )}
    </div>
  )
}