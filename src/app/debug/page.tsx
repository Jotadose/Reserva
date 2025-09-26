'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

export default function DebugPage() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        const supabase = getSupabaseClient()
        
        // Obtener sesión actual
        const { data: sessionData } = await supabase.auth.getSession()
        
        // Obtener todos los tenants
        const { data: tenants } = await supabase
          .from('tenants')
          .select('*')
          
        // Obtener todos los usuarios (si existe la tabla)
        const { data: users } = await supabase
          .from('users')
          .select('*')
        
        setData({
          session: sessionData,
          tenants: tenants || [],
          users: users || [],
          userEmail: sessionData?.session?.user?.email
        })
      } catch (error) {
        console.error('Error fetching debug data:', error)
        setData({ error: error })
      } finally {
        setLoading(false)
      }
    }

    fetchDebugData()
  }, [])

  if (loading) {
    return <div className="p-8">Cargando datos de debug...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug - Estado de Autenticación</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Sesión Actual:</h2>
          <pre className="text-sm bg-white p-2 rounded overflow-auto">
            {JSON.stringify(data.session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Tenants en BD ({data.tenants?.length || 0}):</h2>
          <pre className="text-sm bg-white p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(data.tenants, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Users en BD ({data.users?.length || 0}):</h2>
          <pre className="text-sm bg-white p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(data.users, null, 2)}
          </pre>
        </div>

        {data.error && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="font-semibold mb-2 text-red-800">Error:</h2>
            <pre className="text-sm bg-white p-2 rounded overflow-auto">
              {JSON.stringify(data.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}