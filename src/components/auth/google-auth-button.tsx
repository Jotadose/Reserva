'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase'
import { FaGoogle } from 'react-icons/fa'
import { Loader2 } from 'lucide-react'

export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Error with Google sign in:', error)
        alert('Error al iniciar sesión con Google: ' + error.message)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Error inesperado al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors duration-200"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FaGoogle className="w-4 h-4 text-red-500" />
      )}
      <span>
        {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
      </span>
    </Button>
  )
}