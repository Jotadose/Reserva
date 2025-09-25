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
        .select('id, tenant_id, name, description, duration_minutes, price, category, is_active, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name')

      if (supabaseError) {
        console.warn('Error fetching services from DB, using mock data:', supabaseError)
        setServices(getMockServices())
      } else {
        console.log(`✅ ${data?.length || 0} servicios cargados desde BD`)
        setServices(data || getMockServices())
      }
    } catch (err) {
      console.warn('Error fetching services:', err)
      setServices(getMockServices())
    } finally {
      setIsLoading(false)
    }
  }

  return { services, isLoading, error }
}

// Servicios mock como fallback
function getMockServices(): Service[] {
  return [
    {
      id: '1',
      tenant_id: 'mock',
      name: 'Corte Clásico',
      description: 'Corte tradicional con tijera y máquina, incluye lavado y peinado',
      duration_minutes: 30,
      price: 2500,
      category: 'basico',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      tenant_id: 'mock',
      name: 'Corte + Barba',
      description: 'Corte completo con arreglo de barba profesional',
      duration_minutes: 45,
      price: 3500,
      category: 'premium',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      tenant_id: 'mock',
      name: 'Afeitado Clásico',
      description: 'Afeitado tradicional con navaja y toallas calientes',
      duration_minutes: 20,
      price: 1800,
      category: 'premium',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      tenant_id: 'mock',
      name: 'Lavado y Peinado',
      description: 'Lavado profundo con productos premium',
      duration_minutes: 15,
      price: 1000,
      category: 'basico',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      tenant_id: 'mock',
      name: 'Combo Completo',
      description: 'Corte + Barba + Lavado + Peinado',
      duration_minutes: 60,
      price: 4500,
      category: 'premium',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      tenant_id: 'mock',
      name: 'Tratamiento Capilar',
      description: 'Tratamiento nutritivo para el cabello',
      duration_minutes: 40,
      price: 3000,
      category: 'especial',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}