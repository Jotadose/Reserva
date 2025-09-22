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
      name: 'Solo',
      price: '$0',
      period: '/mes',
      description: 'Perfecto para barberos independientes',
      features: [
        'Hasta 100 citas/mes',
        '1 barbero',
        'Dashboard básico',
        'Booking widget público',
        'Soporte por email'
      ],
      highlighted: false
    },
    {
      name: 'Crecimiento',
      price: '$29',
      period: '/mes',
      description: 'Para barberías en expansión',
      features: [
        'Citas ilimitadas',
        'Hasta 5 barberos',
        'Dashboard avanzado',
        'Notificaciones WhatsApp',
        'Reportes y analytics',
        'Soporte prioritario'
      ],
      highlighted: true
    },
    {
      name: 'Pro Multi',
      price: '$79',
      period: '/mes',
      description: 'Para múltiples ubicaciones',
      features: [
        'Todo de Crecimiento',
        'Barberos ilimitados',
        'Multi-ubicación',
        'API personalizada',
        'Manager dedicado',
        'White label disponible'
      ],
      highlighted: false
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Para franquicias y cadenas',
      features: [
        'Solución completamente personalizada',
        'Integración ERP/CRM',
        'SLA garantizado 99.9%',
        'Soporte 24/7',
        'Entrenamiento on-site',
        'Desarrollo de features exclusivos'
      ],
      highlighted: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Agendex</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">Características</a>
            <a href="#testimonials" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">Testimonios</a>
            <a href="#pricing" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">Precios</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-orange-400 hover:bg-gray-800 border-gray-600">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg">
                Ver Planes
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-orange-500/30 backdrop-blur-sm">
            <Zap className="w-4 h-4 mr-2" />
            MVP Listo - 100 Barberías Esperando
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              El Sistema de Reservas
            </span>
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent block mt-2">
              Más Inteligente
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
            Transforma tu barbería con <strong className="text-orange-400">Agendex</strong>. 
            Gestiona citas, clientes y servicios desde una plataforma moderna, elegante y poderosa. 
            <span className="text-orange-400 font-semibold">¡Plan Solo 100% gratis para siempre!</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link href="/pricing">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg px-10 py-4 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-200">
                Crear Mi Barbería Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-lg px-10 py-4 border-gray-600 text-gray-200 hover:bg-gray-800 hover:border-orange-400 hover:text-orange-400 transition-all duration-200">
                Ver Demo en Vivo
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">100+</div>
              <div className="text-gray-400 mt-2">Barberías en Lista de Espera</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">50K+</div>
              <div className="text-gray-400 mt-2">Citas Proyectadas Q1</div>
            </div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">24/7</div>
              <div className="text-gray-400 mt-2">Disponibilidad del Sistema</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Todo lo que necesitas para hacer crecer tu barbería
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Una plataforma completa diseñada específicamente para barberos profesionales que buscan excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 border-gray-700 bg-gradient-to-br from-gray-800/50 to-slate-900/50 backdrop-blur-sm hover:scale-105 group">
                <CardHeader>
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all duration-300 border border-orange-500/30">
                    <feature.icon className="w-10 h-10 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl text-gray-100 group-hover:text-orange-300 transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
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
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Precios transparentes, sin sorpresas
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comienza gratis y escala según tu negocio crezca. Todos los planes incluyen soporte premium.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricing.map((plan, index) => (
              <Card key={index} className={`relative ${
                plan.highlighted 
                  ? 'border-2 border-orange-500 shadow-2xl shadow-orange-500/20 scale-105 z-10' 
                  : 'border border-gray-700'
              } bg-gradient-to-br from-gray-800/80 to-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                      🔥 Más Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl text-gray-100 mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    {plan.price === 'Custom' ? (
                      <div className="text-3xl font-bold text-orange-400">Contactar</div>
                    ) : (
                      <div className="text-4xl font-bold text-gray-100">
                        {plan.price}
                        <span className="text-lg text-gray-400 font-normal">{plan.period}</span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-orange-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/pricing" className="block">
                    <Button 
                      className={`w-full ${
                        plan.highlighted 
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      } transition-all duration-200`}
                      size="lg"
                    >
                      {plan.name === 'Solo' ? '🚀 Empezar Gratis' : 
                       plan.name === 'Enterprise' ? '📞 Contactar Ventas' : 
                       `🎯 Seleccionar ${plan.name}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 via-red-600 to-orange-500 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para revolucionar tu barbería?
          </h2>
          <p className="text-xl text-orange-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Únete a las <strong>100 barberías</strong> que ya están en lista de espera para transformar 
            su negocio con la plataforma más moderna del mercado
          </p>
          <Link href="/pricing">
            <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-10 py-4 shadow-2xl transform hover:scale-105 transition-all duration-200 font-semibold">
              🚀 Crear Mi Barbería Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <div className="mt-12 text-orange-200">
            <p className="text-sm">✅ Sin tarjeta de crédito • ✅ Setup en 5 minutos • ✅ Soporte 24/7</p>
          </div>
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
      <footer className="bg-black text-gray-300 py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Agendex</span>
              </div>
              <p className="text-gray-400 mb-4">
                El sistema de reservas más inteligente para barberos que buscan excelencia.
              </p>
              <p className="text-sm text-gray-500">
                🚀 MVP listo para 100 barberías
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-orange-400 transition-colors duration-200">Características</a></li>
                <li><a href="#pricing" className="hover:text-orange-400 transition-colors duration-200">Precios</a></li>
                <li><a href="/demo" className="hover:text-orange-400 transition-colors duration-200">Demo</a></li>
                <li><a href="/onboarding" className="hover:text-orange-400 transition-colors duration-200">Crear Barbería</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2">
                <li><a href="/help" className="hover:text-orange-400 transition-colors duration-200">Centro de Ayuda</a></li>
                <li><a href="/contact" className="hover:text-orange-400 transition-colors duration-200">Contacto</a></li>
                <li><a href="/api" className="hover:text-orange-400 transition-colors duration-200">API Docs</a></li>
                <li><a href="/status" className="hover:text-orange-400 transition-colors duration-200">Estado del Sistema</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="hover:text-orange-400 transition-colors duration-200">Acerca de</a></li>
                <li><a href="/blog" className="hover:text-orange-400 transition-colors duration-200">Blog</a></li>
                <li><a href="/careers" className="hover:text-orange-400 transition-colors duration-200">Carreras</a></li>
                <li><a href="/press" className="hover:text-orange-400 transition-colors duration-200">Prensa</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 Agendex. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Privacidad</a>
              <a href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Términos</a>
              <a href="/cookies" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
