import React, { useState } from 'react';
import {
  X,
  Search,
  User,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  Bed,
  CheckCircle,
  XCircle
} from 'lucide-react';

const NewTransferModal = ({ isOpen, onClose, patients, wardAvailability }) => {
  const [step, setStep] = useState(1);
  const [transferData, setTransferData] = useState({
    patientId: '',
    destination: '',
    urgency: 'routine',
    reason: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    checklist: {
      medicalRecords: false,
      medications: false,
      labResults: false,
      nursingPlan: false
    }
  });

  const [patientSearch, setPatientSearch] = useState('');

  if (!isOpen) return null;

  const filteredPatients = patients?.filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.bedNumber.toLowerCase().includes(patientSearch.toLowerCase())
  ) || [];

  const selectedPatient = patients?.find(p => p.id === transferData.patientId);

  const handleChecklistChange = (item) => {
    setTransferData({
      ...transferData,
      checklist: {
        ...transferData.checklist,
        [item]: !transferData.checklist[item]
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Transfer request submitted:', transferData);
    // Reset form
    setTransferData({
      patientId: '',
      destination: '',
      urgency: 'routine',
      reason: '',
      scheduledDate: '',
      scheduledTime: '',
      notes: '',
      checklist: {
        medicalRecords: false,
        medications: false,
        labResults: false,
        nursingPlan: false
      }
    });
    setStep(1);
    onClose();
  };

  const canProceedToStep2 = transferData.patientId && transferData.destination;
  const canProceedToStep3 = canProceedToStep2 && transferData.reason.trim();
  const allChecklistComplete = Object.values(transferData.checklist).every(item => item);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Patient</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search patients by name or bed number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
          />
        </div>

        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredPatients.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No patients found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    transferData.patientId === patient.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setTransferData({...transferData, patientId: patient.id})}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{patient.name}</h4>
                      <p className="text-sm text-gray-600">
                        {patient.age}y, {patient.gender} • Bed {patient.bedNumber}
                      </p>
                      <p className="text-sm text-gray-500">{patient.ward}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{patient.diagnosis}</p>
                      <p className="text-sm text-gray-500">Dr. {patient.doctor}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Destination</h3>
        <div className="grid grid-cols-1 gap-3">
          {wardAvailability?.map((ward) => (
            <div
              key={ward.ward}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                transferData.destination === ward.ward
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setTransferData({...transferData, destination: ward.ward})}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">{ward.ward}</h4>
                    <p className="text-sm text-gray-600">
                      {ward.available !== 'N/A' ? `${ward.available}/${ward.total} beds available` : 'Outpatient Clinic'}
                    </p>
                  </div>
                </div>
                {ward.available !== 'N/A' && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    ward.available > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {ward.available > 0 ? 'Available' : 'Full'}
                  </span>
                )}
              </div>
            </div>
          )) || []}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Selected Transfer</h4>
        <div className="text-sm text-blue-800">
          <strong>{selectedPatient?.name}</strong> from <strong>{selectedPatient?.ward}</strong> to <strong>{transferData.destination}</strong>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={transferData.urgency}
          onChange={(e) => setTransferData({...transferData, urgency: e.target.value})}
        >
          <option value="routine">Routine</option>
          <option value="urgent">Urgent</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Transfer *</label>
        <textarea
          required
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={transferData.reason}
          onChange={(e) => setTransferData({...transferData, reason: e.target.value})}
          placeholder="Provide detailed medical reason for transfer..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={transferData.scheduledDate}
            onChange={(e) => setTransferData({...transferData, scheduledDate: e.target.value})}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
          <input
            type="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={transferData.scheduledTime}
            onChange={(e) => setTransferData({...transferData, scheduledTime: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
        <textarea
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={transferData.notes}
          onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
          placeholder="Any additional instructions or information..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Transfer Summary</h4>
        <div className="text-sm text-green-800 space-y-1">
          <div><strong>Patient:</strong> {selectedPatient?.name} ({selectedPatient?.bedNumber})</div>
          <div><strong>From:</strong> {selectedPatient?.ward} → <strong>To:</strong> {transferData.destination}</div>
          <div><strong>Urgency:</strong> {transferData.urgency}</div>
          {transferData.scheduledDate && (
            <div><strong>Scheduled:</strong> {transferData.scheduledDate} {transferData.scheduledTime}</div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
          <AlertTriangle size={16} className="mr-2" />
          Pre-Transfer Checklist
        </h4>
        <div className="space-y-3">
          {Object.entries(transferData.checklist).map(([item, completed]) => (
            <div key={item} className="flex items-center">
              <input
                type="checkbox"
                id={item}
                checked={completed}
                onChange={() => handleChecklistChange(item)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={item} className="ml-3 text-sm text-yellow-800">
                {item === 'medicalRecords' && 'Patient chart and medical records'}
                {item === 'medications' && 'Current medications list'}
                {item === 'labResults' && 'Recent lab results and imaging'}
                {item === 'nursingPlan' && 'Nursing care plan'}
              </label>
            </div>
          ))}
        </div>
        
        {!allChecklistComplete && (
          <div className="mt-3 text-sm text-yellow-700">
            <strong>Note:</strong> All checklist items should be completed before submitting the transfer request.
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Transfer request will be sent for approval</li>
          <li>Receiving ward will be notified of bed reservation</li>
          <li>You'll receive confirmation once approved</li>
          <li>Patient transfer will be scheduled accordingly</li>
        </ol>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Transfer Request</h2>
              <div className="flex items-center mt-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step > stepNumber ? <CheckCircle size={16} /> : stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-12 h-0.5 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                <span className={step === 1 ? 'font-medium text-blue-600' : ''}>Patient & Destination</span>
                <span className={step === 2 ? 'font-medium text-blue-600' : ''}>Transfer Details</span>
                <span className={step === 3 ? 'font-medium text-blue-600' : ''}>Review & Submit</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !canProceedToStep2) ||
                    (step === 2 && !canProceedToStep3)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Transfer Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTransferModal;