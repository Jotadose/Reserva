'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabaseClient()
        
        // Obtener los parámetros de la URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('Error al procesar la autenticación: ' + error.message)
          return
        }

        if (data.session) {
          console.log('Authentication successful:', data.session.user)
          setStatus('success')
          setMessage('¡Autenticación exitosa! Redirigiendo...')
          
          // Redirigir después de un breve delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('No se pudo establecer la sesión')
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        setStatus('error')
        setMessage('Error inesperado durante la autenticación')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          {status === 'loading' && (
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2">
          {status === 'loading' && 'Procesando autenticación...'}
          {status === 'success' && '¡Bienvenido!'}
          {status === 'error' && 'Error de autenticación'}
        </h2>
        
        <p className="text-gray-300">
          {message}
        </p>
        
        {status === 'error' && (
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Volver al login
          </button>
        )}
      </div>
    </div>
  )
}