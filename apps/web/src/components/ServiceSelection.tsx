import React from "react";
import {
  Scissors,
  Palette,
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { Service } from "../types/booking";
import { useServicios } from "../hooks/useServicios";

interface ServiceSelectionProps {
  selectedServices: Service[];
  onServicesChange: (services: Service[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  selectedServices,
  onServicesChange,
  onBack,
  onNext,
}) => {
  // 🔥 USAR SERVICIOS MVP DINÁMICOS
  const { servicios, loading: loadingServicios } = useServicios();

  // 🔄 CONVERTIR SERVICIOS MVP AL FORMATO ESPERADO
  const services: Service[] = servicios.map((servicio) => ({
    id: servicio.id_servicio, // 🔧 CORREGIDO: era servicio.id
    name: servicio.nombre,
    price: servicio.precio,
    duration: servicio.duracion, // 🔧 CORREGIDO: era duracion_estimada
    category: servicio.categoria?.toLowerCase() || "barberia",
    description: servicio.descripcion || `${servicio.nombre} profesional`,
  }));

  //  OBTENER CATEGORÍAS DINÁMICAMENTE
  const availableCategories = [...new Set(services.map((s) => s.category))];

  // 🎯 MOSTRAR LOADING SI ESTÁ CARGANDO
  if (loadingServicios) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
              <p className="text-gray-400">Cargando servicios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);

    if (isSelected) {
      // Remover servicio
      const newServices = selectedServices.filter((s) => s.id !== service.id);
      onServicesChange(newServices);
    } else {
      // Agregar servicio
      const newServices = [...selectedServices, service];
      onServicesChange(newServices);
    }
  };

  const getServicesByCategory = (category: string) => {
    return services.filter((service) => service.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "barberia":
        return <Scissors className="h-6 w-6" />;
      case "colorimetria":
        return <Palette className="h-6 w-6" />;
      case "extras":
        return <Plus className="h-6 w-6" />;
      default:
        return <Scissors className="h-6 w-6" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "barberia":
        return "Barbería";
      case "colorimetria":
        return "Colorimetría";
      case "extras":
        return "Servicios Extras";
      default:
        return "Servicios";
    }
  };

  const totalPrice = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0
  );
  const totalDuration = selectedServices.reduce(
    (sum, service) => sum + service.duration,
    0
  );

  const canProceed = selectedServices.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
        <h2 className="mb-6 text-2xl font-bold text-white">
          Selecciona tus servicios
        </h2>

        <div className="space-y-8">
          {availableCategories.map((category) => {
            const categoryServices = getServicesByCategory(category);
            if (categoryServices.length === 0) return null;

            return (
              <div key={category}>
                <div className="mb-4 flex items-center space-x-3">
                  <div className="rounded-lg bg-yellow-500/20 p-2 text-yellow-500">
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {getCategoryName(category)}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {categoryServices.map((service) => {
                    const isSelected = selectedServices.some(
                      (s) => s.id === service.id
                    );

                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service)}
                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105 ${
                          isSelected
                            ? "border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20"
                            : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
                            <Check className="h-4 w-4 text-black" />
                          </div>
                        )}

                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="text-lg font-semibold text-white">
                            {service.name}
                          </h4>
                          <div className="text-right">
                            <p className="text-lg font-bold text-yellow-500">
                              {new Intl.NumberFormat("es-CL", {
                                style: "currency",
                                currency: "CLP",
                                minimumFractionDigits: 0,
                              }).format(service.price)}
                            </p>
                            <p className="text-sm text-gray-400">
                              {service.duration} min
                            </p>
                          </div>
                        </div>

                        {service.description && (
                          <p className="text-sm text-gray-300">
                            {service.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {selectedServices.length > 0 && (
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-xl font-semibold text-white">
            Resumen de servicios
          </h3>

          <div className="mb-6 space-y-3">
            {selectedServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between border-b border-gray-700 py-2 last:border-b-0"
              >
                <div>
                  <span className="font-medium text-white">{service.name}</span>
                  <span className="ml-2 text-sm text-gray-400">
                    ({service.duration} min)
                  </span>
                </div>
                <span className="font-semibold text-yellow-500">
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    minimumFractionDigits: 0,
                  }).format(service.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-600 pt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <div className="text-white">
                <span>Total: </span>
                <span className="text-sm text-gray-400">
                  ({totalDuration} min aprox.)
                </span>
              </div>
              <span className="text-2xl text-yellow-500">
                {new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(totalPrice)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 rounded-xl bg-gray-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>

        {canProceed && (
          <button
            onClick={onNext}
            className="flex transform items-center space-x-2 rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:shadow-xl"
          >
            <span>Continuar</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceSelection;
