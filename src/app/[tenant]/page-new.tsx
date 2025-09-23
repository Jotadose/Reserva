import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Phone, MessageCircle, ChevronRight, Clock, MapPin, Scissors, Instagram } from "lucide-react"
import { StarIcon } from "@heroicons/react/24/solid"
import { BookingWidget } from "@/components/booking/booking-widget"
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

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

  // Portfolio images placeholder
  const portfolioImages = [
    '/api/placeholder/300/300',
    '/api/placeholder/300/300',
    '/api/placeholder/300/300',
    '/api/placeholder/300/300',
    '/api/placeholder/300/300',
    '/api/placeholder/300/300'
  ]

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