'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Quote,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Instagram,
  TrendingUp,
  Heart
} from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  comment: string
  avatar: string
  service: string
  date: string
  verified: boolean
  social: string
}

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Carlos Rodríguez',
      location: 'Chapinero, Bogotá',
      rating: 5,
      comment: 'Excelente servicio! El mejor corte que me han hecho en años. El ambiente es muy profesional y moderno.',
      avatar: 'CR',
      service: 'Corte + Barba',
      date: '2 días',
      verified: true,
      social: '@carlos_rod'
    },
    {
      id: '2',
      name: 'Miguel Herrera',
      location: 'Zona Rosa, Bogotá',
      rating: 5,
      comment: 'Reservé online súper fácil. Carlos es un artista con las tijeras, quedé increíble para mi reunión.',
      avatar: 'MH',
      service: 'Corte Ejecutivo',
      date: '1 semana',
      verified: true,
      social: '@miguel_h92'
    },
    {
      id: '3',
      name: 'David Morales',
      location: 'La Candelaria, Bogotá',
      rating: 5,
      comment: 'Primera vez que vengo y definitivamente no será la última. Atención de 10 y resultados perfectos.',
      avatar: 'DM',
      service: 'Afeitado Premium',
      date: '3 días',
      verified: true,
      social: '@davidmorales'
    },
    {
      id: '4',
      name: 'Andrés Valencia',
      location: 'Usaquén, Bogotá',
      rating: 5,
      comment: 'He probado muchas barberías pero esta es diferente. Todo muy higiénico y los barberos son expertos.',
      avatar: 'AV',
      service: 'Combo Completo',
      date: '5 días',
      verified: true,
      social: '@andres_val'
    }
  ]

  useEffect(() => {
    if (!isAutoPlaying || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, isPaused, testimonials.length])

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="relative">
      <Card 
        className="border-0 shadow-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Quote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Testimonios Reales</h3>
                  <p className="text-purple-100 text-sm">Lo que dicen nuestros clientes</p>
                </div>
              </div>
              
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                <Heart className="w-3 h-3 mr-1" />
                Verificados
              </Badge>
            </div>
          </div>

          {/* Main testimonial display */}
          <div className="p-8 relative min-h-[300px]">
            {/* Background decorations */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full animate-pulse-slow"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full animate-float"></div>

            {/* Testimonial content */}
            <div className="relative z-10">
              <div className="flex items-start space-x-4">
                {/* User avatar */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {currentTestimonial.avatar}
                  </div>
                  {currentTestimonial.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                </div>

                {/* User info and rating */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{currentTestimonial.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{currentTestimonial.location}</span>
                        <span>•</span>
                        <Instagram className="w-3 h-3" />
                        <span>{currentTestimonial.social}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {[...Array(currentTestimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">hace {currentTestimonial.date}</div>
                    </div>
                  </div>

                  {/* Service badge */}
                  <Badge className="bg-purple-100 text-purple-800 border-0 mb-4">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {currentTestimonial.service}
                  </Badge>

                  {/* Comment */}
                  <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                    "{currentTestimonial.comment}"
                  </blockquote>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="px-8 pb-6">
            <div className="flex items-center justify-between">
              {/* Slide indicators */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg scale-110'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                  className="w-10 h-10 p-0 rounded-full border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="px-3 py-1 text-xs border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                >
                  {isAutoPlaying ? 'Pausar' : 'Reproducir'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                  className="w-10 h-10 p-0 rounded-full border-gray-300 hover:border-purple-400 hover:bg-purple-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100 ease-linear"
              style={{ 
                width: isAutoPlaying && !isPaused ? '100%' : '0%',
                animation: isAutoPlaying && !isPaused ? 'progressBar 4s linear infinite' : 'none'
              }}
            />
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes progressBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}