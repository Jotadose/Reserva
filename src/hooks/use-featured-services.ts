'use client'

import { useState, useEffect } from 'react'
import { getPublicSupabaseClient } from '@/lib/supabase'

interface FeaturedService {
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

export function useFeaturedServices(tenantId: string | null, limit: number = 6) {
  const [services, setServices] = useState<FeaturedService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) {
      setServices(getMockFeaturedServices(limit))
      setIsLoading(false)
      return
    }

    fetchFeaturedServices(tenantId, limit)
  }, [tenantId, limit])

  const fetchFeaturedServices = async (tenantId: string, limit: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = getPublicSupabaseClient()
      
      // Obtener servicios básicos sin campos opcionales
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, tenant_id, name, description, duration_minutes, price, is_active, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (servicesError) {
        console.warn('Error fetching featured services from DB:', servicesError)
        setServices(getMockFeaturedServices(limit))
        return
      }

      if (!services || services.length === 0) {
        console.log('No services found, using mock data')
        setServices(getMockFeaturedServices(limit))
        return
      }

      // Convertir servicios básicos a featured services con valores por defecto
      const featuredServices = services.map(service => ({
        ...service,
        category: 'basico',
        is_featured: true, // Por ahora todos son featured
        image_url: undefined,
        bookings_count: 0,
        average_rating: 0
      } as FeaturedService))

      console.log(`✅ Loaded ${featuredServices.length} featured services from DB`)
      setServices(featuredServices)
      setError(null)

    } catch (err) {
      console.error('Error fetching featured services:', err)
      setServices(getMockFeaturedServices(limit))
      setError(err instanceof Error ? err.message : 'Error loading featured services')
    } finally {
      setIsLoading(false)
    }
  }

  return { 
    services, 
    isLoading, 
    error, 
    refetch: () => fetchFeaturedServices(tenantId!, limit) 
  }
}

function getMockFeaturedServices(limit: number): FeaturedService[] {
  const mockServices: FeaturedService[] = [
    {
      id: 'featured-1',
      tenant_id: 'demo-tenant-id',
      name: 'Corte Clásico',
      description: 'Corte tradicional con técnicas modernas. Incluye lavado y peinado.',
      duration_minutes: 45,
      price: 25000,
      category: 'Cortes',
      is_active: true,
      is_featured: true,
      bookings_count: 280,
      average_rating: 4.8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'featured-2',
      tenant_id: 'demo-tenant-id',
      name: 'Barba Completa',
      description: 'Arreglo completo de barba con perfilado y hidratación.',
      duration_minutes: 30,
      price: 20000,
      category: 'Barba',
      is_active: true,
      is_featured: true,
      bookings_count: 220,
      average_rating: 4.9,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'featured-3',
      tenant_id: 'demo-tenant-id',
      name: 'Corte + Barba Premium',
      description: 'Combo completo: corte moderno + arreglo de barba + tratamiento.',
      duration_minutes: 75,
      price: 40000,
      category: 'Combos',
      is_active: true,
      is_featured: true,
      bookings_count: 190,
      average_rating: 5.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'featured-4',
      tenant_id: 'demo-tenant-id',
      name: 'Afeitado Tradicional',
      description: 'Afeitado clásico con navaja y toallas calientes.',
      duration_minutes: 40,
      price: 30000,
      category: 'Afeitado',
      is_active: true,
      is_featured: true,
      bookings_count: 150,
      average_rating: 4.7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'featured-5',
      tenant_id: 'demo-tenant-id',
      name: 'Tratamiento Capilar',
      description: 'Tratamiento revitalizante para el cuero cabelludo.',
      duration_minutes: 60,
      price: 35000,
      category: 'Tratamientos',
      is_active: true,
      is_featured: true,
      bookings_count: 120,
      average_rating: 4.6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'featured-6',
      tenant_id: 'demo-tenant-id',
      name: 'Corte Fade',
      description: 'Corte moderno con degradado perfecto.',
      duration_minutes: 50,
      price: 28000,
      category: 'Cortes',
      is_active: true,
      is_featured: false,
      bookings_count: 95,
      average_rating: 4.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  return mockServices.slice(0, limit)
}