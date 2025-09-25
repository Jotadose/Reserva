'use client'

import { Button } from '@/components/ui/button'
import { useTenant } from '@/hooks/use-tenant'
import { Calendar, Scissors } from 'lucide-react'
import Link from 'next/link'

export default function TenantLandingPage() {
  const { tenant, isLoading, error } = useTenant()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Cargando...</h2>
          <p className="text-purple-200">Preparando tu barbería</p>
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
          <h2 className="text-xl font-semibold text-white mb-2">Barbería no encontrada</h2>
          <p className="text-red-200 mb-4">
            No pudimos encontrar la barbería que buscas.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Ir al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-8">
            <Scissors className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold mb-6">
            Bienvenido a <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {tenant.name || 'Barbería'}
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experiencia profesional en barbería con técnicas modernas y atención personalizada.
          </p>

          <Link href={`/${tenant.slug}/book`}>
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg">
              <Calendar className="w-5 h-5 mr-2" />
              Reservar Ahora
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}