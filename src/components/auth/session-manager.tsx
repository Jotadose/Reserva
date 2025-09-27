'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronUp,
  Home,
  Eye,
  Edit3,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useTenant } from '@/hooks/use-tenant'

interface SessionManagerProps {
  className?: string
}

export function SessionManager({ className }: SessionManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { user, signOut } = useAuth()
  const { tenant, tenantSlug } = useTenant()
  const router = useRouter()
  const pathname = usePathname()

  // Show session manager only when user is authenticated and we have tenant context
  useEffect(() => {
    const shouldShow = !!(user && tenant && tenantSlug && 
                      (pathname.includes('/dashboard') || pathname.includes('/settings')))
    setIsVisible(shouldShow)
  }, [user, tenant, tenantSlug, pathname])

  // Auto-collapse after 3 seconds when expanded
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isExpanded])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navigateToPublicView = () => {
    if (tenantSlug) {
      window.open(`/${tenantSlug}`, '_blank')
    }
  }

  const navigateToDashboard = () => {
    if (tenantSlug) {
      router.push(`/${tenantSlug}/dashboard`)
    }
  }

  const navigateToSettings = () => {
    if (tenantSlug) {
      router.push(`/${tenantSlug}/settings`)
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <Card className={`bg-gray-900/95 border-gray-700/50 backdrop-blur-md shadow-2xl transition-all duration-300 ${isExpanded ? 'w-80' : 'w-16'}`}>
        <CardContent className="p-0">
          {!isExpanded ? (
            // Compact view - just the user avatar/initial
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="w-full h-16 text-white hover:bg-gray-800/50 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </Button>
          ) : (
            // Expanded view - full session info
            <div className="p-4 space-y-4">
              {/* Header with user info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.email || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Autenticado
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>

              {/* Tenant info */}
              {tenant && (
                <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-xs text-gray-300">Barbería Activa:</span>
                    <Badge variant="secondary" className="text-xs">
                      {tenant.status || 'active'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{tenant.name}</p>
                  <p className="text-xs text-gray-400">/{tenantSlug}</p>
                </div>
              )}

              {/* Quick actions */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateToDashboard}
                  className="w-full justify-start text-gray-200 hover:text-white hover:bg-gray-800/50"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateToPublicView}
                  className="w-full justify-start text-gray-200 hover:text-white hover:bg-gray-800/50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Landing
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateToSettings}
                  className="w-full justify-start text-gray-200 hover:text-white hover:bg-gray-800/50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}