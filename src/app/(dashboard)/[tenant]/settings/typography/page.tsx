'use client'

import React, { useState, useEffect } from 'react'
import { Type, Save, Eye, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTenant } from '@/hooks/use-tenant'

interface FontOption {
  id: string
  name: string
  family: string
  weights: number[]
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace'
  googleFont?: boolean
  previewText: string
}

const FONT_OPTIONS: FontOption[] = [
  // Sans-serif
  {
    id: 'inter',
    name: 'Inter',
    family: 'Inter, sans-serif',
    weights: [300, 400, 500, 600, 700],
    category: 'sans-serif',
    googleFont: true,
    previewText: 'Reserva tu cita hoy mismo'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: 'Roboto, sans-serif',
    weights: [300, 400, 500, 700],
    category: 'sans-serif',
    googleFont: true,
    previewText: 'Reserva tu cita hoy mismo'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: 'Poppins, sans-serif',
    weights: [300, 400, 500, 600, 700],
    category: 'sans-serif',
    googleFont: true,
    previewText: 'Reserva tu cita hoy mismo'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: 'Montserrat, sans-serif',
    weights: [300, 400, 500, 600, 700],
    category: 'sans-serif',
    googleFont: true,
    previewText: 'Reserva tu cita hoy mismo'
  },
  
  // Serif
  {
    id: 'playfair',
    name: 'Playfair Display',
    family: 'Playfair Display, serif',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFont: true,
    previewText: 'Reserva tu cita hoy mismo'
  },
  {
    id: 'lora',
    name: 'Lora',
    family: 'Lora, serif',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFont: true,
    previewText: 'Reserva tu cita hoy mismo'
  },
  
  // Display
  {
    id: 'oswald',
    name: 'Oswald',
    family: 'Oswald, sans-serif',
    weights: [300, 400, 500, 600, 700],
    category: 'display',
    googleFont: true,
    previewText: 'RESERVA TU CITA'
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    family: 'Dancing Script, cursive',
    weights: [400, 500, 600, 700],
    category: 'handwriting',
    googleFont: true,
    previewText: 'Reserva tu cita hoy mismo'
  }
]

