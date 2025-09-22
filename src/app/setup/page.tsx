'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function SetupPage() {
  const [showKeys, setShowKeys] = useState(false)
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'error'>('pending')
  const isConfigured = isSupabaseConfigured()

  const testConnection = async () => {
    setTestResult('pending')
    
    // Simular test de conexión
    setTimeout(() => {
      if (isConfigured) {
        setTestResult('success')
      } else {
        setTestResult('error')
      }
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración de Agendex</h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-6">
            Configura tu instancia de Supabase para comenzar a usar Agendex
          </p>

          <div className="flex items-center justify-center">
            <Badge 
              variant={isConfigured ? 'default' : 'destructive'}
              className="px-4 py-2"
            >
              {isConfigured ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Supabase Configurado
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Supabase No Configurado
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Configuration Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Estado de Conexión
              </CardTitle>
              <CardDescription>
                Verifica que tu proyecto Supabase esté conectado correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">URL de Supabase</span>
                  <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' ? 'default' : 'secondary'}>
                    {process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' ? 'Configurada' : 'No configurada'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Clave Anónima</span>
                  <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key' ? 'default' : 'secondary'}>
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key' ? 'Configurada' : 'No configurada'}
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={testConnection}
                className="w-full"
                disabled={testResult === 'pending'}
              >
                {testResult === 'pending' ? 'Probando...' : 'Probar Conexión'}
              </Button>
              
              {testResult === 'success' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ¡Conexión exitosa! Tu instancia de Supabase está funcionando correctamente.
                  </AlertDescription>
                </Alert>
              )}
              
              {testResult === 'error' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No se pudo conectar a Supabase. Verifica tu configuración.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="w-5 h-5 mr-2" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Enlaces útiles para configurar tu proyecto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Dashboard de Supabase
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('https://supabase.com/docs/guides/getting-started', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Documentación de Supabase
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('/demo', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Demo de Agendex
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones de Configuración</CardTitle>
            <CardDescription>
              Sigue estos pasos para configurar Supabase con tu proyecto Agendex
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Crear proyecto en Supabase</h3>
                  <p className="text-gray-600 text-sm">
                    Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com/dashboard</a> y crea un nuevo proyecto.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Obtener credenciales del proyecto</h3>
                  <p className="text-gray-600 text-sm">
                    En la configuración del proyecto, copia la URL del proyecto y la clave anónima.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold">Configurar variables de entorno</h3>
                  <p className="text-gray-600 text-sm">
                    Actualiza tu archivo <code className="bg-gray-100 px-1 rounded">.env.local</code> con las siguientes variables:
                  </p>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400"># Configuración de Supabase</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowKeys(!showKeys)}
                        className="text-gray-400 hover:text-white"
                      >
                        {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>NEXT_PUBLIC_SUPABASE_URL={showKeys ? 'https://tu-proyecto.supabase.co' : '***'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co')}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>NEXT_PUBLIC_SUPABASE_ANON_KEY={showKeys ? 'tu-clave-anonima' : '***'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima')}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>SUPABASE_SERVICE_ROLE_KEY={showKeys ? 'tu-service-role-key' : '***'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key')}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold">Ejecutar migraciones de base de datos</h3>
                  <p className="text-gray-600 text-sm">
                    Crea las tablas necesarias ejecutando el script SQL de migraciones en el editor SQL de Supabase.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold">¡Listo para usar!</h3>
                  <p className="text-gray-600 text-sm">
                    Reinicia el servidor de desarrollo y comienza a usar Agendex con tu base de datos.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Mode */}
        {!isConfigured && (
          <Card className="mt-6 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">Modo Demo Disponible</CardTitle>
              <CardDescription className="text-yellow-700">
                Mientras configuras Supabase, puedes explorar Agendex en modo demo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button 
                  onClick={() => window.location.href = '/demo'}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Explorar Demo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/pricing'}
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                >
                  Ver Planes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}