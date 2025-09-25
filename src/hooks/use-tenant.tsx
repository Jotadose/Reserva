'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Tenant } from '@/types/tenant'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

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

  const getCachedTenant = useCallback((slug: string): Tenant | null => {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem('last_created_tenant')
      if (!cached) return null

      const parsed = JSON.parse(cached) as Partial<Tenant> & {
        slug?: string
        plan?: Tenant['plan']
        status?: Tenant['status']
      }

      if (parsed?.slug !== slug) return null

      const fallbackTenant: Tenant = {
        id: parsed.id ?? 'unknown-tenant-id',
        slug,
        name: parsed.name ?? slug,
        plan: parsed.plan ?? 'basic',
        status: parsed.status ?? 'active',
        contact_email: parsed.contact_email ?? undefined,
        contact_phone: parsed.contact_phone ?? undefined,
        slot_duration_minutes: parsed.slot_duration_minutes ?? 30,
        settings: parsed.settings ?? {},
        created_at: parsed.created_at ?? new Date().toISOString(),
        updated_at: parsed.updated_at ?? new Date().toISOString(),
      }

      return fallbackTenant
    } catch (err) {
      console.warn('No se pudo cargar el tenant cacheado:', err)
      return null
    }
  }, [])

  const buildMockTenant = useCallback((slug: string): Tenant => ({
    id: 'demo-tenant-id',
    slug,
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
  }), [])

  const fetchTenant = useCallback(async (slug: string) => {
    let cachedTenant: Tenant | null = getCachedTenant(slug)

    try {
      setIsLoading(true)
      setError(null)

      if (cachedTenant) {
        setTenant(prev => prev ?? cachedTenant)
      }

      if (!supabaseConfigured) {
        setTenant(cachedTenant ?? buildMockTenant(slug))
        return
      }

      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .eq('subscription_status', 'active')
        .maybeSingle()

      if (supabaseError) {
        console.warn('Error fetching tenant from database:', supabaseError)
        setError(supabaseError.message)
        setTenant(cachedTenant)
        return
      }

      if (!data) {
        console.warn('Tenant not found with slug:', slug)
        setError(cachedTenant ? null : 'Tenant no encontrado')
        setTenant(cachedTenant)
        return
      }

      setTenant(data)
    } catch (err) {
      console.warn('Error fetching tenant:', err)
      setError(err instanceof Error ? err.message : 'Error loading tenant')
      if (!cachedTenant) {
        cachedTenant = getCachedTenant(slug)
        setTenant(cachedTenant)
      }
    } finally {
      cachedTenant ??= getCachedTenant(slug)
      if (!cachedTenant) {
        setTenant(null)
      }
      setIsLoading(false)
    }
  }, [buildMockTenant, getCachedTenant, supabaseConfigured])

  const refetchTenant = useCallback(async () => {
    if (tenantSlug) {
      await fetchTenant(tenantSlug)
    }
  }, [tenantSlug, fetchTenant])

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
  }, [pathname, supabaseConfigured, fetchTenant])

  const value = useMemo(() => ({
    tenant,
    tenantSlug,
    isLoading,
    error,
    refetchTenant,
    isSupabaseConfigured: supabaseConfigured,
  }), [tenant, tenantSlug, isLoading, error, refetchTenant, supabaseConfigured])

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