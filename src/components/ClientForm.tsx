import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { Service, TimeSlot, Booking } from '../types/booking';

interface ClientFormProps {
  selectedDate: string;
  selectedTime: TimeSlot | null;
  selectedServices: Service[];
  onBack: () => void;
  onSubmit: (booking: Booking) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  selectedDate,
  selectedTime,
  selectedServices,
  onBack,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
    const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      date: selectedDate,
      time: selectedTime?.time || '',
      services: selectedServices,
      client: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        notes: formData.notes.trim() || undefined
      },
      totalPrice,
      duration: totalDuration,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    onSubmit(booking);
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Datos del cliente</h2>
        
        {/* Booking Summary */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Fecha</p>
              <p className="text-white font-semibold">
                {new Date(selectedDate).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Hora</p>
              <p className="text-white font-semibold">{selectedTime?.time}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Duración estimada</p>
              <p className="text-white font-semibold">{totalDuration} min</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Servicios seleccionados</p>
                <p className="text-white">
                  {selectedServices.map(s => s.name).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-yellow-500 font-bold text-xl">
                  ${totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                <User className="inline h-5 w-5 mr-2" />
                Nombre completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20'
                }`}
                placeholder="Ingresa tu nombre completo"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                <Phone className="inline h-5 w-5 mr-2" />
                Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20'
                }`}
                placeholder="+56 9 1234 5678"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              <Mail className="inline h-5 w-5 mr-2" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20'
              }`}
              placeholder="tu.email@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              <MessageSquare className="inline h-5 w-5 mr-2" />
              Notas adicionales (opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-yellow-500 focus:ring-yellow-500/20 transition-all resize-none"
              placeholder="¿Tienes alguna preferencia especial o comentario?"
            />
          </div>

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center space-x-2 bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
            </button>
            
            <button
              type="submit"
              className="flex items-center space-x-2 bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Confirmar Reserva</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;