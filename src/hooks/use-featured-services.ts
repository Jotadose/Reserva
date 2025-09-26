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
      setServices([])
      setIsLoading(false)
      setError('No tenant ID provided')
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
        console.error('Error fetching featured services from DB:', servicesError)
        setError(servicesError.message || 'Error loading featured services')
        setServices([])
        return
      }

      if (!services || services.length === 0) {
        console.log('⚠️ No featured services found for this tenant')
        setServices([])
        setError('No featured services available for this tenant')
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
      setServices([])
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