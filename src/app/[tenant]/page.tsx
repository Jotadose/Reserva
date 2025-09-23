'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Phone, MessageCircle, ChevronRight, Clock, MapPin, Star } from "lucide-react"
import { StarIcon } from "@heroicons/react/24/solid"
import { BookingWidget } from "@/components/booking/booking-widget"

interface TenantPageProps {
  params: {
    tenant: string
  }
}

export default function TenantPage({ params }: TenantPageProps) {
  const [tenant, setTenant] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setTenant({
          id: '1',
          name: 'Barbería Elite',
          slug: params.tenant,
          description: 'La mejor barbería de Chile con servicios premium y atención personalizada',
          address: 'Providencia 123, Santiago, Chile',
          contact_phone: '+56912345678',
          whatsapp: '+56912345678',
          email: 'info@barberiaelite.cl',
          logo_url: null,
          website: 'https://barberiaelite.cl',
          instagram: '@barberiaelite',
          facebook: 'barberiaelite'
        })

        setServices([
          { id: '1', name: 'Corte Clásico', description: 'Corte tradicional con tijera y máquina', price: 15000, duration: 30 },
          { id: '2', name: 'Corte + Barba', description: 'Corte completo con arreglo de barba', price: 25000, duration: 45 },
          { id: '3', name: 'Afeitado Clásico', description: 'Afeitado tradicional con navaja', price: 18000, duration: 25 },
          { id: '4', name: 'Corte Moderno', description: 'Cortes urbanos y tendencias actuales', price: 20000, duration: 35 },
          { id: '5', name: 'Tratamiento Capilar', description: 'Hidratación y cuidado del cabello', price: 12000, duration: 20 },
          { id: '6', name: 'Paquete Premium', description: 'Corte + Barba + Tratamiento', price: 35000, duration: 60 }
        ])

        setProviders([
          { id: '1', name: 'Carlos Mendoza', specialties: ['Cortes Clásicos', 'Barbas'] },
          { id: '2', name: 'Diego Silva', specialties: ['Cortes Modernos', 'Afeitado'] },
          { id: '3', name: 'Roberto Flores', specialties: ['Tratamientos', 'Coloración'] }
        ])

        setPortfolioImages([
          'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
          'https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=400',
          'https://images.unsplash.com/photo-1634215522872-6e7a92e3d90a?w=400',
          'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
          'https://images.unsplash.com/photo-1600864923531-9fdd76e09bbf?w=400',
          'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400'
        ])

        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [params.tenant])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Barbería no encontrada</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HERO Section */}
      <section className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900">
        {/* Header with contact info */}
        <header className="w-full px-6 py-4 bg-black/20 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {tenant.name}
              </h1>
              {tenant.address && (
                <div className="hidden md:flex items-center text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {tenant.address}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {tenant.whatsapp && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  onClick={() => window.open('https://wa.me/' + tenant.whatsapp, '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              )}
              {tenant.contact_phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => window.open('tel:' + tenant.contact_phone, '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero text */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium border border-orange-500/30">
                <div className="flex items-center mr-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="w-3 h-3 fill-current text-orange-400" />
                  ))}
                </div>
                Barbería 5 Estrellas
              </div>

              <div>
                <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Tu Estilo,
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Nuestra Pasión
                  </span>
                </h2>

                <p className="text-xl text-gray-300 max-w-2xl">
                  {tenant.description || 'Experimenta el arte del barbering en ' + tenant.name + '. Servicios profesionales con las últimas tendencias y técnicas tradicionales en el corazón de Chile.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    const element = document.getElementById('booking')
                    if (element) element.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Reservar Ahora
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-orange-400 hover:text-orange-400 px-8 py-3 text-lg transition-all duration-200"
                  onClick={() => {
                    const element = document.getElementById('services')
                    if (element) element.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Ver Servicios
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">500+</div>
                  <div className="text-gray-400 text-sm">Clientes Satisfechos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">5.0★</div>
                  <div className="text-gray-400 text-sm">Calificación Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{providers.length}</div>
                  <div className="text-gray-400 text-sm">Barberos Expertos</div>
                </div>
              </div>
            </div>

            {/* Right side - Booking Widget */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md" id="booking">
                <BookingWidget
                  tenant={tenant}
                  services={services}
                  providers={providers}
                  compact={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* SERVICES Section */}
      <section id="services" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Nuestros Servicios
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Servicios profesionales con las mejores técnicas, productos premium y atención personalizada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="bg-gradient-to-br from-gray-800/50 to-slate-900/50 border-gray-700 hover:border-orange-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-orange-500/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white group-hover:text-orange-400 transition-colors text-lg">
                      {service.name}
                    </CardTitle>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-semibold">
                      ${(service.price / 100).toLocaleString('es-CL')}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration} min
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                      onClick={() => {
                        const element = document.getElementById('booking')
                        if (element) element.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      Reservar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO Section */}
      <section id="portfolio" className="py-20 px-6 bg-gradient-to-br from-slate-900 to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Nuestros Trabajos
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Cada corte es una obra de arte. Mira algunos de nuestros mejores trabajos
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {portfolioImages.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-xl bg-gray-800">
                <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <img
                    src={image}
                    alt={'Portfolio ' + (index + 1)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HORARIO Section */}
      <section id="horario" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Horarios de Atención
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Estamos aquí para atenderte cuando lo necesites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-gray-800/50 to-slate-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-400" />
                    Horarios de la Semana
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Lunes - Viernes</span>
                    <span className="text-orange-400 font-semibold">9:00 - 19:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Sábado</span>
                    <span className="text-orange-400 font-semibold">9:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Domingo</span>
                    <span className="text-gray-500">Cerrado</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-800/50 to-slate-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-orange-400" />
                    Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{tenant.address}</p>
                  <Button
                    variant="outline"
                    className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 w-full"
                    onClick={() => window.open('https://maps.google.com/?q=' + encodeURIComponent(tenant.address), '_blank')}
                  >
                    Ver en Google Maps
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white text-2xl">
                      ¿Listo para tu próximo corte?
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Reserva tu cita ahora y experimenta el mejor servicio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 text-lg"
                      onClick={() => {
                        const element = document.getElementById('booking')
                        if (element) element.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Reservar Cita
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER Section */}
      <footer className="bg-black py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
                {tenant.name}
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                {tenant.description}
              </p>
              <div className="flex space-x-4">
                {tenant.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:text-orange-400 hover:border-orange-400"
                    onClick={() => window.open('https://instagram.com/' + tenant.instagram.replace('@', ''), '_blank')}
                  >
                    Instagram
                  </Button>
                )}
                {tenant.facebook && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:text-orange-400 hover:border-orange-400"
                    onClick={() => window.open('https://facebook.com/' + tenant.facebook, '_blank')}
                  >
                    Facebook
                  </Button>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contacto</h4>
              <div className="space-y-3">
                {tenant.contact_phone && (
                  <div className="flex items-center text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{tenant.contact_phone}</span>
                  </div>
                )}
                {tenant.email && (
                  <div className="flex items-center text-gray-400">
                    <span className="mr-2">✉</span>
                    <span>{tenant.email}</span>
                  </div>
                )}
                {tenant.address && (
                  <div className="flex items-start text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 mt-1" />
                    <span>{tenant.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Horarios</h4>
              <div className="space-y-2 text-gray-400">
                <div>Lun - Vie: 9:00 - 19:00</div>
                <div>Sábado: 9:00 - 17:00</div>
                <div>Domingo: Cerrado</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500">
              © {new Date().getFullYear()} {tenant.name}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-3">
              {tenant.whatsapp && (
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.open('https://wa.me/' + tenant.whatsapp, '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              )}
              {tenant.contact_phone && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => window.open('tel:' + tenant.contact_phone, '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium border border-orange-500/30">
                <div className="flex items-center mr-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current text-orange-400" />
                  ))}
                </div>
                Barbería 5 Estrellas
              </div>
              
              <div>
                <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Tu Estilo,
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Nuestra Pasión
                  </span>
                </h2>
                
                <p className="text-xl text-gray-300 max-w-2xl">
                  {tenant.description || 'Experimenta el arte del barbering en ' + tenant.name + '. Servicios profesionales con las últimas tendencias y técnicas tradicionales en el corazón de Chile.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                  onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Reservar Ahora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-orange-400 hover:text-orange-400 px-8 py-3 text-lg transition-all duration-200"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver Servicios
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">500+</div>
                  <div className="text-gray-400 text-sm">Clientes Satisfechos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">5.0★</div>
                  <div className="text-gray-400 text-sm">Calificación Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{providers.length}</div>
                  <div className="text-gray-400 text-sm">Barberos Expertos</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md" id="booking">
                <BookingWidget
                  tenant={tenant}
                  services={services}
                  providers={providers}
                  compact={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* SERVICES Section */}
      <section id="services" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Nuestros Servicios
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Servicios profesionales con las mejores técnicas, productos premium y atención personalizada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="bg-gradient-to-br from-gray-800/50 to-slate-900/50 border-gray-700 hover:border-orange-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-orange-500/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white group-hover:text-orange-400 transition-colors text-lg">
                      {service.name}
                    </CardTitle>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-semibold">
                      ${(service.price / 100).toLocaleString('es-CL')}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {service.description || 'Servicio profesional de barbería con atención personalizada'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      {service.duration_minutes} minutos
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Reservar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO Section */}
      <section id="portfolio" className="py-20 px-6 bg-gradient-to-br from-slate-900 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Nuestro Trabajo
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Algunos de nuestros mejores cortes y estilos realizados por nuestro equipo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-gradient-to-br from-gray-800 to-slate-900 rounded-xl border border-gray-700 flex items-center justify-center group hover:border-orange-500/50 transition-all duration-300 cursor-pointer hover:scale-105"
              >
                <div className="text-center">
                  <Scissors className="w-8 h-8 text-gray-600 group-hover:text-orange-400 transition-colors mx-auto mb-2" />
                  <p className="text-xs text-gray-500 group-hover:text-gray-400">Trabajo #{i + 1}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:border-orange-400 hover:text-orange-400"
              onClick={() => tenant.instagram && window.open(tenant.instagram, '_blank')}
            >
              <Instagram className="w-4 h-4 mr-2" />
              Ver más en Instagram
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-gray-800 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">{tenant.name}</span>
                  <p className="text-gray-400 text-sm">Barbería Profesional</p>
                </div>
              </div>
              <p className="text-gray-400">
                Ofrecemos servicios de barbería de la más alta calidad en Chile, 
                con técnicas modernas y atención personalizada.
              </p>
            </div>

            <div className="text-center md:text-left">
              <h4 className="font-bold text-white mb-6 text-lg">Contacto</h4>
              <div className="space-y-4">
                {tenant.contact_phone && (
                  <div className="flex items-center justify-center md:justify-start group cursor-pointer"
                       onClick={() => window.open('tel:' + tenant.contact_phone, '_blank')}>
                    <Phone className="w-5 h-5 mr-3 text-orange-400" />
                    <span className="text-gray-400 group-hover:text-white transition-colors">{tenant.contact_phone}</span>
                  </div>
                )}
                {tenant.contact_email && (
                  <div className="flex items-center justify-center md:justify-start group cursor-pointer"
                       onClick={() => window.open('mailto:' + tenant.contact_email, '_blank')}>
                    <span className="w-5 h-5 mr-3 text-orange-400 text-center">✉️</span>
                    <span className="text-gray-400 group-hover:text-white transition-colors">{tenant.contact_email}</span>
                  </div>
                )}
                {tenant.address && (
                  <div className="flex items-center justify-center md:justify-start">
                    <MapPin className="w-5 h-5 mr-3 text-orange-400" />
                    <span className="text-gray-400">{tenant.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center md:text-left">
              <h4 className="font-bold text-white mb-6 text-lg">Síguenos</h4>
              <div className="flex justify-center md:justify-start space-x-4 mb-6">
                {tenant.instagram && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-gray-600 text-gray-400 hover:border-pink-500 hover:text-pink-400 hover:bg-pink-500/10 transition-all duration-200"
                    onClick={() => window.open(tenant.instagram, '_blank')}
                  >
                    <Instagram className="w-5 h-5" />
                  </Button>
                )}
                {tenant.whatsapp && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200"
                    onClick={() => window.open('https://wa.me/' + tenant.whatsapp, '_blank')}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                )}
              </div>
              
              <Button 
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white w-full md:w-auto"
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Reservar Cita
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 {tenant.name}. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-sm">
              Powered by{' '}
              <span className="text-orange-400 font-semibold hover:text-orange-300 transition-colors cursor-pointer">
                Agendex
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface TenantPageProps {
  params: Promise<{
    tenant: string
  }>
}

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
  working_hours: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }
  subscription_status: string
}

interface Service {
  id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  is_active: boolean
}

interface Provider {
  id: string
  name: string
  email: string
  role: string
  status: string
}

async function getTenantData(slug: string) {
  try {
    // Obtener información del tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .eq('subscription_status', 'active')
      .single()

    if (tenantError || !tenant) {
      return null
    }

    // Obtener servicios activos
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .order('name')

    if (servicesError) {
      console.error('Error fetching services:', servicesError)
    }

    // Obtener providers (barberos) activos
    const { data: providers, error: providersError } = await supabase
      .from('providers')
      .select(`
        id,
        bio,
        specialties,
        commission_rate,
        is_active,
        users!inner(
          id,
          name,
          email,
          role
        )
      `)
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)
      .order('created_at')

    if (providersError) {
      console.error('Error fetching providers:', providersError)
    }

    // Transformar datos de providers para compatibilidad
    const transformedProviders = (providers || []).map((provider: any) => ({
      id: provider.id,
      name: provider.users?.name || 'Sin nombre',
      email: provider.users?.email || 'Sin email',
      role: provider.users?.role || 'barber',
      status: 'active'
    }))

    return {
      tenant: tenant as Tenant,
      services: (services || []) as Service[],
      providers: transformedProviders as Provider[]
    }
  } catch (error) {
    console.error('Error fetching tenant data:', error)
    return null
  }
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenant: tenantSlug } = await params
  const data = await getTenantData(tenantSlug)

  if (!data) {
    notFound()
  }

  const { tenant, services, providers } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* HERO Section - Siguiendo estructura de wireframes */}
      <section className="relative min-h-screen flex flex-col">
        {/* Header con branding */}
        <header className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{tenant.name}</h1>
                <p className="text-gray-400 text-sm">Barbería Profesional • Chile</p>
              </div>
            </div>
            
            {/* Contact buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {tenant.whatsapp && (
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.open(`https://wa.me/${tenant.whatsapp}`, '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              )}
              {tenant.contact_phone && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => window.open(`tel:${tenant.contact_phone}`, '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero text */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium border border-orange-500/30">
                <div className="flex items-center mr-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="w-3 h-3 fill-current text-orange-400" />
                  ))}
                </div>
                Barbería 5 Estrellas
              </div>
              
              <div>
                <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Tu Estilo,
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Nuestra Pasión
                  </span>
                </h2>
                
                <p className="text-xl text-gray-300 max-w-2xl">
                  {tenant.description || `Experimenta el arte del barbering en ${tenant.name}. Servicios profesionales con las últimas tendencias y técnicas tradicionales en el corazón de Chile.`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                  onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Reservar Ahora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-orange-400 hover:text-orange-400 px-8 py-3 text-lg transition-all duration-200"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver Servicios
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">500+</div>
                  <div className="text-gray-400 text-sm">Clientes Satisfechos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">5.0★</div>
                  <div className="text-gray-400 text-sm">Calificación Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{providers.length}</div>
                  <div className="text-gray-400 text-sm">Barberos Expertos</div>
                </div>
              </div>
            </div>

            {/* Right side - Booking Widget */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md" id="booking">
                <BookingWidget
                  tenant={tenant}
                  services={services}
                  providers={providers}
                  compact={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* SERVICES Section */}
      <section id="services" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Nuestros Servicios
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Servicios profesionales con las mejores técnicas, productos premium y atención personalizada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="bg-gradient-to-br from-gray-800/50 to-slate-900/50 border-gray-700 hover:border-orange-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-orange-500/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white group-hover:text-orange-400 transition-colors text-lg">
                      {service.name}
                    </CardTitle>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-semibold">
                      ${(service.price / 100).toLocaleString('es-CL')}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {service.description || 'Servicio profesional de barbería con atención personalizada'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      {service.duration_minutes} minutos
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Reservar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO Section */}
      <section id="portfolio" className="py-20 px-6 bg-gradient-to-br from-slate-900 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Nuestro Trabajo
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Algunos de nuestros mejores cortes y estilos realizados por nuestro equipo
            </p>
          </div>

          {/* Portfolio grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-gradient-to-br from-gray-800 to-slate-900 rounded-xl border border-gray-700 flex items-center justify-center group hover:border-orange-500/50 transition-all duration-300 cursor-pointer hover:scale-105"
              >
                <div className="text-center">
                  <Scissors className="w-8 h-8 text-gray-600 group-hover:text-orange-400 transition-colors mx-auto mb-2" />
                  <p className="text-xs text-gray-500 group-hover:text-gray-400">Trabajo #{i + 1}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:border-orange-400 hover:text-orange-400"
              onClick={() => tenant.instagram && window.open(tenant.instagram, '_blank')}
            >
              <Instagram className="w-4 h-4 mr-2" />
              Ver más en Instagram
            </Button>
          </div>
        </div>
      </section>

      {/* SCHEDULE Section */}
      <section id="horario" className="py-20 px-6 bg-gradient-to-br from-gray-900 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Horarios de Atención
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Estamos aquí para atenderte en los mejores horarios
            </p>
          </div>

          <Card className="bg-gradient-to-br from-gray-800/50 to-slate-900/50 border-gray-700">
            <CardContent className="p-8">
              <div className="space-y-4">
                {Object.entries(tenant.working_hours || {
                  monday: { open: '09:00', close: '19:00' },
                  tuesday: { open: '09:00', close: '19:00' },
                  wednesday: { open: '09:00', close: '19:00' },
                  thursday: { open: '09:00', close: '19:00' },
                  friday: { open: '09:00', close: '19:00' },
                  saturday: { open: '09:00', close: '17:00' },
                  sunday: { closed: true }
                }).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center py-4 border-b border-gray-700 last:border-0">
                    <span className="text-white font-medium text-lg capitalize">
                      {day === 'monday' && 'Lunes'}
                      {day === 'tuesday' && 'Martes'}
                      {day === 'wednesday' && 'Miércoles'}
                      {day === 'thursday' && 'Jueves'}
                      {day === 'friday' && 'Viernes'}
                      {day === 'saturday' && 'Sábado'}
                      {day === 'sunday' && 'Domingo'}
                    </span>
                    <span className={`text-lg font-medium ${hours.closed ? 'text-red-400' : 'text-orange-400'}`}>
                      {hours.closed ? 'Cerrado' : `${hours.open} - ${hours.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CONTACT/FOOTER Section */}
      <footer className="bg-black border-t border-gray-800 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Branding */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">{tenant.name}</span>
                  <p className="text-gray-400 text-sm">Barbería Profesional</p>
                </div>
              </div>
              <p className="text-gray-400">
                Ofrecemos servicios de barbería de la más alta calidad en Chile, 
                con técnicas modernas y atención personalizada.
              </p>
            </div>

            {/* Contacto */}
            <div className="text-center md:text-left">
              <h4 className="font-bold text-white mb-6 text-lg">Contacto</h4>
              <div className="space-y-4">
                {tenant.contact_phone && (
                  <div className="flex items-center justify-center md:justify-start group cursor-pointer"
                       onClick={() => window.open(`tel:${tenant.contact_phone}`, '_blank')}>
                    <Phone className="w-5 h-5 mr-3 text-orange-400" />
                    <span className="text-gray-400 group-hover:text-white transition-colors">{tenant.contact_phone}</span>
                  </div>
                )}
                {tenant.contact_email && (
                  <div className="flex items-center justify-center md:justify-start group cursor-pointer"
                       onClick={() => window.open(`mailto:${tenant.contact_email}`, '_blank')}>
                    <span className="w-5 h-5 mr-3 text-orange-400 text-center">✉️</span>
                    <span className="text-gray-400 group-hover:text-white transition-colors">{tenant.contact_email}</span>
                  </div>
                )}
                {tenant.address && (
                  <div className="flex items-center justify-center md:justify-start">
                    <MapPin className="w-5 h-5 mr-3 text-orange-400" />
                    <span className="text-gray-400">{tenant.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="text-center md:text-left">
              <h4 className="font-bold text-white mb-6 text-lg">Síguenos</h4>
              <div className="flex justify-center md:justify-start space-x-4 mb-6">
                {tenant.instagram && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-gray-600 text-gray-400 hover:border-pink-500 hover:text-pink-400 hover:bg-pink-500/10 transition-all duration-200"
                    onClick={() => window.open(tenant.instagram, '_blank')}
                  >
                    <Instagram className="w-5 h-5" />
                  </Button>
                )}
                {tenant.whatsapp && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200"
                    onClick={() => window.open(`https://wa.me/${tenant.whatsapp}`, '_blank')}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                )}
              </div>
              
              <Button 
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white w-full md:w-auto"
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Reservar Cita
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 {tenant.name}. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-sm">
              Powered by{' '}
              <span className="text-orange-400 font-semibold hover:text-orange-300 transition-colors cursor-pointer">
                Agendex
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
                    <span>{providers.length} Barbero{providers.length > 1 ? 's' : ''} Profesional{providers.length > 1 ? 'es' : ''}</span>
                  </div>
                )}
                {services.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-5 h-5" />
                    <span>{services.length} Servicio{services.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                {quickestService > 0 && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Desde {quickestService} min</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8">
                  <Calendar className="w-5 h-5 mr-2" />
                  Reservar Ahora
                </Button>
                
                {tenant.whatsapp && (
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>
            
            {/* Quick Booking Card */}
            <div className="lg:flex justify-end hidden">
              <Card className="w-full max-w-md shadow-2xl border-0">
                <CardHeader className="text-center">
                  <CardTitle className="text-gray-900">Reserva Rápida</CardTitle>
                  <CardDescription>Selecciona tu servicio favorito</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingWidget 
                    tenant={tenant}
                    services={services.slice(0, 3)} // Solo mostrar los primeros 3 servicios
                    providers={providers}
                    compact={true}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {(averageServicePrice > 0 || services.length > 0 || providers.length > 0) && (
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {averageServicePrice > 0 && (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    ${averageServicePrice.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Precio Promedio</div>
                </div>
              )}
              
              {quickestService > 0 && (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {quickestService} min
                  </div>
                  <div className="text-gray-600">Servicio Más Rápido</div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">
                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-gray-600">Excelente Calidad</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos servicios profesionales con los mejores productos y técnicas
            </p>
          </div>
          
          <TenantServices services={services} enhanced={true} />
          
          {services.length === 0 && (
            <div className="text-center py-12">
              <Scissors className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Próximamente
              </h3>
              <p className="text-gray-500">
                Estamos preparando nuestros servicios para ti
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Portfolio Section */}
      <TenantPortfolio tenantSlug={tenant.slug} />

      {/* Schedule Section */}
      <TenantSchedule workingHours={tenant.working_hours} />

      {/* Team Section */}
      {providers.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Nuestro Equipo
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Barberos profesionales con años de experiencia
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {providers.map((provider) => (
                <Card key={provider.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{provider.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {provider.role === 'owner' ? 'Propietario' : 'Barbero'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact & Location Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Información de Contacto
                </h2>
                <TenantInfo tenant={tenant} />
              </div>
              
              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Síguenos
                </h3>
                <div className="flex space-x-4">
                  {tenant.instagram && (
                    <Button variant="outline" size="lg" asChild>
                      <a href={`https://instagram.com/${tenant.instagram}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-5 h-5 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  
                  {tenant.whatsapp && (
                    <Button variant="outline" size="lg" asChild>
                      <a href={`https://wa.me/${tenant.whatsapp}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Booking Widget */}
            <div className="lg:block hidden">
              <Card className="sticky top-8 shadow-xl border-0">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-900">
                    Reserva tu Cita
                  </CardTitle>
                  <CardDescription>
                    Selecciona el servicio y horario que prefieras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingWidget 
                    tenant={tenant}
                    services={services}
                    providers={providers}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Booking Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg">
          <Calendar className="w-5 h-5 mr-2" />
          Reservar Cita
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Powered by Agendex */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-sm">Powered by</span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Agendex</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Sistema de reservas inteligente para barberos profesionales
          </p>
        </div>
      </footer>
    </div>
  )
}

// Generar metadata dinámicamente
export async function generateMetadata({ params }: TenantPageProps) {
  const { tenant: tenantSlug } = await params
  const tenantData = await getTenantData(tenantSlug)
  
  if (!tenantData) {
    return {
      title: 'Barbería no encontrada',
      description: 'La barbería que buscas no existe o no está disponible.'
    }
  }

  const { tenant } = tenantData
  
  return {
    title: `${tenant.name} - Reserva tu cita online`,
    description: tenant.description || `Reserva tu cita en ${tenant.name}. Servicios profesionales de barbería.`,
    openGraph: {
      title: `${tenant.name} - Reserva tu cita online`,
      description: tenant.description || `Reserva tu cita en ${tenant.name}. Servicios profesionales de barbería.`,
      type: 'website',
    },
  }
}