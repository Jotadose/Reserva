import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Scissors,
  Clock,
  Star,
  Calendar,
  Instagram,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Award,
  Users,
  Sparkles
} from 'lucide-react'

import { YERKO_SERVICES, YERKO_CONTACT, YERKO_SCHEDULE } from '../data/yerkoServices'

export const LandingPageYerko: React.FC = () => {
  const navigate = useNavigate()

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

  const featuredServices = YERKO_SERVICES.filter(s => s.priority === 'alta').slice(0, 3)
  const allServices = YERKO_SERVICES

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{YERKO_CONTACT.businessName}</h1>
                <div className="flex items-center space-x-1 text-xs text-purple-300">
                  <Instagram className="w-3 h-3" />
                  <span>{YERKO_CONTACT.instagram}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#servicios" className="text-gray-300 hover:text-white transition-colors">Servicios</a>
              <a href="#horarios" className="text-gray-300 hover:text-white transition-colors">Horarios</a>
              <a href="#contacto" className="text-gray-300 hover:text-white transition-colors">Contacto</a>
              <button
                onClick={() => navigate('/reservar')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
              >
                Reservar Cita
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-8 flex items-center justify-center">
            <Scissors className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Bienvenido a <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{YERKO_CONTACT.businessName}</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experiencia profesional en barbería con técnicas modernas y atención personalizada. 
            Tu estilo, nuestra pasión.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/reservar')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold text-lg flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Reservar Ahora</span>
            </button>
            
            <a
              href={`https://wa.me/${YERKO_CONTACT.whatsapp.replace(/\s/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600/20 text-green-400 px-8 py-4 rounded-lg hover:bg-green-600/30 transition-all duration-200 font-semibold text-lg flex items-center space-x-2 border border-green-500/30"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Experiencia Profesional</h3>
              <p className="text-gray-300 text-sm">Años de experiencia en técnicas modernas de barbería</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Atención Personalizada</h3>
              <p className="text-gray-300 text-sm">Cada cliente recibe atención exclusiva y personalizada</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Técnicas Modernas</h3>
              <p className="text-gray-300 text-sm">Utilizamos las últimas técnicas y herramientas profesionales</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section id="servicios" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Servicios Destacados</h2>
            <p className="text-xl text-gray-300">Los servicios más populares de nuestra barbería</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-6">
                  <Scissors className="w-8 h-8 text-purple-400" />
                  <span className="bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                    Popular
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">{service.name}</h3>
                <p className="text-gray-300 mb-6">{service.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Precio:</span>
                    <span className="text-green-400 font-bold text-xl">{formatPrice(service.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Duración:</span>
                    <span className="text-blue-400 font-semibold">{formatDuration(service.duration)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/reservar')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold"
                >
                  Reservar Este Servicio
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button
              onClick={() => navigate('/reservar')}
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium border border-purple-500/30"
            >
              Ver Todos los Servicios
            </button>
          </div>
        </div>
      </section>

      {/* All Services Grid */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Todos Nuestros Servicios</h2>
            <p className="text-xl text-gray-300">Encuentra el servicio perfecto para ti</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allServices.map((service) => (
              <div
                key={service.id}
                className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-5 h-5 text-purple-400" />
                    <span className={`text-xs px-2 py-1 rounded ${
                      service.category === 'basico' ? 'bg-blue-600/20 text-blue-400' :
                      service.category === 'premium' ? 'bg-purple-600/20 text-purple-400' :
                      service.category === 'color' ? 'bg-orange-600/20 text-orange-400' :
                      'bg-green-600/20 text-green-400'
                    }`}>
                      {service.category === 'basico' ? 'Básico' :
                       service.category === 'premium' ? 'Premium' :
                       service.category === 'color' ? 'Color' : 'Especial'}
                    </span>
                  </div>
                  {service.priority === 'alta' && (
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{service.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-green-400 font-bold">{formatPrice(service.price)}</div>
                  <div className="text-blue-400 text-sm">{formatDuration(service.duration)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Working Hours */}
      <section id="horarios" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Horarios de Atención</h2>
            <p className="text-xl text-gray-300">Estamos aquí para atenderte</p>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Horario General</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lunes - Sábado:</span>
                    <span className="text-white font-medium">
                      {YERKO_SCHEDULE.workingHours.start} - {YERKO_SCHEDULE.workingHours.end}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Domingo:</span>
                    <span className="text-white font-medium">Alternos (consultar)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Almuerzo:</span>
                    <span className="text-orange-400 font-medium">
                      {YERKO_SCHEDULE.workingHours.lunchStart} - {YERKO_SCHEDULE.workingHours.lunchEnd}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Turnos Disponibles</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {YERKO_SCHEDULE.timeSlots.map((slot) => (
                    <div
                      key={slot}
                      className="bg-white/10 text-center py-2 px-3 rounded-lg text-sm text-white font-medium"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 px-4 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Contáctanos</h2>
            <p className="text-xl text-gray-300">Estamos aquí para ayudarte</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <h3 className="text-2xl font-bold text-white mb-6">Información de Contacto</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Instagram</p>
                    <p className="text-white font-medium">{YERKO_CONTACT.instagram}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">WhatsApp</p>
                    <p className="text-white font-medium">{YERKO_CONTACT.whatsapp}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-medium">{YERKO_CONTACT.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Dirección</p>
                    <p className="text-white font-medium">{YERKO_CONTACT.address}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <h3 className="text-2xl font-bold text-white mb-6">Reserva tu Cita</h3>
              <p className="text-gray-300 mb-6">
                ¿Listo para lucir increíble? Reserva tu cita ahora y experimenta el mejor servicio de barbería.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/reservar')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Reservar Online</span>
                </button>
                
                <a
                  href={`https://wa.me/${YERKO_CONTACT.whatsapp.replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600/20 text-green-400 py-4 px-6 rounded-lg hover:bg-green-600/30 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2 border border-green-500/30"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-sm border-t border-purple-500/20 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">{YERKO_CONTACT.businessName}</span>
          </div>
          
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center space-x-1 text-purple-300">
              <Instagram className="w-4 h-4" />
              <span className="text-sm">{YERKO_CONTACT.instagram}</span>
            </div>
            <div className="flex items-center space-x-1 text-green-300">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{YERKO_CONTACT.whatsapp}</span>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm">
            © 2024 {YERKO_CONTACT.businessName}. Todos los derechos reservados.
          </p>
          
          {/* Enlace discreto al admin */}
          <div className="mt-2">
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-500 hover:text-purple-400 text-xs transition-colors duration-200"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPageYerko