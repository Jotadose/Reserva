'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Scissors, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Plus,
  X,
  Loader2
} from 'lucide-react'

interface BusinessInfo {
  name: string
  slug: string
  description: string
  address: string
  phone: string
  email: string
  website?: string
  category: string
}

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
}

interface BusinessHours {
  [key: string]: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
}

interface BrandingSettings {
  primaryColor: string
  secondaryColor: string
  buttonColor: string
  textColor: string
  logo?: File | null
  coverImage?: File | null
  logoPreview?: string
  coverPreview?: string
}

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
]

const CATEGORIES = [
  'Barbería Traditional',
  'Barbería Moderna',
  'Salón de Belleza',
  'Spa & Wellness',
  'Estética Masculina',
  'Otro'
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<string>(() => {
    if (typeof window === 'undefined') return 'basic'
    const p = new URLSearchParams(window.location.search).get('plan')
    return p || 'basic'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  // Verificar autenticación y si ya tiene tenant al cargar
  useEffect(() => {
    const checkAuthAndTenant = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login?message=Debes iniciar sesión para acceder al onboarding')
          return
        }

        // Verificar si el usuario ya tiene un tenant
        const { data: existingTenant } = await supabase
          .from('tenants')
          .select('slug')
          .eq('owner_id', session.user.id)
          .eq('subscription_status', 'active')
          .maybeSingle()

        if (existingTenant) {
          router.push(`/${existingTenant.slug}/dashboard`)
          return
        }

        setIsCheckingAuth(false)
      } catch (error) {
        console.error('Error checking auth and tenant:', error)
        setError('Error al verificar la autenticación')
        setIsCheckingAuth(false)
      }
    }

    checkAuthAndTenant()
  }, [router])

  // Form data
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    category: ''
  })

  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Corte Clásico', description: 'Corte tradicional con tijera y máquina', duration: 30, price: 15000 }
  ])

  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
  })

  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF', 
    buttonColor: '#EF4444',
    textColor: '#F3F4F6',
    logo: null,
    coverImage: null,
    logoPreview: '',
    coverPreview: ''
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Handle image uploads and previews
  const handleImageUpload = (file: File, type: 'logo' | 'coverImage') => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setBrandingSettings(prev => ({
          ...prev,
          [type]: file,
          [`${type}Preview`]: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleColorChange = (color: string, type: 'primaryColor' | 'secondaryColor' | 'buttonColor' | 'textColor') => {
    setBrandingSettings(prev => ({
      ...prev,
      [type]: color
    }))
  }

  const generateUniqueSlug = async (baseName: string): Promise<string> => {
    const supabase = getSupabaseClient()
    let baseSlug = generateSlug(baseName)
    let finalSlug = baseSlug
    let counter = 1

    while (true) {
      const { data: existing } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle()
      
      if (!existing) {
        return finalSlug
      }
      
      finalSlug = `${baseSlug}-${counter}`
      counter++
    }
  }

  const handleBusinessInfoChange = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo(prev => {
      const updated = { ...prev, [field]: value }
      if (field === 'name') {
        updated.slug = generateSlug(value)
      }
      return updated
    })
  }

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      description: '',
      duration: 30,
      price: 0
    }
    setServices(prev => [...prev, newService])
  }

  const updateService = (id: string, field: keyof Service, value: string | number) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ))
  }

  const removeService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id))
  }

  const updateBusinessHours = (day: string, field: 'isOpen' | 'openTime' | 'closeTime', value: boolean | string) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const handleSubmit = async () => {
    console.log('🚀 Iniciando creación de barbería...')
    setIsLoading(true)
    setError('')

    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('❌ No hay sesión de usuario')
        setError('Debes estar autenticado para crear una barbería')
        setIsLoading(false)
        return
      }

      console.log('✅ Usuario autenticado:', session.user.email)

      // Generar slug único automáticamente
      console.log('🔍 Generando slug único para:', businessInfo.name)
      const uniqueSlug = await generateUniqueSlug(businessInfo.name)
      console.log('✅ Slug único generado:', uniqueSlug)

      // Actualizar el businessInfo con el slug único
      const finalBusinessInfo = { ...businessInfo, slug: uniqueSlug }

      // Preparar datos
      const payload = {
        userId: session.user.id,
        tenant: {
          name: finalBusinessInfo.name,
          slug: finalBusinessInfo.slug,
          description: finalBusinessInfo.description || null,
          category: finalBusinessInfo.category,
          contact_phone: finalBusinessInfo.phone,
          contact_email: finalBusinessInfo.email || null,
          website: finalBusinessInfo.website || null,
          working_hours: businessHours,
          subscription_status: 'active',
          settings: {
            branding: {
              primaryColor: brandingSettings.primaryColor,
              secondaryColor: brandingSettings.secondaryColor,
              buttonColor: brandingSettings.buttonColor,
              textColor: brandingSettings.textColor,
              // Las imágenes se podrían subir después o en un paso separado
            },
            business: {
              name: finalBusinessInfo.name,
              email: finalBusinessInfo.email,
              timezone: 'America/Santiago' // Por defecto Chile
            },
            features: {
              onlineBooking: true,
              paymentProcessing: false,
              smsNotifications: false,
              emailNotifications: true,
              analytics: true,
              multiLocation: false
            }
          }
        },
        plan: selectedPlan,
        services: services.map(s => ({
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: s.price,
        })),
        provider: { role: 'owner' },
        branding: brandingSettings // Para procesar imágenes si es necesario
      }

  const tenantPayload = payload.tenant
  console.log('📦 Payload a enviar:', payload)

      // Enviar al endpoint con service role
      console.log('🌐 Enviando solicitud a /api/onboarding...')
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('📡 Respuesta del servidor:', res.status, res.statusText)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Error del servidor:', errorText)
        let errorMessage = 'Error creando el tenant'
        let existingTenant = null
        
        try {
          const err = JSON.parse(errorText)
          errorMessage = err?.details || err?.error || errorMessage
          existingTenant = err?.existingTenant
          
          // Si ya tiene un tenant, redirigir directamente
          if (existingTenant && res.status === 400) {
            console.log('🏪 Usuario ya tiene tenant, redirigiendo:', existingTenant.slug)
            // Cache el tenant existente
            localStorage.setItem('last_created_tenant', JSON.stringify(existingTenant))
            localStorage.setItem('cachedTenantSlug', existingTenant.slug)
            router.push(`/${existingTenant.slug}/dashboard`)
            return
          }
        } catch (parseError) {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }

      const json = await res.json()
      console.log('✅ Respuesta exitosa:', json)
      
      const created = json.tenant
      if (!created) {
        throw new Error('No se recibió información del tenant creado')
      }

      console.log('🏪 Tenant creado:', created.slug)

      try {
        const cachedTenantData = {
          id: created.id,
          slug: created.slug,
          name: created.name,
          plan: created.subscription_plan ?? payload.plan ?? 'basic',
          status: created.subscription_status ?? tenantPayload.subscription_status ?? 'active',
          contact_email: created.contact_email ?? tenantPayload.contact_email ?? undefined,
          contact_phone: created.contact_phone ?? tenantPayload.contact_phone ?? undefined,
          slot_duration_minutes: created.slot_duration_minutes ?? 30,
          settings: created.settings ?? {
            working_hours: tenantPayload.working_hours,
          },
          created_at: created.created_at ?? new Date().toISOString(),
          updated_at: created.updated_at ?? new Date().toISOString(),
        }
        
        console.log('💾 Cacheando datos del tenant:', cachedTenantData)
        localStorage.setItem('last_tenant_slug', created.slug)
        localStorage.setItem('last_created_tenant', JSON.stringify(cachedTenantData))
      } catch (cacheErr) {
        console.warn('⚠️ No se pudieron cachear los datos del tenant:', cacheErr)
      }

      console.log('🔐 Actualizando JWT con tenant_id...')
      const { error: updErr } = await supabase.auth.updateUser({ data: { tenant_id: created.id } })
      if (updErr) {
        console.warn('No se pudo actualizar tenant_id en JWT inmediatamente:', updErr.message)
      }

      const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession()
      if (refreshErr) {
        console.warn('No se pudo refrescar la sesión tras actualizar tenant_id:', refreshErr.message)
      } else {
        console.log('🔄 Sesión refrescada, metadata actual:', refreshData.session?.user.user_metadata)
      }

      console.log('🎉 ¡Barbería creada exitosamente! Redirigiendo...')
      
      // Force a window refresh to clear any cached state and ensure the tenant context picks up the new data
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      // Use replace instead of push to prevent back navigation issues
      router.replace(`/${created.slug}/dashboard`)
    } catch (e: any) {
      console.error('💥 Error creating tenant:', e)
      setError(e?.message || 'Error inesperado. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return businessInfo.name && businessInfo.slug && businessInfo.category && businessInfo.phone
      case 2:
        return services.every(service => service.name && service.price > 0)
      case 3:
        return true // Horarios son opcionales
      case 4:
        return brandingSettings.primaryColor && brandingSettings.secondaryColor && brandingSettings.buttonColor && brandingSettings.textColor
      case 5:
        return true // Confirmación final
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Información de tu Barbería</h2>
              <p className="text-gray-600 mt-2">Cuéntanos sobre tu negocio para crear tu perfil</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Nombre de la Barbería *</Label>
                <Input
                  id="name"
                  value={businessInfo.name}
                  onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
                  placeholder="Mi Barbería"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL de tu página *</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    agendexstudio.vercel.app/
                  </span>
                  <Input
                    id="slug"
                    value={businessInfo.slug}
                    onChange={(e) => handleBusinessInfoChange('slug', e.target.value)}
                    placeholder="mi-barberia"
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select value={businessInfo.category} onValueChange={(value) => handleBusinessInfoChange('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={businessInfo.description}
                  onChange={(e) => handleBusinessInfoChange('description', e.target.value)}
                  placeholder="Describe tu barbería y lo que la hace especial..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={businessInfo.phone}
                    onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessInfo.email}
                    onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                    placeholder="contacto@mibarberia.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={businessInfo.address}
                  onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                  placeholder="Calle 123 #45-67, Chile"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website">Sitio Web (opcional)</Label>
                <Input
                  id="website"
                  value={businessInfo.website}
                  onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
                  placeholder="https://mibarberia.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Servicios y Precios</h2>
              <p className="text-gray-600 mt-2">Define los servicios que ofreces y sus precios</p>
            </div>

            <div className="space-y-4">
              {services.map((service, index) => (
                <Card key={service.id} className="border-2 border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Servicio {index + 1}</CardTitle>
                      {services.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(service.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nombre del Servicio</Label>
                      <Input
                        value={service.name}
                        onChange={(e) => updateService(service.id, 'name', e.target.value)}
                        placeholder="Ej: Corte Clásico"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={service.description}
                        onChange={(e) => updateService(service.id, 'description', e.target.value)}
                        placeholder="Describe el servicio..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Duración (minutos)</Label>
                        <Input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(service.id, 'duration', parseInt(e.target.value) || 0)}
                          placeholder="30"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Precio (COP)</Label>
                        <Input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(service.id, 'price', parseInt(e.target.value) || 0)}
                          placeholder="15000"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={addService}
                className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Servicio
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Horarios de Atención</h2>
              <p className="text-gray-600 mt-2">Configura los días y horarios en que atiendes</p>
            </div>

            <div className="space-y-4">
              {DAYS.map(day => (
                <Card key={day.key} className="border-2 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={businessHours[day.key].isOpen}
                            onChange={(e) => updateBusinessHours(day.key, 'isOpen', e.target.checked)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="font-medium">{day.label}</span>
                        </label>
                      </div>

                      {businessHours[day.key].isOpen && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={businessHours[day.key].openTime}
                            onChange={(e) => updateBusinessHours(day.key, 'openTime', e.target.value)}
                            className="w-32"
                          />
                          <span className="text-gray-500">a</span>
                          <Input
                            type="time"
                            value={businessHours[day.key].closeTime}
                            onChange={(e) => updateBusinessHours(day.key, 'closeTime', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      )}

                      {!businessHours[day.key].isOpen && (
                        <Badge variant="secondary">Cerrado</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Personalización Visual</h2>
              <p className="text-gray-600 mt-2">Elige los colores y sube imágenes para tu barbería</p>
            </div>

            <div className="space-y-8">
              {/* Color Palette Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                    Paleta de Colores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Primary Color */}
                    <div className="space-y-3">
                      <Label htmlFor="primaryColor">Color Primario</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="primaryColor"
                          value={brandingSettings.primaryColor}
                          onChange={(e) => handleColorChange(e.target.value, 'primaryColor')}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={brandingSettings.primaryColor}
                          onChange={(e) => handleColorChange(e.target.value, 'primaryColor')}
                          placeholder="#3B82F6"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-sm text-gray-500">Color principal de tu marca</p>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-3">
                      <Label htmlFor="secondaryColor">Color Secundario</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="secondaryColor"
                          value={brandingSettings.secondaryColor}
                          onChange={(e) => handleColorChange(e.target.value, 'secondaryColor')}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={brandingSettings.secondaryColor}
                          onChange={(e) => handleColorChange(e.target.value, 'secondaryColor')}
                          placeholder="#1E40AF"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-sm text-gray-500">Color complementario</p>
                    </div>

                    {/* Button Color */}
                    <div className="space-y-3">
                      <Label htmlFor="buttonColor">Color de Botones</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="buttonColor"
                          value={brandingSettings.buttonColor}
                          onChange={(e) => handleColorChange(e.target.value, 'buttonColor')}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={brandingSettings.buttonColor}
                          onChange={(e) => handleColorChange(e.target.value, 'buttonColor')}
                          placeholder="#EF4444"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-sm text-gray-500">Color para botones de acción</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="textColor" className="text-white">Color de Texto</Label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="textColor"
                          value={brandingSettings.textColor}
                          onChange={(e) => handleColorChange(e.target.value, 'textColor')}
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={brandingSettings.textColor}
                          onChange={(e) => handleColorChange(e.target.value, 'textColor')}
                          placeholder="#F3F4F6"
                          className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50"
                        />
                      </div>
                      <p className="text-sm text-gray-400">Color principal para textos</p>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="mt-6 p-6 rounded-lg border-2 border-dashed border-gray-300">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Vista Previa de Colores</h4>
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{
                        background: `linear-gradient(135deg, ${brandingSettings.primaryColor} 0%, ${brandingSettings.secondaryColor} 100%)`
                      }}
                    >
                      <button
                        className="px-6 py-2 rounded-lg text-white font-medium transition-transform hover:scale-105"
                        style={{ backgroundColor: brandingSettings.buttonColor }}
                      >
                        Botón de Ejemplo
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-400 rounded"></div>
                    Imágenes de Marca
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo Upload */}
                    <div className="space-y-3">
                      <Label>Logo de la Barbería</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        {brandingSettings.logoPreview ? (
                          <div className="space-y-3">
                            <img
                              src={brandingSettings.logoPreview}
                              alt="Logo preview"
                              className="max-h-24 mx-auto rounded"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBrandingSettings(prev => ({ ...prev, logo: null, logoPreview: '' }))}
                            >
                              Cambiar Logo
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                              <Plus className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                                className="hidden"
                                id="logo-upload"
                              />
                              <label
                                htmlFor="logo-upload"
                                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Subir Logo
                              </label>
                              <p className="text-sm text-gray-500 mt-1">PNG, JPG hasta 2MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div className="space-y-3">
                      <Label>Imagen de Portada</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        {brandingSettings.coverPreview ? (
                          <div className="space-y-3">
                            <img
                              src={brandingSettings.coverPreview}
                              alt="Cover preview"
                              className="max-h-24 mx-auto rounded"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBrandingSettings(prev => ({ ...prev, coverImage: null, coverPreview: '' }))}
                            >
                              Cambiar Imagen
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                              <Plus className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'coverImage')}
                                className="hidden"
                                id="cover-upload"
                              />
                              <label
                                htmlFor="cover-upload"
                                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Subir Imagen de Portada
                              </label>
                              <p className="text-sm text-gray-500 mt-1">PNG, JPG hasta 5MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">¡Todo Listo!</h2>
              <p className="text-gray-600 mt-2">Revisa la información antes de crear tu barbería</p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scissors className="w-5 h-5 mr-2" />
                    Información del Negocio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nombre:</strong> {businessInfo.name}</p>
                  <p><strong>URL:</strong> agendexstudio.vercel.app/{businessInfo.slug}</p>
                  <p><strong>Categoría:</strong> {businessInfo.category}</p>
                  {businessInfo.description && <p><strong>Descripción:</strong> {businessInfo.description}</p>}
                  <p><strong>Teléfono:</strong> {businessInfo.phone}</p>
                  {businessInfo.email && <p><strong>Email:</strong> {businessInfo.email}</p>}
                  {businessInfo.address && <p><strong>Dirección:</strong> {businessInfo.address}</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Servicios ({services.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {services.map(service => (
                      <div key={service.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.duration} min</p>
                        </div>
                        <p className="font-semibold">${service.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Horarios de Atención
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {DAYS.map(day => (
                      <div key={day.key} className="flex justify-between">
                        <span className="font-medium">{day.label}</span>
                        <span>
                          {businessHours[day.key].isOpen 
                            ? `${businessHours[day.key].openTime} - ${businessHours[day.key].closeTime}`
                            : 'Cerrado'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded mr-2"></div>
                    Personalización Visual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Color Preview */}
                  <div className="space-y-3">
                    <p className="font-medium">Paleta de Colores</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: brandingSettings.primaryColor }}
                        ></div>
                        <span className="text-sm">Primario</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: brandingSettings.secondaryColor }}
                        ></div>
                        <span className="text-sm">Secundario</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: brandingSettings.buttonColor }}
                        ></div>
                        <span className="text-sm">Botones</span>
                      </div>
                    </div>
                  </div>

                  {/* Preview with actual colors */}
                  <div className="mt-4">
                    <p className="font-medium mb-2">Vista Previa</p>
                    <div 
                      className="h-16 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        background: `linear-gradient(135deg, ${brandingSettings.primaryColor} 0%, ${brandingSettings.secondaryColor} 100%)`
                      }}
                    >
                      <button
                        className="px-4 py-2 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: brandingSettings.buttonColor }}
                      >
                        {businessInfo.name || 'Mi Barbería'}
                      </button>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="flex justify-between text-sm">
                    <span>Logo: {brandingSettings.logo ? '✅ Subido' : '⚠️ Sin logo'}</span>
                    <span>Portada: {brandingSettings.coverImage ? '✅ Subida' : '⚠️ Sin imagen'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Loading state mientras verifica autenticación */}
        {isCheckingAuth ? (
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Verificando autenticación...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4, 5].map(step => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                    </div>
                    {step < 5 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Paso {currentStep} de 5: {
                    (() => {
                      switch (currentStep) {
                        case 1: return 'Información Básica'
                        case 2: return 'Servicios'
                        case 3: return 'Horarios'
                        case 4: return 'Personalización Visual'
                        case 5: return 'Confirmación'
                        default: return ''
                      }
                    })()
                  }
                </p>
              </div>
            </div>

            {/* Main Content */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {renderStep()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      disabled={!canProceed()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Siguiente
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : currentStep === 4 ? (
                    <Button
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      disabled={!canProceed()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Continuar a Confirmación
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        console.log('🔥 Botón "Crear Mi Barbería" clickeado!')
                        handleSubmit()
                      }}
                      disabled={isLoading || !canProceed()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          Crear Mi Barbería
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}