import React from 'react';

interface SummaryCardProps {
  title: string;
  items: { label: string; value: string | number }[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, items }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{item.label}</span>
            <span className="font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};