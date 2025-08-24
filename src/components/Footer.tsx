// src/components/layout/Footer.tsx
// QUÉ HACE: Footer component reutilizable
// BENEFICIO: Footer consistente con información de contacto

import React from "react";
import { MapPin, Phone, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-800 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="mb-4 text-2xl font-bold text-yellow-500">MICHAEL THE BARBER STUDIOS</h3>
            <p className="mb-6 text-gray-400">
              Servicios de barbería y formación de alto estándar en Coquimbo
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/michael.the.barber"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-yellow-500"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h4 className="mb-4 text-lg font-semibold text-white">Contacto</h4>
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
            <h4 className="mb-4 text-lg font-semibold text-white">Horarios</h4>
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

        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Michael The Barber Studios. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
