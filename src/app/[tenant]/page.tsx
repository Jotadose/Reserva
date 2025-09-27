'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTenant } from '@/hooks/use-tenant'
import { useBranding } from '@/hooks/use-branding'
import { usePublicServices } from '@/hooks/use-public-services'
import { useFeaturedServices } from '@/hooks/use-featured-services'

import Link from 'next/link'
import {
  Scissors,
  Clock,
  Star,
  Calendar,
  Instagram,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Award,
  Users,
  Sparkles,
  ChevronDown
} from 'lucide-react'

// Utility functions
const getCategoryBadge = (category?: string) => {
  switch(category) {
    case 'basico': return 'bg-blue-600/20 text-blue-400'
    case 'premium': return 'bg-purple-600/20 text-purple-400'
    case 'color': return 'bg-orange-600/20 text-orange-400'
    default: return 'bg-green-600/20 text-green-400'
  }
}

const getCategoryLabel = (category?: string) => {
  switch(category) {
    case 'basico': return 'Básico'
    case 'premium': return 'Premium'
    case 'color': return 'Color'
    default: return 'Especial'
  }
}

const getMockContact = (tenant: any) => ({
  businessName: tenant?.name || 'Mi Barbería',
  instagram: '@' + (tenant?.slug || 'mibarberia'),
  whatsapp: tenant?.contact_phone || '+56 9 0000 0000',
  email: tenant?.contact_email || 'contacto@mibarberia.com',
  address: tenant?.settings?.address || 'Dirección de la barbería'
})

const getMockSchedule = () => ({
  workingHours: {
    start: '09:00',
    end: '18:00',
    lunchStart: '13:00',
    lunchEnd: '14:00'
  },
  timeSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
})

