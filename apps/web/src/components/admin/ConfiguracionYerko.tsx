import React, { useState } from 'react'
import {
  Clock,
  Calendar,
  Scissors,
  Settings,
  Save,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  Coffee,
  Plane,
  Trophy
} from 'lucide-react'

import { YERKO_SERVICES, YERKO_SCHEDULE, YERKO_CLOSURES, YERKO_CONTACT, YerkoService } from '../../data/yerkoServices'

interface WorkingHours {
  [key: string]: {
    start: string
    end: string
    enabled: boolean
  }
}

interface VacationPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
  type: 'vacation' | 'event' | 'personal'
  reason: string
}

export const ConfiguracionYerko: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'horarios' | 'servicios' | 'vacaciones' | 'contacto'>('horarios')
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { start: '11:00', end: '20:00', enabled: true },
    tuesday: { start: '11:00', end: '20:00', enabled: true },
    wednesday: { start: '11:00', end: '20:00', enabled: true },
    thursday: { start: '11:00', end: '20:00', enabled: true },
    friday: { start: '11:00', end: '20:00', enabled: true },
    saturday: { start: '11:00', end: '20:00', enabled: true },
    sunday: { start: '11:00', end: '20:00', enabled: false }
  })
  
  const [lunchTime, setLunchTime] = useState({ start: '14:00', end: '15:00' })
  const [services, setServices] = useState<YerkoService[]>(YERKO_SERVICES)
  const [vacations, setVacations] = useState<VacationPeriod[]>(YERKO_CLOSURES)
  const [contactInfo, setContactInfo] = useState(YERKO_CONTACT)
  const [showSuccess, setShowSuccess] = useState(false)

  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }

  const handleSaveConfiguration = () => {
    // Aquí se guardaría la configuración en la base de datos
    console.log('Guardando configuración:', {
      workingHours,
      lunchTime,
      services,
      vacations,
      contactInfo
    })
    
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const addVacationPeriod = () => {
    const newVacation: VacationPeriod = {
      id: `vacation-${Date.now()}`,
      name: 'Nuevo Período',
      startDate: '',
      endDate: '',
      type: 'vacation',
      reason: ''
    }
    setVacations([...vacations, newVacation])
  }

  const updateVacation = (id: string, updates: Partial<VacationPeriod>) => {
    setVacations(vacations.map(v => v.id === id ? { ...v, ...updates } : v))
  }

  const deleteVacation = (id: string) => {
    setVacations(vacations.filter(v => v.id !== id))
  }

  const updateService = (id: string, updates: Partial<YerkoService>) => {
    setServices(services.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const sections = [
    { id: 'horarios', label: 'Horarios', icon: Clock },
    { id: 'servicios', label: 'Servicios', icon: Scissors },
    { id: 'vacaciones', label: 'Vacaciones', icon: Calendar },
    { id: 'contacto', label: 'Contacto', icon: Settings }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Configuración de Barbería</h2>
        <button
          onClick={handleSaveConfiguration}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
        >
          <Save className="w-5 h-5" />
          <span>Guardar Configuración</span>
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-300">Configuración guardada exitosamente</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex space-x-1 bg-black/30 backdrop-blur-sm rounded-lg p-1">
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-purple-600/30 text-purple-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{section.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        {/* Horarios */}
        {activeSection === 'horarios' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Configuración de Horarios</h3>
            
            {/* Horario de Almuerzo */}
            <div className="bg-orange-600/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Coffee className="w-5 h-5 text-orange-400" />
                <h4 className="text-lg font-semibold text-white">Horario de Almuerzo</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Inicio</label>
                  <input
                    type="time"
                    value={lunchTime.start}
                    onChange={(e) => setLunchTime({ ...lunchTime, start: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-orange-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fin</label>
                  <input
                    type="time"
                    value={lunchTime.end}
                    onChange={(e) => setLunchTime({ ...lunchTime, end: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-orange-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Horarios por Día */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Horarios por Día</h4>
              {Object.entries(workingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                  <div className="w-24">
                    <span className="text-white font-medium">{dayNames[day as keyof typeof dayNames]}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hours.enabled}
                      onChange={(e) => setWorkingHours({
                        ...workingHours,
                        [day]: { ...hours, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-300 text-sm">Activo</span>
                  </div>
                  
                  {hours.enabled && (
                    <>
                      <div>
                        <input
                          type="time"
                          value={hours.start}
                          onChange={(e) => setWorkingHours({
                            ...workingHours,
                            [day]: { ...hours, start: e.target.value }
                          })}
                          className="px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div>
                        <input
                          type="time"
                          value={hours.end}
                          onChange={(e) => setWorkingHours({
                            ...workingHours,
                            [day]: { ...hours, end: e.target.value }
                          })}
                          className="px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicios */}
        {activeSection === 'servicios' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Gestión de Servicios</h3>
            
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="bg-white/5 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(service.id, { name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Precio ($)</label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(service.id, { price: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duración (min)</label>
                      <input
                        type="number"
                        value={service.duration}
                        onChange={(e) => updateService(service.id, { duration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                      <select
                        value={service.category}
                        onChange={(e) => updateService(service.id, { category: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="basico">Básico</option>
                        <option value="premium">Premium</option>
                        <option value="color">Color</option>
                        <option value="especial">Especial</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(service.id, { description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vacaciones */}
        {activeSection === 'vacaciones' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Períodos de Cierre</h3>
              <button
                onClick={addVacationPeriod}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Período</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {vacations.map((vacation) => (
                <div key={vacation.id} className="bg-white/5 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                      <input
                        type="text"
                        value={vacation.name}
                        onChange={(e) => updateVacation(vacation.id, { name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Inicio</label>
                      <input
                        type="date"
                        value={vacation.startDate}
                        onChange={(e) => updateVacation(vacation.id, { startDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Fin</label>
                      <input
                        type="date"
                        value={vacation.endDate}
                        onChange={(e) => updateVacation(vacation.id, { endDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                      <select
                        value={vacation.type}
                        onChange={(e) => updateVacation(vacation.id, { type: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="vacation">Vacaciones</option>
                        <option value="event">Evento</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={() => deleteVacation(vacation.id)}
                        className="w-full bg-red-600/20 text-red-400 px-3 py-2 rounded-md hover:bg-red-600/30 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Motivo</label>
                    <input
                      type="text"
                      value={vacation.reason}
                      onChange={(e) => updateVacation(vacation.id, { reason: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Describe el motivo del cierre..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacto */}
        {activeSection === 'contacto' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Información de Contacto</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Negocio</label>
                <input
                  type="text"
                  value={contactInfo.businessName}
                  onChange={(e) => setContactInfo({ ...contactInfo, businessName: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
                <input
                  type="text"
                  value={contactInfo.instagram}
                  onChange={(e) => setContactInfo({ ...contactInfo, instagram: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp</label>
                <input
                  type="text"
                  value={contactInfo.whatsapp}
                  onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
              <input
                type="text"
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfiguracionYerko