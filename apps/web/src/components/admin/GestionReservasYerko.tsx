import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download
} from 'lucide-react'

import { useReservasMVP } from '../../hooks/useReservasMVP'
import { YERKO_SERVICES } from '../../data/yerkoServices'

interface Reserva {
  id: string
  clienteNombre: string
  clienteEmail: string
  clienteTelefono: string
  servicioId: string
  fecha: string
  hora: string
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
  notas?: string
  createdAt: string
}

export const GestionReservasYerko: React.FC = () => {
  const { reservas, loading } = useReservasMVP()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todas')
  const [dateFilter, setDateFilter] = useState<string>('todas')
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const statusColors = {
    pendiente: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    confirmada: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
    completada: 'bg-green-600/20 text-green-400 border-green-500/30',
    cancelada: 'bg-red-600/20 text-red-400 border-red-500/30'
  }

  const statusLabels = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    completada: 'Completada',
    cancelada: 'Cancelada'
  }

  const statusIcons = {
    pendiente: AlertCircle,
    confirmada: CheckCircle,
    completada: CheckCircle,
    cancelada: XCircle
  }

  // Filtrar reservas
  const filteredReservas = useMemo(() => {
    let filtered = reservas

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(reserva => 
        reserva.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reserva.clienteEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reserva.clienteTelefono.includes(searchTerm)
      )
    }

    // Filtro por estado
    if (statusFilter !== 'todas') {
      filtered = filtered.filter(reserva => reserva.estado === statusFilter)
    }

    // Filtro por fecha
    if (dateFilter !== 'todas') {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      switch (dateFilter) {
        case 'hoy':
          filtered = filtered.filter(reserva => reserva.fecha === todayStr)
          break
        case 'semana':
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          filtered = filtered.filter(reserva => {
            const reservaDate = new Date(reserva.fecha)
            return reservaDate >= weekStart && reservaDate <= weekEnd
          })
          break
        case 'mes':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
          filtered = filtered.filter(reserva => {
            const reservaDate = new Date(reserva.fecha)
            return reservaDate >= monthStart && reservaDate <= monthEnd
          })
          break
      }
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.fecha} ${a.hora}`)
      const dateB = new Date(`${b.fecha} ${b.hora}`)
      return dateB.getTime() - dateA.getTime()
    })
  }, [reservas, searchTerm, statusFilter, dateFilter])

  const getServiceName = (servicioId: string) => {
    const service = YERKO_SERVICES.find(s => s.id === servicioId)
    return service?.name || 'Servicio no encontrado'
  }

  const getServicePrice = (servicioId: string) => {
    const service = YERKO_SERVICES.find(s => s.id === servicioId)
    return service?.price || 0
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5) // HH:MM
  }

  const handleStatusChange = (reservaId: string, newStatus: string) => {
    // Aquí se actualizaría el estado en la base de datos
    console.log(`Cambiando estado de reserva ${reservaId} a ${newStatus}`)
  }

  const handleViewDetails = (reserva: Reserva) => {
    setSelectedReserva(reserva)
    setShowDetails(true)
  }

  const exportReservas = () => {
    // Implementar exportación a CSV/Excel
    console.log('Exportando reservas...')
  }

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const thisWeek = reservas.filter(r => {
      const reservaDate = new Date(r.fecha)
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      return reservaDate >= weekStart
    })

    return {
      total: reservas.length,
      hoy: reservas.filter(r => r.fecha === today).length,
      semana: thisWeek.length,
      pendientes: reservas.filter(r => r.estado === 'pendiente').length,
      confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
      completadas: reservas.filter(r => r.estado === 'completada').length,
      ingresosSemana: thisWeek
        .filter(r => r.estado === 'completada')
        .reduce((total, r) => total + getServicePrice(r.servicioId), 0)
    }
  }, [reservas])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Reservas</h2>
          <p className="text-gray-400 mt-1">Administra las citas de Barbería Yerko</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportReservas}
            className="flex items-center space-x-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-600/30 transition-colors border border-green-500/30"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Reservas Hoy</p>
              <p className="text-2xl font-bold text-white">{stats.hoy}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Esta Semana</p>
              <p className="text-2xl font-bold text-white">{stats.semana}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-white">{stats.pendientes}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-lg p-4 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Ingresos Semana</p>
              <p className="text-2xl font-bold text-white">{formatPrice(stats.ingresosSemana)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="todas">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="todas">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
          </select>
          
          <div className="text-sm text-gray-400 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            {filteredReservas.length} de {reservas.length} reservas
          </div>
        </div>
      </div>

      {/* Reservas List */}
      <div className="space-y-4">
        {filteredReservas.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay reservas</h3>
            <p className="text-gray-500">No se encontraron reservas con los filtros aplicados.</p>
          </div>
        ) : (
          filteredReservas.map((reserva) => {
            const StatusIcon = statusIcons[reserva.estado]
            
            return (
              <div
                key={reserva.id}
                className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white">{reserva.clienteNombre}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{reserva.clienteEmail}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{reserva.clienteTelefono}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-white font-medium">{getServiceName(reserva.servicioId)}</p>
                      <p className="text-green-400 font-semibold">{formatPrice(getServicePrice(reserva.servicioId))}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-white font-medium">{formatDate(reserva.fecha)}</p>
                      <p className="text-blue-400 font-semibold">{formatTime(reserva.hora)}</p>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full border text-sm font-medium ${statusColors[reserva.estado]}`}>
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusLabels[reserva.estado]}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(reserva)}
                        className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {reserva.notas && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">Notas:</span> {reserva.notas}
                    </p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedReserva && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl mx-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalles de la Reserva</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Cliente</label>
                  <p className="text-white font-semibold">{selectedReserva.clienteNombre}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
                  <select
                    value={selectedReserva.estado}
                    onChange={(e) => handleStatusChange(selectedReserva.id, e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fecha</label>
                  <p className="text-white">{formatDate(selectedReserva.fecha)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Hora</label>
                  <p className="text-white">{formatTime(selectedReserva.hora)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Servicio</label>
                <p className="text-white">{getServiceName(selectedReserva.servicioId)}</p>
                <p className="text-green-400 font-semibold">{formatPrice(getServicePrice(selectedReserva.servicioId))}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <p className="text-white">{selectedReserva.clienteEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
                  <p className="text-white">{selectedReserva.clienteTelefono}</p>
                </div>
              </div>
              
              {selectedReserva.notas && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Notas</label>
                  <p className="text-white bg-white/5 p-3 rounded-lg">{selectedReserva.notas}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Guardar Cambios
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionReservasYerko