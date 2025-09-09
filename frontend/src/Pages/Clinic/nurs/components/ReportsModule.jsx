import React from 'react';
import { TrendingUp, Activity, Users, Calendar, FileText, Shield } from 'lucide-react';

const ReportsModule = ({ todayStats }) => {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical Reports & Analytics</h2>
        <p className="text-gray-600">Comprehensive healthcare analytics and reporting dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Analytics Preview */}
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp size={24} className="mr-3 text-blue-600" />
              Quick Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="font-medium text-gray-700">Total Patients Registered</span>
                <span className="text-2xl font-bold text-blue-600">{todayStats.totalPatients}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="font-medium text-gray-700">Today's Registrations</span>
                <span className="text-2xl font-bold text-green-600">{todayStats.todayRegistrations}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                <span className="font-medium text-gray-700">System Uptime</span>
                <span className="text-2xl font-bold text-purple-600">99.9%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity size={20} className="mr-2 text-green-600" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Database Connection</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">API Services</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Backup Status</span>
                <span className="flex items-center text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Last backup: 2 hours ago
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Coming Soon Features */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg border border-blue-200 p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Reports Module</h3>
            <p className="text-gray-600 mb-8">Comprehensive healthcare analytics and reporting suite coming soon</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Users size={16} className="mr-2 text-blue-600" />
                Patient Analytics
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Demographics analysis</li>
                <li>• Treatment outcomes</li>
                <li>• Patient flow tracking</li>
              </ul>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Calendar size={16} className="mr-2 text-green-600" />
                Operational Reports
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Appointment statistics</li>
                <li>• Staff performance</li>
                <li>• Resource utilization</li>
              </ul>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <TrendingUp size={16} className="mr-2 text-purple-600" />
                Financial Analysis
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Revenue tracking</li>
                <li>• Cost analysis</li>
                <li>• Billing reports</li>
              </ul>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Shield size={16} className="mr-2 text-red-600" />
                Compliance Reports
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• HIPAA compliance</li>
                <li>• Quality metrics</li>
                <li>• Audit trails</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl">
              Request Reports Module Access
            </button>
            <p className="text-xs text-gray-500 mt-3">Contact system administrator to enable advanced reporting features</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;