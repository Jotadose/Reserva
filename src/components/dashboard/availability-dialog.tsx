'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { availabilityAPI } from '@/lib/supabase'
import { AvailabilityBlock } from '@/types/tenant'

interface AvailabilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  block?: AvailabilityBlock | null
  providerId: string
  tenantId: string
  onSaved: () => void
}

interface AvailabilityFormData {
  type: 'available' | 'break' | 'vacation' | 'blocked'
  start_datetime: string
  end_datetime: string
  reason?: string
  is_recurring: boolean
  recurring_pattern?: string
}

const BLOCK_TYPES = [
  { value: 'available', label: 'Disponible' },
  { value: 'break', label: 'Descanso' },
  { value: 'vacation', label: 'Vacaciones' },
  { value: 'blocked', label: 'Bloqueado' }
]

const RECURRING_PATTERNS = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' }
]

export function AvailabilityDialog({
  open,
  onOpenChange,
  block,
  providerId,
  tenantId,
  onSaved
}: AvailabilityDialogProps) {
  const [formData, setFormData] = useState<AvailabilityFormData>({
    type: 'available',
    start_datetime: '',
    end_datetime: '',
    reason: '',
    is_recurring: false,
    recurring_pattern: undefined
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!block

  useEffect(() => {
    if (block) {
      // Convertir datetime a formato input datetime-local
      const startDate = new Date(block.start_datetime)
      const endDate = new Date(block.end_datetime)
      
      const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        type: block.type,
        start_datetime: formatDateTimeLocal(startDate),
        end_datetime: formatDateTimeLocal(endDate),
        reason: block.reason || '',
        is_recurring: block.is_recurring || false,
        recurring_pattern: typeof block.recurring_pattern === 'string' 
          ? block.recurring_pattern 
          : JSON.stringify(block.recurring_pattern) || undefined
      })
    } else {
      // Valores por defecto para nuevo bloque
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
      
      const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      setFormData({
        type: 'available',
        start_datetime: formatDateTimeLocal(now),
        end_datetime: formatDateTimeLocal(oneHourLater),
        reason: '',
        is_recurring: false,
        recurring_pattern: undefined
      })
    }
    setError(null)
  }, [block, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validaciones
      if (!formData.start_datetime || !formData.end_datetime) {
        throw new Error('Las fechas de inicio y fin son requeridas')
      }

      const startDate = new Date(formData.start_datetime)
      const endDate = new Date(formData.end_datetime)

      if (startDate >= endDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
      }

      // Preparar datos para la API
      const blockData = {
        provider_id: providerId,
        type: formData.type,
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        reason: formData.reason || null,
        is_recurring: formData.is_recurring,
        recurring_pattern: formData.is_recurring ? formData.recurring_pattern : null
      }

      let result
      if (isEditing && block) {
        result = await availabilityAPI.update(tenantId, block.id, blockData)
      } else {
        result = await availabilityAPI.create(tenantId, blockData)
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el bloque')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof AvailabilityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Bloque de Disponibilidad' : 'Nuevo Bloque de Disponibilidad'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los detalles del bloque de disponibilidad'
              : 'Crea un nuevo bloque de disponibilidad para el proveedor'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Bloque</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_datetime">Fecha y Hora de Inicio</Label>
              <Input
                id="start_datetime"
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => handleInputChange('start_datetime', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_datetime">Fecha y Hora de Fin</Label>
              <Input
                id="end_datetime"
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => handleInputChange('end_datetime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Razón (Opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Describe la razón de este bloque..."
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="is_recurring">Bloque Recurrente</Label>
            </div>

            {formData.is_recurring && (
              <div className="space-y-2">
                <Label htmlFor="recurring_pattern">Patrón de Recurrencia</Label>
                <Select
                  value={formData.recurring_pattern || ''}
                  onValueChange={(value) => handleInputChange('recurring_pattern', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el patrón" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRING_PATTERNS.map((pattern) => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}