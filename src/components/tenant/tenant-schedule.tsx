'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar } from 'lucide-react'

interface WorkingHours {
  [key: string]: {
    open: string
    close: string
    closed?: boolean
  }
}

interface TenantScheduleProps {
  workingHours: WorkingHours
  className?: string
}

const dayLabels = {
  monday: 'Lunes',
  tuesday: 'Martes', 
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
}

// Horarios por defecto
const defaultSchedule: WorkingHours = {
  monday: { open: '11:00', close: '20:00' },
  tuesday: { open: '11:00', close: '20:00' },
  wednesday: { open: '11:00', close: '20:00' },
  thursday: { open: '11:00', close: '20:00' },
  friday: { open: '11:00', close: '20:00' },
  saturday: { open: '11:00', close: '20:00' },
  sunday: { closed: true, open: '', close: '' }
}

// Horarios de almuerzo típicos
const lunchHours = {
  start: '14:00',
  end: '15:00'
}

// Generar slots de horario disponibles
const generateTimeSlots = (start: string, end: string, lunchStart?: string, lunchEnd?: string) => {
  const slots: string[] = []
  const startTime = parseInt(start.split(':')[0])
  const endTime = parseInt(end.split(':')[0])
  
  for (let hour = startTime; hour < endTime; hour++) {
    for (let minutes of [0, 15, 30, 45]) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      
      // Saltar horario de almuerzo si aplica
      if (lunchStart && lunchEnd) {
        const currentTime = hour + (minutes / 60)
        const lunchStartTime = parseInt(lunchStart.split(':')[0]) + (parseInt(lunchStart.split(':')[1]) / 60)
        const lunchEndTime = parseInt(lunchEnd.split(':')[0]) + (parseInt(lunchEnd.split(':')[1]) / 60)
        
        if (currentTime >= lunchStartTime && currentTime < lunchEndTime) {
          continue
        }
      }
      
      slots.push(timeString)
    }
  }
  
  return slots
}

export function TenantSchedule({ workingHours = defaultSchedule, className = '' }: TenantScheduleProps) {
  const today = new Date().getDay()
  const currentDayKey = Object.keys(dayLabels)[today === 0 ? 6 : today - 1] // Convert Sunday=0 to proper array index
  
  // Obtener horarios del día actual
  const todaySchedule = workingHours[currentDayKey as keyof typeof workingHours]
  const isTodayOpen = todaySchedule && !todaySchedule.closed
  
  // Generar slots disponibles para hoy
  const todaySlots = isTodayOpen 
    ? generateTimeSlots(
        todaySchedule.open, 
        todaySchedule.close,
        lunchHours.start,
        lunchHours.end
      ).slice(0, 12) // Mostrar solo los primeros 12 slots
    : []

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Horarios de Atención
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Estamos aquí para atenderte
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Horario General */}
                <div>
                  <div className="flex items-center mb-6">
                    <Clock className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Horario General</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(dayLabels).map(([key, label]) => {
                      const daySchedule = workingHours[key] || defaultSchedule[key]
                      const isToday = key === currentDayKey
                      
                      return (
                        <div 
                          key={key} 
                          className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                            isToday ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className={`font-medium ${isToday ? 'text-blue-900' : 'text-gray-700'}`}>
                              {label}{isToday && ' (Hoy)'}
                            </span>
                            {isToday && (
                              <Badge className="ml-2 bg-blue-600 text-white text-xs">
                                HOY
                              </Badge>
                            )}
                          </div>
                          
                          <div className={`text-sm ${isToday ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                            {daySchedule?.closed ? (
                              <span className="text-orange-600 font-medium">Cerrado</span>
                            ) : (
                              <span>{daySchedule?.open} - {daySchedule?.close}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Horario de almuerzo */}
                  <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center text-orange-800">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-medium">Almuerzo:</span>
                      <span className="ml-2">{lunchHours.start} - {lunchHours.end}</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      Alternos (consultar)
                    </p>
                  </div>
                </div>

                {/* Turnos Disponibles para Hoy */}
                <div>
                  <div className="flex items-center mb-6">
                    <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Turnos Disponibles</h3>
                  </div>
                  
                  {isTodayOpen ? (
                    <div className="grid grid-cols-3 gap-3">
                      {todaySlots.map((slot, index) => (
                        <div
                          key={slot}
                          className={`
                            text-center py-2 px-3 rounded-lg border text-sm font-medium cursor-pointer
                            transition-all duration-200 hover:shadow-md
                            ${index < 6 
                              ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100' 
                              : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                            }
                          `}
                        >
                          {slot}
                        </div>
                      ))}
                      
                      {/* Indicadores de disponibilidad */}
                      <div className="col-span-3 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-6 text-xs">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-200 rounded-full mr-2"></div>
                            <span className="text-gray-600">Mañana</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-200 rounded-full mr-2"></div>
                            <span className="text-gray-600">Tarde</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Cerrado Hoy</h4>
                      <p className="text-gray-600 text-sm">
                        Puedes reservar para mañana o revisar nuestros horarios
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}