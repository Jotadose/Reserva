import React from 'react';
import { useBarberos } from '../hooks/useBarberos';
import { useServicios } from '../hooks/useServicios';
import { useUsuarios } from '../hooks/useUsuarios';

export function TestMVPHooks() {
  console.log('TestMVPHooks component mounting...');
  
  const { barberos, loading: loadingBarberos, error: errorBarberos } = useBarberos();
  const { servicios, loading: loadingServicios, error: errorServicios, formatearPrecio, formatearDuracion } = useServicios();
  const { usuarios, loading: loadingUsuarios, error: errorUsuarios } = useUsuarios();

  console.log('Datos cargados:', {
    barberos: { count: barberos?.length, loading: loadingBarberos, error: errorBarberos },
    servicios: { count: servicios?.length, loading: loadingServicios, error: errorServicios },
    usuarios: { count: usuarios?.length, loading: loadingUsuarios, error: errorUsuarios }
  });

  const isLoading = loadingBarberos || loadingServicios || loadingUsuarios;
  const hasError = errorBarberos || errorServicios || errorUsuarios;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Test MVP Hooks - Sistema de Reservas</h1>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando datos del MVP...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Test MVP Hooks - Sistema de Reservas</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">❌ Error cargando datos</h2>
            <div className="space-y-2 text-sm text-red-600">
              {errorBarberos && <p>• Barberos: {errorBarberos}</p>}
              {errorServicios && <p>• Servicios: {errorServicios}</p>}
              {errorUsuarios && <p>• Usuarios: {errorUsuarios}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">✅ Test MVP Hooks - Sistema de Reservas</h1>
        
        <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-green-300 bg-green-50">
          <h2 className="text-lg font-semibold mb-2 text-green-800">Estado de Conexión - ✅ Exitoso</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-2 rounded bg-green-100 border border-green-200">
              <strong>Barberos:</strong> {barberos?.length || 0} registros
            </div>
            <div className="p-2 rounded bg-green-100 border border-green-200">
              <strong>Servicios:</strong> {servicios?.length || 0} registros
            </div>
            <div className="p-2 rounded bg-green-100 border border-green-200">
              <strong>Usuarios:</strong> {usuarios?.length || 0} registros
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{usuarios?.length || 0}</div>
            <div className="text-sm text-blue-800">Total Usuarios</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{barberos?.length || 0}</div>
            <div className="text-sm text-green-800">Barberos Activos</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{servicios?.length || 0}</div>
            <div className="text-sm text-purple-800">Servicios Disponibles</div>
          </div>
        </div>

        {/* Detailed Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Barberos Detalle */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">🧑‍💼 Barberos ({barberos?.length || 0})</h3>
            <div className="space-y-3">
              {barberos && barberos.length > 0 ? barberos.map((barbero) => (
                <div key={barbero.id_barbero} className="p-3 bg-gray-50 rounded border">
                  <p><strong>{barbero.nombre}</strong> ({barbero.email})</p>
                  <p className="text-sm">Especialidades: {barbero.especialidades?.join(', ') || 'Ninguna'}</p>
                  <p className="text-sm">Horario: {barbero.horario_inicio} - {barbero.horario_fin}</p>
                  <p className="text-sm">Rating: ⭐ {barbero.calificacion_promedio}/5</p>
                </div>
              )) : <p className="text-gray-500">No hay barberos cargados</p>}
            </div>
          </div>

          {/* Servicios Detalle */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">💼 Servicios ({servicios?.length || 0})</h3>
            <div className="space-y-3">
              {servicios && servicios.length > 0 ? servicios.map((servicio) => (
                <div key={servicio.id_servicio} className="p-3 bg-gray-50 rounded border">
                  <p><strong>{servicio.nombre}</strong></p>
                  <p className="text-sm">Precio: {formatearPrecio ? formatearPrecio(servicio.precio) : `$${servicio.precio}`}</p>
                  <p className="text-sm">Duración: {formatearDuracion ? formatearDuracion(servicio.duracion) : `${servicio.duracion} min`}</p>
                  <p className="text-sm">Categoría: {servicio.categoria || 'General'}</p>
                </div>
              )) : <p className="text-gray-500">No hay servicios cargados</p>}
            </div>
          </div>
        </div>

        {/* Usuarios Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">👥 Usuarios del Sistema ({usuarios?.length || 0})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {usuarios && usuarios.length > 0 ? usuarios.map((usuario) => {
              let roleColor = 'bg-gray-100 text-gray-800';
              if (usuario.rol === 'admin') {
                roleColor = 'bg-red-100 text-red-800';
              } else if (usuario.rol === 'barbero') {
                roleColor = 'bg-blue-100 text-blue-800';
              }
              
              return (
                <div key={usuario.id_usuario} className="p-3 bg-gray-50 rounded border">
                  <p><strong>{usuario.nombre}</strong></p>
                  <p className="text-sm">{usuario.email}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${roleColor}`}>
                    {usuario.rol}
                  </span>
                </div>
              );
            }) : <p className="text-gray-500">No hay usuarios cargados</p>}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">¡Migración MVP Exitosa!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>• Esquema de base de datos implementado correctamente</p>
                <p>• Hooks conectados a nuevas tablas</p>
                <p>• Datos de prueba cargados exitosamente</p>
                <p>• Sistema listo para implementar funcionalidades avanzadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
