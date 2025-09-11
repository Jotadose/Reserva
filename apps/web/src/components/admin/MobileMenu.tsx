import React from 'react';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: { id: string; label: string; emoji: string }[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, tabs, activeTab, onTabClick }) => {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="bg-gray-900 w-64 h-full shadow-xl">
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Menú</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabClick(tab.id);
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-black font-semibold'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};