'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MockupStatsCard, InteractiveBookingWidget, TestimonialCarousel } from '@/components/demo'
import { 
  Scissors, 
  Calendar, 
  MapPin, 
  Phone, 
  Clock, 
  Star,
  Users,
  ArrowRight,
  Instagram,
  MessageCircle,
  Sparkles,
  Zap,
  Target
} from 'lucide-react'

// Demo data
const demoBarbershop = {
  id: 'demo',
  slug: 'barberia-demo',
  name: 'Barbería El Corte Perfecto',
  description: 'Más de 15 años ofreciendo servicios profesionales de barbería con un toque moderno. Especialistas en cortes clásicos y tendencias actuales.',
  contact_phone: '+57 300 123 4567',
  contact_email: 'contacto@elcorteperfecto.com',
  address: 'Calle 85 #15-25, Chapinero, Bogotá',
  instagram: 'elcorteperfecto',
  whatsapp: '573001234567',
  working_hours: {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '19:00' },
    saturday: { open: '08:00', close: '17:00' },
    sunday: { closed: true }
  }
}

const demoServices = [
  {
    id: '1',
    name: 'Corte Clásico',
    description: 'Corte tradicional con tijera y máquina, incluye lavado y peinado',
    duration_minutes: 30,
    price: 25000,
    is_active: true
  },
  {
    id: '2',
    name: 'Corte + Barba',
    description: 'Corte completo más arreglo de barba con navaja y productos premium',
    duration_minutes: 45,
    price: 35000,
    is_active: true
  },
  {
    id: '3',
    name: 'Afeitado Clásico',
    description: 'Afeitado tradicional con navaja, toallas calientes y productos artesanales',
    duration_minutes: 25,
    price: 20000,
    is_active: true
  },
  {
    id: '4',
    name: 'Tratamiento Capilar',
    description: 'Tratamiento nutritivo para el cabello con masaje relajante',
    duration_minutes: 40,
    price: 30000,
    is_active: true
  }
]

const demoTeam = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    role: 'owner',
    experience: '15 años',
    specialty: 'Cortes clásicos y barba'
  },
  {
    id: '2',
    name: 'Miguel Ángel',
    role: 'barber',
    experience: '8 años',
    specialty: 'Tendencias modernas'
  },
  {
    id: '3',
    name: 'Andrés Vargas',
    role: 'barber',
    experience: '5 años',
    specialty: 'Afeitado clásico'
  }
]

