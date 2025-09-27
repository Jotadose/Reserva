'use client'

import React, { useState, useEffect } from 'react'
import { Image as ImageIcon, Upload, Trash2, Save, Eye, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTenant } from '@/hooks/use-tenant'
import { getSupabaseClient } from '@/lib/supabase'

interface ImageGalleryItem {
  id: string
  url: string
  name: string
  type: 'logo' | 'cover' | 'gallery' | 'background'
  alt?: string
  order?: number
}

export default function ImagesPage() {
  const { tenant, updateTenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const [images, setImages] = useState<ImageGalleryItem[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    loadImages()
  }, [tenant])

  const loadImages = () => {
    if (!tenant?.branding) return

    const imageList: ImageGalleryItem[] = []
    
    // Logo principal
    if (tenant.branding.logoUrl) {
      imageList.push({
        id: 'logo-main',
        url: tenant.branding.logoUrl,
        name: 'Logo Principal',
        type: 'logo'
      })
    }

    // Imagen de portada
    if (tenant.branding.coverImageUrl) {
      imageList.push({
        id: 'cover-main',
        url: tenant.branding.coverImageUrl,
        name: 'Imagen de Portada',
        type: 'cover'
      })
    }

    // Galería (si existe en branding)
    if (tenant.branding.gallery) {
      tenant.branding.gallery.forEach((item: any, index: number) => {
        imageList.push({
          id: `gallery-${index}`,
          url: item.url,
          name: item.name || `Imagen ${index + 1}`,
          type: 'gallery',
          alt: item.alt,
          order: item.order || index
        })
      })
    }

    setImages(imageList)
  }

  const handleImageUpload = async (file: File, type: 'logo' | 'cover' | 'gallery' | 'background', name?: string) => {
    if (!tenant?.id || !file) return

    setUploadingType(type)
    setMessage('')

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase no configurado')
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${type}-${Date.now()}.${fileExt}`
      const filePath = `${tenant.id}/${fileName}`

      // Subir archivo
      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(filePath)

      // Actualizar tenant branding
      const currentBranding = tenant.branding || {}
      let updatedBranding: any = { ...currentBranding }

      if (type === 'logo') {
        updatedBranding.logoUrl = publicUrl
      } else if (type === 'cover') {
        updatedBranding.coverImageUrl = publicUrl
      } else if (type === 'gallery') {
        if (!updatedBranding.gallery) {
          updatedBranding.gallery = []
        }
        updatedBranding.gallery.push({
          url: publicUrl,
          name: name || `Imagen ${updatedBranding.gallery.length + 1}`,
          alt: name || '',
          order: updatedBranding.gallery.length
        })
      }

      await updateTenant({ branding: updatedBranding })
      
      setMessage(`${type === 'logo' ? 'Logo' : type === 'cover' ? 'Imagen de portada' : 'Imagen'} subida exitosamente`)
      setMessageType('success')
      
      // Recargar imágenes
      loadImages()

    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage('Error al subir la imagen')
      setMessageType('error')
    } finally {
      setUploadingType(null)
    }
  }

  const handleImageDelete = async (imageId: string, imageType: string) => {
    if (!tenant?.id) return

    setLoading(true)
    setMessage('')

    try {
      const currentBranding = tenant.branding || {}
      let updatedBranding: any = { ...currentBranding }

      if (imageType === 'logo') {
        updatedBranding.logoUrl = undefined
      } else if (imageType === 'cover') {
        updatedBranding.coverImageUrl = undefined
      } else if (imageType === 'gallery') {
        const galleryIndex = parseInt(imageId.split('-')[1])
        if (updatedBranding.gallery) {
          updatedBranding.gallery.splice(galleryIndex, 1)
          // Reordenar índices
          updatedBranding.gallery = updatedBranding.gallery.map((item: any, index: number) => ({
            ...item,
            order: index
          }))
        }
      }

      await updateTenant({ branding: updatedBranding })
      
      setMessage('Imagen eliminada exitosamente')
      setMessageType('success')
      
      // Recargar imágenes
      loadImages()

    } catch (error) {
      console.error('Error deleting image:', error)
      setMessage('Error al eliminar la imagen')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const ImageUploadCard = ({ 
    type, 
    title, 
    description, 
    currentImage 
  }: { 
    type: 'logo' | 'cover' | 'gallery' | 'background'
    title: string
    description: string
    currentImage?: ImageGalleryItem
  }) => (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      
      <CardContent className="px-0">
        {currentImage ? (
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={currentImage.url}
                alt={currentImage.name}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewImage(currentImage.url)}
                  className="bg-white/90 hover:bg-white"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleImageDelete(currentImage.id, currentImage.type)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm font-medium">{currentImage.name}</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No hay imagen configurada</p>
          </div>
        )}
        
        <div className="mt-4">
          <Label htmlFor={`${type}-upload`} className="text-sm font-medium">
            {currentImage ? 'Reemplazar imagen' : 'Subir imagen'}
          </Label>
          <Input
            id={`${type}-upload`}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleImageUpload(file, type)
              }
            }}
            disabled={uploadingType === type}
            className="mt-1"
          />
          {uploadingType === type && (
            <p className="text-sm text-blue-600 mt-2">Subiendo imagen...</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const galleryImages = images.filter(img => img.type === 'gallery')
  const logoImage = images.find(img => img.type === 'logo')
  const coverImage = images.find(img => img.type === 'cover')

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Imágenes</h1>
        <p className="text-gray-600">Administra las imágenes de tu landing page</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${messageType === 'error' ? 'border-red-200' : 'border-green-200'}`}>
          <AlertDescription className={messageType === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Logo Principal */}
        <ImageUploadCard
          type="logo"
          title="Logo Principal"
          description="Logo que aparece en el header y footer"
          currentImage={logoImage}
        />

        {/* Imagen de Portada */}
        <ImageUploadCard
          type="cover"
          title="Imagen de Portada"
          description="Imagen principal del hero section"
          currentImage={coverImage}
        />
      </div>

      {/* Galería de Imágenes */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-green-600" />
            Galería de Imágenes
          </CardTitle>
          <p className="text-sm text-gray-600">
            Imágenes adicionales para mostrar en tu landing page
          </p>
        </CardHeader>
        
        <CardContent className="px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {galleryImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.alt || image.name}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewImage(image.url)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleImageDelete(image.id, image.type)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs font-medium mt-2 text-center">{image.name}</p>
              </div>
            ))}
            
            {/* Botón para agregar nueva imagen */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center">
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <Label htmlFor="gallery-upload" className="text-sm text-gray-600 cursor-pointer">
                  Agregar imagen
                </Label>
                <Input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const imageName = prompt('Nombre de la imagen:', file.name.split('.')[0])
                      if (imageName) {
                        handleImageUpload(file, 'gallery', imageName)
                      }
                    }
                  }}
                  disabled={uploadingType === 'gallery'}
                  className="hidden"
                />
              </div>
            </div>
          </div>
          
          {galleryImages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay imágenes en la galería</p>
              <p className="text-sm">Sube tu primera imagen usando el botón "Agregar imagen"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Vista Previa */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewImage}
              alt="Vista previa"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="outline"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}