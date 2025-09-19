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
}



export function TenantServices({ services }: TenantServicesProps) {
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