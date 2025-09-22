'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Tenant } from '@/types/tenant'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface TenantContextType {
  tenant: Tenant | null
  tenantSlug: string | null
  isLoading: boolean
  error: string | null
  refetchTenant: () => Promise<void>
  isSupabaseConfigured: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()
  const supabaseConfigured = isSupabaseConfigured()

  const fetchTenant = async (slug: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Si Supabase no está configurado, crear un tenant mock
      if (!supabaseConfigured) {
        const mockTenant: Tenant = {
          id: 'demo-tenant-id',
          slug: slug,
          name: `Demo ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
          plan: 'basic',
          status: 'active',
          slot_duration_minutes: 30,
          settings: {
            branding: {
              primaryColor: '#3B82F6',
              secondaryColor: '#1E40AF'
            },
            business: {
              name: `Demo ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
              email: `demo@${slug}.com`,
              timezone: 'America/Bogota'
            },
            features: {
              onlineBooking: true,
              paymentProcessing: false,
              smsNotifications: false,
              emailNotifications: true,
              analytics: true,
              multiLocation: false
            },
            limits: {
              maxUsers: 10,
              maxBookings: 100,
              maxServices: 20,
              storageLimit: 1000
            }
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        setTenant(mockTenant)
        return
      }
      
      // Intentar obtener el tenant de Supabase
      const { data, error: supabaseError } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .eq('subscription_status', 'active')
        .single()

      if (supabaseError) {
        // Si no se encuentra el tenant, crear uno mock para desarrollo
        console.warn('Tenant not found in database, using mock data for development')
        const mockTenant: Tenant = {
          id: 'demo-tenant-id',
          slug: slug,
          name: `Demo ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
          plan: 'basic',
          status: 'active',
          slot_duration_minutes: 30,
          settings: {
            branding: {
              primaryColor: '#3B82F6',
              secondaryColor: '#1E40AF'
            },
            business: {
              name: `Demo ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
              email: `demo@${slug}.com`,
              timezone: 'America/Bogota'
            },
            features: {
              onlineBooking: true,
              paymentProcessing: false,
              smsNotifications: false,
              emailNotifications: true,
              analytics: true,
              multiLocation: false
            },
            limits: {
              maxUsers: 10,
              maxBookings: 100,
              maxServices: 20,
              storageLimit: 1000
            }
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setTenant(mockTenant)
        return
      }

      setTenant(data)
    } catch (err) {
      console.warn('Error fetching tenant:', err)
      setError(err instanceof Error ? err.message : 'Error loading tenant')
      setTenant(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refetchTenant = async () => {
    if (tenantSlug) {
      await fetchTenant(tenantSlug)
    }
  }

  useEffect(() => {
    // Extraer tenant slug de la URL
    const pathSegments = pathname.split('/').filter(Boolean)
    const potentialTenantSlug = pathSegments[0]

    // Verificar si es una ruta de tenant válida
    if (potentialTenantSlug && 
        !potentialTenantSlug.startsWith('api') && 
        !potentialTenantSlug.startsWith('_next') &&
        !['login', 'register', 'pricing'].includes(potentialTenantSlug)) {
      
      setTenantSlug(potentialTenantSlug)
      fetchTenant(potentialTenantSlug)
    } else {
      setTenantSlug(null)
      setTenant(null)
      setIsLoading(false)
    }
  }, [pathname, supabaseConfigured])

  const value = {
    tenant,
    tenantSlug,
    isLoading,
    error,
    refetchTenant,
    isSupabaseConfigured: supabaseConfigured,
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}