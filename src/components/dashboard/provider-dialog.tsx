'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { providersAPI } from '@/lib/supabase'
import { Provider } from '@/types/tenant'

interface ExtendedProvider extends Provider {
  users: {
    id: string
    name: string
    email: string
    is_active: boolean
  }
}

interface ProviderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider?: ExtendedProvider | null
  tenantId: string
  onSaved: () => void
}

interface ProviderFormData {
  user_id: string
  bio: string
  specialties: string[]
  commission_rate: number
  is_active: boolean
}

const COMMON_SPECIALTIES = [
  'Corte clásico',
  'Corte moderno',
  'Barba',
  'Bigote',
  'Afeitado',
  'Peinado',
  'Tratamiento capilar',
  'Coloración',
  'Permanente',
  'Alisado'
]

export function ProviderDialog({ open, onOpenChange, provider, tenantId, onSaved }: ProviderDialogProps) {
  const [formData, setFormData] = useState<ProviderFormData>({
    user_id: '',
    bio: '',
    specialties: [],
    commission_rate: 0.5,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newSpecialty, setNewSpecialty] = useState('')
  const [availableUsers, setAvailableUsers] = useState<any[]>([])

  const isEditing = !!provider

  useEffect(() => {
    if (provider) {
      setFormData({
        user_id: provider.user_id,
        bio: provider.bio || '',
        specialties: provider.specialties || [],
        commission_rate: provider.commission_rate,
        is_active: provider.is_active
      })
    } else {
      setFormData({
        user_id: '',
        bio: '',
        specialties: [],
        commission_rate: 0.5,
        is_active: true
      })
    }
    setError(null)
  }, [provider, open])

  // TODO: Implementar función para obtener usuarios disponibles
  // que no sean providers aún y tengan rol 'barber'
  useEffect(() => {
    if (open && !isEditing) {
      // Aquí iría la lógica para cargar usuarios disponibles
      // Por ahora dejamos un array vacío
      setAvailableUsers([])
    }
  }, [open, isEditing])

  const handleInputChange = (field: keyof ProviderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }))
    }
    setNewSpecialty('')
  }

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing && provider) {
        const { error } = await providersAPI.update(tenantId, provider.id, {
          bio: formData.bio,
          specialties: formData.specialties,
          commission_rate: formData.commission_rate,
          is_active: formData.is_active
        })
        
        if (error) {
          throw new Error(error.message)
        }
      } else {
        const { error } = await providersAPI.create(tenantId, formData)
        
        if (error) {
          throw new Error(error.message)
        }
      }
      
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar provider')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica la información del proveedor'
              : 'Completa los datos del nuevo proveedor de servicios'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="user_id">Usuario *</Label>
              <Select 
                value={formData.user_id} 
                onValueChange={(value) => handleInputChange('user_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Solo se muestran usuarios con rol &apos;barber&apos; que no sean proveedores aún
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Describe la experiencia y especialidades del proveedor..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Especialidades</Label>
            
            {/* Especialidades actuales */}
            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(specialty)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Especialidades comunes */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Especialidades comunes:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SPECIALTIES.filter(s => !formData.specialties.includes(s)).map((specialty) => (
                  <Button
                    key={specialty}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSpecialty(specialty)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {specialty}
                  </Button>
                ))}
              </div>
            </div>

            {/* Agregar especialidad personalizada */}
            <div className="flex gap-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Agregar especialidad personalizada"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSpecialty(newSpecialty)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addSpecialty(newSpecialty)}
                disabled={!newSpecialty.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission_rate">Tasa de Comisión *</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="commission_rate"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={formData.commission_rate}
                onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value) || 0)}
                className="flex-1"
                required
              />
              <span className="text-sm text-gray-500 min-w-0">
                ({(formData.commission_rate * 100).toFixed(0)}%)
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Porcentaje de comisión que recibe el proveedor por cada servicio (0.0 - 1.0)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_active">Estado</Label>
            <Select 
              value={formData.is_active.toString()} 
              onValueChange={(value) => handleInputChange('is_active', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
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