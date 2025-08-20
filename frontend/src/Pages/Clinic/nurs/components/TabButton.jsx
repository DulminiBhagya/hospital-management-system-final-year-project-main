import React from 'react';

const TabButton = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 group ${
      active 
        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25 transform scale-105' 
        : 'text-gray-600 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
    }`}
  >
    <Icon size={20} className={`transition-transform duration-300 ${
      active ? 'rotate-0' : 'group-hover:scale-110'
    }`} />
    <span className="text-sm font-medium">{children}</span>
    {active && (
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-white rounded-full opacity-75"></div>
    )}
  </button>
);

export default TabButton;