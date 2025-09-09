import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  User, 
  Scan,
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Pill,
  FileText,
  UserCheck,
  Calendar,
  Package
} from 'lucide-react';

export default function DispensingControl({ 
  prescriptions, 
  inventory,
  loading, 
  onDispenseMedication,
  onVerifyPatient,
  stats 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [patientVerified, setPatientVerified] = useState(false);
  const [dispensingData, setDispensingData] = useState({});

  // Filter ready prescriptions
  const readyPrescriptions = useMemo(() => {
    return prescriptions.filter(prescription => {
      const matchesSearch = !searchTerm || 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescriptionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase());
      
      return prescription.status === 'ready' && matchesSearch;
    });
  }, [prescriptions, searchTerm]);

  // Check medication availability
  const checkMedicationAvailability = (medications) => {
    return medications.map(med => {
      const inventoryItem = inventory.find(item => 
        item.drugName.toLowerCase() === med.drugName.toLowerCase() ||
        item.genericName.toLowerCase() === med.drugName.toLowerCase()
      );
      
      const isExpired = inventoryItem && new Date(inventoryItem.expiryDate) < new Date();
      const isAvailable = inventoryItem && inventoryItem.currentStock >= (med.quantity || 1);
      
      return {
        ...med,
        available: isAvailable && !isExpired,
        currentStock: inventoryItem?.currentStock || 0,
        expired: isExpired,
        batchNumber: inventoryItem?.batchNumber,
        expiryDate: inventoryItem?.expiryDate
      };
    });
  };

  const handleVerifyPatient = async (prescription) => {
    setSelectedPrescription({
      ...prescription,
      medicationsWithAvailability: checkMedicationAvailability(prescription.medications)
    });
    setPatientVerified(false);
    setShowDispenseModal(true);
  };

  const handlePatientVerification = () => {
    // In real implementation, this would involve:
    // - ID scanning/verification
    // - Biometric verification
    // - Photo identification
    setPatientVerified(true);
  };

  const handleDispenseMedication = async () => {
    if (!selectedPrescription || !patientVerified) return;

    try {
      const dispensingRecord = {
        prescriptionId: selectedPrescription.prescriptionId,
        patientId: selectedPrescription.patientId,
        dispensedBy: 'current-pharmacist', // Get from auth context
        dispensedAt: new Date().toISOString(),
        medications: selectedPrescription.medicationsWithAvailability,
        patientSignature: dispensingData.patientSignature,
        notes: dispensingData.notes
      };

      await onDispenseMedication(dispensingRecord);
      setShowDispenseModal(false);
      setSelectedPrescription(null);
      setPatientVerified(false);
      setDispensingData({});
    } catch (error) {
      console.error('Failed to dispense medication:', error);
    }
  };

  const canDispense = (prescription) => {
    const medicationsWithAvailability = checkMedicationAvailability(prescription.medications);
    return medicationsWithAvailability.every(med => med.available);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading dispensing queue...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready to Dispense</p>
              <p className="text-3xl font-bold text-green-600">{stats.readyPrescriptions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dispensed Today</p>
              <p className="text-3xl font-bold text-blue-600">{stats.dispensedToday}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing Rate</p>
              <p className="text-3xl font-bold text-purple-600">{stats.processingRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.processingRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name or prescription ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-96"
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {readyPrescriptions.length} prescription(s) ready for dispensing
          </div>
        </div>
      </div>

      {/* Dispensing Queue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Dispensing Control Center
          </h3>
          <p className="text-sm text-gray-600 mt-1">Verify patient identity and dispense medications safely</p>
        </div>

        <div className="divide-y divide-gray-100">
          {readyPrescriptions.length > 0 ? (
            readyPrescriptions.map((prescription) => {
              const medicationsWithAvailability = checkMedicationAvailability(prescription.medications);
              const canDispenseAll = medicationsWithAvailability.every(med => med.available);
              const hasUnavailableMeds = medicationsWithAvailability.some(med => !med.available);
              
              return (
                <div key={prescription.prescriptionId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Prescription Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            canDispenseAll ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            <Pill className={`w-6 h-6 ${
                              canDispenseAll ? 'text-green-600' : 'text-orange-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {prescription.prescriptionId}
                            </h4>
                            {hasUnavailableMeds && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                                Stock Issues
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4" />
                              <span>Patient: {prescription.patientName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4" />
                              <span>ID: {prescription.patientId}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>Ready: {new Date(prescription.readyDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Medications List */}
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">
                              Medications ({prescription.medications.length}):
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {medicationsWithAvailability.slice(0, 4).map((med, index) => (
                                <div key={index} className={`flex items-center justify-between p-2 rounded text-xs ${
                                  med.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                }`}>
                                  <div>
                                    <span className="font-medium">{med.drugName}</span>
                                    <span className="text-gray-600"> - {med.dosage}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {med.available ? (
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <AlertTriangle className="w-3 h-3 text-red-600" />
                                    )}
                                    <span className={med.available ? 'text-green-600' : 'text-red-600'}>
                                      {med.available ? 'Available' : med.expired ? 'Expired' : 'Out of Stock'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {prescription.medications.length > 4 && (
                                <div className="text-xs text-gray-500 col-span-2 text-center py-1">
                                  +{prescription.medications.length - 4} more medications
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleVerifyPatient(prescription)}
                        disabled={!canDispenseAll}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                          canDispenseAll
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Verify & Dispense</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prescriptions Ready</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "No prescriptions match your search criteria." 
                  : "No prescriptions are currently ready for dispensing."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dispensing Modal */}
      {showDispenseModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Medication Dispensing</h2>
                <p className="text-green-100 text-sm">ID: {selectedPrescription.prescriptionId}</p>
              </div>
              <button
                onClick={() => setShowDispenseModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              {/* Patient Verification Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Patient Verification
                  </h3>
                  {patientVerified && (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedPrescription.patientName}</p>
                      <p><span className="font-medium">Patient ID:</span> {selectedPrescription.patientId}</p>
                      <p><span className="font-medium">Age:</span> {selectedPrescription.patientAge}</p>
                      <p><span className="font-medium">Contact:</span> {selectedPrescription.patientPhone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    {!patientVerified ? (
                      <button
                        onClick={handlePatientVerification}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Scan className="w-5 h-5" />
                        <span>Verify Patient ID</span>
                      </button>
                    ) : (
                      <div className="text-center text-green-600">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-medium">Patient Verified</p>
                        <p className="text-sm">Identity confirmed</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medications to Dispense */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Medications to Dispense
                </h3>
                
                <div className="space-y-3">
                  {selectedPrescription.medicationsWithAvailability.map((medication, index) => (
                    <div key={index} className="bg-gray-50 border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{medication.drugName}</h4>
                          <p className="text-sm text-gray-600">{medication.genericName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Quantity: <span className="font-medium">{medication.quantity || 1}</span></p>
                          <p className="text-sm text-gray-600">Batch: <span className="font-medium">{medication.batchNumber}</span></p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Dosage: <span className="font-medium">{medication.dosage}</span></p>
                          <p className="text-gray-600">Frequency: <span className="font-medium">{medication.frequency}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration: <span className="font-medium">{medication.duration}</span></p>
                          <p className="text-gray-600">Stock: <span className="font-medium">{medication.currentStock}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expiry: <span className="font-medium">{new Date(medication.expiryDate).toLocaleDateString()}</span></p>
                          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            medication.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {medication.available ? 'Available' : 'Unavailable'}
                          </div>
                        </div>
                      </div>
                      
                      {medication.instructions && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm"><span className="font-medium">Instructions:</span> {medication.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispensing Notes */}
              {patientVerified && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dispensing Notes (Optional)
                  </label>
                  <textarea
                    value={dispensingData.notes || ''}
                    onChange={(e) => setDispensingData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Any additional notes or instructions..."
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDispenseModal(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispenseMedication}
                  disabled={!patientVerified}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Complete Dispensing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}