import React from "react";
import { Scissors, Palette, Plus, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Service } from "../types/booking";

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
  const services: Service[] = [
    {
      id: "1",
      name: "Corte de Cabello",
      price: 12000,
      duration: 30,
      category: "barberia",
      description: "Corte clásico o moderno personalizado",
    },
    {
      id: "2",
      name: "Corte + Barba",
      price: 16000,
      duration: 45,
      category: "barberia",
      description: "Corte completo con arreglo y perfilado de barba",
    },
    {
      id: "3",
      name: "Corte + Barba + Limpieza",
      price: 22000,
      duration: 60,
      category: "barberia",
      description: "Servicio completo con limpieza facial",
    },
    {
      id: "4",
      name: "Solo Barba",
      price: 6000,
      duration: 20,
      category: "barberia",
      description: "Arreglo y perfilado de barba",
    },
    {
      id: "5",
      name: "Bloque de Color",
      price: 60000,
      duration: 120,
      category: "colorimetria",
      description: "Color uniforme en todo el cabello",
    },
    {
      id: "6",
      name: "Platinado Global",
      price: 70000,
      duration: 150,
      category: "colorimetria",
      description: "Decoloración completa y tinte platino",
    },
    {
      id: "7",
      name: "Visos",
      price: 60000,
      duration: 90,
      category: "colorimetria",
      description: "Mechas y reflejos profesionales",
    },
    {
      id: "8",
      name: "Ondulación Permanente",
      price: 55000,
      duration: 90,
      category: "extras",
      description: "Permanente para crear ondas naturales",
    },
  ];

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);

    if (isSelected) {
      onServicesChange(selectedServices.filter((s) => s.id !== service.id));
    } else {
      onServicesChange([...selectedServices, service]);
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

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  const canProceed = selectedServices.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
        <h2 className="mb-6 text-2xl font-bold text-white">Selecciona tus servicios</h2>

        <div className="space-y-8">
          {["barberia", "colorimetria", "extras"].map((category) => (
            <div key={category}>
              <div className="mb-4 flex items-center space-x-3">
                <div className="rounded-lg bg-yellow-500/20 p-2 text-yellow-500">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="text-xl font-semibold text-white">{getCategoryName(category)}</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {getServicesByCategory(category).map((service) => {
                  const isSelected = selectedServices.some((s) => s.id === service.id);

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
                        <h4 className="text-lg font-semibold text-white">{service.name}</h4>
                        <div className="text-right">
                          <p className="text-lg font-bold text-yellow-500">
                            ${service.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-400">{service.duration} min</p>
                        </div>
                      </div>

                      {service.description && (
                        <p className="text-sm text-gray-300">{service.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {selectedServices.length > 0 && (
        <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-xl font-semibold text-white">Resumen de servicios</h3>

          <div className="mb-6 space-y-3">
            {selectedServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between border-b border-gray-700 py-2 last:border-b-0"
              >
                <div>
                  <span className="font-medium text-white">{service.name}</span>
                  <span className="ml-2 text-sm text-gray-400">({service.duration} min)</span>
                </div>
                <span className="font-semibold text-yellow-500">
                  ${service.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-600 pt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <div className="text-white">
                <span>Total: </span>
                <span className="text-sm text-gray-400">({totalDuration} min aprox.)</span>
              </div>
              <span className="text-2xl text-yellow-500">${totalPrice.toLocaleString()}</span>
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
