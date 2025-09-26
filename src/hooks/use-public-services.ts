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
      setServices([])
      setIsLoading(false)
      setError('No tenant ID provided')
      return
    }

    fetchServices(tenantId)
  }, [tenantId])

  const fetchServices = async (tenantId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log(`🔄 Fetching services for tenant: ${tenantId}`)
      
      const supabase = getPublicSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('services')
        .select('id, tenant_id, name, description, duration_minutes, price, is_active, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      console.log('🔍 Supabase query result:', { data, error: supabaseError })

      if (supabaseError) {
        console.error('❌ Error fetching services from DB:', supabaseError)
        setError(supabaseError.message || 'Error loading services')
        setServices([])
        return
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No services found for this tenant')
        setServices([])
        setError('No services available for this tenant')
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
      setServices([])
      setError(err instanceof Error ? err.message : 'Error loading services')
    } finally {
      setIsLoading(false)
    }
  }

  return { services, isLoading, error, refetch: () => fetchServices(tenantId!) }
}