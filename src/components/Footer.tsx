// src/components/layout/Footer.tsx
// QUÉ HACE: Footer component reutilizable
// BENEFICIO: Footer consistente con información de contacto

import React from "react";
import { MapPin, Phone, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold text-yellow-500 mb-4">
              MICHAEL THE BARBER STUDIOS
            </h3>
            <p className="text-gray-400 mb-6">
              Servicios de barbería y formación de alto estándar en Coquimbo
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/michael.the.barber"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-gray-700 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-white mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-4 w-4 text-yellow-500" />
                <span>Lago Blanco 1585, Coquimbo</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-4 w-4 text-yellow-500" />
                <span>+56 9 1234 5678</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-white mb-4">Horarios</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex justify-between">
                <span>Lun - Vie:</span>
                <span>9:00 - 19:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sábado:</span>
                <span>9:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Domingo:</span>
                <span>Cerrado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Michael The Barber Studios. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
