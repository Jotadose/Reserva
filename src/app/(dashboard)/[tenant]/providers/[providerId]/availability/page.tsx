'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Clock, Plus, Edit, Trash2, Coffee, Plane, Ban, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { availabilityAPI, providersAPI } from '@/lib/supabase'
import { AvailabilityBlock, Provider } from '@/types/tenant'
import { AvailabilityDialog } from '@/components/dashboard/availability-dialog'

interface ExtendedAvailabilityBlock extends AvailabilityBlock {
  // Campos adicionales si son necesarios
}

const BLOCK_TYPE_CONFIG = {
  available: {
    label: 'Disponible',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200'
  },
  break: {
    label: 'Descanso',
    icon: Coffee,
    color: 'bg-yellow-100 text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  vacation: {
    label: 'Vacaciones',
    icon: Plane,
    color: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200'
  },
  blocked: {
    label: 'Bloqueado',
    icon: Ban,
    color: 'bg-red-100 text-red-800',
    borderColor: 'border-red-200'
  }
}

export default function ProviderAvailabilityPage() {
  const params = useParams()
  const providerId = params.providerId as string
  
  const [availabilityBlocks, setAvailabilityBlocks] = useState<ExtendedAvailabilityBlock[]>([])
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<ExtendedAvailabilityBlock | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  // TODO: Obtener tenant_id desde el contexto o API
  const tenantId = 'temp-tenant-id'

  const fetchProvider = async () => {
    try {
      const { data, error } = await providersAPI.getById(tenantId, providerId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      setProvider(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar proveedor')
    }
  }

  const fetchAvailabilityBlocks = async () => {
    try {
      setLoading(true)
      
      // Obtener bloques para la semana actual
      const startDate = new Date(selectedDate)
      startDate.setDate(startDate.getDate() - startDate.getDay()) // Inicio de semana
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6) // Fin de semana
      
      const { data, error } = await availabilityAPI.getByProvider(
        tenantId, 
        providerId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      
      if (error) {
        throw new Error(error.message)
      }
      
      setAvailabilityBlocks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar disponibilidad')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProvider()
    fetchAvailabilityBlocks()
  }, [tenantId, providerId, selectedDate])

  const handleCreateBlock = () => {
    setSelectedBlock(null)
    setDialogOpen(true)
  }

  const handleEditBlock = (block: ExtendedAvailabilityBlock) => {
    setSelectedBlock(block)
    setDialogOpen(true)
  }

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este bloque de disponibilidad?')) {
      return
    }

    try {
      const { error } = await availabilityAPI.delete(tenantId, blockId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      await fetchAvailabilityBlocks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar bloque')
    }
  }

  const handleBlockSaved = () => {
    setDialogOpen(false)
    setSelectedBlock(null)
    fetchAvailabilityBlocks()
  }

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime)
    return {
      date: date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const groupBlocksByDate = (blocks: ExtendedAvailabilityBlock[]) => {
    const grouped: { [key: string]: ExtendedAvailabilityBlock[] } = {}
    
    blocks.forEach(block => {
      const date = block.start_datetime.split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(block)
    })
    
    return grouped
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando disponibilidad...</p>
          </div>
        </div>
      </div>
    )
  }

  const groupedBlocks = groupBlocksByDate(availabilityBlocks)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disponibilidad</h1>
          <p className="text-gray-600 mt-2">
            Gestiona la disponibilidad de {provider?.users?.name || 'Proveedor'}
          </p>
        </div>
        <Button onClick={handleCreateBlock}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Bloque
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selector de fecha */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Seleccionar Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </CardContent>
      </Card>

      {/* Leyenda de tipos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tipos de Bloques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(BLOCK_TYPE_CONFIG).map(([type, config]) => {
              const Icon = config.icon
              return (
                <div key={type} className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <Badge className={config.color}>
                    {config.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bloques de disponibilidad */}
      <div className="space-y-6">
        {Object.keys(groupedBlocks).length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay bloques de disponibilidad
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza agregando bloques de disponibilidad para esta semana
              </p>
              <Button onClick={handleCreateBlock}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Bloque
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedBlocks)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, blocks]) => {
              const dateObj = new Date(date)
              const formattedDate = dateObj.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })

              return (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="capitalize">{formattedDate}</CardTitle>
                    <CardDescription>
                      {blocks.length} bloque{blocks.length !== 1 ? 's' : ''} de disponibilidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {blocks
                        .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime))
                        .map((block) => {
                          const config = BLOCK_TYPE_CONFIG[block.type]
                          const Icon = config.icon
                          const startTime = formatDateTime(block.start_datetime)
                          const endTime = formatDateTime(block.end_datetime)

                          return (
                            <div
                              key={block.id}
                              className={`p-4 border rounded-lg ${config.borderColor} hover:shadow-md transition-shadow`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Icon className="w-5 h-5" />
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className={config.color}>
                                        {config.label}
                                      </Badge>
                                      <span className="font-medium">
                                        {startTime.time} - {endTime.time}
                                      </span>
                                    </div>
                                    {block.reason && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {block.reason}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditBlock(block)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteBlock(block.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              )
            })
        )}
      </div>

      <AvailabilityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        block={selectedBlock}
        providerId={providerId}
        tenantId={tenantId}
        onSaved={handleBlockSaved}
      />
    </div>
  )
}