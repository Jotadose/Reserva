'use client'

import React, { useState, useEffect } from 'react'
import { Settings, Save, Building2, Mail, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTenant } from '@/hooks/use-tenant'

export default function SettingsPage() {
  const { tenant, updateTenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const [generalData, setGeneralData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    slot_duration_minutes: 30
  })

  useEffect(() => {
    if (tenant) {
      setGeneralData({
        name: tenant.name || '',
        contact_email: tenant.contact_email || '',
        contact_phone: tenant.contact_phone || '',
        slot_duration_minutes: tenant.slot_duration_minutes || 30
      })
    }
  }, [tenant])

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      await updateTenant(generalData)
      setMessage('Configuración general guardada exitosamente')
      setMessageType('success')
    } catch (error) {
      console.error('Error saving general settings:', error)
      setMessage('Error al guardar la configuración')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: string | number) => {
    setGeneralData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración General</h1>
        <p className="text-gray-600">Gestiona la información básica de tu workspace</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${messageType === 'error' ? 'border-red-200' : 'border-green-200'}`}>
          <AlertDescription className={messageType === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información Básica */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Información Básica
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-0 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Nombre del Negocio</Label>
              <Input
                id="name"
                type="text"
                value={generalData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nombre de tu negocio"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="slot_duration_minutes" className="text-sm font-medium">
                Duración de Slots (minutos)
              </Label>
              <select
                id="slot_duration_minutes" 
                title="Seleccionar duración de slots"
                value={generalData.slot_duration_minutes}
                onChange={(e) => handleInputChange('slot_duration_minutes', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-0 space-y-4">
            <div>
              <Label htmlFor="contact_email" className="text-sm font-medium">Email de Contacto</Label>
              <Input
                id="contact_email"
                type="email"
                value={generalData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="contacto@ejemplo.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="contact_phone" className="text-sm font-medium">Teléfono de Contacto</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={generalData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+56 9 1234 5678"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información del Plan */}
        <Card className="p-6 lg:col-span-2">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Información del Plan
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-0">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    Plan Actual: {tenant?.plan === 'basic' ? 'Básico' : 'Premium'}
                  </h3>
                  <p className="text-purple-700 mt-1">
                    Estado: {tenant?.status === 'active' ? 'Activo' : 'Prueba'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Hasta 100 reservas/mes
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Branding personalizado
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Soporte por email
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-900">$0</p>
                  <p className="text-purple-700 text-sm">por mes</p>
                  <Button variant="outline" className="mt-2 text-purple-700 border-purple-300 hover:bg-purple-50">
                    Ver Planes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones */}
      <div className="flex justify-end items-center mt-8 pt-6 border-t">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}