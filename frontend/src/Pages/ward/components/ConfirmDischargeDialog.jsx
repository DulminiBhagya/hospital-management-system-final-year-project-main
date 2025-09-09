import React from 'react';
import { AlertTriangle, User, MapPin, Bed, CreditCard, X } from 'lucide-react';

const ConfirmDischargeDialog = ({ isOpen, onClose, onConfirm, patient, loading = false }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full m-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Patient Discharge</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to discharge this patient? This action will:
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Mark the patient as discharged</li>
              <li>• Free up the bed for new admissions</li>
              <li>• Update the hospital records permanently</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900 mb-2">Patient Information:</h4>
            
            <div className="flex items-center text-sm text-gray-700">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">Name:</span>
              <span className="ml-2">{patient.patientName}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-700">
              <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">Patient ID:</span>
              <span className="ml-2">{patient.patientNationalId}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-700">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">Ward:</span>
              <span className="ml-2">{patient.wardName}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-700">
              <Bed className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">Bed:</span>
              <span className="ml-2">{patient.bedNumber}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={loading}
            className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {loading ? 'Discharging...' : 'Yes, Discharge Patient'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDischargeDialog;