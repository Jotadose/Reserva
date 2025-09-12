import React, { useState } from 'react'
import {
  Scissors,
  DollarSign,
  Clock,
  Star,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Tag
} from 'lucide-react'

import { YERKO_SERVICES, YerkoService } from '../../data/yerkoServices'

interface EditingService extends YerkoService {
  isEditing?: boolean
}

export const GestionServiciosYerko: React.FC = () => {
  const [services, setServices] = useState<EditingService[]>(YERKO_SERVICES)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newService, setNewService] = useState<Partial<YerkoService>>({
    name: '',
    price: 0,
    duration: 30,
    description: '',
    category: 'basico',
    priority: 'media',
    canApplyDiscount: false,
    marginTime: 5
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const categoryColors = {
    basico: 'from-blue-600/20 to-cyan-600/20 border-blue-500/30',
    premium: 'from-purple-600/20 to-pink-600/20 border-purple-500/30',
    color: 'from-orange-600/20 to-red-600/20 border-orange-500/30',
    especial: 'from-green-600/20 to-emerald-600/20 border-green-500/30'
  }

  const categoryLabels = {
    basico: 'Básico',
    premium: 'Premium',
    color: 'Coloración',
    especial: 'Especial'
  }

  const priorityColors = {
    alta: 'text-red-400',
    media: 'text-yellow-400',
    baja: 'text-green-400'
  }

  const priorityLabels = {
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja'
  }

  const handleEditService = (id: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, isEditing: true } : { ...s, isEditing: false }
    ))
  }

  const handleSaveService = (id: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, isEditing: false } : s
    ))
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  const handleCancelEdit = (id: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, isEditing: false } : s
    ))
  }

  const handleUpdateService = (id: string, field: keyof YerkoService, value: any) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const handleAddService = () => {
    if (!newService.name || !newService.price || !newService.duration) {
      return
    }

    const service: YerkoService = {
      id: `service-${Date.now()}`,
      name: newService.name!,
      price: newService.price!,
      duration: newService.duration!,
      description: newService.description || '',
      category: newService.category!,
      priority: newService.priority!,
      canApplyDiscount: newService.canApplyDiscount || false,
      marginTime: newService.marginTime || 5
    }

    setServices([...services, service])
    setNewService({
      name: '',
      price: 0,
      duration: 30,
      description: '',
      category: 'basico',
      priority: 'media',
      canApplyDiscount: false,
      marginTime: 5
    })
    setShowAddForm(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  const handleDeleteService = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
    }
    return `${minutes}min`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Servicios</h2>
          <p className="text-gray-400 mt-1">Administra los servicios de Barbería Yerko</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-300">Servicio actualizado exitosamente</span>
        </div>
      )}

      {/* Add Service Form */}
      {showAddForm && (
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Agregar Nuevo Servicio</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Servicio</label>
              <input
                type="text"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Corte Moderno"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio ($)</label>
              <input
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="12000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duración (minutos)</label>
              <input
                type="number"
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
              <select
                value={newService.category}
                onChange={(e) => setNewService({ ...newService, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="basico">Básico</option>
                <option value="premium">Premium</option>
                <option value="color">Coloración</option>
                <option value="especial">Especial</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prioridad</label>
              <select
                value={newService.priority}
                onChange={(e) => setNewService({ ...newService, priority: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Margen (min)</label>
              <input
                type="number"
                value={newService.marginTime}
                onChange={(e) => setNewService({ ...newService, marginTime: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="5"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe el servicio..."
            />
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newService.canApplyDiscount}
              onChange={(e) => setNewService({ ...newService, canApplyDiscount: e.target.checked })}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="text-sm text-gray-300">Puede aplicar descuento</label>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleAddService}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Servicio</span>
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className={`bg-gradient-to-br ${categoryColors[service.category]} backdrop-blur-sm rounded-xl p-6 border transition-all duration-200 hover:scale-105`}
          >
            {service.isEditing ? (
              // Edit Mode
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleUpdateService(service.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Precio</label>
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => handleUpdateService(service.id, 'price', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Duración</label>
                    <input
                      type="number"
                      value={service.duration}
                      onChange={(e) => handleUpdateService(service.id, 'duration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => handleUpdateService(service.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveService(service.id)}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={() => handleCancelEdit(service.id)}
                    className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-5 h-5 text-white/70" />
                    <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
                      {categoryLabels[service.category]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className={`w-4 h-4 ${priorityColors[service.priority]}`} />
                    <span className={`text-xs font-medium ${priorityColors[service.priority]}`}>
                      {priorityLabels[service.priority]}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">{formatPrice(service.price)}</span>
                    </div>
                    {service.canApplyDiscount && (
                      <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                        Descuento
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">{formatDuration(service.duration)}</span>
                    <span className="text-gray-400 text-sm">(+{service.marginTime}min margen)</span>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-2">
                  <button
                    onClick={() => handleEditService(service.id)}
                    className="flex items-center space-x-1 bg-blue-600/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-600/30 transition-colors text-sm flex-1 justify-center"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="flex items-center space-x-1 bg-red-600/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <h3 className="text-xl font-bold text-white mb-4">Resumen de Servicios</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{services.length}</p>
            <p className="text-gray-400 text-sm">Total Servicios</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {formatPrice(Math.min(...services.map(s => s.price)))}
            </p>
            <p className="text-gray-400 text-sm">Precio Mínimo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {formatPrice(Math.max(...services.map(s => s.price)))}
            </p>
            <p className="text-gray-400 text-sm">Precio Máximo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">
              {formatDuration(Math.round(services.reduce((acc, s) => acc + s.duration, 0) / services.length))}
            </p>
            <p className="text-gray-400 text-sm">Duración Promedio</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GestionServiciosYerko