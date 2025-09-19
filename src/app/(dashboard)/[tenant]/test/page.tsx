'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useSupabaseTest } from '@/hooks/use-supabase-test'
import { useTenant } from '@/hooks/use-tenant'

export default function TestPage() {
  const { testResults, isLoading, runConnectivityTest, isConfigured } = useSupabaseTest()
  const { tenant, isLoading: tenantLoading } = useTenant()

  const renderTestResult = (result: any, label: string) => {
    if (!result) return null

    const isSuccess = result.success
    const Icon = isSuccess ? CheckCircle : XCircle

    return (
      <div className="flex items-center space-x-2 p-2 border rounded">
        <Icon className={`w-4 h-4 ${isSuccess ? 'text-green-500' : 'text-red-500'}`} />
        <div className="flex-1">
          <span className="font-medium">{label}</span>
          {result.error && <p className="text-sm text-red-600">{result.error}</p>}
          {result.count !== undefined && <p className="text-sm text-gray-600">Count: {result.count}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pruebas del Sistema</h1>
        <p className="text-gray-600 mt-2">
          Verificar conectividad con Supabase y funcionalidad de APIs
        </p>
      </div>

      {/* Estado del Tenant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Estado del Tenant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tenantLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cargando tenant...</span>
            </div>
          ) : tenant ? (
            <div className="space-y-2">
              <p><strong>Tenant ID:</strong> {tenant.id}</p>
              <p><strong>Slug:</strong> {tenant.slug}</p>
              <p><strong>Nombre:</strong> {tenant.name}</p>
              <p><strong>Estado:</strong> {tenant.status}</p>
              <p><strong>Plan:</strong> {tenant.plan}</p>
            </div>
          ) : (
            <p className="text-yellow-600">No se pudo cargar el tenant</p>
          )}
        </CardContent>
      </Card>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Supabase</CardTitle>
          <CardDescription>
            Estado de las variables de entorno y configuración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {isConfigured ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Supabase configurado: {isConfigured ? 'Sí' : 'No'}</span>
            </div>
            
            {testResults.configuration && (
              <div className="space-y-1 mt-4">
                <p>URL: {testResults.configuration.url}</p>
                <p>Anon Key: {testResults.configuration.anonKey}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botón de pruebas */}
      <Card>
        <CardHeader>
          <CardTitle>Ejecutar Pruebas</CardTitle>
          <CardDescription>
            Probar conectividad, RLS y APIs de Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runConnectivityTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ejecutando pruebas...
              </>
            ) : (
              'Ejecutar Pruebas de Conectividad'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados de las pruebas */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de las Pruebas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {renderTestResult(testResults.connectivity, 'Conectividad Base')}
              {renderTestResult(testResults.tenantRLS, 'Políticas RLS - Tenants')}
              {renderTestResult(testResults.servicesAPI, 'API de Servicios')}
              {renderTestResult(testResults.providersAPI, 'API de Providers')}
              {renderTestResult(testResults.bookingsAPI, 'API de Bookings')}
            </div>

            {testResults.error && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error en las pruebas: {testResults.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Nota:</strong> Si Supabase no está configurado, el sistema usará datos mock para desarrollo. 
          Para producción, configurar las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </AlertDescription>
      </Alert>
    </div>
  )
}