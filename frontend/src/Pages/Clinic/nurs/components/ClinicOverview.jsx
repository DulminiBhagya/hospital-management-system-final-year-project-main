import React from 'react';
import { Users, UserPlus, Calendar, Activity, Shield, Stethoscope, Clipboard, UserCheck } from 'lucide-react';
import StatCard from './StatCard';
import StatusBadge from './StatusBadge';
import useDoctors from '../hooks/useDoctors';
import useAppointments from '../hooks/useAppointments';

const ClinicOverview = ({ todayStats, onTabChange }) => {
  const { doctors, loading: doctorsLoading } = useDoctors();
  const { appointments } = useAppointments();

  // Calculate real-time doctor statistics
  const getDoctorStats = (doctorId) => {
    const today = new Date().toISOString().split('T')[0];
    const doctorAppointments = appointments.filter(apt => 
      apt.doctorEmployeeId === doctorId && apt.date === today
    );
    
    const todayPatients = doctorAppointments.length;
    const completed = doctorAppointments.filter(apt => 
      apt.status?.toLowerCase() === 'completed' || apt.status?.toLowerCase() === 'done'
    ).length;
    
    return { todayPatients, completed };
  };

  return (
    <div className="space-y-8">
      {/* Key Performance Indicators */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Today's Overview</h2>
        <p className="text-gray-600">Real-time hospital statistics and performance metrics</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Patients"
          value={todayStats.totalPatients}
          subtitle="Registered patients"
          icon={Users}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Today's Registrations"
          value={todayStats.todayRegistrations}
          subtitle="New patients today"
          icon={UserPlus}
          color="green"
        />
        <StatCard
          title="Active Doctors"
          value={`${todayStats.availableDoctors}/${todayStats.totalDoctors}`}
          subtitle={`${todayStats.doctorUtilization}% availability`}
          icon={Stethoscope}
          color="purple"
        />
        <StatCard
          title="Appointments"
          value={todayStats.totalAppointments}
          subtitle={`${todayStats.completedAppointments} completed`}
          icon={Calendar}
          color="yellow"
        />
        <StatCard
          title="Completion Rate"
          value={`${todayStats.completionRate}%`}
          subtitle="Today's progress"
          icon={Activity}
          color="green"
        />
        <StatCard
          title="System Status"
          value="Online"
          subtitle="All systems operational"
          icon={Shield}
          color="indigo"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clipboard size={20} className="mr-2 text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onTabChange('register')}
            className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-105 group"
          >
            <UserPlus size={24} className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-blue-800">Add Patient</span>
          </button>
          <button 
            onClick={() => onTabChange('schedule')}
            className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200 hover:scale-105 group"
          >
            <Calendar size={24} className="text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-green-800">Schedule</span>
          </button>
          <button 
            onClick={() => onTabChange('patients')}
            className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 hover:scale-105 group"
          >
            <Users size={24} className="text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-purple-800">View Patients</span>
          </button>
          <button 
            onClick={() => onTabChange('reports')}
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all duration-200 hover:scale-105 group"
          >
            <Activity size={24} className="text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-orange-800">Reports</span>
          </button>
        </div>
      </div>

      {/* Medical Staff Status */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-25 to-indigo-25">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Stethoscope size={24} className="mr-3 text-blue-500" />
            Medical Staff Status
          </h3>
          <p className="text-sm text-gray-500 mt-1">Current availability and performance metrics</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-25 to-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Medical Professional</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Current Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Today's Load</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {doctorsLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500">Loading medical staff data...</p>
                    </div>
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users size={48} className="text-gray-200 mb-4" />
                      <p className="text-gray-400 text-lg font-medium">No medical staff data available</p>
                      <p className="text-gray-300 text-sm mt-2">Add doctors to view their information</p>
                    </div>
                  </td>
                </tr>
              ) : (
                doctors.map((doctor, index) => {
                  const stats = getDoctorStats(doctor.empId);
                  const colors = [
                    { bg: 'from-blue-200 to-blue-300', text: 'text-blue-700' },
                    { bg: 'from-green-200 to-green-300', text: 'text-green-700' },
                    { bg: 'from-purple-200 to-purple-300', text: 'text-purple-700' },
                    { bg: 'from-orange-200 to-orange-300', text: 'text-orange-700' }
                  ];
                  const doctorColor = colors[index % colors.length];
                  
                  return (
                  <tr key={doctor.id} className="hover:bg-blue-25/30 transition-colors duration-200">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${doctor.color || doctorColor.bg} flex items-center justify-center shadow-sm`}>
                          <span className={`${doctor.textColor || doctorColor.text} font-bold text-sm`}>
                            {doctor.avatar || doctor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-800">{doctor.name}</div>
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <UserCheck size={12} className="mr-1" />
                            {doctor.specialization} • ID: {doctor.empId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={`text-xs font-medium ${doctor.available ? 'text-green-600' : 'text-red-600'}`}>
                          {doctor.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-700">{stats.todayPatients}</div>
                      <div className="text-xs text-gray-400">appointments</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-emerald-500">{stats.completed}</div>
                      <div className="text-xs text-gray-400">completed</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="w-20 bg-gray-100 rounded-full h-2.5">
                            <div 
                              className={`bg-gradient-to-r ${doctorColor.bg.includes('blue') ? 'from-blue-300 to-blue-400' : 
                                doctorColor.bg.includes('green') ? 'from-green-300 to-green-400' :
                                doctorColor.bg.includes('purple') ? 'from-purple-300 to-purple-400' :
                                'from-orange-300 to-orange-400'} h-2.5 rounded-full transition-all duration-300`}
                              style={{ width: `${stats.todayPatients > 0 ? (stats.completed / stats.todayPatients) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-600 min-w-[3rem]">
                          {stats.todayPatients > 0 ? Math.round((stats.completed / stats.todayPatients) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClinicOverview;