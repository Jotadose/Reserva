'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, CheckCircle, Scissors } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
  businessName?: string
  businessSlug?: string
}

function RegisterForm() {
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
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp } = useAuth()
  const tenantSlug = searchParams.get('tenant')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generar slug del negocio basado en el nombre
    if (name === 'businessName' && !tenantSlug) {
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
    
    if (!tenantSlug) {
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
      const metadata = {
        name: formData.name,
        phone: formData.phone,
        business_name: formData.businessName,
        business_slug: formData.businessSlug,
        tenant_slug: tenantSlug,
      }

      const result = await signUp(formData.email, formData.password, metadata)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    } catch (error) {
      console.error('Error en registro:', error)
      setError('Error inesperado al registrarse')
    } finally {
      setIsLoading(false)
    }
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
                {!tenantSlug 
                  ? 'Tu barbería ha sido creada exitosamente'
                  : 'Tu solicitud ha sido enviada'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Hemos enviado un email de verificación. Por favor, verifica tu cuenta para comenzar a usar Agendex.
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Agendex</h1>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Crea tu cuenta y comienza a gestionar reservas
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
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
                    placeholder="+57 300 123 4567"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {!tenantSlug && (
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {!tenantSlug ? 'Creando barbería...' : 'Registrando...'}
                  </>
                ) : (
                  (() => {
                    return !tenantSlug ? 'Crear Barbería' : 'Solicitar Acceso'
                  })()
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  href={tenantSlug ? `/login?tenant=${tenantSlug}` : '/login'}
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

function LoadingRegister() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingRegister />}>
      <RegisterForm />
    </Suspense>
  )
}