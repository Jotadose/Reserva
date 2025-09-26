'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

interface DashboardMetrics {
  totalBookings: number
  totalRevenue: number
  activeClients: number
  averageRating: number
  bookingsThisMonth: number
  revenueThisMonth: number
  pendingBookings: number
  completedBookings: number
  cancelledBookings: number
  popularServices: {
    name: string
    bookings: number
    revenue: number
  }[]
  recentActivity: {
    type: 'booking' | 'cancellation' | 'completion'
    message: string
    date: string
  }[]
  monthlyTrends: {
    month: string
    bookings: number
    revenue: number
  }[]
}

export function useDashboardMetrics(tenantId: string | null) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) {
      setMetrics(getMockMetrics())
      setIsLoading(false)
      return
    }

    fetchMetrics(tenantId)
  }, [tenantId])

  const fetchMetrics = async (tenantId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = getSupabaseClient()
      
      // Obtener métricas de reservas
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          total_price,
          booking_date,
          created_at,
          service:services(name),
          client:clients(name, email)
        `)
        .eq('tenant_id', tenantId)

      if (bookingsError) {
        console.warn('Error fetching bookings metrics:', bookingsError)
        setMetrics(getMockMetrics())
        return
      }

      // Obtener servicios con estadísticas
      const { data: serviceStats, error: servicesError } = await supabase
        .from('services')
        .select(`
          name,
          bookings(status, total_price)
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)

      if (servicesError) {
        console.warn('Error fetching service stats:', servicesError)
      }

      // Procesar datos
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const processedMetrics: DashboardMetrics = {
        totalBookings: bookings?.length || 0,
        totalRevenue: bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
        activeClients: new Set(bookings?.map(b => (b.client as any)?.email).filter(Boolean)).size,
        averageRating: 4.2, // TODO: Implementar sistema de ratings
        bookingsThisMonth: bookings?.filter(b => new Date(b.created_at) >= thisMonth).length || 0,
        revenueThisMonth: bookings?.filter(b => new Date(b.created_at) >= thisMonth)
          .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
        pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
        completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
        cancelledBookings: bookings?.filter(b => b.status === 'cancelled').length || 0,
        popularServices: processPopularServices(serviceStats),
        recentActivity: processRecentActivity(bookings),
        monthlyTrends: processMonthlyTrends(bookings)
      }

      setMetrics(processedMetrics)
      setError(null)

    } catch (err) {
      console.error('Error fetching dashboard metrics:', err)
      setMetrics(getMockMetrics())
      setError(err instanceof Error ? err.message : 'Error loading metrics')
    } finally {
      setIsLoading(false)
    }
  }

  return { metrics, isLoading, error, refetch: () => fetchMetrics(tenantId!) }
}

function processPopularServices(serviceStats: any[] | null): DashboardMetrics['popularServices'] {
  if (!serviceStats) return []

  return serviceStats
    .map(service => ({
      name: service.name,
      bookings: service.bookings?.length || 0,
      revenue: service.bookings?.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0) || 0
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5)
}

function processRecentActivity(bookings: any[] | null): DashboardMetrics['recentActivity'] {
  if (!bookings) return []

  return bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map(booking => ({
      type: booking.status === 'completed' ? 'completion' as const : 
            booking.status === 'cancelled' ? 'cancellation' as const : 'booking' as const,
      message: `${booking.service?.name || 'Servicio'} - ${booking.client?.name || 'Cliente'}`,
      date: booking.created_at
    }))
}

function processMonthlyTrends(bookings: any[] | null): DashboardMetrics['monthlyTrends'] {
  if (!bookings) return []

  const monthlyData = new Map<string, { bookings: number, revenue: number }>()
  
  bookings.forEach(booking => {
    const date = new Date(booking.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { bookings: 0, revenue: 0 })
    }
    
    const current = monthlyData.get(monthKey)!
    current.bookings += 1
    current.revenue += booking.total_price || 0
  })

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      bookings: data.bookings,
      revenue: data.revenue
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6) // Últimos 6 meses
}

function getMockMetrics(): DashboardMetrics {
  return {
    totalBookings: 1250,
    totalRevenue: 89500,
    activeClients: 340,
    averageRating: 4.8,
    bookingsThisMonth: 142,
    revenueThisMonth: 12800,
    pendingBookings: 18,
    completedBookings: 1180,
    cancelledBookings: 52,
    popularServices: [
      { name: 'Corte Clásico', bookings: 280, revenue: 14000 },
      { name: 'Barba Completa', bookings: 220, revenue: 13200 },
      { name: 'Corte + Barba', bookings: 190, revenue: 17100 },
      { name: 'Afeitado Tradicional', bookings: 150, revenue: 9000 },
      { name: 'Tratamiento Capilar', bookings: 120, revenue: 9600 }
    ],
    recentActivity: [
      { type: 'booking', message: 'Corte Clásico - Juan Pérez', date: new Date().toISOString() },
      { type: 'completion', message: 'Barba Completa - Carlos Silva', date: new Date(Date.now() - 3600000).toISOString() },
      { type: 'booking', message: 'Corte + Barba - Luis Martín', date: new Date(Date.now() - 7200000).toISOString() },
      { type: 'cancellation', message: 'Afeitado - Pedro García', date: new Date(Date.now() - 10800000).toISOString() }
    ],
    monthlyTrends: [
      { month: '2025-04', bookings: 95, revenue: 8500 },
      { month: '2025-05', bookings: 110, revenue: 9800 },
      { month: '2025-06', bookings: 125, revenue: 11200 },
      { month: '2025-07', bookings: 135, revenue: 12100 },
      { month: '2025-08', bookings: 148, revenue: 13400 },
      { month: '2025-09', bookings: 142, revenue: 12800 }
    ]
  }
}