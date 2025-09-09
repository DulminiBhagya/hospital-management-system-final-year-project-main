import React, { useMemo, useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  ArrowUpDown, 
  UserCheck, 
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  Users,
  Bed,
  AlertTriangle,
  Home,
  Heart,
  Zap,
  Stethoscope,
  MoveRight
} from 'lucide-react';

const PatientList = ({
  patients,
  loading,
  searchTerm,
  setSearchTerm,
  filterBy,
  setFilterBy,
  onViewPatient,
  onTransferPatient,
  onDischargePatient
}) => {
  const [activeWardTab, setActiveWardTab] = useState('all');

  // Define ward tabs with their configurations
  const wardTabs = useMemo(() => [
    { id: 'all', name: 'All Patients', icon: Users, color: 'gray' },
    { id: 'ward1', name: 'Ward1', icon: Home, color: 'blue', keywords: ['Ward 1', 'ward 1', 'Ward1', 'ward1', 'General'] },
    { id: 'ward2', name: 'Ward2', icon: Home, color: 'green', keywords: ['Ward 2', 'ward 2', 'Ward2', 'ward2'] },
    { id: 'icu', name: 'ICU', icon: Heart, color: 'red', keywords: ['ICU', 'icu', 'Ward 3', 'ward 3', 'Ward3', 'ward3', 'Intensive', 'intensive'] },
    { id: 'dialysis', name: 'Dialysis', icon: Zap, color: 'purple', keywords: ['Dialysis', 'dialysis', 'Ward 4', 'ward 4', 'Ward4', 'ward4'] }
  ], []);

  // Filter and organize patients
  const filteredPatients = useMemo(() => {
    if (!patients || patients.length === 0) return [];
    
    let filtered = patients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.wardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientNationalId.toString().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(patient => patient.status.toLowerCase() === filterBy.toLowerCase());
    }

    // Apply ward filter
    if (activeWardTab !== 'all') {
      const wardConfig = wardTabs.find(tab => tab.id === activeWardTab);
      if (wardConfig && wardConfig.keywords) {
        filtered = filtered.filter(patient => {
          const wardName = patient.wardName || '';
          return wardConfig.keywords.some(keyword => 
            wardName.toLowerCase().includes(keyword.toLowerCase())
          );
        });
      }
    }

    return filtered;
  }, [patients, searchTerm, filterBy, activeWardTab, wardTabs]);

  // Calculate tab statistics
  const getTabStats = (tabId) => {
    if (!patients) return { total: 0, active: 0, critical: 0, stable: 0, discharged: 0 };

    let tabPatients = patients;
    
    if (tabId !== 'all') {
      const wardConfig = wardTabs.find(tab => tab.id === tabId);
      if (wardConfig && wardConfig.keywords) {
        tabPatients = patients.filter(patient => {
          const wardName = patient.wardName || '';
          return wardConfig.keywords.some(keyword => 
            wardName.toLowerCase().includes(keyword.toLowerCase())
          );
        });
      }
    }

    return {
      total: tabPatients.length,
      active: tabPatients.filter(p => p.status?.toLowerCase() === 'active').length,
      critical: tabPatients.filter(p => p.status?.toLowerCase() === 'critical').length,
      stable: tabPatients.filter(p => p.status?.toLowerCase() === 'stable').length,
      discharged: tabPatients.filter(p => p.status?.toLowerCase() === 'discharged').length
    };
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'discharged': return 'text-gray-600 bg-gray-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'stable': return 'text-green-600 bg-green-100';
      case 'improving': return 'text-blue-600 bg-blue-100';
      case 'transferred': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle size={14} />;
      case 'discharged': return <UserCheck size={14} />;
      case 'critical': return <XCircle size={14} />;
      case 'stable': return <CheckCircle size={14} />;
      case 'improving': return <Activity size={14} />;
      case 'transferred': return <MoveRight size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: HEADER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Patient Management</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and monitor patients across all wards</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{patients?.length || 0} Total Patients</span>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by patient name, bed number, or ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="discharged">Discharged</option>
                <option value="critical">Critical</option>
                <option value="stable">Stable</option>
              </select>
              {(searchTerm || filterBy !== 'all') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                  }}
                  className="px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WARD TABS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0 overflow-x-auto">
            {wardTabs.map((tab) => {
              const stats = getTabStats(tab.id);
              const isActive = activeWardTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveWardTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-4 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                    isActive
                      ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${isActive ? `text-${tab.color}-600` : 'text-gray-400'}`} />
                  <span>{tab.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive 
                      ? `bg-${tab.color}-100 text-${tab.color}-700` 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {stats.total}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Current Tab Statistics */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {(() => {
                  const currentTab = wardTabs.find(tab => tab.id === activeWardTab);
                  const TabIcon = currentTab.icon;
                  return (
                    <>
                      <div className={`h-8 w-8 bg-${currentTab.color}-100 rounded-lg flex items-center justify-center`}>
                        <TabIcon className={`h-4 w-4 text-${currentTab.color}-600`} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{currentTab.name}</h3>
                    </>
                  );
                })()}
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Search: "{searchTerm}"
                  </span>
                )}
                {filterBy !== 'all' && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium capitalize">
                    Filter: {filterBy}
                  </span>
                )}
                <span className="text-gray-500">
                  Showing {filteredPatients.length} patients
                </span>
              </div>
            </div>

            {/* Quick Statistics */}
            {(() => {
              const stats = getTabStats(activeWardTab);
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Active Patients</p>
                        <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Discharged</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.discharged}</p>
                      </div>
                      <UserCheck className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Patient Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Loading patients...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-2">No patients found</p>
                      <p className="text-sm text-gray-400">
                        {searchTerm || filterBy !== 'all' 
                          ? 'Try adjusting your search or filter criteria' 
                          : `No patients currently in ${wardTabs.find(t => t.id === activeWardTab)?.name}`
                        }
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.admissionId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{patient.patientName}</div>
                            <div className="text-xs text-gray-500">ID: {patient.patientNationalId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <Bed className="h-4 w-4 mr-2 text-gray-400" />
                            Bed {patient.bedNumber}
                          </div>
                          <div className="text-xs text-gray-500">{patient.wardName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                            {getStatusIcon(patient.status)}
                            <span className="ml-2 capitalize">{patient.status}</span>
                          </span>
                          {patient.status?.toLowerCase() === 'transferred' && patient.transferredTo && (
                            <div className="text-xs text-gray-600 mt-1 font-medium">
                              Transferred to: {patient.transferredTo}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            onClick={() => onViewPatient(patient)}
                            title="View Patient Details"
                          >
                            <Eye size={16} />
                          </button>
                          {patient.status?.toLowerCase() === 'active' && (
                            <>
                              <button
                                className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200"
                                onClick={() => onTransferPatient(patient)}
                                title="Transfer Patient"
                              >
                                <ArrowUpDown size={16} />
                              </button>
                              <button
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                                onClick={() => onDischargePatient(patient)}
                                title="Discharge Patient"
                              >
                                <UserCheck size={16} />
                              </button>
                            </>
                          )}
                          {patient.status?.toLowerCase() === 'discharged' && (
                            <div className="px-3 py-1 text-gray-500 bg-gray-100 rounded-lg text-sm">
                              Discharged
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;