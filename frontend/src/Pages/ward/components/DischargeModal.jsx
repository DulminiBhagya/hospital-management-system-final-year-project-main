import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const DischargeModal = ({ isOpen, onClose, patient }) => {
  const [discharge, setDischarge] = useState({
    dischargeDate: new Date().toISOString().split('T')[0],
    dischargeTime: '',
    condition: 'stable',
    instructions: '',
    followUp: '',
    medications: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Discharge submitted:', discharge);
    onClose();
  };

  const handleClose = () => {
    setDischarge({
      dischargeDate: new Date().toISOString().split('T')[0],
      dischargeTime: '',
      condition: 'stable',
      instructions: '',
      followUp: '',
      medications: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Discharge Patient</h2>
          <p className="text-sm text-gray-600">Patient: {patient?.name} - Bed: {patient?.bedNumber}</p>
        </div>
        <div className="p-6">
          {/* Discharge Checklist */}
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-3 flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              Pre-Discharge Checklist
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Pending Lab Results</span>
                  <span className="text-red-600 font-medium">{patient?.pendingTests?.length || 0} pending</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unfulfilled Prescriptions</span>
                  <span className="text-green-600 font-medium">0 unfulfilled</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Final Vitals Recorded</span>
                  <span className="text-green-600 font-medium">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discharge Summary</span>
                  <span className="text-yellow-600 font-medium">⚠ Pending</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={discharge.dischargeDate}
                  onChange={(e) => setDischarge({...discharge, dischargeDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Time</label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={discharge.dischargeTime}
                  onChange={(e) => setDischarge({...discharge, dischargeTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition at Discharge</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={discharge.condition}
                onChange={(e) => setDischarge({...discharge, condition: e.target.value})}
              >
                <option value="stable">Stable</option>
                <option value="improved">Improved</option>
                <option value="unchanged">Unchanged</option>
                <option value="against_medical_advice">Against Medical Advice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Instructions</label>
              <textarea
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={discharge.instructions}
                onChange={(e) => setDischarge({...discharge, instructions: e.target.value})}
                placeholder="Detailed instructions for patient care at home..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Appointments</label>
              <textarea
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={discharge.followUp}
                onChange={(e) => setDischarge({...discharge, followUp: e.target.value})}
                placeholder="Schedule follow-up appointments..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Medications</label>
              <textarea
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={discharge.medications}
                onChange={(e) => setDischarge({...discharge, medications: e.target.value})}
                placeholder="List of medications to continue at home..."
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Complete Discharge
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DischargeModal;