'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, UserCheck, Mail, Phone, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { providersAPI } from '@/lib/supabase'
import { Provider } from '@/types/tenant'
import { ProviderDialog } from '@/components/dashboard/provider-dialog'

interface ExtendedProvider extends Provider {
  users: {
    id: string
    name: string
    email: string
    is_active: boolean
  }
}

export default function ProvidersPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params.tenant as string
  
  const [providers, setProviders] = useState<ExtendedProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ExtendedProvider | null>(null)

  // TODO: Obtener tenant_id desde el contexto o API
  const tenantId = 'temp-tenant-id' // Esto debe venir del contexto de autenticación

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const { data, error } = await providersAPI.getAll(tenantId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      setProviders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar providers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [tenantId])

  const handleCreateProvider = () => {
    setSelectedProvider(null)
    setDialogOpen(true)
  }

  const handleEditProvider = (provider: ExtendedProvider) => {
    setSelectedProvider(provider)
    setDialogOpen(true)
  }

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar este proveedor?')) {
      return
    }

    try {
      const { error } = await providersAPI.delete(tenantId, providerId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      await fetchProviders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar provider')
    }
  }

  const handleProviderSaved = () => {
    setDialogOpen(false)
    setSelectedProvider(null)
    fetchProviders()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando proveedores...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los barberos y profesionales de tu equipo
          </p>
        </div>
        <Button onClick={handleCreateProvider}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Proveedor
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{provider.users.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Mail className="w-4 h-4 mr-1" />
                      {provider.users.email}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={provider.is_active ? "default" : "secondary"}>
                  {provider.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {provider.bio && (
                <p className="text-sm text-gray-600 line-clamp-2">{provider.bio}</p>
              )}
              
              {provider.specialties && provider.specialties.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Award className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Especialidades:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {provider.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">Comisión:</span> {(provider.commission_rate * 100).toFixed(0)}%
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/${tenantSlug}/providers/${provider.id}/availability`)}
                  title="Gestionar disponibilidad"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditProvider(provider)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteProvider(provider.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay proveedores registrados
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando barberos y profesionales a tu equipo
            </p>
            <Button onClick={handleCreateProvider}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Proveedor
            </Button>
          </CardContent>
        </Card>
      )}

      <ProviderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        provider={selectedProvider}
        tenantId={tenantId}
        onSaved={handleProviderSaved}
      />
    </div>
  )
}