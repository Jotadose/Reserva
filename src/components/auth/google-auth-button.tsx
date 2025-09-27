'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase'
import { FaGoogle } from 'react-icons/fa'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const supabase = getSupabaseClient()
      
      // Guardar información de intento de login para debugging
      localStorage.setItem('auth_attempt', JSON.stringify({
        provider: 'google',
        timestamp: new Date().toISOString(),
        origin: window.location.origin
      }))
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile openid'
        }
      })

      if (error) {
        console.error('Error with Google sign in:', error)
        setError(`Error al conectar con Google: ${error.message}`)
        return
      }

      // Si llegamos aquí sin error, el usuario será redirigido a Google
      console.log('Google OAuth initiated successfully', data)
      
    } catch (error: any) {
      console.error('Unexpected error during Google sign in:', error)
      setError('Error inesperado. Por favor, intenta nuevamente.')
    } finally {
      // Solo resetear loading si hay error, ya que si es exitoso seremos redirigidos
      setTimeout(() => setIsLoading(false), 500)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-md active:scale-[0.98]"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
        ) : (
          <FaGoogle className="w-5 h-5 text-red-500" />
        )}
        <span className="font-medium">
          {isLoading ? 'Conectando con Google...' : 'Continuar con Google'}
        </span>
      </Button>
      
      {isLoading && (
        <p className="text-xs text-gray-500 text-center">
          Serás redirigido a Google para autorizar el acceso
        </p>
      )}
    </div>
  )
}