export default function DemoPage() {
  const [showBookingModal, setShowBookingModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Demo Banner */}
      <div className="bg-blue-600 text-white py-3">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">
              DEMO
            </Badge>
            <span className="text-sm">
              Esta es una demostración de cómo se ve una barbería en Agendex
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Scissors className="w-7 h-7 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Demo Interactivo
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {demoBarbershop.name}
              </h1>
              
              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                {demoBarbershop.description}
              </p>
              
              <div className="flex flex-wrap gap-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{demoTeam.length} Barberos Profesionales</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Scissors className="w-5 h-5" />
                  <span>{demoServices.length} Servicios</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Desde 25 min</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8"
                  onClick={() => setShowBookingModal(true)}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Reservar Ahora (Demo)
                </Button>
                
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="lg:flex justify-end hidden">
              <Card className="w-full max-w-md shadow-2xl border-0">
                <CardHeader className="text-center">
                  <CardTitle className="text-gray-900">¿Por qué elegirnos?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-blue-600">
                      <div className="flex justify-center">
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                      </div>
                    </div>
                    <div className="text-gray-600">Excelente Calidad</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-blue-600">500+</div>
                      <div className="text-sm text-gray-600">Clientes Satisfechos</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-blue-600">15</div>
                      <div className="text-sm text-gray-600">Años de Experiencia</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Components Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full animate-float"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg text-sm">
                <Zap className="w-3 h-3 mr-1" />
                Componentes Interactivos
              </Badge>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
              Experiencia Visual Impresionante
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre cómo Agendex transforma tu negocio con componentes visuales modernos, 
              interactivos y optimizados para convertir visitantes en clientes satisfechos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Feature highlights */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Métricas en Tiempo Real</h3>
              <p className="text-gray-600">Dashboard con estadísticas animadas que se actualizan automáticamente</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Reservas Inteligentes</h3>
              <p className="text-gray-600">Sistema de reservas paso a paso con validación intuitiva</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Testimonios Dinámicos</h3>
              <p className="text-gray-600">Carrusel automático de reseñas verificadas de clientes reales</p>
            </div>
          </div>

          {/* Interactive Demo Components */}
          <div className="space-y-16">
            {/* Stats Dashboard Demo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800 border-0">
                    <Target className="w-3 h-3 mr-1" />
                    Componente 1
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  Dashboard de Métricas Animado
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Visualiza el crecimiento de tu barbería con métricas que cobran vida. 
                  Estadísticas animadas que muestran clientes activos, ingresos mensuales, 
                  calificaciones y tendencias en tiempo real.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Animaciones CSS</Badge>
                  <Badge variant="secondary">Glass Morphism</Badge>
                  <Badge variant="secondary">Gradientes</Badge>
                  <Badge variant="secondary">Responsive</Badge>
                </div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300">
                <MockupStatsCard />
              </div>
            </div>

            {/* Interactive Booking Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 transform hover:scale-105 transition-transform duration-300">
                <InteractiveBookingWidget />
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-800 border-0">
                    <Calendar className="w-3 h-3 mr-1" />
                    Componente 2
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  Widget de Reservas Interactivo
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Sistema de reservas paso a paso que guía a tus clientes de forma intuitiva. 
                  Selección de servicios, barberos, horarios y confirmación con validación 
                  en tiempo real y animaciones fluidas.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Multi-step Form</Badge>
                  <Badge variant="secondary">Validación Real-time</Badge>
                  <Badge variant="secondary">Animaciones Suaves</Badge>
                  <Badge variant="secondary">UX Optimizado</Badge>
                </div>
              </div>
            </div>

            {/* Testimonial Carousel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800 border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Componente 3
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  Carrusel de Testimonios Dinámico
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Muestra las reseñas de tus clientes de forma elegante y automatizada. 
                  Carrusel con auto-play, controles manuales, verificación de usuarios 
                  y diseño que genera confianza y credibilidad.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Auto-play Inteligente</Badge>
                  <Badge variant="secondary">Social Proof</Badge>
                  <Badge variant="secondary">Usuarios Verificados</Badge>
                  <Badge variant="secondary">Controles Táctiles</Badge>
                </div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300">
                <TestimonialCarousel />
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">
                ¿Te imaginas tu barbería con estos componentes?
              </h3>
              <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                Todos estos elementos visuales y más están incluidos en Agendex. 
                Crea tu cuenta gratuita y comienza a impresionar a tus clientes hoy mismo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Crear Mi Barbería Gratis
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Ver Más Demos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Servicios profesionales con los mejores productos y técnicas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer group border-0 shadow-md">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scissors className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </CardTitle>
                  <div className="text-2xl font-bold text-blue-600">
                    ${service.price.toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowBookingModal(true)}
                  >
                    Seleccionar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Barberos profesionales con años de experiencia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {demoTeam.map((member, index) => (
              <Card key={member.id} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription>
                    {member.role === 'owner' ? 'Propietario' : 'Barbero Profesional'}
                  </CardDescription>
                  <Badge variant="secondary">{member.experience}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">{member.specialty}</p>
                  <div className="flex justify-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Ubicación y Contacto
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Dirección</h3>
                      <p className="text-gray-600">{demoBarbershop.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Teléfono</h3>
                      <p className="text-gray-600">{demoBarbershop.contact_phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Horarios</h3>
                      <div className="text-gray-600 space-y-1">
                        <p>Lun - Vie: 9:00 AM - 6:00 PM</p>
                        <p>Sábado: 8:00 AM - 5:00 PM</p>
                        <p>Domingo: Cerrado</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <Button variant="outline" size="lg">
                    <Instagram className="w-5 h-5 mr-2" />
                    Instagram
                  </Button>
                  
                  <Button variant="outline" size="lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-900">
                    ¿Te gusta lo que ves?
                  </CardTitle>
                  <CardDescription>
                    Crea tu propia barbería en Agendex
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Scissors className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">Agendex</span>
                    </div>
                    
                    <p className="text-gray-600">
                      Este es un ejemplo de cómo se ve una barbería real en nuestra plataforma.
                    </p>
                    
                    <div className="space-y-3">
                      <Link href="/register">
                        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                          Crear Mi Barbería Gratis
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                      
                      <Link href="/">
                        <Button variant="outline" size="lg" className="w-full">
                          Volver al Inicio
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Reserva Demo */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Demo de Reserva</CardTitle>
              <CardDescription>
                Esta es una demostración del sistema de reservas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">¡Funcionalidad Demo!</h3>
                <p className="text-sm text-blue-700">
                  En la versión real, aquí podrías:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Seleccionar servicios</li>
                  <li>• Elegir barbero</li>
                  <li>• Escoger fecha y hora</li>
                  <li>• Confirmar tu reserva</li>
                </ul>
              </div>
              
              <div className="flex space-x-2">
                <Link href="/register" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Crear Mi Cuenta
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-sm">Powered by</span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Agendex</span>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Demo del sistema de reservas inteligente para barberos profesionales
          </p>
        </div>
      </footer>
    </div>
  )
}