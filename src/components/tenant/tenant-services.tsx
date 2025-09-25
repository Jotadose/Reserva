'use client'

import { Clock, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDuration } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  is_active: boolean
}

interface TenantServicesProps {
  services?: Service[]
  tenant?: any
  enhanced?: boolean
  preview?: boolean
  selectable?: boolean
  onServiceSelect?: (service: Service) => void
  selectedService?: Service | null
}



export function TenantServices({ 
  services: propServices, 
  tenant,
  enhanced = false, 
  preview = false,
  selectable = false,
  onServiceSelect,
  selectedService
}: Readonly<TenantServicesProps>) {
  // Usar servicios del prop o mock services del tenant
  const services = propServices || (tenant ? [
    { id: '1', name: 'Corte Clásico', description: 'Corte tradicional con tijeras', duration_minutes: 30, price: 15000, is_active: true },
    { id: '2', name: 'Corte + Barba', description: 'Corte completo con arreglo de barba', duration_minutes: 45, price: 25000, is_active: true },
    { id: '3', name: 'Afeitado Clásico', description: 'Afeitado tradicional con navaja', duration_minutes: 20, price: 12000, is_active: true }
  ] : [])

  if (!services || services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Servicios</CardTitle>
          <CardDescription>
            Próximamente estarán disponibles nuestros servicios.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Si es preview, mostrar solo los primeros 3
  const displayServices = preview ? services.slice(0, 3) : services

  const handleServiceClick = (service: Service) => {
    if (selectable && onServiceSelect) {
      onServiceSelect(service)
    }
  }

  if (enhanced || selectable) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayServices.map((service) => (
          <Card 
            key={service.id} 
            className={`hover:shadow-lg transition-all cursor-pointer group border-0 shadow-md ${
              selectable && selectedService?.id === service.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleServiceClick(service)}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                {service.name}
              </CardTitle>
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(service.price)}
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {service.description && (
                <CardDescription className="text-gray-600">
                  {service.description}
                </CardDescription>
              )}
              
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span>{formatDuration(service.duration_minutes)}</span>
              </div>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
                Seleccionar
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{preview ? 'Nuestros Servicios' : 'Servicios Disponibles'}</CardTitle>
        <CardDescription>
          {preview ? 'Algunos de nuestros servicios más populares' : 'Selecciona el servicio que deseas reservar'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayServices.map((service) => (
            <button
              key={service.id}
              type="button"
              className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group text-left w-full ${
                selectable && selectedService?.id === service.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleServiceClick(service)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </h3>
                <Badge variant="secondary" className="ml-2">
                  {formatPrice(service.price)}
                </Badge>
              </div>
              
              {service.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {service.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatDuration(service.duration_minutes)}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="font-medium">{formatPrice(service.price)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}