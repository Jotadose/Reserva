import React from "react";
import { Download, X } from "lucide-react";
import { usePWA } from "../hooks/usePWA";

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
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-xl">
        <div className="flex items-start space-x-3">
          <div className="rounded-lg bg-yellow-500 p-2">
            <Download className="h-5 w-5 text-black" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Instalar App</h3>
            <p className="mt-1 text-sm text-gray-400">
              Agrega Michael The Barber a tu pantalla de inicio para acceso rápido
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={installPWA}
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-600"
              >
                Instalar
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
