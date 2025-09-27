'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { Palette, Image as ImageIcon, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from '@/components/ui/color-picker'
import { useTenant } from '@/hooks/use-tenant'
import { supabase } from '@/lib/supabase'

interface BrandingSettings {
  primaryColor: string
  secondaryColor: string
  buttonColor: string
  logo: File | null
  coverImage: File | null
  logoUrl?: string
  coverImageUrl?: string
}

export default function SettingsPage() {
  const params = useParams()
  const tenantSlug = params.tenant as string
  const { tenant, refetch } = useTenant()
  
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    primaryColor: tenant?.branding?.primaryColor || '#8B5CF6',
    secondaryColor: tenant?.branding?.secondaryColor || '#EC4899',
    buttonColor: tenant?.branding?.buttonColor || '#10B981',
    logo: null,
    coverImage: null,
    logoUrl: tenant?.branding?.logoUrl || '',
    coverImageUrl: tenant?.branding?.coverImageUrl || ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleColorChange = (colorType: keyof BrandingSettings, value: string) => {
    setBrandingSettings(prev => ({
      ...prev,
      [colorType]: value
    }))
  }

  const handleImageUpload = (imageType: 'logo' | 'coverImage', file: File | null) => {
    setBrandingSettings(prev => ({
      ...prev,
      [imageType]: file
    }))
  }

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('tenant-assets')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('tenant-assets')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSave = async () => {
    if (!tenant) return
    
    setIsLoading(true)
    try {
      let logoUrl = brandingSettings.logoUrl
      let coverImageUrl = brandingSettings.coverImageUrl

      // Upload new images if selected
      if (brandingSettings.logo) {
        logoUrl = await uploadImage(brandingSettings.logo, `${tenant.id}/logo`)
      }
      
      if (brandingSettings.coverImage) {
        coverImageUrl = await uploadImage(brandingSettings.coverImage, `${tenant.id}/cover`)
      }

      // Update tenant branding in database
      const { error } = await supabase
        .from('tenants')
        .update({
          branding: {
            primaryColor: brandingSettings.primaryColor,
            secondaryColor: brandingSettings.secondaryColor,
            buttonColor: brandingSettings.buttonColor,
            logoUrl,
            coverImageUrl
          }
        })
        .eq('id', tenant.id)

      if (error) throw error

      // Refresh tenant data
      await refetch()
      
      // Reset file inputs
      setBrandingSettings(prev => ({
        ...prev,
        logo: null,
        coverImage: null,
        logoUrl,
        coverImageUrl
      }))

      alert('Configuración guardada exitosamente!')
    } catch (error) {
      console.error('Error saving branding:', error)
      alert('Error al guardar la configuración')
    } finally {
      setIsLoading(false)
    }
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Marca</h1>
          <p className="text-gray-600">Personaliza la apariencia visual de tu barbería</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Ocultar Vista Previa' : 'Vista Previa'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Colores de Marca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorPicker
              id="primaryColor"
              label="Color Primario"
              value={brandingSettings.primaryColor}
              onChange={(value) => handleColorChange('primaryColor', value)}
              placeholder="#8B5CF6"
            />

            <ColorPicker
              id="secondaryColor"
              label="Color Secundario"
              value={brandingSettings.secondaryColor}
              onChange={(value) => handleColorChange('secondaryColor', value)}
              placeholder="#EC4899"
            />

            <ColorPicker
              id="buttonColor"
              label="Color de Botones"
              value={brandingSettings.buttonColor}
              onChange={(value) => handleColorChange('buttonColor', value)}
              placeholder="#10B981"
            />
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              Imágenes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo">Logo de la Barbería</Label>
              <div className="mt-1">
                {brandingSettings.logoUrl && (
                  <div className="mb-2">
                    <img 
                      src={brandingSettings.logoUrl} 
                      alt="Logo actual" 
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <p className="text-xs text-gray-500 mt-1">Logo actual</p>
                  </div>
                )}
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('logo', e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="coverImage">Imagen de Portada</Label>
              <div className="mt-1">
                {brandingSettings.coverImageUrl && (
                  <div className="mb-2">
                    <img 
                      src={brandingSettings.coverImageUrl} 
                      alt="Portada actual" 
                      className="w-full h-24 object-cover rounded border"
                    />
                    <p className="text-xs text-gray-500 mt-1">Imagen actual</p>
                  </div>
                )}
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('coverImage', e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa del Diseño</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Header Preview */}
              <div 
                className="h-32 rounded-lg flex items-center justify-center text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${brandingSettings.primaryColor} 0%, ${brandingSettings.secondaryColor} 100%)`
                }}
              >
                {brandingSettings.coverImageUrl && (
                  <img 
                    src={brandingSettings.coverImageUrl} 
                    alt="Cover" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                  />
                )}
                <div className="relative z-10 text-center">
                  {brandingSettings.logoUrl && (
                    <img 
                      src={brandingSettings.logoUrl} 
                      alt="Logo" 
                      className="w-12 h-12 mx-auto mb-2 rounded"
                    />
                  )}
                  <h2 className="text-xl font-bold">{tenant.name}</h2>
                </div>
              </div>

              {/* Button Samples */}
              <div className="flex space-x-4">
                <button
                  className="px-6 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: brandingSettings.buttonColor }}
                >
                  Reservar Ahora
                </button>
                <button
                  className="px-6 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: brandingSettings.primaryColor }}
                >
                  Ver Servicios
                </button>
                <button
                  className="px-6 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: brandingSettings.secondaryColor }}
                >
                  Contacto
                </button>
              </div>

              {/* Color Palette Display */}
              <div className="flex items-center space-x-4 mt-4">
                <span className="font-medium">Paleta de colores:</span>
                <div className="flex space-x-2">
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-300"
                    style={{ backgroundColor: brandingSettings.primaryColor }}
                    title="Color Primario"
                  ></div>
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-300"
                    style={{ backgroundColor: brandingSettings.secondaryColor }}
                    title="Color Secundario"
                  ></div>
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-300"
                    style={{ backgroundColor: brandingSettings.buttonColor }}
                    title="Color de Botones"
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}