import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BookingWidget } from '@/components/booking/booking-widget'
import { TenantHeader } from '@/components/tenant/tenant-header'
import { TenantServices } from '@/components/tenant/tenant-services'
import { TenantInfo } from '@/components/tenant/tenant-info'

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la barbería */}
      <TenantHeader tenant={tenant} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Descripción */}
            {tenant.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Acerca de {tenant.name}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {tenant.description}
                </p>
              </div>
            )}

            {/* Servicios */}
            <TenantServices services={services} />

            {/* Información de contacto y ubicación */}
            <TenantInfo tenant={tenant} />
          </div>

          {/* Widget de reservas */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingWidget 
                tenant={tenant}
                services={services}
                providers={providers}
              />
            </div>
          </div>
        </div>
      </div>
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