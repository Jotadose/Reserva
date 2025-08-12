import React from 'react';
import { Scissors, Palette, Plus, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Service } from '../types/booking';

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
  onNext
}) => {
  const services: Service[] = [
    {
      id: '1',
      name: 'Corte de Cabello',
      price: 12000,
      duration: 30,
      category: 'barberia',
      description: 'Corte clásico o moderno personalizado'
    },
    {
      id: '2',
      name: 'Corte + Barba',
      price: 16000,
      duration: 45,
      category: 'barberia',
      description: 'Corte completo con arreglo y perfilado de barba'
    },
    {
      id: '3',
      name: 'Corte + Barba + Limpieza',
      price: 22000,
      duration: 60,
      category: 'barberia',
      description: 'Servicio completo con limpieza facial'
    },
    {
      id: '4',
      name: 'Solo Barba',
      price: 6000,
      duration: 20,
      category: 'barberia',
      description: 'Arreglo y perfilado de barba'
    },
    {
      id: '5',
      name: 'Bloque de Color',
      price: 60000,
      duration: 120,
      category: 'colorimetria',
      description: 'Color uniforme en todo el cabello'
    },
    {
      id: '6',
      name: 'Platinado Global',
      price: 70000,
      duration: 150,
      category: 'colorimetria',
      description: 'Decoloración completa y tinte platino'
    },
    {
      id: '7',
      name: 'Visos',
      price: 60000,
      duration: 90,
      category: 'colorimetria',
      description: 'Mechas y reflejos profesionales'
    },
    {
      id: '8',
      name: 'Ondulación Permanente',
      price: 55000,
      duration: 90,
      category: 'extras',
      description: 'Permanente para crear ondas naturales'
    }
  ];

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    
    if (isSelected) {
      onServicesChange(selectedServices.filter(s => s.id !== service.id));
    } else {
      onServicesChange([...selectedServices, service]);
    }
  };

  const getServicesByCategory = (category: string) => {
    return services.filter(service => service.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'barberia':
        return <Scissors className="h-6 w-6" />;
      case 'colorimetria':
        return <Palette className="h-6 w-6" />;
      case 'extras':
        return <Plus className="h-6 w-6" />;
      default:
        return <Scissors className="h-6 w-6" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'barberia':
        return 'Barbería';
      case 'colorimetria':
        return 'Colorimetría';
      case 'extras':
        return 'Servicios Extras';
      default:
        return 'Servicios';
    }
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  const canProceed = selectedServices.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Selecciona tus servicios</h2>
        
        <div className="space-y-8">
          {['barberia', 'colorimetria', 'extras'].map(category => (
            <div key={category}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {getCategoryName(category)}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getServicesByCategory(category).map(service => {
                  const isSelected = selectedServices.some(s => s.id === service.id);
                  
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-black" />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white text-lg">
                          {service.name}
                        </h4>
                        <div className="text-right">
                          <p className="text-yellow-500 font-bold text-lg">
                            ${service.price.toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {service.duration} min
                          </p>
                        </div>
                      </div>
                      
                      {service.description && (
                        <p className="text-gray-300 text-sm">
                          {service.description}
                        </p>
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
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Resumen de servicios</h3>
          
          <div className="space-y-3 mb-6">
            {selectedServices.map(service => (
              <div key={service.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                <div>
                  <span className="text-white font-medium">{service.name}</span>
                  <span className="text-gray-400 text-sm ml-2">({service.duration} min)</span>
                </div>
                <span className="text-yellow-500 font-semibold">
                  ${service.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-600 pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <div className="text-white">
                <span>Total: </span>
                <span className="text-gray-400 text-sm">({totalDuration} min aprox.)</span>
              </div>
              <span className="text-yellow-500 text-2xl">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>
        
        {canProceed && (
          <button
            onClick={onNext}
            className="flex items-center space-x-2 bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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