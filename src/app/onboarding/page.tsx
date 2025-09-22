'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  // Verificar autenticación y si ya tiene tenant al cargar
  useEffect(() => {
    const checkAuthAndTenant = async () => {
      try {
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
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
    setIsLoading(true)
    setError('')

    try {
      // Verificar autenticación
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Debes estar autenticado para crear una barbería')
        setIsLoading(false)
        return
      }

      // Verificar que el slug no esté en uso
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', businessInfo.slug)
        .maybeSingle()

      if (existingTenant) {
        setError('El nombre de URL ya está en uso. Por favor, elige otro.')
        setIsLoading(false)
        return
      }

      // Crear el tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: businessInfo.name,
          slug: businessInfo.slug,
          description: businessInfo.description || null,
          category: businessInfo.category,
          address: businessInfo.address || null,
          contact_phone: businessInfo.phone,
          contact_email: businessInfo.email || null,
          website: businessInfo.website || null,
          working_hours: businessHours,
          owner_id: session.user.id,
          subscription_status: 'active'
        })
        .select()
        .single()

      if (tenantError) {
        console.error('Error creating tenant:', tenantError)
        setError('Error al crear la barbería. Por favor, inténtalo de nuevo.')
        setIsLoading(false)
        return
      }

      // Crear los servicios
      if (services && services.length > 0) {
        const servicesData = services
          .filter(service => service.name && service.price > 0)
          .map(service => ({
            tenant_id: tenant.id,
            name: service.name,
            description: service.description || null,
            duration_minutes: service.duration || 30,
            price: service.price,
            is_active: true
          }))

        if (servicesData.length > 0) {
          const { error: servicesError } = await supabase
            .from('services')
            .insert(servicesData)

          if (servicesError) {
            console.error('Error creating services:', servicesError)
            // Continuar aunque hay error en servicios
          }
        }
      }

      // Crear el proveedor principal (el dueño)
      const { error: providerError } = await supabase
        .from('providers')
        .insert({
          tenant_id: tenant.id,
          user_id: session.user.id,
          role: 'owner',
          is_active: true
        })

      if (providerError) {
        console.error('Error creating provider:', providerError)
        // Continuar aunque hay error en provider
      }

      // Redirigir al dashboard
      router.push(`/${tenant.slug}/dashboard`)
      
    } catch (error: any) {
      console.error('Error creating tenant:', error)
      setError('Error inesperado. Por favor, inténtalo de nuevo.')
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
        return true
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
                    agendex.studio/
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
                  placeholder="Calle 123 #45-67, Bogotá"
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
                  <p><strong>URL:</strong> agendex.studio/{businessInfo.slug}</p>
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
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                    </div>
                    {step < 4 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Paso {currentStep} de 4: {
                    (() => {
                      switch (currentStep) {
                        case 1: return 'Información Básica'
                        case 2: return 'Servicios'
                        case 3: return 'Horarios'
                        case 4: return 'Confirmación'
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
                  ) : (
                    <Button
                      onClick={handleSubmit}
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