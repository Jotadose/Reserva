import React from "react";
import { User, Star, ArrowRight, Clock } from "lucide-react";
import { useBarberos } from "../hooks/useBarberos";

interface BarberSelectionProps {
  selectedBarberId: string;
  onBarberSelect: (barberId: string) => void;
  onNext: () => void;
}

const BarberSelection: React.FC<BarberSelectionProps> = ({
  selectedBarberId,
  onBarberSelect,
  onNext,
}) => {
  const { barberos, loading } = useBarberos();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
              <p className="text-gray-400">Cargando barberos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canProceed = Boolean(selectedBarberId);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center space-x-3">
          <div className="rounded-lg bg-yellow-500/20 p-3">
            <User className="h-6 w-6 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Selecciona tu barbero
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {barberos.map((barbero) => {
            const isSelected = selectedBarberId === barbero.id;

            return (
              <div
                key={barbero.id}
                onClick={() => onBarberSelect(barbero.id)}
                className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? "border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20"
                    : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                }`}
              >
                {isSelected && (
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
                    <User className="h-4 w-4 text-black" />
                  </div>
                )}

                <div className="mb-4 flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600">
                    <User className="h-8 w-8 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {barbero.nombre_completo}
                    </h3>
                    {barbero.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm text-yellow-500">
                          {barbero.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {barbero.especializaciones && barbero.especializaciones.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-sm font-medium text-gray-300">
                      Especialidades:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {barbero.especializaciones.map((esp, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-gray-700 px-2 py-1 text-xs text-gray-300"
                        >
                          {esp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {barbero.horario_trabajo && (
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Horario: {barbero.horario_trabajo}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {barberos.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-400">
              No hay barberos disponibles en este momento.
            </p>
          </div>
        )}
      </div>

      {/* Next Button */}
      {canProceed && (
        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="flex transform items-center space-x-2 rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-black shadow-lg hover:scale-105 hover:bg-yellow-400 hover:shadow-xl"
          >
            <span>Continuar</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BarberSelection;
