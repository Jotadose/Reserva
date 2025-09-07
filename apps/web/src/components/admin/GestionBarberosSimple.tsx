/**
 * GESTIÓN SIMPLE DE BARBEROS - DATOS REALES
 */

import React from "react";
import { User, Clock, Calendar } from "lucide-react";
import { Card } from "../ui";
import { useBarberos } from "../../hooks/useBarberos";

export const GestionBarberosSimple: React.FC = () => {
  const { barberos, loading, error } = useBarberos();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-white">Cargando barberos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Barberos</h2>
          <p className="text-gray-400">{barberos.length} barberos registrados</p>
        </div>
      </div>

      <div className="grid gap-4">
        {barberos.map((barbero) => (
          <Card key={barbero.id_barbero} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-500 rounded-full p-3">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {barbero.nombre}
                  </h3>
                  <p className="text-gray-400">{barbero.email}</p>
                  {barbero.telefono && (
                    <p className="text-gray-400 text-sm">{barbero.telefono}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span 
                  className={`px-2 py-1 text-xs rounded ${barbero.activo ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"}`}
                >
                  {barbero.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Horario</span>
                </div>
                <p className="text-sm text-gray-400">
                  {barbero.horario_inicio} - {barbero.horario_fin}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Días de trabajo</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {barbero.dias_trabajo.map((dia) => (
                    <span
                      key={dia}
                      className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                    >
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {barbero.especialidades.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Especialidades</p>
                <div className="flex flex-wrap gap-2">
                  {barbero.especialidades.map((especialidad) => (
                    <span
                      key={especialidad}
                      className="px-2 py-1 text-xs bg-yellow-500 text-black rounded"
                    >
                      {especialidad.replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{barbero.total_cortes}</p>
                <p className="text-xs text-gray-400">Total cortes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {barbero.calificacion_promedio.toFixed(1)}
                </p>
                <p className="text-xs text-gray-400">Calificación</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{barbero.tiempo_descanso}m</p>
                <p className="text-xs text-gray-400">Descanso</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