export default function TenantLandingPage() {
  const { tenant, isLoading, error } = useTenant()
  const { colors, getGradientStyle, getButtonStyle, logoUrl, coverImageUrl } = useBranding()
  const { services } = usePublicServices(tenant?.id || null)
  const { services: featuredServices } = useFeaturedServices(tenant?.id || null, 3)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Cargando...</h2>
          <p className="text-purple-200">Preparando tu barbería</p>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Barbería no encontrada</h2>
          <p className="text-red-200 mb-4">
            No pudimos encontrar la barbería que buscas.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Ir al inicio
          </Button>
        </div>
      </div>
    )
  }

  const contact = getMockContact(tenant)
  const schedule = getMockSchedule()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
    }
    return `${minutes}min`
  }

  return (
    <div className="min-h-screen" style={getGradientStyle()}>
      {/* Navigation */}
      <nav className={`glass sticky top-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'backdrop-blur-md' : 'backdrop-blur-sm'
      }`}
      style={{ borderBottomColor: colors.primary + '33' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={getGradientStyle()}>
                  <Scissors className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{contact.businessName}</h1>
                <div className="flex items-center space-x-1 text-xs" style={{ color: colors.primary + 'CC' }}>
                  <Instagram className="w-3 h-3" />
                  <span>{contact.instagram}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#servicios" className="text-gray-300 hover:text-white transition-colors">Servicios</a>
              <a href="#horarios" className="text-gray-300 hover:text-white transition-colors">Horarios</a>
              <a href="#contacto" className="text-gray-300 hover:text-white transition-colors">Contacto</a>
              <Link href={`/${tenant.slug}/book`}>
                <Button className="text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium" style={getButtonStyle()}>
                  Reservar Cita
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        {coverImageUrl && (
          <div className="absolute inset-0 z-0">
            <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center animate-float" style={getGradientStyle()}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <Scissors className="w-12 h-12 text-white" />
            )}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Bienvenido a <span style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{contact.businessName}</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experiencia profesional en barbería con técnicas modernas y atención personalizada. 
            Tu estilo, nuestra pasión.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href={`/${tenant.slug}/book`}>
              <Button size="lg" className="text-white px-8 py-4 rounded-lg transition-all duration-200 font-semibold text-lg flex items-center space-x-2" style={getButtonStyle()}>
                <Calendar className="w-5 h-5" />
                <span>Reservar Ahora</span>
              </Button>
            </Link>
            
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/\s/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button text-green-400 px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 border border-green-500/30"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Experiencia Profesional</h3>
              <p className="text-gray-300 text-sm">Años de experiencia en técnicas modernas de barbería</p>
            </div>
            
            <div className="glass-card p-6">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Atención Personalizada</h3>
              <p className="text-gray-300 text-sm">Cada cliente recibe atención exclusiva y personalizada</p>
            </div>
            
            <div className="glass-card p-6">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Técnicas Modernas</h3>
              <p className="text-gray-300 text-sm">Utilizamos las últimas técnicas y herramientas profesionales</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section id="servicios" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Servicios Destacados</h2>
            <p className="text-xl text-gray-300">Los servicios más populares de nuestra barbería</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="glass-card p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center justify-between mb-6">
                  <Scissors className="w-8 h-8 text-purple-400" />
                  <Badge className="bg-yellow-600/20 text-yellow-400">
                    Popular
                  </Badge>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">{service.name}</h3>
                <p className="text-gray-300 mb-6">{service.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Precio:</span>
                    <span className="text-green-400 font-bold text-xl">{formatPrice(service.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Duración:</span>
                    <span className="text-blue-400 font-semibold">{formatDuration(service.duration_minutes)}</span>
                  </div>
                </div>
                
                <Link href={`/${tenant.slug}/book`}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold">
                    Reservar Este Servicio
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button
              onClick={() => {
                const allServicesSection = document.getElementById('todos-servicios')
                allServicesSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="glass-button text-white px-8 py-3 rounded-lg font-medium border border-purple-500/30"
            >
              Ver Todos los Servicios <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* All Services Grid */}
      <section id="todos-servicios" className="py-20 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Todos Nuestros Servicios</h2>
            <p className="text-xl text-gray-300">Encuentra el servicio perfecto para ti</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="glass-card p-6 hover:border-purple-500/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-5 h-5 text-purple-400" />
                    <Badge variant="secondary" className={`text-xs px-2 py-1 rounded ${getCategoryBadge(service.category)}`}>
                      {getCategoryLabel(service.category)}
                    </Badge>
                  </div>
                  {/* Solo mostrar estrella para los primeros 3 servicios */}
                  {services.indexOf(service) < 3 && (
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-green-400 font-bold">{formatPrice(service.price)}</div>
                  <div className="text-blue-400 text-sm">{formatDuration(service.duration_minutes)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Working Hours */}
      <section id="horarios" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Horarios de Atención</h2>
            <p className="text-xl text-gray-300">Estamos aquí para atenderte</p>
          </div>
          
          <div className="glass-card p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Horario General</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lunes - Sábado:</span>
                    <span className="text-white font-medium">
                      {schedule.workingHours.start} - {schedule.workingHours.end}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Domingo:</span>
                    <span className="text-white font-medium">Alternos (consultar)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Almuerzo:</span>
                    <span className="text-orange-400 font-medium">
                      {schedule.workingHours.lunchStart} - {schedule.workingHours.lunchEnd}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Turnos Disponibles</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {schedule.timeSlots.map((slot) => (
                    <div
                      key={slot}
                      className="glass text-center py-2 px-3 rounded-lg text-sm text-white font-medium"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 px-4 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Contáctanos</h2>
            <p className="text-xl text-gray-300">Estamos aquí para ayudarte</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Información de Contacto</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Instagram</p>
                    <p className="text-white font-medium">{contact.instagram}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">WhatsApp</p>
                    <p className="text-white font-medium">{contact.whatsapp}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-medium">{contact.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Dirección</p>
                    <p className="text-white font-medium">{contact.address}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Reserva tu Cita</h3>
              <p className="text-gray-300 mb-6">
                ¿Listo para lucir increíble? Reserva tu cita ahora y experimenta el mejor servicio de barbería.
              </p>
              
              <div className="space-y-4">
                <Link href={`/${tenant.slug}/book`}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Reservar Online</span>
                  </Button>
                </Link>
                
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full glass-button text-green-400 py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 border border-green-500/30"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-purple-500/20 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">{contact.businessName}</span>
          </div>
          
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center space-x-1 text-purple-300">
              <Instagram className="w-4 h-4" />
              <span className="text-sm">{contact.instagram}</span>
            </div>
            <div className="flex items-center space-x-1 text-green-300">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{contact.whatsapp}</span>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm">
            © 2024 {contact.businessName}. Todos los derechos reservados.
          </p>
          
          {/* Enlace discreto para admin */}
          <div className="mt-2">
            <Link href={`/${tenant.slug}/dashboard`}>
              <button className="text-gray-500 hover:text-purple-400 text-xs transition-colors duration-200">
                Admin
              </button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}