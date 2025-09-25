'use client'

import { useState } from 'react'
import { getSupabaseClient, isSupabaseConfigured, bookingsAPI, servicesAPI, providersAPI } from '@/lib/supabase'

export function useSupabaseTest() {
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const runConnectivityTest = async () => {
    setIsLoading(true)
    const results: any = {}

    try {
      const supabase = getSupabaseClient()
      
      // Test 1: Verificar configuración
      results.configuration = {
        isConfigured: isSupabaseConfigured(),
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }

      // Test 2: Conectividad básica
      try {
        const { data, error } = await supabase.from('tenants').select('count').limit(1)
        results.connectivity = { success: !error, error: error?.message }
      } catch (err) {
        results.connectivity = { success: false, error: 'Connection failed' }
      }

      // Test 3: Políticas RLS - Tenants
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, slug, name, subscription_status')
          .eq('subscription_status', 'active')
          .limit(5)

        results.tenantRLS = { 
          success: !error, 
          error: error?.message,
          count: data?.length || 0
        }
      } catch (err) {
        results.tenantRLS = { success: false, error: 'RLS test failed' }
      }

      // Test 4: Test de servicios (mock tenant)
      const mockTenantId = 'demo-tenant-id'
      try {
        const servicesResult = await servicesAPI.getAll(mockTenantId)
        results.servicesAPI = {
          success: !servicesResult.error,
          error: servicesResult.error?.message,
          count: servicesResult.data?.length || 0
        }
      } catch (err) {
        results.servicesAPI = { success: false, error: 'Services API failed' }
      }

      // Test 5: Test de providers (mock tenant)
      try {
        const providersResult = await providersAPI.getAll(mockTenantId)
        results.providersAPI = {
          success: !providersResult.error,
          error: providersResult.error?.message,
          count: providersResult.data?.length || 0
        }
      } catch (err) {
        results.providersAPI = { success: false, error: 'Providers API failed' }
      }

      // Test 6: Test de bookings (mock tenant)
      try {
        const bookingsResult = await bookingsAPI.getAll(mockTenantId)
        results.bookingsAPI = {
          success: !bookingsResult.error,
          error: bookingsResult.error?.message,
          count: bookingsResult.data?.length || 0
        }
      } catch (err) {
        results.bookingsAPI = { success: false, error: 'Bookings API failed' }
      }

      setTestResults(results)
    } catch (error) {
      console.error('Test suite failed:', error)
      setTestResults({ error: 'Test suite failed' })
    }

    setIsLoading(false)
  }

  const testBookingConstraint = async (tenantId: string, providerId: string, serviceId: string) => {
    try {
      const overlappingBooking1 = {
        tenant_id: tenantId,
        provider_id: providerId,
        service_id: serviceId,
        scheduled_date: '2024-01-15',
        scheduled_time: '10:00',
        duration_minutes: 60,
        status: 'confirmed',
        client_name: 'Test Client 1',
        client_email: 'test1@example.com',
        client_phone: '+1234567890',
        service_price: 5000, // $50.00
        total_price: 5000
      }

      const overlappingBooking2 = {
        ...overlappingBooking1,
        scheduled_time: '10:30', // Overlap with previous booking
        client_name: 'Test Client 2',
        client_email: 'test2@example.com'
      }

      // First booking should succeed
      const result1 = await bookingsAPI.create(tenantId, overlappingBooking1)
      
      // Second booking should fail due to overlap constraint
      const result2 = await bookingsAPI.create(tenantId, overlappingBooking2)

      return {
        firstBooking: { success: !result1.error, id: result1.data?.id },
        secondBooking: { success: !result2.error, expectedToFail: true, error: result2.error?.message }
      }
    } catch (error) {
      return { error: 'Constraint test failed' }
    }
  }

  return {
    testResults,
    isLoading,
    runConnectivityTest,
    testBookingConstraint,
    isConfigured: isSupabaseConfigured()
  }
}