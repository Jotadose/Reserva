'use client'

import { useState, useEffect } from 'react'
import { Camera, Save, X, Upload, Instagram, MessageCircle, Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { getSupabaseClient } from '@/lib/supabase'
import { useTenant } from '@/hooks/use-tenant'

interface ProfileData {
  // Información personal/profesional
  display_name: string
  bio: string
  specialties: string[]
  experience_years: number
  
  // Redes sociales y contacto
  instagram: string
  whatsapp: string
  email: string
  website: string
  
  // URLs de imágenes
  profile_image: string
  logo_image: string
  hero_background: string
  portfolio_images: string[] // Array de hasta 4 imágenes
}

const initialProfileData: ProfileData = {
  display_name: '',
  bio: '',
  specialties: [],
  experience_years: 0,
  instagram: '',
  whatsapp: '',
  email: '',
  website: '',
  profile_image: '',
  logo_image: '',
  hero_background: '',
  portfolio_images: ['', '', '', '']
}

const specialtyOptions = [
  'Corte Clásico', 'Corte Moderno', 'Barba', 'Bigote', 'Afeitado',
  'Coloración', 'Decoloración', 'Tratamientos Capilares', 'Peinados',
  'Cejas', 'Corte Infantil', 'Ocasiones Especiales'
]

export default function ProfilePage() {
  const { tenant } = useTenant()
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (tenant?.id) {
      loadProfileData()
    }
  }, [tenant])

  const loadProfileData = async () => {
    if (!tenant?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const supabase = getSupabaseClient()
      
      // Cargar datos del perfil desde la tabla tenants (settings JSON)
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('settings, contact_email, contact_phone')
        .eq('id', tenant.id)
        .single()

      if (tenantError) throw tenantError

      // Extraer datos del perfil desde settings
      const settings = tenantData.settings ? JSON.parse(tenantData.settings) : {}
      const profile = settings.profile || {}

      setProfileData({
        display_name: profile.display_name || tenant.name || '',
        bio: profile.bio || '',
        specialties: profile.specialties || [],
        experience_years: profile.experience_years || 0,
        instagram: profile.instagram || '',
        whatsapp: tenantData.contact_phone || '',
        email: tenantData.contact_email || '',
        website: profile.website || '',
        profile_image: profile.profile_image || '',
        logo_image: profile.logo_image || '',
        hero_background: profile.hero_background || '',
        portfolio_images: profile.portfolio_images || ['', '', '', '']
      })

    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfileData = async () => {
    if (!tenant?.id) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const supabase = getSupabaseClient()

      // Obtener settings actuales
      const { data: currentData, error: fetchError } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', tenant.id)
        .single()

      if (fetchError) throw fetchError

      const currentSettings = currentData.settings ? JSON.parse(currentData.settings) : {}
      
      // Actualizar con datos del perfil
      const updatedSettings = {
        ...currentSettings,
        profile: {
          display_name: profileData.display_name,
          bio: profileData.bio,
          specialties: profileData.specialties,
          experience_years: profileData.experience_years,
          instagram: profileData.instagram,
          website: profileData.website,
          profile_image: profileData.profile_image,
          logo_image: profileData.logo_image,
          hero_background: profileData.hero_background,
          portfolio_images: profileData.portfolio_images
        }
      }

      // Guardar en base de datos
      const { error: updateError } = await supabase
        .from('tenants')
        .update({
          settings: JSON.stringify(updatedSettings),
          contact_email: profileData.email || null,
          contact_phone: profileData.whatsapp || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id)

      if (updateError) throw updateError

      setSuccessMessage('Perfil guardado exitosamente')
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const handlePortfolioImageChange = (index: number, url: string) => {
    setProfileData(prev => ({
      ...prev,
      portfolio_images: prev.portfolio_images.map((img, i) => 
        i === index ? url : img
      )
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">
            Configura tu información profesional y personaliza tu landing page
          </p>
        </div>
        <Button onClick={saveProfileData} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Esta información aparecerá en tu landing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="display_name">Nombre profesional *</Label>
              <Input
                id="display_name"
                value={profileData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Ej: Juan Pérez - Barbero Profesional"
              />
            </div>

            <div>
              <Label htmlFor="bio">Biografía/Descripción</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre tu experiencia, formación y lo que te hace único..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="experience_years">Años de experiencia</Label>
              <Input
                id="experience_years"
                type="number"
                min="0"
                max="50"
                value={profileData.experience_years}
                onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Especialidades */}
        <Card>
          <CardHeader>
            <CardTitle>Especialidades</CardTitle>
            <CardDescription>
              Selecciona tus áreas de especialización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {specialtyOptions.map((specialty) => (
                <Button
                  key={specialty}
                  variant={profileData.specialties.includes(specialty) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSpecialtyToggle(specialty)}
                  className="justify-start"
                >
                  {specialty}
                </Button>
              ))}
            </div>
            {profileData.specialties.length > 0 && (
              <div className="mt-4">
                <Label>Especialidades seleccionadas:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacto y Redes Sociales */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto y Redes Sociales</CardTitle>
            <CardDescription>
              Información de contacto que aparecerá en tu landing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="whatsapp"
                    value={profileData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="+56 9 0000 0000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="instagram"
                    value={profileData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    placeholder="@tu_usuario"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Sitio Web (opcional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://tu-sitio.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Imágenes */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes del Landing</CardTitle>
            <CardDescription>
              Estas imágenes se mostrarán en tu página principal. Usa URLs de imágenes válidas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Imagen de perfil */}
            <div>
              <Label htmlFor="profile_image">Imagen de Perfil</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    id="profile_image"
                    value={profileData.profile_image}
                    onChange={(e) => handleInputChange('profile_image', e.target.value)}
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                  />
                </div>
                {profileData.profile_image && (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    <img 
                      src={profileData.profile_image} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Logo */}
            <div>
              <Label htmlFor="logo_image">Logo de la Barbería</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    id="logo_image"
                    value={profileData.logo_image}
                    onChange={(e) => handleInputChange('logo_image', e.target.value)}
                    placeholder="https://ejemplo.com/logo.jpg"
                  />
                </div>
                {profileData.logo_image && (
                  <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                    <img 
                      src={profileData.logo_image} 
                      alt="Logo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Background Hero */}
            <div>
              <Label htmlFor="hero_background">Imagen de Fondo del Hero</Label>
              <Input
                id="hero_background"
                value={profileData.hero_background}
                onChange={(e) => handleInputChange('hero_background', e.target.value)}
                placeholder="https://ejemplo.com/fondo-hero.jpg"
              />
            </div>

            {/* Portfolio */}
            <div>
              <Label>Imágenes de Portfolio (máximo 4)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {profileData.portfolio_images.map((img, index) => (
                  <div key={index}>
                    <Label htmlFor={`portfolio_${index}`} className="text-sm text-gray-600">
                      Portfolio {index + 1}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Input
                          id={`portfolio_${index}`}
                          value={img}
                          onChange={(e) => handlePortfolioImageChange(index, e.target.value)}
                          placeholder={`https://ejemplo.com/portfolio-${index + 1}.jpg`}
                        />
                      </div>
                      {img && (
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
                          <img 
                            src={img} 
                            alt={`Portfolio ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista Previa */}
        {(profileData.display_name || profileData.bio) && (
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>
                Así se verá tu información en el landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-lg p-6 text-white">
                <div className="flex items-center space-x-4 mb-4">
                  {profileData.profile_image ? (
                    <img 
                      src={profileData.profile_image} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{profileData.display_name || 'Tu Nombre'}</h3>
                    {profileData.experience_years > 0 && (
                      <p className="text-purple-200">{profileData.experience_years} años de experiencia</p>
                    )}
                  </div>
                </div>
                
                {profileData.bio && (
                  <p className="text-purple-100 mb-4">{profileData.bio}</p>
                )}
                
                {profileData.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="bg-white/20 text-white">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}