'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  businessName?: string
  businessSlug?: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessSlug: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isOwnerRegistration, setIsOwnerRegistration] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenantSlug = searchParams.get('tenant')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generar slug del negocio basado en el nombre
    if (name === 'businessName' && isOwnerRegistration) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, businessSlug: slug }))
    }
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'El nombre es requerido'
    if (!formData.email.trim()) return 'El email es requerido'
    if (formData.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden'
    
    if (isOwnerRegistration) {
      if (!formData.businessName?.trim()) return 'El nombre de la barbería es requerido'
      if (!formData.businessSlug?.trim()) return 'El slug de la barbería es requerido'
      if ((formData.businessSlug?.length || 0) < 3) return 'El slug debe tener al menos 3 caracteres'
      if (formData.businessSlug && !/^[a-z0-9-]+$/.test(formData.businessSlug)) {
        return 'El slug solo puede contener letras minúsculas, números y guiones'
      }
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      if (isOwnerRegistration) {
        // Registro de owner con nueva barbería
        await registerOwnerWithBusiness()
      } else {
        // Registro de empleado en barbería existente
        await registerEmployee()
      }
    } catch (error) {
      console.error('Error en registro:', error)
      setError(error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const registerOwnerWithBusiness = async () => {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          phone: formData.phone,
        }
      }
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Error al crear el usuario')
    }

    // 2. Llamar a la función provision_tenant para crear la barbería
    const { data: provisionData, error: provisionError } = await supabase
      .rpc('provision_tenant', {
        p_slug: formData.businessSlug,
        p_name: formData.businessName,
        p_description: `Barbería ${formData.businessName} - Creada con Agendex`,
        p_owner_email: formData.email,
        p_owner_name: formData.name,
        p_owner_phone: formData.phone,
        p_contact_email: formData.email,
        p_contact_phone: formData.phone,
        p_subscription_plan: 'trial'
      })

    if (provisionError) {
      // Si falla la provisión, eliminar el usuario de auth
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(provisionError.message)
    }

    if (!provisionData?.success) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(provisionData?.message || 'Error al crear la barbería')
    }

    setSuccess(true)
  }

  const registerEmployee = async () => {
    if (!tenantSlug) {
      throw new Error('No se especificó la barbería')
    }

    // 1. Verificar que la barbería existe
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('slug', tenantSlug)
      .single()

    if (tenantError || !tenantData) {
      throw new Error('Barbería no encontrada')
    }

    // 2. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          phone: formData.phone,
        }
      }
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Error al crear el usuario')
    }

    // 3. Crear usuario en la tabla users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        tenant_id: tenantData.id,
        email: formData.email,
        name: formData.name,
        role: 'barber',
        is_active: false, // Requiere aprobación del owner
        settings: {}
      })
      .select()
      .single()

    if (userError) {
      // Si falla la creación del usuario, eliminar de auth
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(userError.message)
    }

    // 4. Crear registro en la tabla providers
    const { error: providerError } = await supabase
      .from('providers')
      .insert({
        tenant_id: tenantData.id,
        user_id: userData.id,
        bio: '',
        specialties: [],
        commission_rate: 0.5, // 50% por defecto
        is_active: false // Requiere aprobación del owner
      })

    if (providerError) {
      // Si falla la creación del provider, eliminar usuario y auth
      await supabase.from('users').delete().eq('id', authData.user.id)
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(providerError.message)
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <CardTitle className="text-green-700">¡Registro Exitoso!</CardTitle>
              <CardDescription>
                {isOwnerRegistration 
                  ? 'Tu barbería ha sido creada exitosamente'
                  : 'Tu solicitud ha sido enviada'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                {isOwnerRegistration 
                  ? 'Hemos enviado un email de verificación. Por favor, verifica tu cuenta para comenzar a usar Agendex.'
                  : 'El propietario de la barbería debe aprobar tu solicitud antes de que puedas acceder.'
                }
              </p>
              <Button 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Ir al Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Agendex</h1>
          <p className="mt-2 text-sm text-gray-600">
            Crea tu cuenta y comienza a gestionar reservas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>
              {tenantSlug 
                ? `Únete al equipo de ${tenantSlug}`
                : 'Registra tu barbería en Agendex'
              }
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {!tenantSlug && (
                <div className="flex space-x-2 mb-4">
                  <Button
                    type="button"
                    variant={isOwnerRegistration ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsOwnerRegistration(true)}
                  >
                    Crear Barbería
                  </Button>
                  <Button
                    type="button"
                    variant={!isOwnerRegistration ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsOwnerRegistration(false)}
                  >
                    Unirse a Barbería
                  </Button>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+56 9 1234 5678"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {isOwnerRegistration && !tenantSlug && (
                <div className="grid grid-cols-1 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nombre de la Barbería</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Mi Barbería"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessSlug">URL de la Barbería</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        agendex.studio/
                      </span>
                      <Input
                        id="businessSlug"
                        name="businessSlug"
                        type="text"
                        value={formData.businessSlug}
                        onChange={handleInputChange}
                        placeholder="mi-barberia"
                        required
                        disabled={isLoading}
                        className="rounded-l-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Solo letras minúsculas, números y guiones
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isOwnerRegistration ? 'Creando barbería...' : 'Registrando...'}
                  </>
                ) : (
                  isOwnerRegistration ? 'Crear Barbería' : 'Solicitar Acceso'
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  href={`/login${tenantSlug ? `?tenant=${tenantSlug}` : ''}`}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Inicia sesión aquí
                </Link>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <Link 
                  href="/"
                  className="hover:text-gray-700"
                >
                  ← Volver al inicio
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}