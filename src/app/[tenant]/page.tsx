import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BookingWidget } from '@/components/booking/booking-widget'
import { TenantHeader } from '@/components/tenant/tenant-header'
import { TenantServices } from '@/components/tenant/tenant-services'
import { TenantInfo } from '@/components/tenant/tenant-info'
import { TenantPortfolio } from '@/components/tenant/tenant-portfolio'
import { TenantSchedule } from '@/components/tenant/tenant-schedule'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Users, 
  Scissors,
  ChevronRight,
  Instagram,
  MessageCircle
} from 'lucide-react'

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
  const tenantData = await getTenantData(tenantSlug)

  if (!tenantData) {
    notFound()
  }

  const { tenant, services, providers } = tenantData

  // Calcular estadísticas para mostrar
  const averageServicePrice = services.length > 0 
    ? Math.round(services.reduce((sum, service) => sum + service.price, 0) / services.length)
    : 0

  const quickestService = services.length > 0
    ? Math.min(...services.map(s => s.duration_minutes))
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Scissors className="w-7 h-7 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Reserva Online
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {tenant.name}
              </h1>
              
              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                {tenant.description || 'Servicios profesionales de barbería con la mejor calidad y atención personalizada'}
              </p>
              
              <div className="flex flex-wrap gap-6 text-blue-100">
                {providers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
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