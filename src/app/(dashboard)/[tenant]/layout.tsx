'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  Settings, 
  Menu, 
  X,
  User,
  LogOut,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { getSupabaseClient } from '@/lib/supabase'

interface DashboardLayoutProps {
  readonly children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Reservas',
    href: '/bookings',
    icon: Calendar
  },
  {
    name: 'Proveedores',
    href: '/providers',
    icon: User
  },
  {
    name: 'Servicios',
    href: '/services',
    icon: Scissors
  },
  {
    name: 'Clientes',
    href: '/clients',
    icon: Users
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings
  }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [tenantData, setTenantData] = useState<{ name: string } | null>(null)
  
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const tenantSlug = params.tenant as string

  // Validar acceso al tenant
  useEffect(() => {
    const validateAccess = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        // Verificar que el tenant existe y pertenece al usuario
        const supabase = getSupabaseClient()
        const { data: tenant, error } = await supabase
          .from('tenants')
          .select('id, name, owner_id')
          .eq('slug', tenantSlug)
          .eq('subscription_status', 'active')
          .single()

        if (error || !tenant) {
          console.error('Tenant not found:', error)
          router.push('/404')
          return
        }

        if (tenant.owner_id !== user.id) {
          // Usuario no es propietario, redirigir a su tenant o onboarding
          const { data: userTenant } = await supabase
            .from('tenants')
            .select('slug')
            .eq('owner_id', user.id)
            .eq('subscription_status', 'active')
            .maybeSingle()

          if (userTenant) {
            router.push(`/${userTenant.slug}/dashboard`)
          } else {
            router.push('/onboarding')
          }
          return
        }

        setTenantData({ name: tenant.name })
        setIsValidating(false)
      } catch (error) {
        console.error('Error validating access:', error)
        router.push('/login')
      }
    }

    validateAccess()
  }, [user, tenantSlug, router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setSidebarOpen(false)
  }

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSidebarOpen(false)
    }
  }

  if (isValidating) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Validando acceso...</p>
        </div>
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === `/${tenantSlug}` || pathname === `/${tenantSlug}/dashboard`
    }
    if (href === '/providers') {
      return pathname === `/${tenantSlug}/providers` || pathname.startsWith(`/${tenantSlug}/providers/`) && !pathname.startsWith(`/${tenantSlug}/providers/availability`)
    }
    return pathname.startsWith(`/${tenantSlug}${href}`)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">
              {tenantData?.name || tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}
            </h1>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={`/${tenantSlug}${item.href}`}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      active
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
              <Link
                href={`/${tenantSlug}/providers/availability`}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ml-6',
                  pathname.startsWith(`/${tenantSlug}/providers/availability`)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Calendar
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    pathname.startsWith(`/${tenantSlug}/providers/availability`) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                Disponibilidad
              </Link>
            </nav>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Button
                variant="ghost"
                className="flex items-center w-full text-left text-gray-600 hover:text-gray-900"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <button 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 border-0 cursor-pointer" 
            onClick={handleOverlayClick}
            onKeyDown={handleOverlayKeyDown}
            aria-label="Cerrar sidebar"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </Button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-gray-900">
                  {tenantData?.name || tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}
                </h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={`/${tenantSlug}${item.href}`}
                      className={cn(
                        'group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors',
                        active
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon
                        className={cn(
                          'mr-4 h-6 w-6 flex-shrink-0',
                          active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </Link>
                  )
                })}
                <Link
                  href={`/${tenantSlug}/providers/availability`}
                  className={cn(
                    'group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ml-6',
                    pathname.startsWith(`/${tenantSlug}/providers/availability`)
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Calendar
                    className={cn(
                      'mr-4 h-6 w-6 flex-shrink-0',
                      pathname.startsWith(`/${tenantSlug}/providers/availability`) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  Disponibilidad
                </Link>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Button
                variant="ghost"
                className="flex items-center w-full text-left text-gray-600 hover:text-gray-900"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header móvil */}
        <div className="md:hidden">
          <div className="flex items-center justify-between bg-white px-4 py-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              {tenantData?.name || tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Contenido */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}