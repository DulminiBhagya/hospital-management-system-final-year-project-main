import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User,
  Pill,
  FileText,
  Shield,
  Calendar
} from 'lucide-react';

export default function PrescriptionProcessing({ 
  prescriptions, 
  loading, 
  onProcessPrescription, 
  onUpdateStatus,
  onCheckInteractions,
  drugDatabase,
  stats 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [interactionResults, setInteractionResults] = useState(null);

  // Filter prescriptions based on search and status
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(prescription => {
      const matchesSearch = !searchTerm || 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, searchTerm, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dispensed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received':
        return <ClipboardList className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'dispensed':
        return <Shield className="w-4 h-4" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleViewPrescription = async (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetails(true);
    
    // Check for drug interactions
    try {
      const interactions = await onCheckInteractions(prescription.medications);
      setInteractionResults(interactions);
    } catch (error) {
      console.error('Failed to check interactions:', error);
    }
  };

  const handleStatusUpdate = async (prescriptionId, newStatus) => {
    try {
      await onUpdateStatus(prescriptionId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleProcessPrescription = async (prescription) => {
    try {
      await onProcessPrescription(prescription.prescriptionId);
    } catch (error) {
      console.error('Failed to process prescription:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading prescriptions...</span>
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
              <p className="text-sm font-medium text-gray-600">Total Today</p>
              <p className="text-3xl font-bold text-blue-600">{stats.todayPrescriptions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingPrescriptions}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready</p>
              <p className="text-3xl font-bold text-green-600">{stats.readyPrescriptions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dispensed</p>
              <p className="text-3xl font-bold text-purple-600">{stats.dispensedToday}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="received">Received</option>
                <option value="in-progress">In Progress</option>
                <option value="ready">Ready</option>
                <option value="dispensed">Dispensed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
          </div>
        </div>
      </div>

      {/* Prescription List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Prescription Processing</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map((prescription) => (
              <div key={prescription.prescriptionId} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Prescription Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Pill className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {prescription.prescriptionId}
                          </h4>
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                            {getStatusIcon(prescription.status)}
                            <span className="capitalize">{prescription.status.replace('-', ' ')}</span>
                          </span>
                          {prescription.priority !== 'normal' && (
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(prescription.priority)}`}>
                              {prescription.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Patient: {prescription.patientName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>Doctor: {prescription.doctorName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Received: {new Date(prescription.receivedDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Medications Preview */}
                        <div className="mt-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            Medications ({prescription.medications.length}):
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {prescription.medications.slice(0, 3).map((med, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {med.drugName} - {med.dosage}
                              </span>
                            ))}
                            {prescription.medications.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{prescription.medications.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Warnings */}
                        {prescription.warnings && prescription.warnings.length > 0 && (
                          <div className="mt-3 flex items-center space-x-2 text-sm text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{prescription.warnings.length} warning(s) detected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleViewPrescription(prescription)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>

                    {prescription.status === 'received' && (
                      <button
                        onClick={() => handleProcessPrescription(prescription)}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Process</span>
                      </button>
                    )}

                    {prescription.status === 'in-progress' && (
                      <button
                        onClick={() => handleStatusUpdate(prescription.prescriptionId, 'ready')}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Ready</span>
                      </button>
                    )}

                    {(prescription.status === 'received' || prescription.status === 'in-progress') && (
                      <button
                        onClick={() => handleStatusUpdate(prescription.prescriptionId, 'rejected')}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Prescriptions Found
              </h3>
              <p className="text-gray-600">
                {prescriptions.length === 0 
                  ? "No prescriptions have been received yet." 
                  : "No prescriptions match your current search criteria."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Details Modal */}
      {showDetails && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Prescription Details</h2>
                <p className="text-green-100 text-sm">ID: {selectedPrescription.prescriptionId}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedPrescription.patientName}</p>
                    <p><span className="font-medium">ID:</span> {selectedPrescription.patientId}</p>
                    <p><span className="font-medium">Age:</span> {selectedPrescription.patientAge}</p>
                    <p><span className="font-medium">Allergies:</span> {selectedPrescription.allergies || 'None recorded'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Prescription Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Doctor:</span> {selectedPrescription.doctorName}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedPrescription.prescribedDate).toLocaleString()}</p>
                    <p><span className="font-medium">Priority:</span> <span className="capitalize">{selectedPrescription.priority}</span></p>
                    <p><span className="font-medium">Status:</span> <span className="capitalize">{selectedPrescription.status}</span></p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Medications</h3>
                <div className="space-y-3">
                  {selectedPrescription.medications.map((medication, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium">{medication.drugName}</p>
                          <p className="text-sm text-gray-600">{medication.genericName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Dosage</p>
                          <p className="font-medium">{medication.dosage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Frequency</p>
                          <p className="font-medium">{medication.frequency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium">{medication.duration}</p>
                        </div>
                      </div>
                      {medication.instructions && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm"><span className="font-medium">Instructions:</span> {medication.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Drug Interactions */}
              {interactionResults && interactionResults.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    Drug Interactions Detected
                  </h3>
                  <div className="space-y-2">
                    {interactionResults.map((interaction, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="font-medium text-red-900">{interaction.severity} Interaction</p>
                        <p className="text-sm text-red-800">{interaction.description}</p>
                        <p className="text-xs text-red-700 mt-1">Drugs: {interaction.drugs.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}