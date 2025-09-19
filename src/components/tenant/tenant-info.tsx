'use client'

import { Clock, MapPin, Phone, Mail, Instagram } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTime } from '@/lib/utils'

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

interface TenantInfoProps {
  tenant: Tenant
}

const DAYS_MAP = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
}



export function TenantInfo({ tenant }: TenantInfoProps) {
  const workingHours = tenant.working_hours || {}
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Horarios de atención */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Horarios de Atención
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(DAYS_MAP).map(([key, dayName]) => {
              const daySchedule = workingHours[key]
              const isEnabled = daySchedule?.enabled !== false
              
              return (
                <div key={key} className="flex justify-between items-center py-1">
                  <span className={`font-medium ${
                    isEnabled ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {dayName}
                  </span>
                  <span className={`text-sm ${
                    isEnabled ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {isEnabled && daySchedule?.start && daySchedule?.end
                      ? `${formatTime(daySchedule.start)} - ${formatTime(daySchedule.end)}`
                      : 'Cerrado'
                    }
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Información de contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tenant.address && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Dirección</p>
                <p className="text-sm text-gray-600">{tenant.address}</p>
              </div>
            </div>
          )}
          
          {tenant.contact_phone && (
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Teléfono</p>
                <a 
                  href={`tel:${tenant.contact_phone}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {tenant.contact_phone}
                </a>
              </div>
            </div>
          )}
          
          {tenant.contact_email && (
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <a 
                  href={`mailto:${tenant.contact_email}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {tenant.contact_email}
                </a>
              </div>
            </div>
          )}
          
          {tenant.instagram && (
            <div className="flex items-start space-x-3">
              <Instagram className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Instagram</p>
                <a 
                  href={`https://instagram.com/${tenant.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {tenant.instagram}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}