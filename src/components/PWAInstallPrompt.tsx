import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, installPWA } = usePWA();
  const [showPrompt, setShowPrompt] = React.useState(false);

  React.useEffect(() => {
    if (isInstallable) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Mostrar después de 5 segundos

      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  if (!showPrompt || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
        <div className="flex items-start space-x-3">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <Download className="h-5 w-5 text-black" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">Instalar App</h3>
            <p className="text-gray-400 text-sm mt-1">
              Agrega Michael The Barber a tu pantalla de inicio para acceso rápido
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={installPWA}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg text-sm transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
