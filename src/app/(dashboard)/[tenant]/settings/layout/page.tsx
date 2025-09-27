'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Save, Eye, Smartphone, Monitor, Tablet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTenant } from '@/hooks/use-tenant'

interface LayoutConfig {
  containerPadding: 'compact' | 'normal' | 'spacious'
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  glassIntensity: 'subtle' | 'medium' | 'strong'
  backgroundColor?: string
  cardColor?: string
  borderColor?: string
  logoPosition: 'left' | 'center' | 'right'
  logoSize: 'small' | 'medium' | 'large'
  coverImageOpacity: number
  mobileLayout: 'stack' | 'side-by-side'
  responsiveBreakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
}

export default function LayoutPage() {
  const { tenant, updateTenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    containerPadding: 'normal',
    borderRadius: 'medium',
    glassIntensity: 'medium',
    backgroundColor: '#0F172A',
    cardColor: '#1E293B',
    borderColor: '#334155',
    logoPosition: 'left',
    logoSize: 'medium',
    coverImageOpacity: 0.8,
    mobileLayout: 'stack',
    responsiveBreakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280
    }
  })

  useEffect(() => {
    if (tenant?.branding?.layout) {
      setLayoutConfig(prev => ({
        ...prev,
        ...tenant.branding!.layout
      }))
    }
  }, [tenant])

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      const currentBranding = tenant?.branding || {
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
        buttonColor: '#10B981',
        textColor: '#F3F4F6'
      }

      const updatedBranding = {
        ...currentBranding,
        layout: layoutConfig
      }

      await updateTenant({ branding: updatedBranding })
      
      // Aplicar configuración CSS inmediatamente
      applyLayoutCSS()
      
      setMessage('Configuración de layout guardada exitosamente')
      setMessageType('success')
    } catch (error) {
      console.error('Error saving layout:', error)
      setMessage('Error al guardar la configuración de layout')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const applyLayoutCSS = () => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement

      // Espaciado del contenedor
      const paddingMap = {
        compact: '1rem',
        normal: '2rem',
        spacious: '3rem'
      }
      root.style.setProperty('--container-padding', paddingMap[layoutConfig.containerPadding])

      // Border radius
      const radiusMap = {
        none: '0px',
        small: '0.375rem',
        medium: '0.75rem',
        large: '1.5rem'
      }
      root.style.setProperty('--border-radius', radiusMap[layoutConfig.borderRadius])

      // Intensidad del glass effect
      const glassMap = {
        subtle: '0.05',
        medium: '0.1',
        strong: '0.2'
      }
      root.style.setProperty('--glass-opacity', glassMap[layoutConfig.glassIntensity])

      // Colores de fondo
      if (layoutConfig.backgroundColor) {
        root.style.setProperty('--bg-color', layoutConfig.backgroundColor)
      }
      if (layoutConfig.cardColor) {
        root.style.setProperty('--card-color', layoutConfig.cardColor)
      }
      if (layoutConfig.borderColor) {
        root.style.setProperty('--border-color', layoutConfig.borderColor)
      }

      // Logo
      const logoSizeMap = {
        small: '2rem',
        medium: '3rem',
        large: '4rem'
      }
      root.style.setProperty('--logo-size', logoSizeMap[layoutConfig.logoSize])
      root.style.setProperty('--logo-position', layoutConfig.logoPosition)

      // Cover image opacity
      root.style.setProperty('--cover-opacity', layoutConfig.coverImageOpacity.toString())

      // Responsive breakpoints
      root.style.setProperty('--breakpoint-mobile', `${layoutConfig.responsiveBreakpoints.mobile}px`)
      root.style.setProperty('--breakpoint-tablet', `${layoutConfig.responsiveBreakpoints.tablet}px`)
      root.style.setProperty('--breakpoint-desktop', `${layoutConfig.responsiveBreakpoints.desktop}px`)
    }
  }

  useEffect(() => {
    applyLayoutCSS()
  }, [layoutConfig])

  const handleConfigChange = (key: keyof LayoutConfig, value: any) => {
    setLayoutConfig(prev => ({ ...prev, [key]: value }))
  }

  const resetToDefaults = () => {
    setLayoutConfig({
      containerPadding: 'normal',
      borderRadius: 'medium',
      glassIntensity: 'medium',
      backgroundColor: '#0F172A',
      cardColor: '#1E293B',
      borderColor: '#334155',
      logoPosition: 'left',
      logoSize: 'medium',
      coverImageOpacity: 0.8,
      mobileLayout: 'stack',
      responsiveBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      }
    })
  }

  const DevicePreview = ({ device }: { device: 'desktop' | 'tablet' | 'mobile' }) => {
    const widthMap = {
      desktop: '100%',
      tablet: '768px',
      mobile: '375px'
    }

    return (
      <div 
        className="mx-auto transition-all duration-300 border rounded-lg overflow-hidden"
        style={{ 
          width: widthMap[device],
          maxWidth: '100%'
        }}
      >
        {/* Simulación del header */}
        <div 
          className="p-4 flex items-center"
          style={{
            backgroundColor: layoutConfig.cardColor,
            borderBottom: `1px solid ${layoutConfig.borderColor}`,
            justifyContent: layoutConfig.logoPosition
          }}
        >
          <div 
            className="rounded bg-gray-400"
            style={{
              width: layoutConfig.logoSize === 'small' ? '32px' : 
                     layoutConfig.logoSize === 'medium' ? '48px' : '64px',
              height: layoutConfig.logoSize === 'small' ? '32px' : 
                      layoutConfig.logoSize === 'medium' ? '48px' : '64px'
            }}
          />
        </div>

        {/* Simulación del contenido */}
        <div 
          style={{ 
            backgroundColor: layoutConfig.backgroundColor,
            padding: layoutConfig.containerPadding === 'compact' ? '1rem' :
                     layoutConfig.containerPadding === 'normal' ? '2rem' : '3rem'
          }}
        >
          {/* Card de ejemplo */}
          <div 
            className="p-6 mb-4"
            style={{
              backgroundColor: layoutConfig.cardColor + 
                (layoutConfig.glassIntensity === 'subtle' ? '0D' :
                 layoutConfig.glassIntensity === 'medium' ? '1A' : '33'),
              border: `1px solid ${layoutConfig.borderColor}`,
              borderRadius: layoutConfig.borderRadius === 'none' ? '0px' :
                           layoutConfig.borderRadius === 'small' ? '6px' :
                           layoutConfig.borderRadius === 'medium' ? '12px' : '24px'
            }}
          >
            <div className="h-4 bg-gray-400 rounded mb-2" style={{ width: '60%' }} />
            <div className="h-3 bg-gray-500 rounded mb-1" style={{ width: '80%' }} />
            <div className="h-3 bg-gray-500 rounded" style={{ width: '40%' }} />
          </div>

          {/* Layout móvil */}
          {device === 'mobile' && (
            <div className={`flex gap-4 ${layoutConfig.mobileLayout === 'stack' ? 'flex-col' : 'flex-row'}`}>
              <div 
                className="p-4 flex-1"
                style={{
                  backgroundColor: layoutConfig.cardColor,
                  borderRadius: layoutConfig.borderRadius === 'none' ? '0px' :
                               layoutConfig.borderRadius === 'small' ? '6px' :
                               layoutConfig.borderRadius === 'medium' ? '12px' : '24px'
                }}
              >
                <div className="h-3 bg-gray-400 rounded" />
              </div>
              <div 
                className="p-4 flex-1"
                style={{
                  backgroundColor: layoutConfig.cardColor,
                  borderRadius: layoutConfig.borderRadius === 'none' ? '0px' :
                               layoutConfig.borderRadius === 'small' ? '6px' :
                               layoutConfig.borderRadius === 'medium' ? '12px' : '24px'
                }}
              >
                <div className="h-3 bg-gray-400 rounded" />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Layout</h1>
        <p className="text-gray-600">Personaliza el diseño y disposición de elementos</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${messageType === 'error' ? 'border-red-200' : 'border-green-200'}`}>
          <AlertDescription className={messageType === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Configuraciones */}
        <div className="xl:col-span-2 space-y-6">
          {/* Espaciado y Forma */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-600" />
                Espaciado y Forma
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-0 space-y-4">
              <div>
                <Label className="text-sm font-medium">Padding del Contenedor</Label>
                <select
                  value={layoutConfig.containerPadding}
                  onChange={(e) => handleConfigChange('containerPadding', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="compact">Compacto</option>
                  <option value="normal">Normal</option>
                  <option value="spacious">Espacioso</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Border Radius</Label>
                <select
                  value={layoutConfig.borderRadius}
                  onChange={(e) => handleConfigChange('borderRadius', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Sin bordes redondeados</option>
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Intensidad Glass Effect</Label>
                <select
                  value={layoutConfig.glassIntensity}
                  onChange={(e) => handleConfigChange('glassIntensity', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="subtle">Sutil</option>
                  <option value="medium">Medio</option>
                  <option value="strong">Fuerte</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Colores de Fondo */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Colores de Fondo</CardTitle>
            </CardHeader>
            
            <CardContent className="px-0 space-y-4">
              <div>
                <Label className="text-sm font-medium">Color de Fondo Principal</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={layoutConfig.backgroundColor}
                    onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <input
                    type="text"
                    value={layoutConfig.backgroundColor}
                    onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="#0F172A"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Color de Cards</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={layoutConfig.cardColor}
                    onChange={(e) => handleConfigChange('cardColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <input
                    type="text"
                    value={layoutConfig.cardColor}
                    onChange={(e) => handleConfigChange('cardColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="#1E293B"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Color de Bordes</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={layoutConfig.borderColor}
                    onChange={(e) => handleConfigChange('borderColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <input
                    type="text"
                    value={layoutConfig.borderColor}
                    onChange={(e) => handleConfigChange('borderColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="#334155"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo y Elementos */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Logo y Elementos</CardTitle>
            </CardHeader>
            
            <CardContent className="px-0 space-y-4">
              <div>
                <Label className="text-sm font-medium">Posición del Logo</Label>
                <select
                  value={layoutConfig.logoPosition}
                  onChange={(e) => handleConfigChange('logoPosition', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Tamaño del Logo</Label>
                <select
                  value={layoutConfig.logoSize}
                  onChange={(e) => handleConfigChange('logoSize', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Opacidad de Imagen de Portada: {Math.round(layoutConfig.coverImageOpacity * 100)}%
                </Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={layoutConfig.coverImageOpacity}
                  onChange={(e) => handleConfigChange('coverImageOpacity', parseFloat(e.target.value))}
                  className="mt-1 w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Responsive */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Configuración Responsive</CardTitle>
            </CardHeader>
            
            <CardContent className="px-0 space-y-4">
              <div>
                <Label className="text-sm font-medium">Layout Mobile</Label>
                <select
                  value={layoutConfig.mobileLayout}
                  onChange={(e) => handleConfigChange('mobileLayout', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="stack">Apilado (Stack)</option>
                  <option value="side-by-side">Lado a Lado</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Mobile</Label>
                  <input
                    type="number"
                    value={layoutConfig.responsiveBreakpoints.mobile}
                    onChange={(e) => handleConfigChange('responsiveBreakpoints', {
                      ...layoutConfig.responsiveBreakpoints,
                      mobile: parseInt(e.target.value)
                    })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Tablet</Label>
                  <input
                    type="number"
                    value={layoutConfig.responsiveBreakpoints.tablet}
                    onChange={(e) => handleConfigChange('responsiveBreakpoints', {
                      ...layoutConfig.responsiveBreakpoints,
                      tablet: parseInt(e.target.value)
                    })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Desktop</Label>
                  <input
                    type="number"
                    value={layoutConfig.responsiveBreakpoints.desktop}
                    onChange={(e) => handleConfigChange('responsiveBreakpoints', {
                      ...layoutConfig.responsiveBreakpoints,
                      desktop: parseInt(e.target.value)
                    })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vista Previa */}
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Vista Previa Responsive</CardTitle>
              
              {/* Selector de dispositivo */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="px-0">
              <div className="bg-gray-100 p-4 rounded-lg">
                <DevicePreview device={previewDevice} />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
            
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="w-full"
            >
              Restaurar Valores por Defecto
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}