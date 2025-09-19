'use client'

export default function ColorTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-8">
          🎨 Test de Colores Tailwind CSS
        </h1>
        
        {/* Colores Azules */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Colores Azules</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 text-blue-900 p-4 rounded-lg text-center">
              bg-blue-50
            </div>
            <div className="bg-blue-100 text-blue-900 p-4 rounded-lg text-center">
              bg-blue-100
            </div>
            <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
              bg-blue-600
            </div>
            <div className="bg-blue-800 text-white p-4 rounded-lg text-center">
              bg-blue-800
            </div>
          </div>
        </div>
        
        {/* Colores Grises */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Colores Grises</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 text-gray-900 p-4 rounded-lg text-center">
              bg-gray-50
            </div>
            <div className="bg-gray-100 text-gray-900 p-4 rounded-lg text-center">
              bg-gray-100
            </div>
            <div className="bg-gray-600 text-white p-4 rounded-lg text-center">
              bg-gray-600
            </div>
            <div className="bg-gray-900 text-white p-4 rounded-lg text-center">
              bg-gray-900
            </div>
          </div>
        </div>
        
        {/* Otros Colores */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Otros Colores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-500 text-white p-4 rounded-lg text-center">
              bg-green-500
            </div>
            <div className="bg-yellow-400 text-gray-900 p-4 rounded-lg text-center">
              bg-yellow-400
            </div>
            <div className="bg-red-500 text-white p-4 rounded-lg text-center">
              bg-red-500
            </div>
            <div className="bg-purple-600 text-white p-4 rounded-lg text-center">
              bg-purple-600
            </div>
          </div>
        </div>
        
        {/* Efectos y Gradientes */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Efectos y Gradientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg text-center">
              Gradiente Azul
            </div>
            <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-lg text-center text-gray-900">
              Shadow y Border
            </div>
          </div>
        </div>
        
        {/* Botones de Prueba */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Botones de Prueba</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
              Botón Azul
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors">
              Botón Gris
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors">
              Botón Verde
            </button>
            <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg transition-colors">
              Botón Outline
            </button>
          </div>
        </div>
        
        {/* Estado */}
        <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-lg text-center">
          ✅ ¡Tailwind CSS funcionando correctamente!
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Si ves todos estos colores correctamente, entonces Tailwind CSS está funcionando.
          </p>
          <a 
            href="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  )
}