'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors,
  CheckCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone
} from 'lucide-react'

interface BookingStep {
  id: string
  title: string
  icon: React.ComponentType<any>
  completed: boolean
  active: boolean
}

export function InteractiveBookingWidget() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const steps: BookingStep[] = [
    { id: 'service', title: 'Elegir Servicio', icon: Scissors, completed: false, active: true },
    { id: 'barber', title: 'Seleccionar Barbero', icon: User, completed: false, active: false },
    { id: 'datetime', title: 'Fecha y Hora', icon: Calendar, completed: false, active: false },
    { id: 'confirm', title: 'Confirmar', icon: CheckCircle, completed: false, active: false }
  ]

  const [bookingSteps, setBookingSteps] = useState(steps)

  const services = [
    { id: '1', name: 'Corte Clásico', price: 25000, duration: 30, popular: true },
    { id: '2', name: 'Corte + Barba', price: 35000, duration: 45, popular: false },
    { id: '3', name: 'Afeitado Premium', price: 20000, duration: 25, popular: false }
  ]

  const barbers = [
    { id: '1', name: 'Carlos Mendoza', experience: '15 años', rating: 4.9, available: true },
    { id: '2', name: 'Miguel Ángel', experience: '8 años', rating: 4.8, available: true },
    { id: '3', name: 'Andrés Vargas', experience: '5 años', rating: 4.7, available: false }
  ]

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]

  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const handleNext = () => {
    if (currentStep < bookingSteps.length - 1) {
      setIsAnimating(true)
      
      // Mark current step as completed
      const newSteps = [...bookingSteps]
      newSteps[currentStep].completed = true
      newSteps[currentStep].active = false
      newSteps[currentStep + 1].active = true
      setBookingSteps(newSteps)
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 300)
    } else {
      // Show success animation
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        // Reset to beginning
        setCurrentStep(0)
        setBookingSteps(steps.map((step, index) => ({
          ...step,
          completed: false,
          active: index === 0
        })))
        setSelectedService(null)
        setSelectedBarber(null)
        setSelectedTime(null)
      }, 3000)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedService !== null
      case 1: return selectedBarber !== null
      case 2: return selectedTime !== null
      case 3: return true
      default: return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecciona tu servicio</h3>
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedService === service.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/60 hover:bg-white/80 border border-gray-200'
                }`}
              >
                {service.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className={`text-sm ${selectedService === service.id ? 'text-blue-100' : 'text-gray-500'}`}>
                      {service.duration} min
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${service.price.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      
      case 1:
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Elige tu barbero</h3>
            {barbers.map((barber) => (
              <div
                key={barber.id}
                onClick={() => barber.available && setSelectedBarber(barber.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  !barber.available ? 'opacity-50 cursor-not-allowed' :
                  selectedBarber === barber.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/60 hover:bg-white/80 border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{barber.name}</div>
                      <div className={`text-sm ${selectedBarber === barber.id ? 'text-blue-100' : 'text-gray-500'}`}>
                        {barber.experience}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{barber.rating}</span>
                      <CheckCircle className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className={`text-xs ${selectedBarber === barber.id ? 'text-blue-100' : 'text-gray-500'}`}>
                      {barber.available ? 'Disponible' : 'Ocupado'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecciona fecha y hora</h3>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-800 font-medium">Mañana, 27 de Septiembre</div>
              <div className="text-xs text-blue-600">Horarios disponibles</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTime === time
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/60 hover:bg-white/80 border border-gray-200 text-gray-600'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirma tu reserva</h3>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Servicio:</span>
                  <span className="font-medium">{services.find(s => s.id === selectedService)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Barbero:</span>
                  <span className="font-medium">{barbers.find(b => b.id === selectedBarber)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha y hora:</span>
                  <span className="font-medium">Mañana {selectedTime}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">${services.find(s => s.id === selectedService)?.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (showSuccess) {
    return (
      <div className="relative">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Reserva Confirmada!</h3>
                <p className="text-gray-600">Tu cita ha sido programada exitosamente</p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                <Phone className="w-4 h-4" />
                <span>Recibirás confirmación por WhatsApp</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative">
      <Card className="border-0 shadow-2xl glass-card bg-white/10 backdrop-blur-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Reserva Inteligente
            </Badge>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Reserva tu Cita
          </CardTitle>
          
          {/* Step indicator */}
          <div className="flex justify-center space-x-2">
            {bookingSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step.completed ? 'bg-green-500 text-white' :
                  step.active ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                {index < bookingSteps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
            {renderStepContent()}
          </div>
          
          <div className="mt-6 flex justify-between">
            <div className="text-sm text-gray-500">
              Paso {currentStep + 1} de {bookingSteps.length}
            </div>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 transition-all duration-300 ${
                canProceed() ? 'scale-100 opacity-100' : 'scale-95 opacity-50'
              }`}
            >
              {currentStep === bookingSteps.length - 1 ? 'Confirmar Reserva' : 'Continuar'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}