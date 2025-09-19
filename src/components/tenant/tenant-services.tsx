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
  services: Service[]
  enhanced?: boolean
}



export function TenantServices({ services, enhanced = false }: TenantServicesProps) {
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

  if (enhanced) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer group border-0 shadow-md">
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
        <CardTitle>Nuestros Servicios</CardTitle>
        <CardDescription>
          Selecciona el servicio que deseas reservar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}