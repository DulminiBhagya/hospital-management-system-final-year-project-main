import React from 'react';
import { 
  Droplets, 
  Users, 
  Monitor, 
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';

export default function DialysisHeader({ stats }) {
  const statCards = [
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      label: "Today's Sessions",
      value: stats.todaySessions,
      icon: Clock,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      label: 'Present Today',
      value: stats.presentToday,
      icon: TrendingUp,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200'
    },
    {
      label: 'Active Machines',
      value: `${stats.activeMachines}/${stats.totalMachines}`,
      icon: Monitor,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      label: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-200'
    }
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b-2 border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-6 space-y-4 lg:space-y-0">
          {/* Header Title */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Droplets className="w-9 h-9 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dialysis Management</h1>
              <p className="text-gray-600 text-sm font-medium mt-1">
                National Institute of Nephrology, Dialysis and Transplantation
              </p>
              <div className="flex items-center mt-2 text-gray-500 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {statCards.map((stat, index) => (
              <div 
                key={index}
                className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-3 hover:shadow-md transition-all duration-200 group`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${stat.textColor} mb-1`}>
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.textColor} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                
                {/* Progress indicator for attendance rate */}
                {stat.label === 'Attendance Rate' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Today</span>
                      <span className={stat.textColor}>{stats.attendanceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600 h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${stats.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Present: {stats.presentToday}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>Absent: {stats.absentToday}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Pending: {stats.pendingToday}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>In Progress: {stats.inProgressSessions}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Completed: {stats.completedSessions}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}