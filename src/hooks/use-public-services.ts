'use client'

import { useState, useEffect } from 'react'
import { getPublicSupabaseClient } from '@/lib/supabase'

interface Service {
  id: string
  tenant_id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  category?: string
  is_active: boolean
  is_featured?: boolean
  image_url?: string
  bookings_count?: number
  average_rating?: number
  created_at: string
  updated_at: string
}

export function usePublicServices(tenantId: string | null) {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) {
      // Si no hay tenant, usar servicios mock
      setServices(getMockServices())
      setIsLoading(false)
      return
    }

    fetchServices(tenantId)
  }, [tenantId])

  const fetchServices = async (tenantId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = getPublicSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('services')
        .select('id, tenant_id, name, description, duration_minutes, price, is_active, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.warn('Error fetching services from DB, using mock data:', supabaseError)
        setServices(getMockServices())
        return
      }

      if (!data || data.length === 0) {
        console.log('No services found, using mock data')
        setServices(getMockServices())
        return
      }

      // Agregar campos por defecto para compatibilidad
      const servicesWithDefaults = data.map(service => ({
        ...service,
        category: 'basico',
        is_featured: false,
        image_url: undefined,
        bookings_count: 0,
        average_rating: 0
      }))

      console.log(`✅ Loaded ${servicesWithDefaults.length} services from DB`)
      setServices(servicesWithDefaults)
      setError(null)

    } catch (err) {
      console.error('Error fetching services:', err)
      setServices(getMockServices())
      setError(err instanceof Error ? err.message : 'Error loading services')
    } finally {
      setIsLoading(false)
    }
  }

  return { services, isLoading, error, refetch: () => fetchServices(tenantId!) }
}

function getMockServices(): Service[] {
  return [
    {
      id: 'mock-service-1',
      tenant_id: 'demo-tenant-id',
      name: 'Corte Clásico',
      description: 'Corte tradicional con técnicas modernas. Incluye lavado y peinado.',
      duration_minutes: 45,
      price: 25000,
      category: 'basico',
      is_active: true,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-service-2',
      tenant_id: 'demo-tenant-id',
      name: 'Barba Completa',
      description: 'Arreglo completo de barba con perfilado y hidratación. Incluye aceites especiales.',
      duration_minutes: 30,
      price: 20000,
      category: 'premium',
      is_active: true,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-service-3',
      tenant_id: 'demo-tenant-id',
      name: 'Corte + Barba Premium',
      description: 'Combo completo: corte moderno + arreglo de barba + tratamiento hidratante.',
      duration_minutes: 75,
      price: 40000,
      category: 'premium',
      is_active: true,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-service-4',
      tenant_id: 'demo-tenant-id',
      name: 'Afeitado Tradicional',
      description: 'Afeitado clásico con navaja y toallas calientes. Experiencia tradicional de barbería.',
      duration_minutes: 40,
      price: 30000,
      category: 'premium',
      is_active: true,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-service-5',
      tenant_id: 'demo-tenant-id',
      name: 'Tratamiento Capilar',
      description: 'Tratamiento revitalizante para el cuero cabelludo con productos especializados.',
      duration_minutes: 60,
      price: 35000,
      category: 'color',
      is_active: true,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-service-6',
      tenant_id: 'demo-tenant-id',
      name: 'Corte Fade',
      description: 'Corte moderno con degradado perfecto. Técnica especializada para looks actuales.',
      duration_minutes: 50,
      price: 28000,
      category: 'basico',
      is_active: true,
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}