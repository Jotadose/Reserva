'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Users, Scissors, TrendingUp, Clock, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DashboardStats {
  totalBookings: number
  totalProviders: number
  totalServices: number
  monthlyRevenue: number
  todayBookings: number
  pendingBookings: number
}

export default function DashboardPage() {
  const params = useParams()
  const tenantSlug = params.tenant as string
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalProviders: 0,
    totalServices: 0,
    monthlyRevenue: 0,
    todayBookings: 0,
    pendingBookings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Implementar carga real de estadísticas desde Supabase
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Simulación de datos por ahora
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
          totalBookings: 156,
          totalProviders: 4,
          totalServices: 8,
          monthlyRevenue: 2450000, // en centavos
          todayBookings: 12,
          pendingBookings: 3
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [tenantSlug])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen general de tu barbería {tenantSlug}
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProviders}</div>
            <p className="text-xs text-muted-foreground">
              Barberos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">
              Servicios disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +8% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actividad del día */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Actividad de Hoy
            </CardTitle>
            <CardDescription>
              Resumen de las reservas de hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reservas de hoy</span>
                <Badge variant="secondary">{stats.todayBookings}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pendientes de confirmación</span>
                <Badge variant="outline">{stats.pendingBookings}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completadas</span>
                <Badge variant="default">{stats.todayBookings - stats.pendingBookings}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Rendimiento
            </CardTitle>
            <CardDescription>
              Métricas de rendimiento del negocio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tasa de ocupación</span>
                <Badge variant="secondary">78%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Satisfacción del cliente</span>
                <Badge variant="default">4.8/5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tiempo promedio de servicio</span>
                <Badge variant="outline">45 min</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Calendar className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium">Nueva Reserva</h3>
              <p className="text-sm text-gray-600">Crear una reserva manual</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium">Gestionar Proveedores</h3>
              <p className="text-sm text-gray-600">Administrar tu equipo</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Scissors className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium">Configurar Servicios</h3>
              <p className="text-sm text-gray-600">Actualizar precios y servicios</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}