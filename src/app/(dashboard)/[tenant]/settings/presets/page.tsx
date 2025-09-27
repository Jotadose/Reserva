'use client'

import React, { useState, useEffect } from 'react'
import { Palette, Save, Eye, Download, Upload, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTenant } from '@/hooks/use-tenant'

interface DesignPreset {
  id: string
  name: string
  description: string
  category: 'professional' | 'modern' | 'elegant' | 'vibrant' | 'minimal'
  colors: {
    primaryColor: string
    secondaryColor: string
    buttonColor: string
    textColor: string
    textSecondaryColor: string
    iconColor: string
    backgroundColor?: string
    cardColor?: string
    borderColor?: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    buttonFont: string
    headingSize: 'small' | 'medium' | 'large' | 'xlarge'
    bodySize: 'small' | 'medium' | 'large'
    lineHeight: 'tight' | 'normal' | 'relaxed'
  }
  layout: {
    containerPadding: 'compact' | 'normal' | 'spacious'
    borderRadius: 'none' | 'small' | 'medium' | 'large'
    glassIntensity: 'subtle' | 'medium' | 'strong'
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
  customTexts?: {
    customTitle?: string
    customSubtitle?: string
    buttonText?: string
    whatsappButtonText?: string
  }
}

const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'professional-blue',
    name: 'Profesional Azul',
    description: 'Diseño clásico y confiable para servicios profesionales',
    category: 'professional',
    colors: {
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      buttonColor: '#059669',
      textColor: '#F8FAFC',
      textSecondaryColor: '#CBD5E1',
      iconColor: '#60A5FA',
      backgroundColor: '#0F172A',
      cardColor: '#1E293B',
      borderColor: '#334155'
    },
    typography: {
      headingFont: 'roboto',
      bodyFont: 'roboto',
      buttonFont: 'roboto',
      headingSize: 'large',
      bodySize: 'medium',
      lineHeight: 'normal'
    },
    layout: {
      containerPadding: 'normal',
      borderRadius: 'small',
      glassIntensity: 'medium',
      logoPosition: 'left',
      logoSize: 'medium',
      coverImageOpacity: 0.8,
      mobileLayout: 'stack',
      responsiveBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      }
    }
  },
  {
    id: 'elegant-purple',
    name: 'Elegante Púrpura',
    description: 'Sofisticado y moderno para salones de belleza y spas',
    category: 'elegant',
    colors: {
      primaryColor: '#7C3AED',
      secondaryColor: '#A855F7',
      buttonColor: '#EC4899',
      textColor: '#FBBF24',
      textSecondaryColor: '#F3E8FF',
      iconColor: '#C084FC',
      backgroundColor: '#1F1B24',
      cardColor: '#2D1B33',
      borderColor: '#4C1D95'
    },
    typography: {
      headingFont: 'playfair',
      bodyFont: 'lora',
      buttonFont: 'montserrat',
      headingSize: 'xlarge',
      bodySize: 'medium',
      lineHeight: 'relaxed'
    },
    layout: {
      containerPadding: 'spacious',
      borderRadius: 'large',
      glassIntensity: 'strong',
      logoPosition: 'center',
      logoSize: 'large',
      coverImageOpacity: 0.9,
      mobileLayout: 'stack',
      responsiveBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      }
    }
  },
  {
    id: 'modern-green',
    name: 'Moderno Verde',
    description: 'Fresco y natural para centros de bienestar',
    category: 'modern',
    colors: {
      primaryColor: '#059669',
      secondaryColor: '#10B981',
      buttonColor: '#F59E0B',
      textColor: '#F0FDF4',
      textSecondaryColor: '#A7F3D0',
      iconColor: '#34D399',
      backgroundColor: '#064E3B',
      cardColor: '#065F46',
      borderColor: '#047857'
    },
    typography: {
      headingFont: 'poppins',
      bodyFont: 'inter',
      buttonFont: 'poppins',
      headingSize: 'large',
      bodySize: 'medium',
      lineHeight: 'normal'
    },
    layout: {
      containerPadding: 'normal',
      borderRadius: 'medium',
      glassIntensity: 'medium',
      logoPosition: 'left',
      logoSize: 'medium',
      coverImageOpacity: 0.8,
      mobileLayout: 'stack',
      responsiveBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      }
    }
  },
  {
    id: 'vibrant-orange',
    name: 'Vibrante Naranja',
    description: 'Energético y dinámico para gimnasios y deportes',
    category: 'vibrant',
    colors: {
      primaryColor: '#EA580C',
      secondaryColor: '#FB923C',
      buttonColor: '#DC2626',
      textColor: '#FEF3C7',
      textSecondaryColor: '#FED7AA',
      iconColor: '#FDBA74',
      backgroundColor: '#7C2D12',
      cardColor: '#9A3412',
      borderColor: '#C2410C'
    },
    typography: {
      headingFont: 'oswald',
      bodyFont: 'roboto',
      buttonFont: 'oswald',
      headingSize: 'xlarge',
      bodySize: 'large',
      lineHeight: 'tight'
    },
    layout: {
      containerPadding: 'compact',
      borderRadius: 'small',
      glassIntensity: 'subtle',
      logoPosition: 'left',
      logoSize: 'small',
      coverImageOpacity: 0.7,
      mobileLayout: 'side-by-side',
      responsiveBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      }
    }
  },
  {
    id: 'minimal-gray',
    name: 'Minimalista Gris',
    description: 'Limpio y simple para consultorios y oficinas',
    category: 'minimal',
    colors: {
      primaryColor: '#374151',
      secondaryColor: '#6B7280',
      buttonColor: '#1F2937',
      textColor: '#F9FAFB',
      textSecondaryColor: '#D1D5DB',
      iconColor: '#9CA3AF',
      backgroundColor: '#111827',
      cardColor: '#1F2937',
      borderColor: '#374151'
    },
    typography: {
      headingFont: 'inter',
      bodyFont: 'inter',
      buttonFont: 'inter',
      headingSize: 'medium',
      bodySize: 'medium',
      lineHeight: 'normal'
    },
    layout: {
      containerPadding: 'normal',
      borderRadius: 'medium',
      glassIntensity: 'subtle',
      logoPosition: 'left',
      logoSize: 'medium',
      coverImageOpacity: 0.6,
      mobileLayout: 'stack',
      responsiveBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      }
    }
  },
  {
    id: 'luxury-gold',
    name: 'Lujo Dorado',
    description: 'Premium y exclusivo para servicios de alta gama',
    category: 'elegant',
    colors: {
      primaryColor: '#B45309',
      secondaryColor: '#D97706',
      buttonColor: '#DC2626',
      textColor: '#FFFBEB',
      textSecondaryColor: '#FEF3C7',
      iconColor: '#FBBF24',
      backgroundColor: '#0C0A09',
      cardColor: '#1C1917',
      borderColor: '#78716C'
    },
    typography: {
      headingFont: 'playfair',
      bodyFont: 'lora',
      buttonFont: 'montserrat',
      headingSize: 'xlarge',
      bodySize: 'medium',
      lineHeight: 'relaxed'
    },
    layout: {
      containerPadding: 'spacious',
      borderRadius: 'large',
      glassIntensity: 'strong',
      logoPosition: 'center',
      logoSize: 'large',
      coverImageOpacity: 1.0,
      mobileLayout: 'stack',
      responsiveBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      }
    }
  }
]

