import React from 'react';

interface DesktopTabsProps {
  tabs: { id: string; label: string; icon: React.ElementType; emoji: string }[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
}

export const DesktopTabs: React.FC<DesktopTabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="hidden sm:block bg-gray-800 border-b border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-all duration-200 whitespace-nowrap text-sm lg:text-base border-b-2 ${
                  isActive
                    ? 'bg-gray-900 border-yellow-500 text-yellow-500 font-semibold'
                    : 'border-transparent text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">{tab.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};