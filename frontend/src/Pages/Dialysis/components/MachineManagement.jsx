import React, { useState, useMemo } from 'react';
import { 
  Monitor, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wrench,
  Calendar,
  Filter,
  Search,
  Activity
} from 'lucide-react';

export default function MachineManagement({ machines, sessions, loading, onUpdateMachine }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Filter machines based on search and status
  const filteredMachines = useMemo(() => {
    return machines.filter(machine => {
      const matchesSearch = !searchTerm || 
        machine.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.machineId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || machine.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [machines, searchTerm, filterStatus]);

  // Calculate machine utilization
  const machineStats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(session => 
      new Date(session.scheduledDate).toDateString() === today
    );

    const machineUtilization = machines.map(machine => {
      const machineSessions = todaySessions.filter(session => 
        session.machineId === machine.machineId
      );
      const utilizationHours = machineSessions.reduce((total, session) => {
        const duration = session.duration || '0h 0m';
        const hours = parseFloat(duration.match(/(\d+)h/) || [0, 0])[1];
        const minutes = parseFloat(duration.match(/(\d+)m/) || [0, 0])[1];
        return total + hours + (minutes / 60);
      }, 0);

      return {
        ...machine,
        utilizationHours,
        utilizationPercentage: Math.round((utilizationHours / 16) * 100), // 16 hours max per day
        sessionsCount: machineSessions.length
      };
    });

    const totalMachines = machines.length;
    const activeMachines = machines.filter(m => m.status === 'active').length;
    const maintenanceMachines = machines.filter(m => m.status === 'maintenance').length;
    const offlineMachines = machines.filter(m => m.status === 'offline').length;

    return {
      totalMachines,
      activeMachines,
      maintenanceMachines,
      offlineMachines,
      machineUtilization
    };
  }, [machines, sessions]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'offline':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (machineId, newStatus) => {
    try {
      await onUpdateMachine(machineId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update machine status:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading machines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Machines</p>
              <p className="text-3xl font-bold text-gray-900">{machineStats.totalMachines}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600">{machineStats.activeMachines}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-3xl font-bold text-yellow-600">{machineStats.maintenanceMachines}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Wrench className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-3xl font-bold text-red-600">{machineStats.offlineMachines}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search machines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredMachines.length} of {machines.length} machines
          </div>
        </div>
      </div>

      {/* Machine List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Dialysis Machines</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredMachines.length > 0 ? (
            filteredMachines.map((machine) => {
              const machineUtil = machineStats.machineUtilization.find(m => m.machineId === machine.machineId);
              
              return (
                <div key={machine.machineId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Machine Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Monitor className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {machine.machineName}
                            </h4>
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(machine.status)}`}>
                              {getStatusIcon(machine.status)}
                              <span className="capitalize">{machine.status}</span>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">ID:</span>
                              <span>{machine.machineId}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Location:</span>
                              <span>{machine.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Last Maintenance:</span>
                              <span>{new Date(machine.lastMaintenance).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Utilization Bar */}
                          {machineUtil && machine.status === 'active' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">Today's Utilization</span>
                                <span className="font-medium">
                                  {machineUtil.utilizationHours.toFixed(1)}h ({machineUtil.utilizationPercentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(machineUtil.utilizationPercentage, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {machineUtil.sessionsCount} sessions today
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      {machine.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(machine.machineId, 'maintenance')}
                            className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                          >
                            <Wrench className="w-4 h-4" />
                            <span>Maintenance</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(machine.machineId, 'offline')}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Offline</span>
                          </button>
                        </>
                      )}

                      {machine.status === 'maintenance' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(machine.machineId, 'active')}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Activate</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(machine.machineId, 'offline')}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Offline</span>
                          </button>
                        </>
                      )}

                      {machine.status === 'offline' && (
                        <button
                          onClick={() => handleStatusChange(machine.machineId, 'active')}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Activate</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedMachine(machine);
                          setShowMaintenanceModal(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>

                  {/* Maintenance Schedule */}
                  {machine.nextMaintenance && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Next Maintenance:</span>
                        <span className={`font-medium ${
                          new Date(machine.nextMaintenance) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            ? 'text-red-600'
                            : 'text-gray-900'
                        }`}>
                          {new Date(machine.nextMaintenance).toLocaleDateString()}
                        </span>
                        {new Date(machine.nextMaintenance) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            Due Soon
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Machines Found
              </h3>
              <p className="text-gray-600">
                {machines.length === 0 
                  ? "No dialysis machines are configured in the system." 
                  : "No machines match your current search criteria."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}