import React, { useState, useMemo } from "react";
import { User, Star, ArrowRight, Clock, CheckCircle } from "lucide-react";
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
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  // 🎯 OBTENER TODAS LAS ESPECIALIDADES ÚNICAS
  const allSpecialties = useMemo(() => {
    const specs = barberos.flatMap((barbero) => barbero.especialidades || []);
    return [...new Set(specs)];
  }, [barberos]);

  // 🔍 FILTRAR BARBEROS POR ESPECIALIDAD
  const filteredBarberos = useMemo(() => {
    if (selectedSpecialty === "all") return barberos;
    return barberos.filter((barbero) =>
      barbero.especialidades?.includes(selectedSpecialty)
    );
  }, [barberos, selectedSpecialty]);

  // 📅 VERIFICAR SI BARBERO ESTÁ DISPONIBLE HOY
  const isAvailableToday = (barbero: any) => {
    const today = new Date().getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const dayNames = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    const todayName = dayNames[today];
    return (
      barbero.dias_trabajo?.includes(todayName) ||
      barbero.dias_trabajo?.includes(today.toString())
    );
  };

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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-yellow-500/20 p-3">
              <User className="h-6 w-6 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Selecciona tu barbero especialista
            </h2>
          </div>
          <div className="text-sm text-gray-400">
            {filteredBarberos.length} especialista
            {filteredBarberos.length !== 1 ? "s" : ""} disponible
            {filteredBarberos.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* 🔍 FILTRO POR ESPECIALIDADES */}
        {allSpecialties.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-gray-300">
              Filtrar por especialidad:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSpecialty("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedSpecialty === "all"
                    ? "bg-yellow-500 text-black shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Todos ({barberos.length})
              </button>
              {allSpecialties.map((specialty) => {
                const count = barberos.filter((b) =>
                  b.especialidades?.includes(specialty)
                ).length;
                return (
                  <button
                    key={specialty}
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      selectedSpecialty === specialty
                        ? "bg-yellow-500 text-black shadow-lg"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {specialty} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredBarberos.map((barbero) => {
            const isSelected = selectedBarberId === barbero.id_barbero;
            const availableToday = isAvailableToday(barbero);

            return (
              <button
                type="button"
                key={barbero.id_barbero}
                onClick={() => {
                  if (typeof onBarberSelect === "function") {
                    try {
                      onBarberSelect(barbero.id_barbero);
                    } catch (err) {
                      console.error("Error ejecutando onBarberSelect", err);
                    }
                  } else {
                    console.warn(
                      "onBarberSelect no es una función:",
                      onBarberSelect
                    );
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (typeof onBarberSelect === "function") {
                      try {
                        onBarberSelect(barbero.id_barbero);
                      } catch (err) {
                        console.error(
                          "Error ejecutando onBarberSelect (keyboard)",
                          err
                        );
                      }
                    }
                  }
                }}
                className={`text-left relative rounded-xl border-2 p-6 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/60 hover:scale-105 ${
                  isSelected
                    ? "border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20 animate-pulse"
                    : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                }`}
              >
                {isSelected && (
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
                    <CheckCircle className="h-4 w-4 text-black" />
                  </div>
                )}

                {/* 🟢 INDICADOR DE DISPONIBILIDAD HOY */}
                {availableToday && (
                  <div className="absolute right-3 top-3">
                    <div className="flex items-center space-x-1 rounded-full bg-green-500/20 px-2 py-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-green-400">
                        Disponible hoy
                      </span>
                    </div>
                  </div>
                )}

                <div className="mb-4 flex items-center space-x-4">
                  <div className="relative">
                    {barbero.avatar_url ? (
                      <img
                        src={barbero.avatar_url}
                        alt={barbero.nombre}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600">
                        <User className="h-8 w-8 text-black" />
                      </div>
                    )}
                    {/* 🏆 RATING BADGE */}
                    {barbero.calificacion_promedio > 0 && (
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
                        {barbero.calificacion_promedio.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">
                      {barbero.nombre}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                      {barbero.calificacion_promedio > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-yellow-500">
                            {barbero.calificacion_promedio.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {barbero.total_cortes > 0 && (
                        <span>{barbero.total_cortes} cortes realizados</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 💡 ESPECIALIDADES */}
                {barbero.especialidades &&
                  barbero.especialidades.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-2 text-sm font-medium text-gray-300">
                        Especialidades:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {barbero.especialidades.map((esp, index) => (
                          <span
                            key={`${barbero.id_barbero}-${esp}-${index}`}
                            className={`rounded-full px-2 py-1 text-xs ${
                              selectedSpecialty === esp
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {esp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 🕒 HORARIO DE TRABAJO */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>
                      {barbero.horario_inicio} - {barbero.horario_fin}
                    </span>
                  </div>
                  {!availableToday && (
                    <span className="text-xs text-orange-400">
                      No disponible hoy
                    </span>
                  )}
                </div>

                {/* 📝 BIOGRAFÍA (SI EXISTE) */}
                {barbero.biografia && (
                  <div className="mt-3 border-t border-gray-700 pt-3">
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {barbero.biografia}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredBarberos.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
              <User className="h-8 w-8 text-gray-500" />
            </div>
            {selectedSpecialty === "all" ? (
              <div>
                <p className="mb-2 text-gray-400">
                  No hay barberos disponibles en este momento.
                </p>
                <p className="text-sm text-gray-500">
                  Inténtalo más tarde o contacta al salón.
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-gray-400">
                  No hay especialistas en "{selectedSpecialty}" disponibles.
                </p>
                <button
                  onClick={() => setSelectedSpecialty("all")}
                  className="text-sm text-yellow-500 hover:text-yellow-400"
                >
                  Ver todos los barberos
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          disabled={!canProceed}
          onClick={() => {
            if (!canProceed) return;
            if (typeof onNext === "function") {
              try {
                onNext();
              } catch (err) {
                console.error("Error ejecutando onNext", err);
              }
            } else {
              console.warn("onNext no es una función:", onNext);
            }
          }}
          className={`flex transform items-center space-x-2 rounded-xl px-8 py-4 text-lg font-bold shadow-lg transition-all duration-300 ${
            canProceed
              ? "bg-yellow-500 text-black hover:scale-105 hover:bg-yellow-400 hover:shadow-xl"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          <span>{canProceed ? "Continuar" : "Selecciona un barbero"}</span>
          {canProceed && <ArrowRight className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export default BarberSelection;
