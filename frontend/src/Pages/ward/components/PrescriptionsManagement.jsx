import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react';
import PrescriptionModal from './PrescriptionModal';

const PrescriptionsManagement = ({ activeAdmissions = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'

  // Mock prescription data - replace with actual API data
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'RX001',
      patientName: 'John Doe',
      patientId: 'P001',
      admissionId: 'ADM001',
      wardNumber: 'W001',
      bedNumber: 'B012',
      drugName: 'Amoxicillin',
      dose: '500mg',
      frequency: 'Three times daily (TDS)',
      route: 'Oral',
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      status: 'active',
      instructions: 'Take with food. Complete the full course.',
      prescribedBy: 'Dr. Smith',
      prescribedDate: '2024-01-15T09:30:00',
      lastModified: '2024-01-15T09:30:00'
    },
    {
      id: 'RX002', 
      patientName: 'Jane Smith',
      patientId: 'P002',
      admissionId: 'ADM002',
      wardNumber: 'W002',
      bedNumber: 'B005',
      drugName: 'Paracetamol',
      dose: '1g',
      frequency: 'Four times daily (QDS)',
      route: 'Oral',
      startDate: '2024-01-14',
      endDate: '2024-01-18',
      status: 'completed',
      instructions: 'For fever and pain relief.',
      prescribedBy: 'Dr. Johnson',
      prescribedDate: '2024-01-14T14:15:00',
      lastModified: '2024-01-18T10:00:00'
    },
    {
      id: 'RX003',
      patientName: 'Michael Brown',
      patientId: 'P003',
      admissionId: 'ADM003',
      wardNumber: 'W001',
      bedNumber: 'B008',
      drugName: 'Insulin',
      dose: '10 units',
      frequency: 'Twice daily (BD)',
      route: 'Subcutaneous',
      startDate: '2024-01-10',
      endDate: '',
      status: 'active',
      instructions: 'Administer before meals. Monitor blood glucose levels.',
      prescribedBy: 'Dr. Williams',
      prescribedDate: '2024-01-10T08:00:00',
      lastModified: '2024-01-16T12:30:00'
    }
  ]);

  // Filter prescriptions based on search and filters
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(prescription => {
      const matchesSearch = 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;

      let matchesDate = true;
      if (filterDate !== 'all') {
        const prescDate = new Date(prescription.prescribedDate);
        const today = new Date();
        
        switch (filterDate) {
          case 'today':
            matchesDate = prescDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = prescDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = prescDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [prescriptions, searchTerm, filterStatus, filterDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: prescriptions.length,
      active: prescriptions.filter(p => p.status === 'active').length,
      completed: prescriptions.filter(p => p.status === 'completed').length,
      expired: prescriptions.filter(p => p.status === 'expired').length,
      todaysPrescriptions: prescriptions.filter(p => {
        const prescDate = new Date(p.prescribedDate);
        const today = new Date();
        return prescDate.toDateString() === today.toDateString();
      }).length
    };
  }, [prescriptions]);

  const handleNewPrescription = (patientData) => {
    setSelectedPatient(patientData);
    setShowPrescriptionModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'discontinued':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'completed':
        return <CheckCircle size={16} className="text-blue-600" />;
      case 'expired':
        return <XCircle size={16} className="text-red-600" />;
      case 'discontinued':
        return <XCircle size={16} className="text-gray-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Prescriptions Management</h2>
            <p className="text-gray-600">Manage electronic prescriptions for all ward patients</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'card' : 'list')}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {viewMode === 'list' ? 'Card View' : 'List View'}
            </button>
            <button
              onClick={() => handleNewPrescription(null)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus size={18} className="mr-2" />
              New Prescription
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Pill className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-700">{stats.completed}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-700">{stats.expired}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Rx</p>
              <p className="text-2xl font-bold text-purple-700">{stats.todaysPrescriptions}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, drug, or prescription ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-400" />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button className="px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Prescriptions ({filteredPrescriptions.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Download size={16} className="mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {viewMode === 'list' ? (
            // List View
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Medication</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Dosage</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Prescribed By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Pill size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No prescriptions found</p>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((prescription) => (
                    <tr key={prescription.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{prescription.patientName}</div>
                            <div className="text-sm text-gray-500">ID: {prescription.patientId}</div>
                            <div className="text-sm text-gray-500">Bed: {prescription.bedNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{prescription.drugName}</div>
                        <div className="text-sm text-gray-500">{prescription.frequency}</div>
                        <div className="text-sm text-gray-500">Route: {prescription.route}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{prescription.dose}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(prescription.startDate)}
                          {prescription.endDate && (
                            <span> - {formatDate(prescription.endDate)}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Prescribed: {formatDate(prescription.prescribedDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                          {getStatusIcon(prescription.status)}
                          <span className="ml-1 capitalize">{prescription.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{prescription.prescribedBy}</div>
                        <div className="text-sm text-gray-500">{formatTime(prescription.prescribedDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            // Card View
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPrescriptions.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center py-12">
                    <Pill size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No prescriptions found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Pill size={16} className="text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{prescription.patientName}</div>
                            <div className="text-sm text-gray-500">Bed: {prescription.bedNumber}</div>
                          </div>
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                          {getStatusIcon(prescription.status)}
                          <span className="ml-1 capitalize">{prescription.status}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{prescription.drugName}</div>
                          <div className="text-sm text-gray-600">{prescription.dose} • {prescription.frequency}</div>
                          <div className="text-sm text-gray-500">Route: {prescription.route}</div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            Start: {formatDate(prescription.startDate)}
                          </div>
                          {prescription.endDate && (
                            <div className="flex items-center mt-1">
                              <Calendar size={14} className="mr-1" />
                              End: {formatDate(prescription.endDate)}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Prescribed by {prescription.prescribedBy} on {formatDate(prescription.prescribedDate)}
                        </div>
                        
                        {prescription.instructions && (
                          <div className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start">
                              <AlertCircle size={14} className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{prescription.instructions}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => {
          setShowPrescriptionModal(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />
    </div>
  );
};

export default PrescriptionsManagement;