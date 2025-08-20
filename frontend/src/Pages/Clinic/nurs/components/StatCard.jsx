import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend }) => {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 border-blue-200 text-blue-800 shadow-blue-100/50",
    green: "bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800 shadow-emerald-100/50",
    yellow: "bg-gradient-to-br from-amber-50 via-yellow-50 to-yellow-100 border-amber-200 text-amber-800 shadow-amber-100/50",
    red: "bg-gradient-to-br from-rose-50 via-red-50 to-red-100 border-rose-200 text-rose-800 shadow-rose-100/50",
    purple: "bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 border-purple-200 text-purple-800 shadow-purple-100/50",
    indigo: "bg-gradient-to-br from-indigo-50 via-indigo-50 to-indigo-100 border-indigo-200 text-indigo-800 shadow-indigo-100/50"
  };

  const iconColors = {
    blue: "text-blue-600",
    green: "text-emerald-600",
    yellow: "text-amber-600",
    red: "text-rose-600",
    purple: "text-purple-600",
    indigo: "text-indigo-600"
  };

  return (
    <div className={`p-6 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer backdrop-blur-sm ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wide">{title}</p>
            {trend && (
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp size={12} className="text-green-600" />
                <span className="text-green-600 font-medium">{trend}</span>
              </div>
            )}
          </div>
          <p className="text-4xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">{value}</p>
          {subtitle && <p className="text-sm opacity-75 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-white/60 group-hover:bg-white/80 transition-all duration-300 ${iconColors[color]}`}>
          <Icon size={28} className="group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;