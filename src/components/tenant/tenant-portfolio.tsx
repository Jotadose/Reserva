'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Scissors } from 'lucide-react'

interface PortfolioItem {
  id: string
  title: string
  description: string
  image: string
  category: 'corte' | 'barba' | 'color' | 'combo'
  featured?: boolean
}

interface TenantPortfolioProps {
  tenantSlug: string
  items?: PortfolioItem[]
}

// Mock data hasta que implementemos la tabla de portfolio
const mockPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'Corte Moderno',
    description: 'Estilo contemporáneo con técnicas avanzadas',
    image: '/placeholder-portfolio-1.jpg',
    category: 'corte',
    featured: true
  },
  {
    id: '2',
    title: 'Barba Definida',
    description: 'Arreglo profesional con productos premium',
    image: '/placeholder-portfolio-2.jpg',
    category: 'barba'
  },
  {
    id: '3',
    title: 'Color Fantasía',
    description: 'Transformación completa con colores vibrantes',
    image: '/placeholder-portfolio-3.jpg',
    category: 'color',
    featured: true
  },
  {
    id: '4',
    title: 'Combo Completo',
    description: 'Corte + barba + arreglo integral',
    image: '/placeholder-portfolio-4.jpg',
    category: 'combo'
  }
]

const categoryLabels = {
  corte: 'Corte',
  barba: 'Barba',
  color: 'Color',
  combo: 'Combo'
}

const categoryColors = {
  corte: 'bg-blue-100 text-blue-800',
  barba: 'bg-green-100 text-green-800',
  color: 'bg-purple-100 text-purple-800',
  combo: 'bg-orange-100 text-orange-800'
}

export function TenantPortfolio({ tenantSlug, items = mockPortfolioItems }: TenantPortfolioProps) {
  if (!items || items.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Scissors className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Próximamente
          </h3>
          <p className="text-gray-500">
            Pronto mostraremos nuestros mejores trabajos
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Nuestros Trabajos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre algunos de nuestros mejores trabajos y deja que la calidad hable por sí sola
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md">
              <div className="relative overflow-hidden">
                {/* Placeholder para imagen */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Scissors className="w-12 h-12 text-gray-400" />
                </div>
                
                {/* Overlay con información */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end">
                  <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm opacity-90">{item.description}</p>
                  </div>
                </div>

                {/* Badge de categoría */}
                <div className="absolute top-3 left-3">
                  <Badge className={`${categoryColors[item.category]} border-0`}>
                    {categoryLabels[item.category]}
                  </Badge>
                </div>

                {/* Badge de destacado */}
                {item.featured && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-yellow-400 text-yellow-900 border-0">
                      ⭐ Popular
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={categoryColors[item.category]}>
                    {categoryLabels[item.category]}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span>5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            ¿Te gusta lo que ves? ¡Reserva tu cita y únete a nuestros clientes satisfechos!
          </p>
          <div className="flex items-center justify-center text-yellow-400 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-current" />
            ))}
            <span className="ml-2 text-gray-700 font-semibold">5.0 estrellas</span>
          </div>
        </div>
      </div>
    </section>
  )
}