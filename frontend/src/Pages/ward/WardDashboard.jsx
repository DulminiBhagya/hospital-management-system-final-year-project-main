import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, 
  FileText, 
  ArrowUpDown, 
  Users,
  Bed,
  UserPlus,
  BarChart3
} from 'lucide-react';

// Import components
import WardHeader from './components/WardHeader';
import WardOverview from './components/WardOverview';
import PatientList from './components/PatientList';
import TransferModal from './components/TransferModal';
import PatientDetailsModal from './components/PatientDetailsModal';
import ConfirmDischargeDialog from './components/ConfirmDischargeDialog';
import TransferManagement from './components/TransferManagement';
import AdmitPatientModal from './components/AdmitPatientModal';
import PrescriptionsManagement from './components/PrescriptionsManagement';
import WardAnalytics from './components/WardAnalytics';
import { ToastContainer } from '../Clinic/nurs/components/Toast';
import useAdmissions from './hooks/useAdmissions';
import usePatients from './hooks/usePatients';

const WardDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [transferModal, setTransferModal] = useState(false);
  const [confirmDischargeDialog, setConfirmDischargeDialog] = useState(false);
  const [patientDetailsModal, setPatientDetailsModal] = useState(false);
  const [admitPatientModal, setAdmitPatientModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Use the admissions hook to get all admissions (both active and discharged)
  const { allAdmissions, activeAdmissions, fetchingAdmissions, fetchActiveAdmissions, fetchAllAdmissions, dischargePatient, loading } = useAdmissions();
  
  // State for handling local updates
  const [localAllAdmissions, setLocalAllAdmissions] = useState([]);
  const [localActiveAdmissions, setLocalActiveAdmissions] = useState([]);
  
  // Enhanced patient data with persistent transfer information
  const enhanceWithTransferData = (admissions) => {
    const transferData = JSON.parse(localStorage.getItem('patientTransfers') || '{}');
    
    return admissions.map(admission => {
      const transferInfo = transferData[admission.admissionId];
      if (transferInfo && admission.status?.toLowerCase() === 'transferred') {
        return {
          ...admission,
          transferredTo: transferInfo.toWardName
        };
      }
      return admission;
    });
  };
  
  // Use local state if available, otherwise use hook data with transfer enhancement
  const displayAllAdmissions = localAllAdmissions.length > 0 
    ? localAllAdmissions 
    : enhanceWithTransferData(allAdmissions);
  const displayActiveAdmissions = localActiveAdmissions.length > 0 
    ? localActiveAdmissions 
    : enhanceWithTransferData(activeAdmissions);
  
  // Use the patients hook to get patient details
  const { selectedPatient: patientDetails, fetchingPatient, getPatientByNationalId, setSelectedPatient: setPatientDetails } = usePatients();

  // Toast functions
  const showToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    const newToast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
  };

  const closeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Handle transfer success
  const handleTransferSuccess = (transferResult) => {
    // Store transfer information persistently
    if (transferResult && selectedPatient) {
      const transferData = JSON.parse(localStorage.getItem('patientTransfers') || '{}');
      transferData[selectedPatient.admissionId] = {
        toWardName: transferResult.toWardName,
        transferDate: new Date().toISOString()
      };
      localStorage.setItem('patientTransfers', JSON.stringify(transferData));

      // Update the local patient data with transfer destination
      const updatedData = (prevAdmissions) => 
        prevAdmissions.map(admission => 
          admission.admissionId === selectedPatient.admissionId
            ? {
                ...admission,
                status: 'TRANSFERRED',
                transferredTo: transferResult.toWardName
              }
            : admission
        );
      
      setLocalAllAdmissions(updatedData(allAdmissions));
      setLocalActiveAdmissions(updatedData(activeAdmissions));
    }
    
    // Refresh admissions data after a short delay to get updated data from backend
    setTimeout(() => {
      fetchAllAdmissions();
      fetchActiveAdmissions();
      // Clear local state after backend refresh - transfer data will persist via localStorage
      setLocalAllAdmissions([]);
      setLocalActiveAdmissions([]);
    }, 2000);
    
    console.log('Transfer completed:', transferResult);
  };

  // Sample ward data
  const [wards] = useState([
    { id: 1, name: 'Ward 1 - General', occupied: 12, total: 20, type: 'general' },
    { id: 2, name: 'Ward 2 - General', occupied: 14, total: 20, type: 'general' },
    { id: 3, name: 'Ward 2 - ICU', occupied: 8, total: 10, type: 'icu' },
    { id: 4, name: 'Ward 3 - Dialysis', occupied: 6, total: 8, type: 'specialty' }
  ]);


  // Calculate statistics
  const wardStats = useMemo(() => {
    const totalBeds = wards.reduce((sum, ward) => sum + ward.total, 0);
    const occupiedBeds = displayActiveAdmissions.length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      occupancyRate,
      totalPatients: displayActiveAdmissions.length,
      criticalPatients: 0, // Will be updated when we have patient status data
      stablePatients: 0,
      improvingPatients: 0
    };
  }, [wards, displayActiveAdmissions]);


  const tabs = [
    { id: 'overview', label: 'Ward Overview', icon: Activity },
    { id: 'patients', label: 'Patient List', icon: Users },
    { id: 'admit', label: 'Admit Patients', icon: UserPlus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'beds', label: 'Bed Management', icon: Bed },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'transfers', label: 'Transfers', icon: ArrowUpDown }
  ];

  // Handler functions for patient actions
  const handleViewPatient = async (patient) => {
    try {
      await getPatientByNationalId(patient.patientNationalId);
      setPatientDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch patient details:', error);
    }
  };

  const handleTransferPatient = (patient) => {
    setSelectedPatient(patient);
    setTransferModal(true);
  };

  const handleDischargePatient = (patient) => {
    setSelectedPatient(patient);
    setConfirmDischargeDialog(true);
  };

  const confirmDischarge = async () => {
    if (selectedPatient) {
      try {
        await dischargePatient(selectedPatient.admissionId);
        // Refresh the data after successful discharge
        await fetchAllAdmissions();
        await fetchActiveAdmissions();
        setSelectedPatient(null);
      } catch (error) {
        console.error('Failed to discharge patient:', error);
        // Error is already handled in the hook with toast notifications
      }
    }
  };

  // Fetch all admissions when component mounts
  useEffect(() => {
    fetchAllAdmissions();
    fetchActiveAdmissions(); // Still need this for ward stats
  }, [fetchAllAdmissions, fetchActiveAdmissions]);


  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <WardOverview 
          wardStats={wardStats} 
          wards={wards} 
          activeAdmissions={displayActiveAdmissions}
          allAdmissions={displayAllAdmissions}
          showToast={null} 
        />;
      case 'patients':
        return (
          <PatientList
            patients={displayAllAdmissions}
            loading={fetchingAdmissions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            onViewPatient={handleViewPatient}
            onTransferPatient={handleTransferPatient}
            onDischargePatient={handleDischargePatient}
          />
        );
      case 'admit':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Admit New Patients</h3>
                <p className="text-sm text-gray-600">Process new patient admissions to the ward</p>
              </div>
              <button
                onClick={() => setAdmitPatientModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlus size={18} className="mr-2" />
                Admit Patient
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Available Beds</p>
                    <p className="text-2xl font-bold text-blue-900">{wardStats.availableBeds}</p>
                  </div>
                  <Bed className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Admissions Today</p>
                    <p className="text-2xl font-bold text-green-900">3</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending Admissions</p>
                    <p className="text-2xl font-bold text-yellow-900">2</p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Emergency Admissions</p>
                    <p className="text-2xl font-bold text-purple-900">1</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Recent Admissions</h4>
              {fetchingAdmissions ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading recent admissions...</p>
                </div>
              ) : displayActiveAdmissions && displayActiveAdmissions.length > 0 ? (
                <div className="space-y-3">
                  {displayActiveAdmissions
                    .sort((a, b) => new Date(b.admissionDate) - new Date(a.admissionDate))
                    .slice(0, 3)
                    .map((admission) => {
                      const admissionDate = new Date(admission.admissionDate);
                      const now = new Date();
                      const hoursAgo = Math.floor((now - admissionDate) / (1000 * 60 * 60));
                      const timeAgo = hoursAgo < 1 ? 'Just now' : 
                                     hoursAgo === 1 ? '1 hour ago' : 
                                     `${hoursAgo} hours ago`;
                      
                      return (
                        <div key={admission.admissionId} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                          <div>
                            <p className="font-medium text-gray-900">{admission.patientName}</p>
                            <p className="text-sm text-gray-600">Bed {admission.bedNumber} • Admitted {timeAgo}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {admission.status}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-600">
                  <p className="text-sm">No recent admissions found</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'analytics':
        return (
          <WardAnalytics 
            allAdmissions={displayAllAdmissions}
            activeAdmissions={displayActiveAdmissions}
            wards={wards}
            loading={fetchingAdmissions}
            onRefresh={async () => {
              await fetchAllAdmissions();
              await fetchActiveAdmissions();
            }}
          />
        );
      case 'beds':
        return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">Bed Management (To be implemented)</div>;
      case 'prescriptions':
        return <PrescriptionsManagement activeAdmissions={displayActiveAdmissions} />;
      case 'transfers':
        return <TransferManagement />;
      default:
        return <WardOverview wardStats={wardStats} wards={wards} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <WardHeader />

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 py-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Modals */}
      <TransferModal
        isOpen={transferModal}
        onClose={() => {
          setTransferModal(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        showToast={showToast}
        onTransferSuccess={handleTransferSuccess}
      />
      <ConfirmDischargeDialog
        isOpen={confirmDischargeDialog}
        onClose={() => {
          setConfirmDischargeDialog(false);
          setSelectedPatient(null);
        }}
        onConfirm={confirmDischarge}
        patient={selectedPatient}
        loading={loading}
      />
      <PatientDetailsModal
        isOpen={patientDetailsModal}
        onClose={() => {
          setPatientDetailsModal(false);
          setPatientDetails(null);
        }}
        patient={patientDetails}
        loading={fetchingPatient}
      />
      <AdmitPatientModal
        isOpen={admitPatientModal}
        onClose={() => setAdmitPatientModal(false)}
        onAdmissionSuccess={() => {
          fetchAllAdmissions();
          fetchActiveAdmissions();
        }}
      />
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
};

export default WardDashboard;