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
      if (!cached) {
        console.log(`🔍 No hay tenant cacheado para slug: ${slug}`)
        return null
      }

      const parsed = JSON.parse(cached) as Partial<Tenant> & {
        slug?: string
        plan?: Tenant['plan']
        status?: Tenant['status']
      }

      if (parsed?.slug !== slug) {
        console.log(`🔍 Tenant cacheado (${parsed?.slug}) no coincide con slug solicitado: ${slug}`)
        return null
      }

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

      console.log(`✅ Tenant cacheado encontrado para ${slug}:`, fallbackTenant)
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

  const handleTenantResult = useCallback((data: any, error: any, cachedTenant: Tenant | null, slug: string) => {
    if (error) {
      console.warn(`Error fetching tenant '${slug}' from database:`, error.message)
      if (cachedTenant) {
        console.log(`📦 Fallback: Usando tenant cacheado para ${slug}`)
        setError(null)
        setTenant(cachedTenant)
      } else {
        setError(`Barbería '${slug}' no encontrada`)
        setTenant(null)
      }
      return
    }

    if (!data) {
      if (cachedTenant) {
        console.log(`📦 Usando cache para: ${slug}`)
        setError(null)
        setTenant(cachedTenant)
      } else {
        console.warn(`❌ Tenant '${slug}' no encontrado`)
        setError(`Barbería '${slug}' no encontrada`)
        setTenant(null)
      }
      return
    }

    console.log(`✅ Tenant '${slug}' cargado desde BD`)
    setTenant(data)
    setError(null)
  }, [])

  const fetchTenant = useCallback(async (slug: string) => {
    const cachedTenant = getCachedTenant(slug)

    try {
      setIsLoading(true)
      setError(null)

      if (cachedTenant) {
        console.log(`📦 Usando tenant cacheado para ${slug}:`, cachedTenant.name)
        setTenant(cachedTenant)
        setError(null)
      }

      if (!supabaseConfigured) {
        setTenant(cachedTenant ?? buildMockTenant(slug))
        return
      }

      console.log(`🔍 Buscando tenant en DB: ${slug}`)
      const supabase = getSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .in('subscription_status', ['active', 'trial'])
        .maybeSingle()

      handleTenantResult(data, supabaseError, cachedTenant, slug)
    } catch (err) {
      console.warn('Error fetching tenant:', err)
      if (cachedTenant) {
        setError(null)
        setTenant(cachedTenant)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading tenant')
        setTenant(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [buildMockTenant, getCachedTenant, handleTenantResult, supabaseConfigured])

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
        !['login', 'register', 'pricing', 'onboarding', 'setup', 'demo', 'features'].includes(potentialTenantSlug)) {
      
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