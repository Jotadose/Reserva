import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, YERKO_CONFIG } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  isYerko: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isYerko, setIsYerko] = useState(false)

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsYerko(session?.user?.email === YERKO_CONFIG.adminEmail)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setIsYerko(session?.user?.email === YERKO_CONFIG.adminEmail)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Error de autenticación:', error.message)
        return { error }
      }
      
      // Verificar que sea el email de Yerko
      if (data.user?.email !== YERKO_CONFIG.adminEmail) {
        await supabase.auth.signOut()
        return { error: { message: 'Acceso no autorizado' } }
      }
      
      return { error: null }
    } catch (error) {
      console.error('Error en signIn:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Error en signOut:', error)
      return { error }
    }
  }

  const value = {
    user,
    loading,
    isYerko,
    isAuthenticated: !!user && isYerko,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthIndividual = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthIndividual debe ser usado dentro de AuthProvider')
  }
  return context
}