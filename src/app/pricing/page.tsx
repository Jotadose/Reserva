'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Check, 
  Scissors, 
  Star, 
  Zap, 
  Shield, 
  Smartphone,
  Calendar,
  BarChart3,
  MessageSquare,
  Mail,
  Clock,
  Users
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  period: 'month' | 'year'
  currency: 'CLP' | 'USD'
  description: string
  features: string[]
  limitations?: string[]
  popular?: boolean
  recommended?: boolean
  color: string
  icon: React.ComponentType<any>
}

const plans: Plan[] = [
  {
    id: 'solo',
    name: 'Solo',
    price: 19000,
    period: 'month',
    currency: 'CLP',
    description: 'Para un barbero independiente que quiere dejar de confirmar manualmente.',
    features: [
      '1 barbero',
      '50 mensajes WhatsApp',
      'Nacional',
      'Agenda web + móvil',
      'Recordatorios básicos (1 etapa)',
      'Páginas integradas',
      'Reportes básicos',
      'Soporte email'
    ],
    color: 'from-gray-100 to-gray-200',
    icon: Scissors
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    price: 39000,
    period: 'month',
    currency: 'CLP',
    description: 'Activa reservas web y optimiza la agenda con automatización inteligente.',
    features: [
      'Hasta 3 barberos',
      '100 mensajes incluidos',
      'Nacional',
      'Recordatorios inteligentes multi-etapa',
      'Mensajes post-servicio (retención)',
      'Reportes de recurrencia',
      'Pagos integrados',
      'Soporte prioritario (WhatsApp)'
    ],
    popular: true,
    recommended: true,
    color: 'from-blue-500 to-blue-600',
    icon: BarChart3
  },
  {
    id: 'pro-multi',
    name: 'Pro Multi',
    price: 69000,
    period: 'month',
    currency: 'CLP',
    description: 'Escala y sucursales con control y campañas de reactivación.',
    features: [
      'Hasta 8 barberos',
      '200 mensajes',
      'Nacional',
      'Roles y permisos avanzados',
      'Campañas de reactivación',
      'Reportes avanzados (retención, gaps)',
      'API Lite',
      'Onboarding guiado'
    ],
    color: 'from-purple-500 to-purple-600',
    icon: Users
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 120000,
    period: 'month',
    currency: 'CLP',
    description: 'Para cadenas y franquicias que requieren marca propia y soporte dedicado.',
    features: [
      'Barberos ilimitados',
      'Mensajes volumen flexible',
      'Sucursales limitadas',
      'White label + dominio propio',
      'API completa + integraciones',
      'Soporte dedicado con SLA',
      'Capacitación equipos',
      'Consultoría de optimización'
    ],
    color: 'from-emerald-500 to-emerald-600',
    icon: Shield
  }
]

const addOns = [
  {
    id: 'whatsapp-50',
    name: 'Pack WhatsApp 50',
    description: '50 mensajes extra',
    price: 4000,
    currency: 'CLP'
  },
  {
    id: 'whatsapp-100',
    name: 'Pack WhatsApp 100', 
    description: '100 mensajes extra',
    price: 7500,
    currency: 'CLP'
  },
  {
    id: 'whatsapp-150',
    name: 'Pack WhatsApp 150',
    description: '300 mensajes extra',
    price: 10500,
    currency: 'CLP'
  },
  {
    id: 'sucursal-extra',
    name: 'Barbero extra',
    description: 'Sube el tope de tu plan',
    price: 15000,
    currency: 'CLP'
  },
  {
    id: 'white-label',
    name: 'White label',
    description: 'Marca propia (Plan Pro+)',
    price: 49000,
    currency: 'CLP'
  },
  {
    id: 'soporte-premium',
    name: 'Soporte Premium',
    description: 'SLA + hora extendido',
    price: 19000,
    currency: 'CLP'
  },
  {
    id: 'api-completa',
    name: 'API Completa',
    description: 'Endpoints avanzados',
    price: 29000,
    currency: 'CLP'
  }
]

const formatPrice = (price: number, currency: string = 'CLP') => {
  if (currency === 'CLP') {
    return `$${price.toLocaleString()}`
  }
  return `$${price}`
}

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('crecimiento')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId)
    setIsLoading(true)
    setError('')

    try {
      // Aquí iría la lógica para procesar el plan seleccionado
      // Por ahora redirigimos directamente al onboarding
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirigir al onboarding con el plan seleccionado
      router.push(`/onboarding?plan=${planId}`)
    } catch (error: any) {
      console.error('Error selecting plan:', error)
      setError('Error al seleccionar el plan. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Scissors className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Agendex</h1>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Planes simples. Escalas cuando creas{' '}
            <span className="text-blue-600">más valor</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Empieza gratis sin tarjeta. Reduce no-shows y llena tu agenda en minutos.
          </p>

          {/* Características principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Clock className="w-6 h-6 text-blue-600" />
              <span className="font-medium">15 min setup</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="font-medium">Sin tarjeta</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Calendar className="w-6 h-6 text-purple-600" />
              <span className="font-medium">Cancelas cuando quieras</span>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isSelected = selectedPlan === plan.id
            
            return (
              <Card 
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  plan.recommended ? 'ring-2 ring-blue-500 scale-105' : ''
                } ${isSelected ? 'ring-2 ring-blue-600 shadow-xl' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Plan recomendado
                    </Badge>
                  </div>
                )}
                
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-400 text-yellow-900">
                      <Star className="w-3 h-3 mr-1" />
                      Ideal para barberías en expansión
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price)}{' '}
                    <span className="text-sm font-normal text-gray-500">
                      {plan.currency}/{plan.period === 'month' ? 'mes' : 'año'}
                    </span>
                  </div>
                  <CardDescription className="text-sm mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlanSelect(plan.id)
                    }}
                    className={`w-full ${
                      plan.recommended 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    disabled={isLoading && selectedPlan === plan.id}
                  >
                    {isLoading && selectedPlan === plan.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      plan.id === 'solo' ? 'Empezar gratis' : 'Escalar ahora'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Add-ons para escalar */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Add-ons para escalar
            </h3>
            <p className="text-gray-600">
              Solo pagas por lo que realmente usas. Amplia mensajes, equipo o capacidad cuando tu barbería crece
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {addOns.map((addon) => (
              <Card key={addon.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{addon.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{addon.description}</p>
                  <div className="text-lg font-bold text-blue-600">
                    {formatPrice(addon.price, addon.currency)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Garantía de satisfacción */}
        <div className="text-center mt-16">
          <div className="max-w-2xl mx-auto bg-green-50 rounded-2xl p-8">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Garantía de satisfacción del 100%
            </h3>
            <p className="text-green-700">
              Si automatizas tus procesos en nuestros primeros 90%, te devolvemos el 100% de tu dinero sin preguntas. No tienes nada que perder, excepto los no-shows.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <div className="text-center">
              <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold">WhatsApp Gratis</h4>
              <p className="text-sm text-gray-600">Hasta 50 notificaciones de bienvenida</p>
            </div>
            
            <div className="text-center">
              <Smartphone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold">Mensajes Gratis</h4>
              <p className="text-sm text-gray-600">Hasta conseguir cientos activos</p>
            </div>
            
            <div className="text-center">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold">Mega Plus</h4>
              <p className="text-sm text-gray-600">Ilimitado en tu barbería estés donde estés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}