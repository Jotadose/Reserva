'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, requireAuth, router])

  return {
    user: session?.user,
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
  }
}

export function useRequireAuth() {
  return useAuth(true)
}

export function useOptionalAuth() {
  return useAuth(false)
}

// Hook para verificar roles específicos
export function useRole(requiredRole?: 'owner' | 'employee') {
  const { user, isAuthenticated } = useAuth()
  
  const hasRole = (role: 'owner' | 'employee') => {
    return isAuthenticated && user?.role === role
  }
  
  const isOwner = hasRole('owner')
  const isEmployee = hasRole('employee')
  
  // Si se requiere un rol específico, verificar acceso
  const hasRequiredRole = requiredRole ? hasRole(requiredRole) : true
  
  return {
    user,
    isAuthenticated,
    hasRole,
    isOwner,
    isEmployee,
    hasRequiredRole,
    role: user?.role,
  }
}

// Hook para obtener información del tenant del usuario
export function useUserTenant() {
  const { user, isAuthenticated } = useAuth()
  
  return {
    tenantId: user?.tenant_id,
    isAuthenticated,
    user,
  }
}