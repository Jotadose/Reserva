'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Tenant } from '@/types/tenant'
import { getPublicSupabaseClient, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/components/providers/auth-provider'

interface TenantMembership {
  tenant_id: string
  role: 'owner' | 'admin' | 'staff' | 'provider' | 'viewer'
  is_active: boolean
  tenant: {
    id: string
    slug: string
    name: string
  }
}

interface TenantContextType {
  // Legacy support for existing code
  tenant: Tenant | null
  tenantSlug: string | null
  isLoading: boolean
  error: string | null
  refetchTenant: () => Promise<void>
  refetch: () => Promise<void> // Alias for convenience
  isSupabaseConfigured: boolean
  
  // New membership-based properties
  currentMembership: TenantMembership | null
  memberships: TenantMembership[]
  hasRole: (role: string | string[], tenantId?: string) => boolean
  isAdmin: (tenantId?: string) => boolean
  canManage: (resource: string, tenantId?: string) => boolean
  switchTenant: (tenantId: string) => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // New membership state
  const [currentMembership, setCurrentMembership] = useState<TenantMembership | null>(null)
  const [memberships, setMemberships] = useState<TenantMembership[]>([])
  
  const pathname = usePathname()
  const supabaseConfigured = isSupabaseConfigured()
  const { user, session } = useAuth()
  const supabase = getSupabaseClient()

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
      // Usar cliente público para acceso sin autenticación
      const supabase = getPublicSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('tenants')
        .select('id, slug, name, subscription_status, subscription_plan, contact_email, contact_phone, slot_duration_minutes, settings, branding, created_at, updated_at')
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

  // Load user's tenant memberships
  const loadMemberships = useCallback(async () => {
    if (!user || !session || !supabaseConfigured) {
      setMemberships([])
      setCurrentMembership(null)
      return
    }

    try {
      console.log('🔍 Loading user memberships...')
      
      const { data: membershipsData, error } = await supabase
        .from('tenant_memberships')
        .select(`
          tenant_id,
          role,
          is_active,
          tenant:tenants!tenant_id (
            id,
            slug,
            name,
            branding
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        console.error('Error loading memberships:', error)
        return
      }

      // Transform the data to match our interface
      const memberships: TenantMembership[] = (membershipsData || []).map((item: any) => ({
        tenant_id: item.tenant_id,
        role: item.role,
        is_active: item.is_active,
        tenant: Array.isArray(item.tenant) ? item.tenant[0] : item.tenant
      }))
      setMemberships(memberships)
      console.log(`✅ Loaded ${memberships.length} memberships for user`)

      // Set current membership based on current tenant or cache
      if (tenant && tenantSlug) {
        const currentMembership = memberships.find(m => m.tenant.slug === tenantSlug)
        setCurrentMembership(currentMembership || null)
      } else if (memberships.length > 0) {
        // Default to first owner role, then admin, then first available
        const ownerMembership = memberships.find(m => m.role === 'owner')
        const adminMembership = memberships.find(m => m.role === 'admin')
        const defaultMembership = ownerMembership || adminMembership || memberships[0]
        setCurrentMembership(defaultMembership)
      }

    } catch (error) {
      console.error('Error loading memberships:', error)
      setMemberships([])
      setCurrentMembership(null)
    }
  }, [user, session, supabaseConfigured, tenant, tenantSlug, supabase])

  // Permission checking functions
  const hasRole = useCallback((role: string | string[], tenantId?: string) => {
    const targetTenantId = tenantId || currentMembership?.tenant_id
    if (!targetTenantId) return false

    const membership = memberships.find(m => m.tenant_id === targetTenantId)
    if (!membership || !membership.is_active) return false

    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(membership.role)
  }, [currentMembership, memberships])

  const isAdmin = useCallback((tenantId?: string) => {
    return hasRole(['owner', 'admin'], tenantId)
  }, [hasRole])

  const canManage = useCallback((resource: string, tenantId?: string) => {
    const targetTenantId = tenantId || currentMembership?.tenant_id
    if (!targetTenantId) return false

    const membership = memberships.find(m => m.tenant_id === targetTenantId)
    if (!membership || !membership.is_active) return false

    // Role hierarchy permissions with explicit typing
    const permissions: Record<string, string[]> = {
      owner: ['tenants', 'users', 'providers', 'services', 'bookings', 'clients', 'settings', 'billing'],
      admin: ['providers', 'services', 'bookings', 'clients', 'settings'],
      staff: ['bookings', 'clients'],
      provider: ['bookings'], // Only their own bookings
      viewer: []
    }

    const rolePermissions = permissions[membership.role]
    return rolePermissions ? rolePermissions.includes(resource) : false
  }, [currentMembership, memberships])

  const switchTenant = useCallback(async (tenantId: string) => {
    const membership = memberships.find(m => m.tenant_id === tenantId)
    if (membership) {
      setCurrentMembership(membership)
      // Also update the main tenant if it matches
      if (membership.tenant.slug === tenantSlug) {
        // Tenant is already loaded, just update membership
      } else {
        // Load the new tenant
        await fetchTenant(membership.tenant.slug)
      }
    }
  }, [memberships, tenantSlug, fetchTenant])

  // Load memberships when user changes
  useEffect(() => {
    loadMemberships()
  }, [loadMemberships])

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

  // Update current membership when tenant changes
  useEffect(() => {
    if (tenant && tenantSlug && memberships.length > 0) {
      const membership = memberships.find(m => m.tenant.slug === tenantSlug)
      setCurrentMembership(membership || null)
    }
  }, [tenant, tenantSlug, memberships])

  const value = useMemo(() => ({
    // Legacy support
    tenant,
    tenantSlug,
    isLoading,
    error,
    refetchTenant,
    refetch: refetchTenant, // Alias for convenience
    isSupabaseConfigured: supabaseConfigured,
    
    // New membership-based properties
    currentMembership,
    memberships,
    hasRole,
    isAdmin,
    canManage,
    switchTenant,
  }), [
    tenant, tenantSlug, isLoading, error, refetchTenant, supabaseConfigured,
    currentMembership, memberships, hasRole, isAdmin, canManage, switchTenant
  ])

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