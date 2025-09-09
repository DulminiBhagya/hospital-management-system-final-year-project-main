import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  History, 
  ArrowRight, 
  Clock, 
  MapPin, 
  User,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Activity,
  Users,
  List,
  Eye
} from 'lucide-react';
import useTransfers from '../hooks/useTransfers';

const TransferManagement = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterPatient, setFilterPatient] = useState('');
  
  const { 
    transferHistory, 
    historyLoading, 
    fetchTransferHistory,
    allTransfers,
    allTransfersLoading,
    fetchAllTransfers, 
    lastError 
  } = useTransfers(showToast);

  // Load all transfers on component mount
  useEffect(() => {
    if (activeTab === 'all') {
      fetchAllTransfers().catch(() => {
        // Error already handled by hook
      });
    }
  }, [activeTab, fetchAllTransfers]);

  const handleSearchPatient = async () => {
    if (!searchTerm.trim()) {
      if (showToast) {
        showToast('warning', 'Search Required', 'Please enter a patient National ID to search.');
      }
      return;
    }

    const patientId = searchTerm.trim();
    setSelectedPatientId(patientId);
    
    try {
      await fetchTransferHistory(patientId);
      if (showToast) {
        showToast('success', 'History Loaded', `Transfer history loaded for patient ID: ${patientId}`);
      }
    } catch {
      // Error already handled by hook
    }
  };

  // Get current data based on active tab
  const currentTransfers = activeTab === 'all' ? allTransfers : transferHistory;
  const currentLoading = activeTab === 'all' ? allTransfersLoading : historyLoading;

  // Filter and sort transfers
  const filteredAndSortedTransfers = useMemo(() => {
    if (!currentTransfers || currentTransfers.length === 0) return [];
    
    let filtered = [...currentTransfers];
    
    // Apply filters for all transfers view
    if (activeTab === 'all') {
      if (filterPatient) {
        filtered = filtered.filter(transfer => 
          transfer.patientName.toLowerCase().includes(filterPatient.toLowerCase()) ||
          transfer.patientNationalId.toString().includes(filterPatient)
        );
      }
    }
    
    // Sort transfers
    if (sortOrder === 'newest') {
      return filtered.sort((a, b) => new Date(b.transferDate) - new Date(a.transferDate));
    } else {
      return filtered.sort((a, b) => new Date(a.transferDate) - new Date(b.transferDate));
    }
  }, [currentTransfers, sortOrder, filterPatient, activeTab]);

  // Get unique patients for filters
  const uniquePatients = useMemo(() => {
    if (!allTransfers || allTransfers.length === 0) return [];
    const patients = [...new Set(allTransfers.map(t => ({ id: t.patientNationalId, name: t.patientName })))];
    return patients.sort((a, b) => a.name.localeCompare(b.name));
  }, [allTransfers]);

  const uniqueWards = useMemo(() => {
    if (!allTransfers || allTransfers.length === 0) return [];
    const wards = [...new Set([...allTransfers.map(t => t.fromWardName), ...allTransfers.map(t => t.toWardName)])];
    return wards.sort();
  }, [allTransfers]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getTransferIcon = (index, total) => {
    if (index === 0 && total > 1) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (index === total - 1) {
      return <Activity className="h-5 w-5 text-blue-600" />;
    } else {
      return <ArrowRight className="h-5 w-5 text-orange-600" />;
    }
  };

  const getTransferStatus = (index, total) => {
    if (index === 0 && total > 1) {
      return { label: 'Latest Transfer', color: 'text-green-600 bg-green-50' };
    } else if (index === total - 1) {
      return { label: 'Initial Transfer', color: 'text-blue-600 bg-blue-50' };
    } else {
      return { label: 'Transfer', color: 'text-orange-600 bg-orange-50' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <History className="mr-3 h-6 w-6 text-blue-600" />
                Transfer Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">View all transfers or search individual patient history</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center space-x-3 px-6 py-4 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <List className={`h-4 w-4 ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>All Transfers</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                activeTab === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {allTransfers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center space-x-3 px-6 py-4 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'patient'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className={`h-4 w-4 ${activeTab === 'patient' ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Patient Search</span>
              {selectedPatientId && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === 'patient' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {transferHistory.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Conditional Content Based on Tab */}
        <div className="p-6">
          {activeTab === 'all' ? (
            /* All Transfers View */
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Patient</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Patient name or ID..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filterPatient}
                    onChange={(e) => setFilterPatient(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {filterPatient && (
                  <button 
                    onClick={() => setFilterPatient('')}
                    className="px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
                <select
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <button
                  onClick={() => fetchAllTransfers()}
                  disabled={allTransfersLoading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {allTransfersLoading ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Patient Search View */
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient National ID
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Enter National ID (e.g., 200227804656)"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchPatient()}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {transferHistory.length > 0 && (
                  <select
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                )}
                
                <button
                  onClick={handleSearchPatient}
                  disabled={historyLoading}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {historyLoading ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search History
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {lastError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Transfers</h3>
              <p className="text-sm text-red-700 mt-1">{lastError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeTab === 'all' ? (
        /* All Transfers View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">All System Transfers</h3>
                <p className="text-sm text-gray-600">Complete transfer history across all patients and wards</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {filteredAndSortedTransfers.length} of {allTransfers.length} Transfer{allTransfers.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {currentLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Loading all transfers...</p>
              </div>
            ) : filteredAndSortedTransfers.length === 0 ? (
              <div className="text-center py-12">
                {allTransfers.length === 0 ? (
                  <>
                    <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Transfers Found</h3>
                    <p className="text-gray-500">No transfers have been recorded in the system yet.</p>
                  </>
                ) : (
                  <>
                    <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
                    <p className="text-gray-500">No transfers match your current filter criteria.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Stats */}
                {allTransfers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Transfers</p>
                          <p className="text-xl font-bold text-blue-900">{allTransfers.length}</p>
                        </div>
                        <History className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Unique Patients</p>
                          <p className="text-xl font-bold text-green-900">{uniquePatients.length}</p>
                        </div>
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Unique Wards</p>
                          <p className="text-xl font-bold text-purple-900">{uniqueWards.length}</p>
                        </div>
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Latest Transfer</p>
                          <p className="text-sm font-bold text-orange-900">
                            {formatDateTime(allTransfers[0]?.transferDate).date}
                          </p>
                        </div>
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Transfers Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredAndSortedTransfers.map((transfer) => {
                    const { date, time } = formatDateTime(transfer.transferDate);
                    
                    return (
                      <div key={transfer.transferId} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 rounded-lg p-2">
                              <ArrowRight className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Transfer #{transfer.transferId}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {transfer.patientName} (ID: {transfer.patientNationalId})
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div className="font-medium">{date}</div>
                            <div>{time}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 text-red-500 mr-2" />
                              <span className="font-medium">From:</span>
                              <span className="ml-1 text-gray-700">{transfer.fromWardName}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="font-medium text-red-600 ml-6">Bed:</span>
                              <span className="ml-1 text-gray-700">{transfer.fromBedNumber}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 text-green-500 mr-2" />
                              <span className="font-medium">To:</span>
                              <span className="ml-1 text-gray-700">{transfer.toWardName}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="font-medium text-green-600 ml-6">Bed:</span>
                              <span className="ml-1 text-gray-700">{transfer.toBedNumber}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex items-start">
                            <span className="text-sm font-medium text-gray-600 mr-2">Reason:</span>
                            <span className="text-sm text-gray-800 flex-1">{transfer.transferReason}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>Admission ID: {transfer.oldAdmissionId} → {transfer.newAdmissionId}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Patient Search Results */
        <>
          {selectedPatientId && !currentLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Patient Transfer History</h3>
                    <p className="text-sm text-gray-600">
                      Patient ID: {selectedPatientId} 
                      {transferHistory.length > 0 && ` - ${transferHistory[0].patientName}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                      {transferHistory.length} Transfer{transferHistory.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredAndSortedTransfers.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Transfer History Found</h3>
                    <p className="text-gray-500">No transfers have been recorded for this patient.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Stats for Patient */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600">Total Transfers</p>
                            <p className="text-2xl font-bold text-blue-900">{transferHistory.length}</p>
                          </div>
                          <History className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600">Unique Wards</p>
                            <p className="text-2xl font-bold text-green-900">
                              {new Set([...transferHistory.map(t => t.fromWardId), ...transferHistory.map(t => t.toWardId)]).size}
                            </p>
                          </div>
                          <MapPin className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-600">Latest Transfer</p>
                            <p className="text-sm font-bold text-purple-900">
                              {formatDateTime(transferHistory[0]?.transferDate).date}
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>
                    </div>

                    {/* Patient Timeline */}
                    <div className="relative">
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      <div className="space-y-6">
                        {filteredAndSortedTransfers.map((transfer, index) => {
                          const { date, time } = formatDateTime(transfer.transferDate);
                          const status = getTransferStatus(index, filteredAndSortedTransfers.length);
                          
                          return (
                            <div key={transfer.transferId} className="relative flex items-start">
                              <div className="absolute left-6 w-6 h-6 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center z-10">
                                {getTransferIcon(index, filteredAndSortedTransfers.length)}
                              </div>
                              
                              <div className="ml-16 flex-1">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                        {status.label}
                                      </span>
                                      <span className="text-sm text-gray-500">Transfer #{transfer.transferId}</span>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                      <div>{date}</div>
                                      <div className="font-medium">{time}</div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center text-sm">
                                        <MapPin className="h-4 w-4 text-red-500 mr-2" />
                                        <span className="font-medium">From:</span>
                                        <span className="ml-1 text-gray-700">{transfer.fromWardName}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="font-medium text-red-600 ml-6">Bed:</span>
                                        <span className="ml-1 text-gray-700">{transfer.fromBedNumber}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center text-sm">
                                        <MapPin className="h-4 w-4 text-green-500 mr-2" />
                                        <span className="font-medium">To:</span>
                                        <span className="ml-1 text-gray-700">{transfer.toWardName}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="font-medium text-green-600 ml-6">Bed:</span>
                                        <span className="ml-1 text-gray-700">{transfer.toBedNumber}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="border-t border-gray-200 pt-3">
                                    <div className="flex items-start">
                                      <span className="text-sm font-medium text-gray-600 mr-2">Reason:</span>
                                      <span className="text-sm text-gray-800 flex-1">{transfer.transferReason}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                      <span>Admission ID: {transfer.oldAdmissionId} → {transfer.newAdmissionId}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Search Performed */}
          {!selectedPatientId && !currentLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search Patient Transfer History</h3>
              <p className="text-gray-500 mb-6">
                Enter a patient's National ID to view their complete transfer history.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-green-800">
                  <strong>Example:</strong> Enter "200227804656" to see sample transfer history
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransferManagement;