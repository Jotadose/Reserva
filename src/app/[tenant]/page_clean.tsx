import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Calendar, MapPin, Phone, MessageCircle, Clock, ChevronRight, StarIcon } from 'lucide-react'
import BookingWidget from '@/components/booking/booking-widget'

interface TenantPageProps {
  params: Promise<{ tenant: string }>
}

interface Tenant {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  contact_phone: string | null
  email: string | null
  whatsapp: string | null
  instagram: string | null
  facebook: string | null
  website: string | null
  logo_url: string | null
  banner_url: string | null
  business_hours: any
  settings: any
  status: string
  created_at: string
  updated_at: string
}

interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  category: string | null
  is_active: boolean
}

interface Provider {
  id: string
  name: string
  specialties: string[]
}

async function getTenantData(slug: string) {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!tenant) {
    return { tenant: null, services: [], providers: [] }
  }

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)

  // Mock providers data
  const providers = [
    { id: '1', name: 'Carlos Mendoza', specialties: ['Cortes Clásicos', 'Barbas'] },
    { id: '2', name: 'Diego Silva', specialties: ['Cortes Modernos', 'Afeitado'] },
    { id: '3', name: 'Roberto Flores', specialties: ['Tratamientos', 'Coloración'] }
  ]

  return { 
    tenant, 
    services: services || [], 
    providers 
  }
}

export default async function TenantPage({ params }: TenantPageProps) {
  const tenantSlug = await params.then(p => p.tenant)
  const { tenant, services, providers } = await getTenantData(tenantSlug)

  // Portfolio images
  const portfolioImages = [
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
    'https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=400',
    'https://images.unsplash.com/photo-1634215522872-6e7a92e3d90a?w=400',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
    'https://images.unsplash.com/photo-1600864923531-9fdd76e09bbf?w=400',
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400'
  ]

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
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
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
                    onClick={() => window.open('https://maps.google.com/?q=' + encodeURIComponent(tenant.address || ''), '_blank')}
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
                    onClick={() => window.open('https://instagram.com/' + tenant.instagram?.replace('@', ''), '_blank')}
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

export async function generateMetadata({ params }: TenantPageProps): Promise<Metadata> {
  const tenantSlug = await params.then(p => p.tenant)
  
  // Try to get tenant data for metadata
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, description')
    .eq('slug', tenantSlug)
    .single()

  if (!tenant) {
    return {
      title: 'Barbería no encontrada',
      description: 'La barbería que buscas no está disponible.',
    }
  }

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