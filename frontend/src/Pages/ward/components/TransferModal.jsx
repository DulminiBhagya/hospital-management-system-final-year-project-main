import React, { useState, useEffect } from 'react';
import useTransfers from '../hooks/useTransfers';
import useWards from '../hooks/useWards';

const TransferModal = ({ isOpen, onClose, patient, showToast, onTransferSuccess }) => {
  const [transfer, setTransfer] = useState({
    newWardId: '',
    newBedNumber: '',
    transferReason: ''
  });
  
  const { loading: transferLoading, instantTransfer } = useTransfers(showToast);
  const { wards, loading: wardsLoading } = useWards(showToast);

  useEffect(() => {
    if (!isOpen) {
      setTransfer({
        newWardId: '',
        newBedNumber: '',
        transferReason: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter out the current ward to prevent self-transfer
  const availableWards = wards.filter(ward => 
    patient?.wardName ? !ward.wardName.includes(patient.wardName.split(' - ')[1]) : true
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!patient?.admissionId) {
      if (showToast) {
        showToast('error', 'Invalid Patient', 'Patient admission ID is required for transfer.');
      }
      return;
    }

    try {
      const transferData = {
        admissionId: patient.admissionId,
        newWardId: parseInt(transfer.newWardId),
        newBedNumber: transfer.newBedNumber,
        transferReason: transfer.transferReason
      };

      const result = await instantTransfer(transferData);
      
      if (onTransferSuccess) {
        onTransferSuccess(result);
      }
      
      handleClose();
    } catch {
      // Error already handled by the hook
    }
  };

  const handleClose = () => {
    setTransfer({
      newWardId: '',
      newBedNumber: '',
      transferReason: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Transfer Patient</h2>
          <p className="text-sm text-gray-600">Patient: {patient?.patientName} - Current Location: {patient?.wardName} - Bed: {patient?.bedNumber}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Ward</label>
            <select
              required
              disabled={wardsLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              value={transfer.newWardId}
              onChange={(e) => setTransfer({...transfer, newWardId: e.target.value, newBedNumber: ''})}
            >
              <option value="">Select Destination Ward</option>
              {availableWards.map((ward) => (
                <option key={ward.wardId} value={ward.wardId}>
                  {ward.wardName} ({ward.capacity - ward.currentOccupancy} beds available)
                </option>
              ))}
            </select>
            {wardsLoading && <p className="text-xs text-gray-500 mt-1">Loading wards...</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
            <input
              type="text"
              required
              placeholder="Enter bed number (e.g., 001, 002)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={transfer.newBedNumber}
              onChange={(e) => setTransfer({...transfer, newBedNumber: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Transfer</label>
            <textarea
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={transfer.transferReason}
              onChange={(e) => setTransfer({...transfer, transferReason: e.target.value})}
              placeholder="Medical reason for transfer..."
            />
          </div>
          {transfer.newWardId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2">Transfer Information</h4>
              <div className="text-sm text-blue-700">
                <p><strong>From:</strong> {patient?.wardName} - Bed {patient?.bedNumber}</p>
                <p><strong>To:</strong> {availableWards.find(w => w.wardId === parseInt(transfer.newWardId))?.wardName} - Bed {transfer.newBedNumber}</p>
                <p className="mt-2 text-xs text-blue-600">This transfer will be processed immediately upon submission.</p>
              </div>
            </div>
          )}
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
              disabled={transferLoading || wardsLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {transferLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {transferLoading ? 'Processing Transfer...' : 'Transfer Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;