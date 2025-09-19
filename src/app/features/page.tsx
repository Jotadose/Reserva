'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Scissors, 
  Calendar, 
  Smartphone, 
  BarChart3, 
  Users,
  MessageCircle,
  CreditCard,
  Globe,
  Star,
  Check,
  ArrowRight,
  TrendingUp
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Sistema de Reservas 24/7',
    description: 'Tus clientes pueden reservar cualquier hora del día desde cualquier dispositivo',
    benefits: ['Reservas automáticas', 'Confirmaciones por SMS/Email', 'Recordatorios automáticos', 'Cancelaciones fáciles']
  },
  {
    icon: Smartphone,
    title: 'Landing Page Profesional',
    description: 'Tu propia página web optimizada para búsquedas de Google',
    benefits: ['Diseño responsivo', 'SEO optimizado', 'Galería de trabajos', 'Información de contacto']
  },
  {
    icon: BarChart3,
    title: 'Reportes y Analytics',
    description: 'Analiza tu negocio con datos en tiempo real',
    benefits: ['Ingresos por período', 'Servicios más populares', 'Horas de mayor demanda', 'Satisfacción del cliente']
  },
  {
    icon: MessageCircle,
    title: 'Comunicación Automática',
    description: 'Mantén informados a tus clientes sin esfuerzo',
    benefits: ['Notificaciones WhatsApp', 'Recordatorios SMS', 'Emails automáticos', 'Chat en tiempo real']
  },
  {
    icon: CreditCard,
    title: 'Pagos Digitales',
    description: 'Acepta pagos en línea y simplifica tu flujo de caja',
    benefits: ['Múltiples métodos de pago', 'Facturación automática', 'Control de inventario', 'Reportes financieros']
  },
  {
    icon: Users,
    title: 'Gestión de Cliente',
    description: 'Base de datos completa de todos tus clientes',
    benefits: ['Historial de servicios', 'Preferencias personales', 'Notas importantes', 'Programas de fidelidad']
  }
]

const testimonials = [
  {
    name: 'Carlos Mendoza',
    business: 'Barbería El Corte Perfecto',
    image: '/api/placeholder/100/100',
    rating: 5,
    text: 'Desde que uso Agendex he aumentado mis reservas un 300%. Mis clientes aman la facilidad de reservar online.',
    results: '+300% reservas'
  },
  {
    name: 'María González',
    business: 'Salón Bella Vista',
    image: '/api/placeholder/100/100',
    rating: 5,
    text: 'La página web que me creó Agendex me ha traído muchos clientes nuevos. Ahora aparezco en Google cuando buscan salones.',
    results: '+150% clientes nuevos'
  },
  {
    name: 'Andrés Vargas',
    business: 'Estudio de Barbería',
    image: '/api/placeholder/100/100',
    rating: 5,
    text: 'Los reportes me ayudan a entender mi negocio mejor. Ahora sé cuáles son mis horas pico y servicios más rentables.',
    results: '+40% ingresos'
  }
]

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Gratis',
    description: 'Perfecto para comenzar',
    features: [
      'Hasta 50 reservas/mes',
      'Landing page básica',
      'Recordatorios por email',
      'Soporte por chat',
      '1 barbero/empleado'
    ],
    cta: 'Comenzar Gratis',
    popular: false
  },
  {
    name: 'Professional',
    price: '$29.900',
    period: '/mes',
    description: 'Para barberos establecidos',
    features: [
      'Reservas ilimitadas',
      'Landing page premium',
      'WhatsApp + SMS + Email',
      'Reportes avanzados',
      'Hasta 3 barberos',
      'Pagos online',
      'Soporte prioritario'
    ],
    cta: 'Probar 30 días gratis',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$59.900',
    period: '/mes',
    description: 'Para cadenas de barberías',
    features: [
      'Todo lo de Professional',
      'Múltiples ubicaciones',
      'Barberos ilimitados',
      'API personalizada',
      'Integración POS',
      'Soporte telefónico 24/7',
      'Entrenamiento personalizado'
    ],
    cta: 'Contactar Ventas',
    popular: false
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-6">
              Características Completas
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Todo lo que necesitas para hacer crecer tu barbería
            </h1>
            
            <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed mb-8">
              Desde reservas automáticas hasta reportes avanzados, Agendex tiene todas las herramientas para modernizar tu negocio
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8">
                  <Globe className="w-5 h-5 mr-2" />
                  Ver Demo Interactivo
                </Button>
              </Link>
              
              <Link href="/register">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8">
                  Empezar Gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades que transforman tu negocio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada característica está diseñada para ahorrarte tiempo y aumentar tus ingresos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Resultados que hablan por sí solos
            </h2>
            <p className="text-xl text-blue-100">
              Barberos reales, resultados reales con Agendex
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-4xl lg:text-5xl font-bold">2,500+</div>
              <div className="text-blue-100">Barberos Activos</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl lg:text-5xl font-bold">150k+</div>
              <div className="text-blue-100">Reservas Mensuales</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl lg:text-5xl font-bold">4.9/5</div>
              <div className="text-blue-100">Satisfacción Cliente</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl lg:text-5xl font-bold">35%</div>
              <div className="text-blue-100">Aumento Promedio Ingresos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros barberos
            </h2>
            <p className="text-xl text-gray-600">
              Historias reales de éxito de barberos como tú
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.business}</CardDescription>
                      <div className="flex mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                  <Badge className="bg-green-100 text-green-800">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {testimonial.results}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Planes que se adaptan a tu negocio
            </h2>
            <p className="text-xl text-gray-600">
              Desde empezar gratis hasta escalar tu cadena de barberías
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-6 py-1">
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {plan.description}
                  </CardDescription>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-gray-900">
                      {plan.price}
                      {plan.period && <span className="text-lg text-gray-600">{plan.period}</span>}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/register">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              ¿Necesitas algo más específico?
            </p>
            <Button variant="outline" size="lg">
              Hablar con Ventas
              <MessageCircle className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              ¿Listo para modernizar tu barbería?
            </h2>
            
            <p className="text-xl text-blue-100">
              Únete a más de 2,500 barberos que ya están aumentando sus ingresos con Agendex
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8">
                  Empezar Gratis Hoy
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link href="/demo">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8">
                  Ver Demo
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-blue-200">
              Sin compromisos • Cancelación en cualquier momento • Soporte 24/7
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Agendex</span>
              </div>
              <p className="text-gray-400">
                La plataforma de reservas más completa para barberos profesionales en Colombia.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Producto</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="hover:text-white transition-colors">Características</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Precios</Link></li>
                <li><Link href="/integration" className="hover:text-white transition-colors">Integraciones</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white transition-colors">Acerca de</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Ayuda</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Seguridad</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Agendex. Todos los derechos reservados. Hecho con ❤️ en Colombia.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}