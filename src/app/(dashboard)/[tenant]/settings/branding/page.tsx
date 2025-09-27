'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Palette, Type, Image, Save } from 'lucide-react'
import { Alert } from '@/components/ui/alert'

export default function BrandingSettingsPage() {
  const { tenant, updateTenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const [brandingData, setBrandingData] = useState({
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    buttonColor: '#10B981',
    textColor: '#F3F4F6',
    textSecondaryColor: '#D1D5DB',
    iconColor: '#A78BFA',
    customTitle: '',
    customSubtitle: '',
    buttonText: '',
    whatsappButtonText: ''
  })

  useEffect(() => {
    if (tenant?.branding) {
      setBrandingData({
        primaryColor: tenant.branding.primaryColor || '#8B5CF6',
        secondaryColor: tenant.branding.secondaryColor || '#EC4899',
        buttonColor: tenant.branding.buttonColor || '#10B981',
        textColor: tenant.branding.textColor || '#F3F4F6',
        textSecondaryColor: tenant.branding.textSecondaryColor || '#D1D5DB',
        iconColor: tenant.branding.iconColor || '#A78BFA',
        customTitle: tenant.branding.customTitle || '',
        customSubtitle: tenant.branding.customSubtitle || '',
        buttonText: tenant.branding.buttonText || '',
        whatsappButtonText: tenant.branding.whatsappButtonText || ''
      })
    }
  }, [tenant])

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      await updateTenant({
        branding: {
          ...tenant?.branding,
          ...brandingData
        }
      })
      setMessage('Configuración de branding guardada exitosamente')
      setMessageType('success')
    } catch (error) {
      console.error('Error saving branding:', error)
      setMessage('Error al guardar la configuración')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = (key: string, value: string) => {
    setBrandingData(prev => ({ ...prev, [key]: value }))
  }

  const handleTextChange = (key: string, value: string) => {
    setBrandingData(prev => ({ ...prev, [key]: value }))
  }

  const resetToDefaults = () => {
    setBrandingData({
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      buttonColor: '#10B981',
      textColor: '#F3F4F6',
      textSecondaryColor: '#D1D5DB',
      iconColor: '#A78BFA',
      customTitle: '',
      customSubtitle: '',
      buttonText: '',
      whatsappButtonText: ''
    })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Branding</h1>
        <p className="text-gray-600">Personaliza los colores y textos de tu landing page</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${messageType === 'error' ? 'border-red-200' : 'border-green-200'}`}>
          <AlertCircle className="h-4 w-4" />
          <div className={messageType === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message}
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colores Principales */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Colores Principales</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="primaryColor" className="text-sm font-medium">Color Primario</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primaryColor"
                  type="color"
                  value={brandingData.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={brandingData.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="flex-1"
                  placeholder="#8B5CF6"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondaryColor" className="text-sm font-medium">Color Secundario</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={brandingData.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={brandingData.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="flex-1"
                  placeholder="#EC4899"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="buttonColor" className="text-sm font-medium">Color de Botones</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="buttonColor"
                  type="color"
                  value={brandingData.buttonColor}
                  onChange={(e) => handleColorChange('buttonColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={brandingData.buttonColor}
                  onChange={(e) => handleColorChange('buttonColor', e.target.value)}
                  className="flex-1"
                  placeholder="#10B981"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Colores de Texto */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Colores de Texto</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="textColor" className="text-sm font-medium">Texto Principal</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="textColor"
                  type="color"
                  value={brandingData.textColor}
                  onChange={(e) => handleColorChange('textColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={brandingData.textColor}
                  onChange={(e) => handleColorChange('textColor', e.target.value)}
                  className="flex-1"
                  placeholder="#F3F4F6"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="textSecondaryColor" className="text-sm font-medium">Texto Secundario</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="textSecondaryColor"
                  type="color"
                  value={brandingData.textSecondaryColor}
                  onChange={(e) => handleColorChange('textSecondaryColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={brandingData.textSecondaryColor}
                  onChange={(e) => handleColorChange('textSecondaryColor', e.target.value)}
                  className="flex-1"
                  placeholder="#D1D5DB"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="iconColor" className="text-sm font-medium">Color de Iconos</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="iconColor"
                  type="color"
                  value={brandingData.iconColor}
                  onChange={(e) => handleColorChange('iconColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={brandingData.iconColor}
                  onChange={(e) => handleColorChange('iconColor', e.target.value)}
                  className="flex-1"
                  placeholder="#A78BFA"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Textos Personalizados */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold">Textos Personalizados</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customTitle" className="text-sm font-medium">Título Personalizado</Label>
              <Input
                id="customTitle"
                type="text"
                value={brandingData.customTitle}
                onChange={(e) => handleTextChange('customTitle', e.target.value)}
                placeholder="Ej: Bienvenido a nuestro servicio"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="customSubtitle" className="text-sm font-medium">Subtítulo Personalizado</Label>
              <Input
                id="customSubtitle"
                type="text"
                value={brandingData.customSubtitle}
                onChange={(e) => handleTextChange('customSubtitle', e.target.value)}
                placeholder="Ej: La mejor experiencia de reservas"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="buttonText" className="text-sm font-medium">Texto del Botón Principal</Label>
              <Input
                id="buttonText"
                type="text"
                value={brandingData.buttonText}
                onChange={(e) => handleTextChange('buttonText', e.target.value)}
                placeholder="Ej: Reservar Ahora"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="whatsappButtonText" className="text-sm font-medium">Texto Botón WhatsApp</Label>
              <Input
                id="whatsappButtonText"
                type="text"
                value={brandingData.whatsappButtonText}
                onChange={(e) => handleTextChange('whatsappButtonText', e.target.value)}
                placeholder="Ej: Contactar por WhatsApp"
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Vista Previa */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Vista Previa</h2>
          <div 
            className="p-6 rounded-lg border-2 border-dashed border-gray-200"
            style={{
              background: `linear-gradient(135deg, ${brandingData.primaryColor} 0%, ${brandingData.secondaryColor} 100%)`,
              color: brandingData.textColor
            }}
          >
            <h3 className="text-2xl font-bold mb-2" style={{ color: brandingData.textColor }}>
              {brandingData.customTitle || 'Título por Defecto'}
            </h3>
            <p className="mb-4" style={{ color: brandingData.textSecondaryColor }}>
              {brandingData.customSubtitle || 'Subtítulo por defecto'}
            </p>
            <button 
              className="px-6 py-2 rounded-lg font-medium mr-3"
              style={{ backgroundColor: brandingData.buttonColor, color: '#ffffff' }}
            >
              {brandingData.buttonText || 'Botón Principal'}
            </button>
            <button 
              className="px-6 py-2 rounded-lg font-medium border"
              style={{ 
                borderColor: brandingData.iconColor, 
                color: brandingData.iconColor,
                backgroundColor: 'transparent'
              }}
            >
              {brandingData.whatsappButtonText || 'WhatsApp'}
            </button>
          </div>
        </Card>
      </div>

      {/* Acciones */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          disabled={loading}
        >
          Restaurar Valores por Defecto
        </Button>
        
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}