export default function TypographyPage() {
  const { tenant, updateTenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const [fontSettings, setFontSettings] = useState({
    headingFont: 'inter',
    bodyFont: 'inter',
    buttonFont: 'inter',
    headingSize: 'large' as 'small' | 'medium' | 'large' | 'xlarge',
    bodySize: 'medium' as 'small' | 'medium' | 'large',
    lineHeight: 'normal' as 'tight' | 'normal' | 'relaxed'
  })

  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (tenant?.branding?.typography) {
      setFontSettings({
        headingFont: tenant.branding.typography.headingFont || 'inter',
        bodyFont: tenant.branding.typography.bodyFont || 'inter',
        buttonFont: tenant.branding.typography.buttonFont || 'inter',
        headingSize: tenant.branding.typography.headingSize || 'large',
        bodySize: tenant.branding.typography.bodySize || 'medium',
        lineHeight: tenant.branding.typography.lineHeight || 'normal'
      })
    }
  }, [tenant])

  const loadGoogleFont = (fontId: string) => {
    const font = FONT_OPTIONS.find(f => f.id === fontId)
    if (!font || !font.googleFont || loadedFonts.has(fontId)) return

    const weights = font.weights.join(',')
    const fontName = font.name.replace(/\s+/g, '+')
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@${weights}&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    setLoadedFonts(prev => new Set([...prev, fontId]))
  }

  const handleFontChange = (type: 'headingFont' | 'bodyFont' | 'buttonFont', fontId: string) => {
    setFontSettings(prev => ({ ...prev, [type]: fontId }))
    loadGoogleFont(fontId)
  }

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
        typography: fontSettings
      }

      await updateTenant({ branding: updatedBranding })
      
      // Aplicar fuentes inmediatamente
      applyFontsToCSS()
      
      setMessage('Configuración de tipografía guardada exitosamente')
      setMessageType('success')
    } catch (error) {
      console.error('Error saving typography:', error)
      setMessage('Error al guardar la configuración de tipografía')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const applyFontsToCSS = () => {
    const headingFont = FONT_OPTIONS.find(f => f.id === fontSettings.headingFont)
    const bodyFont = FONT_OPTIONS.find(f => f.id === fontSettings.bodyFont)
    const buttonFont = FONT_OPTIONS.find(f => f.id === fontSettings.buttonFont)

    if (typeof window !== 'undefined') {
      const root = document.documentElement
      
      if (headingFont) {
        root.style.setProperty('--font-heading', headingFont.family)
      }
      if (bodyFont) {
        root.style.setProperty('--font-body', bodyFont.family)
      }
      if (buttonFont) {
        root.style.setProperty('--font-button', buttonFont.family)
      }

      // Tamaños de fuente
      const headingSizes = {
        small: '1.5rem',
        medium: '2rem',
        large: '2.5rem',
        xlarge: '3rem'
      }
      
      const bodySizes = {
        small: '0.875rem',
        medium: '1rem',
        large: '1.125rem'
      }

      const lineHeights = {
        tight: '1.2',
        normal: '1.5',
        relaxed: '1.75'
      }

      root.style.setProperty('--heading-size', headingSizes[fontSettings.headingSize as keyof typeof headingSizes])
      root.style.setProperty('--body-size', bodySizes[fontSettings.bodySize as keyof typeof bodySizes])
      root.style.setProperty('--line-height', lineHeights[fontSettings.lineHeight as keyof typeof lineHeights])
    }
  }

  // Aplicar fuentes cuando cambie la configuración
  useEffect(() => {
    applyFontsToCSS()
  }, [fontSettings])

  const FontPreview = ({ font, isSelected, onClick }: { 
    font: FontOption
    isSelected: boolean
    onClick: () => void 
  }) => {
    useEffect(() => {
      loadGoogleFont(font.id)
    }, [font.id])

    return (
      <div
        onClick={onClick}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{font.name}</h4>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
            {font.category}
          </span>
        </div>
        <p 
          className="text-lg leading-relaxed"
          style={{ fontFamily: font.family }}
        >
          {font.previewText}
        </p>
        <div className="mt-2 flex gap-1">
          {font.weights.map(weight => (
            <span key={weight} className="text-xs px-1 py-0.5 bg-gray-100 rounded text-gray-600">
              {weight}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Tipografía</h1>
        <p className="text-gray-600">Personaliza las fuentes de tu landing page</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${messageType === 'error' ? 'border-red-200' : 'border-green-200'}`}>
          <AlertDescription className={messageType === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Configuración de Fuentes */}
        <div className="xl:col-span-2 space-y-8">
          {/* Fuente para Títulos */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-blue-600" />
                Fuente para Títulos y Encabezados
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FONT_OPTIONS.map((font) => (
                  <FontPreview
                    key={font.id}
                    font={font}
                    isSelected={fontSettings.headingFont === font.id}
                    onClick={() => handleFontChange('headingFont', font.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fuente para Cuerpo */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-green-600" />
                Fuente para Texto del Cuerpo
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FONT_OPTIONS.map((font) => (
                  <FontPreview
                    key={font.id}
                    font={font}
                    isSelected={fontSettings.bodyFont === font.id}
                    onClick={() => handleFontChange('bodyFont', font.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fuente para Botones */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-purple-600" />
                Fuente para Botones
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FONT_OPTIONS.map((font) => (
                  <FontPreview
                    key={font.id}
                    font={font}
                    isSelected={fontSettings.buttonFont === font.id}
                    onClick={() => handleFontChange('buttonFont', font.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Configuración y Vista Previa */}
        <div className="space-y-6">
          {/* Configuraciones Adicionales */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Configuraciones Adicionales</CardTitle>
            </CardHeader>
            
            <CardContent className="px-0 space-y-4">
              <div>
                <Label className="text-sm font-medium">Tamaño de Títulos</Label>
                <select
                  value={fontSettings.headingSize}
                  onChange={(e) => setFontSettings(prev => ({ ...prev, headingSize: e.target.value as 'small' | 'medium' | 'large' | 'xlarge' }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                  <option value="xlarge">Extra Grande</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Tamaño del Texto</Label>
                <select
                  value={fontSettings.bodySize}
                  onChange={(e) => setFontSettings(prev => ({ ...prev, bodySize: e.target.value as 'small' | 'medium' | 'large' }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium">Espaciado de Líneas</Label>
                <select
                  value={fontSettings.lineHeight}
                  onChange={(e) => setFontSettings(prev => ({ ...prev, lineHeight: e.target.value as 'tight' | 'normal' | 'relaxed' }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tight">Ajustado</option>
                  <option value="normal">Normal</option>
                  <option value="relaxed">Relajado</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Vista Previa */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            
            <CardContent className="px-0">
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h1 
                  className="font-bold"
                  style={{ 
                    fontFamily: FONT_OPTIONS.find(f => f.id === fontSettings.headingFont)?.family,
                    fontSize: 'var(--heading-size, 2rem)',
                    lineHeight: 'var(--line-height, 1.5)'
                  }}
                >
                  Tu Negocio Aquí
                </h1>
                <p 
                  style={{ 
                    fontFamily: FONT_OPTIONS.find(f => f.id === fontSettings.bodyFont)?.family,
                    fontSize: 'var(--body-size, 1rem)',
                    lineHeight: 'var(--line-height, 1.5)'
                  }}
                >
                  Este es un ejemplo de cómo se verá el texto del cuerpo en tu landing page. 
                  Puedes ajustar la fuente, el tamaño y el espaciado para que se adapte perfectamente 
                  a la identidad de tu marca.
                </p>
                <button 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
                  style={{ 
                    fontFamily: FONT_OPTIONS.find(f => f.id === fontSettings.buttonFont)?.family
                  }}
                >
                  Reservar Ahora
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Botón Guardar */}
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  )
}