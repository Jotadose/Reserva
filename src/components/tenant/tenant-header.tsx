'use client'

import { Phone, Mail, MapPin, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface TenantHeaderProps {
  tenant: Tenant
}

export function TenantHeader({ tenant }: TenantHeaderProps) {
  const handleWhatsAppClick = () => {
    if (tenant.whatsapp) {
      const cleanPhone = tenant.whatsapp.replace(/[^0-9]/g, '')
      const message = encodeURIComponent(`Hola! Me gustaría reservar una cita en ${tenant.name}`)
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
    }
  }

  const handleInstagramClick = () => {
    if (tenant.instagram) {
      const username = tenant.instagram.replace('@', '')
      window.open(`https://instagram.com/${username}`, '_blank')
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo y nombre */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {tenant.name}
              </h1>
              {tenant.address && (
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{tenant.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex flex-wrap gap-2">
            {tenant.whatsapp && (
              <Button 
                onClick={handleWhatsAppClick}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            )}
            
            {tenant.contact_phone && (
              <Button 
                onClick={() => window.open(`tel:${tenant.contact_phone}`, '_self')}
                variant="outline"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </Button>
            )}
            
            {tenant.contact_email && (
              <Button 
                onClick={() => window.open(`mailto:${tenant.contact_email}`, '_self')}
                variant="outline"
                size="sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            )}
            
            {tenant.instagram && (
              <Button 
                onClick={handleInstagramClick}
                variant="outline"
                size="sm"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}