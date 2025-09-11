import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs sm:text-sm font-medium">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-white">{value}</p>
        </div>
        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor}`} />
      </div>
    </div>
  );
};