export default function PresetsPage() {
  const { tenant, updateTenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [previewPreset, setPreviewPreset] = useState<DesignPreset | null>(null)

  const applyPreset = async (preset: DesignPreset) => {
    setLoading(true)
    setMessage('')

    try {
      const currentBranding = tenant?.branding || {}
      
      const updatedBranding = {
        ...currentBranding,
        ...preset.colors,
        typography: preset.typography,
        layout: preset.layout,
        ...(preset.customTexts && preset.customTexts)
      }

      await updateTenant({ branding: updatedBranding })
      
      setMessage(`Preset "${preset.name}" aplicado exitosamente`)
      setMessageType('success')
      setSelectedPreset(preset.id)
    } catch (error) {
      console.error('Error applying preset:', error)
      setMessage('Error al aplicar el preset')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const exportCurrentTheme = () => {
    if (!tenant?.branding) return

    const currentTheme = {
      id: 'custom-export',
      name: 'Mi Tema Personalizado',
      description: 'Tema exportado desde configuración actual',
      category: 'professional' as const,
      colors: {
        primaryColor: tenant.branding.primaryColor || '#8B5CF6',
        secondaryColor: tenant.branding.secondaryColor || '#EC4899',
        buttonColor: tenant.branding.buttonColor || '#10B981',
        textColor: tenant.branding.textColor || '#F3F4F6',
        textSecondaryColor: tenant.branding.textSecondaryColor || '#D1D5DB',
        iconColor: tenant.branding.iconColor || '#A78BFA'
      },
      typography: tenant.branding.typography || {
        headingFont: 'inter',
        bodyFont: 'inter',
        buttonFont: 'inter',
        headingSize: 'large' as const,
        bodySize: 'medium' as const,
        lineHeight: 'normal' as const
      },
      layout: tenant.branding.layout || {
        containerPadding: 'normal' as const,
        borderRadius: 'medium' as const,
        glassIntensity: 'medium' as const
      }
    }

    const dataStr = JSON.stringify(currentTheme, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mi-tema-personalizado.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const PresetCard = ({ preset }: { preset: DesignPreset }) => (
    <Card className="relative group cursor-pointer transition-all duration-300 hover:shadow-lg">
      <div 
        className="absolute inset-0 rounded-lg opacity-20"
        style={{
          background: `linear-gradient(135deg, ${preset.colors.primaryColor} 0%, ${preset.colors.secondaryColor} 100%)`
        }}
      />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{preset.name}</CardTitle>
          <span className={`px-2 py-1 text-xs rounded-full capitalize ${
            preset.category === 'professional' ? 'bg-blue-100 text-blue-800' :
            preset.category === 'elegant' ? 'bg-purple-100 text-purple-800' :
            preset.category === 'modern' ? 'bg-green-100 text-green-800' :
            preset.category === 'vibrant' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {preset.category}
          </span>
        </div>
        <p className="text-sm text-gray-600">{preset.description}</p>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {/* Vista previa de colores */}
        <div className="flex gap-2 mb-4">
          <div 
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: preset.colors.primaryColor }}
            title="Color Primario"
          />
          <div 
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: preset.colors.secondaryColor }}
            title="Color Secundario"
          />
          <div 
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: preset.colors.buttonColor }}
            title="Color de Botones"
          />
          <div 
            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: preset.colors.iconColor }}
            title="Color de Íconos"
          />
        </div>

        {/* Información de tipografía */}
        <div className="text-xs text-gray-500 mb-4">
          <p>Título: {preset.typography.headingFont}</p>
          <p>Cuerpo: {preset.typography.bodyFont}</p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewPreset(preset)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Vista Previa
          </Button>
          <Button
            onClick={() => applyPreset(preset)}
            disabled={loading}
            size="sm"
            className="flex-1"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Aplicar
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const categories = Array.from(new Set(DESIGN_PRESETS.map(p => p.category)))

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Presets de Diseño</h1>
        <p className="text-gray-600">Aplica temas prediseñados o crea el tuyo propio</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${messageType === 'error' ? 'border-red-200' : 'border-green-200'}`}>
          <AlertDescription className={messageType === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Acciones Principales */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button
          variant="outline"
          onClick={exportCurrentTheme}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar Tema Actual
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.json'
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  try {
                    const theme = JSON.parse(e.target?.result as string)
                    applyPreset(theme)
                  } catch (error) {
                    setMessage('Error al importar el tema')
                    setMessageType('error')
                  }
                }
                reader.readAsText(file)
              }
            }
            input.click()
          }}
        >
          <Upload className="w-4 h-4" />
          Importar Tema
        </Button>
      </div>

      {/* Presets por Categoría */}
      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 capitalize flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {category === 'professional' ? 'Profesional' :
             category === 'elegant' ? 'Elegante' :
             category === 'modern' ? 'Moderno' :
             category === 'vibrant' ? 'Vibrante' :
             'Minimalista'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESIGN_PRESETS
              .filter(preset => preset.category === category)
              .map(preset => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
          </div>
        </div>
      ))}

      {/* Modal de Vista Previa */}
      {previewPreset && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{previewPreset.name}</h3>
                <Button
                  variant="outline"
                  onClick={() => setPreviewPreset(null)}
                >
                  ✕
                </Button>
              </div>
              
              {/* Vista previa del diseño */}
              <div 
                className="p-8 rounded-lg mb-6"
                style={{
                  background: `linear-gradient(135deg, ${previewPreset.colors.primaryColor} 0%, ${previewPreset.colors.secondaryColor} 100%)`,
                  color: previewPreset.colors.textColor
                }}
              >
                <h1 
                  className="text-3xl font-bold mb-4"
                  style={{ 
                    fontFamily: `var(--font-${previewPreset.typography.headingFont}, 'Inter', sans-serif)`,
                    color: previewPreset.colors.textColor
                  }}
                >
                  Tu Negocio Aquí
                </h1>
                <p 
                  className="text-lg mb-6"
                  style={{ 
                    fontFamily: `var(--font-${previewPreset.typography.bodyFont}, 'Inter', sans-serif)`,
                    color: previewPreset.colors.textSecondaryColor
                  }}
                >
                  Descripción de tu servicio con el estilo seleccionado
                </p>
                <button 
                  className="px-6 py-3 rounded-lg font-medium"
                  style={{ 
                    backgroundColor: previewPreset.colors.buttonColor,
                    color: 'white',
                    fontFamily: `var(--font-${previewPreset.typography.buttonFont}, 'Inter', sans-serif)`
                  }}
                >
                  Reservar Ahora
                </button>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    applyPreset(previewPreset)
                    setPreviewPreset(null)
                  }}
                  disabled={loading}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Aplicar Este Diseño
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewPreset(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}