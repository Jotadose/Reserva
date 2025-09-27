'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Edit3, 
  ExternalLink, 
  RefreshCw,
  Settings,
  Palette,
  Type,
  Layout
} from 'lucide-react'
import { useTenant } from '@/hooks/use-tenant'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface QuickPreviewProps {
  show?: boolean
}

export function QuickPreview({ show = true }: QuickPreviewProps) {
  const { tenant } = useTenant()
  const router = useRouter()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  // Solo mostrar en páginas de configuración
  const shouldShow = show && pathname.includes('/settings') && tenant

  if (!shouldShow) {
    return null
  }

  const handlePreview = () => {
    if (tenant) {
      // Abrir en nueva pestaña para no perder el trabajo de configuración
      window.open(`/${tenant.slug}`, '_blank')
    }
  }

  const handleNavigateToLanding = () => {
    if (tenant) {
      router.push(`/${tenant.slug}`)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="glass border-white/20 bg-blue-600/90 backdrop-blur-md text-white max-w-sm">
        <CardContent className="p-4">
          {!isExpanded ? (
            // Vista compacta
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Vista Previa</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreview}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            // Vista expandida
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Vista Previa Rápida</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {/* Información del tenant */}
              <div className="bg-white/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{tenant.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    /{tenant.slug}
                  </Badge>
                </div>
                <p className="text-xs text-gray-200">
                  Configuración en tiempo real
                </p>
              </div>

              {/* Acciones rápidas */}
              <div className="space-y-2">
                <Button
                  onClick={handlePreview}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir en Nueva Pestaña
                </Button>

                <Button
                  onClick={handleNavigateToLanding}
                  variant="outline"
                  className="w-full text-white border-white/30 hover:bg-white/10"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ir a Vista Pública
                </Button>
              </div>

              {/* Enlaces rápidos a configuración */}
              <div className="grid grid-cols-3 gap-2">
                <Link href={`/${tenant.slug}/settings/branding`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-white hover:bg-white/20 flex-col h-12"
                  >
                    <Palette className="w-4 h-4 mb-1" />
                    <span className="text-xs">Colores</span>
                  </Button>
                </Link>

                <Link href={`/${tenant.slug}/settings/typography`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-white hover:bg-white/20 flex-col h-12"
                  >
                    <Type className="w-4 h-4 mb-1" />
                    <span className="text-xs">Fuentes</span>
                  </Button>
                </Link>

                <Link href={`/${tenant.slug}/settings/layout`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-white hover:bg-white/20 flex-col h-12"
                  >
                    <Layout className="w-4 h-4 mb-1" />
                    <span className="text-xs">Layout</span>
                  </Button>
                </Link>
              </div>

              {/* Status */}
              <div className="text-xs text-center text-gray-200 pt-2 border-t border-white/20">
                Los cambios se aplican automáticamente
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}