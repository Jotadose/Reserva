'use client'

import Link from 'next/link'
import { Calendar, Scissors, Users, Zap, ArrowRight, CheckCircle, Star, Globe, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const features = [
    {
      icon: Calendar,
      title: 'Gestión de Citas',
      description: 'Sistema inteligente de reservas con disponibilidad en tiempo real'
    },
    {
      icon: Scissors,
      title: 'Servicios Personalizados',
      description: 'Define tus servicios, precios y duración de manera flexible'
    },
    {
      icon: Users,
      title: 'Gestión de Clientes',
      description: 'Base de datos completa con historial y preferencias'
    },
    {
      icon: Zap,
      title: 'Automatización',
      description: 'Notificaciones automáticas y recordatorios por WhatsApp'
    }
  ]

  const testimonials = [
    {
      name: 'Carlos Mendoza',
      business: 'Barbería El Corte',
      text: 'Agendex transformó mi negocio. Ahora tengo control total de mis citas y mis clientes están más satisfechos.',
      rating: 5
    },
    {
      name: 'María González',
      business: 'Salón Elegancia',
      text: 'La mejor inversión que he hecho. El sistema es súper fácil de usar y mis ventas aumentaron 40%.',
      rating: 5
    }
  ]

  const pricing = [
    {
      name: 'Gratis',
      price: '$0',
      period: '/mes',
      description: 'Perfecto para empezar',
      features: [
        'Hasta 100 citas/mes',
        'Dashboard básico',
        'Soporte por email',
        'Landing page personalizada'
      ],
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/mes',
      description: 'Para barberías en crecimiento',
      features: [
        'Citas ilimitadas',
        'Dashboard avanzado',
        'Notificaciones WhatsApp',
        'Reportes y analytics',
        'Soporte prioritario',
        'Integración con POS'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/mes',
      description: 'Para cadenas de barberías',
      features: [
        'Multi-ubicación',
        'API personalizada',
        'Manager dedicado',
        'Entrenamiento personalizado',
        'SLA garantizado'
      ],
      highlighted: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Agendex</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Características</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonios</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Precios</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Crear Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Lanzamiento Octubre 2025
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            El Sistema de Reservas
            <span className="text-blue-600 block">Más Inteligente</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transforma tu barbería con Agendex. Gestiona citas, clientes y servicios 
            desde una plataforma moderna y fácil de usar. <strong>¡100% gratis para empezar!</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                Crear Mi Barbería Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Ver Demo
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">100+</div>
              <div className="text-gray-600">Barberías Registradas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">50K+</div>
              <div className="text-gray-600">Citas Gestionadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">99%</div>
              <div className="text-gray-600">Satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para hacer crecer tu barbería
            </h2>
            <p className="text-xl text-gray-600">
              Una plataforma completa diseñada específicamente para barberos profesionales
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros barberos
            </h2>
            <p className="text-xl text-gray-600">
              Más de 100 barberos confían en Agendex para hacer crecer su negocio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-lg text-gray-700 italic">
                    "{testimonial.text}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-blue-600">{testimonial.business}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Precios simples y transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Comienza gratis y escala según tu negocio crezca
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => (
              <Card key={index} className={`relative ${plan.highlighted ? 'border-blue-500 border-2 shadow-xl scale-105' : 'border-gray-200'}`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-gray-900 mt-4">
                    {plan.price}<span className="text-lg text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block">
                    <Button 
                      className={`w-full mt-6 ${plan.highlighted 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      size="lg"
                    >
                      Empezar Ahora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Listo para transformar tu barbería?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a más de 100 barberos que ya confían en Agendex para gestionar su negocio
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
              Crear Mi Cuenta Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Explora todo lo que Agendex puede hacer por ti
            </h2>
            <p className="text-gray-600">
              Descubre cada funcionalidad con nuestros demos interactivos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/demo" className="group">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                    <Globe className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    Demo Interactivo
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ve cómo se ve tu barbería real en Agendex
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/features" className="group">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                    <Zap className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    Todas las Funciones
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Descubre cada herramienta en detalle
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/onboarding" className="group">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                    <Rocket className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    Configuración Guiada
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Prueba el proceso completo de setup
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Agendex</span>
              </div>
              <p className="text-gray-400">
                El sistema de reservas más inteligente para barberos profesionales.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2">
                <li><a href="/help" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="/api" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="hover:text-white transition-colors">Acerca de</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Agendex. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
