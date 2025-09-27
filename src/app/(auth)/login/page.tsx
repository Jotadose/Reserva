'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Scissors, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)
  const [rememberMe, setRememberMe] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const tenantSlug = searchParams.get('tenant')
  const message = searchParams.get('message')
  const callbackUrl = searchParams.get('callbackUrl')

  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured())
    
    // Mostrar mensaje de URL si existe
    if (message) {
      setError(message)
    }

    // Verificar si hay intento de auth previo
    const authAttempt = localStorage.getItem('auth_attempt')
    if (authAttempt) {
      try {
        const attempt = JSON.parse(authAttempt)
        if (attempt.provider === 'google') {
          setSuccess('Intento de login con Google detectado. Si no fuiste redirigido, intenta nuevamente.')
        }
        localStorage.removeItem('auth_attempt')
      } catch (e) {
        // Ignorar errores de parsing
      }
    }
  }, [message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await signIn(email, password)

      if (result.error) {
        setError(result.error)
        return
      }
      
      setSuccess('¡Login exitoso! Redirigiendo...')
      
      // Esperar un momento para mostrar el mensaje de éxito
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Redirección inteligente
      if (callbackUrl) {
        // Si hay URL de callback, ir ahí
        router.push(callbackUrl)
      } else if (result.tenant) {
        // Usuario tiene tenant, ir a su dashboard
        router.push(`/${result.tenant}/dashboard`)
      } else {
        // Usuario no tiene tenant, ir a onboarding
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Error inesperado. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
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
              Inicia sesión en tu cuenta para gestionar tu barbería
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                {tenantSlug 
                  ? `Accede a ${tenantSlug}`
                  : 'Accede a tu dashboard de barbería'
                }
              </CardDescription>
            </CardHeader>
            
            {!supabaseConfigured && (
              <CardContent className="pb-0">
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Settings className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Supabase no configurado:</strong> Para usar el login real, configura primero tu instancia de Supabase.{' '}
                    <Link href="/setup" className="text-yellow-700 hover:text-yellow-900 underline font-medium">
                      Ir a configuración
                    </Link>
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
            
            <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <Settings className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <Settings className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="h-11 pr-10"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    Recordarme
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  ¿Olvidaste tu contraseña?
                </Link>
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
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">O continúa con</span>
                </div>
              </div>

              {/* Google Auth Button */}
              {supabaseConfigured && <GoogleAuthButton />}
              
              <div className="text-center text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link 
                  href={tenantSlug ? `/register?tenant=${tenantSlug}` : '/register'}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Regístrate aquí
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

function LoadingLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingLogin />}>
      <LoginForm />
    </Suspense>
  )
}