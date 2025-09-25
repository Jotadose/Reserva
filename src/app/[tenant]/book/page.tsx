'use client'

import { Button } from '@/components/ui/button'
import { useTenant } from '@/hooks/use-tenant'
import { Scissors, ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function BookingPage() {
  const { tenant, isLoading, error } = useTenant()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Cargando reservas...</h2>
          <p className="text-purple-200">Preparando tu sistema de reservas</p>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error al cargar</h2>
          <p className="text-red-200 mb-4">
            No pudimos cargar el sistema de reservas.
          </p>
          <Link href={`/${tenant?.slug || 'home'}`}>
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/${tenant.slug}`}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">{tenant.name}</h1>
                  <p className="text-sm text-gray-300">Sistema de Reservas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Booking Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Reserva tu Cita en {tenant.name}
            </h2>
            <p className="text-gray-300 text-lg">
              Selecciona tu servicio preferido y agenda tu cita de forma rápida y sencilla
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-4">Sistema de Reservas</h3>
              <p className="text-gray-300 mb-6">
                El wizard de reservas estará disponible próximamente. 
                Por ahora, puedes contactarnos directamente.
              </p>
              
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  onClick={() => window.open(`https://wa.me/56900000000`, '_blank')}
                >
                  Reservar por WhatsApp
                </Button>
                
                <Link href={`/${tenant.slug}`}>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    Volver a la página principal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}