import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SystemStatusProps {
  barberosCount: number;
  serviciosCount: number;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ barberosCount, serviciosCount }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Estado del Sistema</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <span className="text-sm text-gray-300">
            Barberos activos: <span className="text-white font-medium">{barberosCount}</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <span className="text-sm text-gray-300">
            Servicios: <span className="text-white font-medium">{serviciosCount}</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <span className="text-sm text-gray-300">Sistema operativo</span>
        </div>
      </div>
    </div>
  );
};