'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string; tenant?: string | null }>
  signUp: (email: string, password: string, metadata?: object) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Usar el cliente singleton
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Obtener sesión inicial
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      // Si Supabase no está configurado, simular login exitoso
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, simulating login')
        return { tenant: 'demo-tenant' }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      // Verificar si el usuario tiene un tenant después del login exitoso
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('slug')
          .eq('owner_id', session.user.id)
          .eq('subscription_status', 'active')
          .maybeSingle()

        // Retornar información de redirección
        return { tenant: tenant?.slug || null }
      }

      return {}
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'Error inesperado al iniciar sesión' }
    }
  }

  const signUp = async (email: string, password: string, metadata?: object) => {
    try {
      // Si Supabase no está configurado, simular signup exitoso
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, simulating signup')
        return {}
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata ?? {}
        }
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'Error inesperado al registrarse' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }), [user, session, loading, signIn, signUp, signOut])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  return context
}