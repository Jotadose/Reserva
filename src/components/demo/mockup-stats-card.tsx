'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Star,
  Clock,
  ArrowUp
} from 'lucide-react'

interface StatItemProps {
  icon: React.ComponentType<any>
  label: string
  value: number
  prefix?: string
  suffix?: string
  trend?: number
  delay?: number
}

function AnimatedStatItem({ icon: Icon, label, value, prefix = '', suffix = '', trend, delay = 0 }: StatItemProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      const duration = 2000
      const interval = 16
      const steps = duration / interval
      const increment = value / steps

      let currentValue = 0
      const counter = setInterval(() => {
        currentValue += increment
        if (currentValue >= value) {
          currentValue = value
          clearInterval(counter)
        }
        setDisplayValue(currentValue % 1 === 0 ? currentValue : Math.floor(currentValue * 10) / 10)
      }, interval)

      return () => clearInterval(counter)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="relative p-6 rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/20 hover:scale-105 transition-transform duration-300">
        {/* Floating icon */}
        <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-float">
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {prefix}{displayValue.toLocaleString()}{suffix}
          </div>
          <div className="text-sm font-medium text-gray-700">{label}</div>
          
          {trend && (
            <div className="flex items-center space-x-1">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+{trend}%</span>
              <span className="text-xs text-gray-500">este mes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MockupStatsCard() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const stats = [
    {
      icon: Users,
      label: 'Clientes Activos',
      value: 1247,
      trend: 23,
      delay: 200
    },
    {
      icon: Calendar,
      label: 'Reservas Mensuales',
      value: 856,
      trend: 18,
      delay: 400
    },
    {
      icon: DollarSign,
      label: 'Ingresos',
      value: 34580,
      prefix: '$',
      trend: 31,
      delay: 600
    },
    {
      icon: Star,
      label: 'Calificación',
      value: 4.9,
      suffix: '/5',
      delay: 800
    }
  ]

  return (
    <div className="relative">
      <Card className={`border-0 shadow-2xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm transform transition-all duration-1000 ${isLoaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
              <Clock className="w-3 h-3 mr-1" />
              En Tiempo Real
            </Badge>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard de Métricas
          </CardTitle>
          
          <p className="text-gray-600 text-sm">
            Estadísticas en vivo de tu barbería
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <AnimatedStatItem key={index} {...stat} />
            ))}
          </div>
          
          {/* Success metrics bar */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Satisfacción del Cliente</span>
              <span className="text-sm font-bold text-green-600">96%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-2000 ease-out"
                style={{ width: isLoaded ? '96%' : '0%' }}
              ></div>
            </div>
          </div>
          
          {/* Floating decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-8 left-4 w-12 h-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full animate-pulse-slow"></div>
        </CardContent>
      </Card>
    </div>
  )
}