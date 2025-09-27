'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Settings, 
  Palette, 
  Image, 
  Users, 
  CreditCard, 
  Bell,
  Shield,
  Globe
} from 'lucide-react'

interface SettingsLayoutProps {
  children: ReactNode
}

const settingsNavigation = [
  {
    name: 'General',
    href: '/settings',
    icon: Settings,
    exact: true
  },
  {
    name: 'Branding',
    href: '/settings/branding',
    icon: Palette,
    exact: false
  },
  {
    name: 'Imágenes',
    href: '/settings/images',
    icon: Image,
    exact: false
  },
  {
    name: 'Usuarios',
    href: '/settings/users',
    icon: Users,
    exact: false
  },
  {
    name: 'Facturación',
    href: '/settings/billing',
    icon: CreditCard,
    exact: false
  },
  {
    name: 'Notificaciones',
    href: '/settings/notifications',
    icon: Bell,
    exact: false
  },
  {
    name: 'Privacidad',
    href: '/settings/privacy',
    icon: Shield,
    exact: false
  },
  {
    name: 'Dominio',
    href: '/settings/domain',
    icon: Globe,
    exact: false
  }
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const params = useParams()
  const pathname = usePathname()
  const tenantSlug = params.tenant as string

  const isActiveRoute = (href: string, exact: boolean) => {
    const fullPath = `/${tenantSlug}${href}`
    if (exact) {
      return pathname === fullPath
    }
    return pathname.startsWith(fullPath)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar de navegación */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tu workspace</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-3">
            {settingsNavigation.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.href, item.exact)
              
              return (
                <Link
                  key={item.name}
                  href={`/${tenantSlug}${item.href}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1',
                    isActive
                      ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}