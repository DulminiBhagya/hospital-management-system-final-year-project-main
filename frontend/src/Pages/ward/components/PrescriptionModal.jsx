import React, { useState } from 'react';
import { X, Pill, Calendar, Clock, AlertCircle, FileText, User } from 'lucide-react';

const PrescriptionModal = ({ isOpen, onClose, patient }) => {
  const [prescription, setPrescription] = useState({
    drugName: '',
    dose: '',
    frequency: '',
    route: 'Oral',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Prescription submitted:', prescription);
    onClose();
  };

  const handleClose = () => {
    setPrescription({
      drugName: '',
      dose: '',
      frequency: '',
      route: 'Oral',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      instructions: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-gray-100">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Pill size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Electronic Prescription</h2>
              <div className="flex items-center space-x-2 text-blue-100">
                <User size={16} />
                <span className="text-lg">Patient: {patient?.name || 'Unknown Patient'}</span>
              </div>
              {patient?.wardNumber && (
                <div className="text-blue-200 text-sm">Ward: {patient.wardNumber}</div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Medication Information Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Pill size={20} className="mr-3 text-blue-600" />
              Medication Details
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Pill size={16} className="mr-2 text-blue-500" />
                  Drug Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  value={prescription.drugName}
                  onChange={(e) => setPrescription({...prescription, drugName: e.target.value})}
                  placeholder="Enter medication name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dosage *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  value={prescription.dose}
                  onChange={(e) => setPrescription({...prescription, dose: e.target.value})}
                  placeholder="e.g., 500mg, 1 tablet"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Clock size={16} className="mr-2 text-green-500" />
                  Frequency *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  value={prescription.frequency}
                  onChange={(e) => setPrescription({...prescription, frequency: e.target.value})}
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily (OD)">Once daily (OD)</option>
                  <option value="Twice daily (BD)">Twice daily (BD)</option>
                  <option value="Three times daily (TDS)">Three times daily (TDS)</option>
                  <option value="Four times daily (QDS)">Four times daily (QDS)</option>
                  <option value="Every 6 hours">Every 6 hours</option>
                  <option value="Every 8 hours">Every 8 hours</option>
                  <option value="Every 12 hours">Every 12 hours</option>
                  <option value="As needed (PRN)">As needed (PRN)</option>
                  <option value="Before meals">Before meals</option>
                  <option value="After meals">After meals</option>
                  <option value="At bedtime">At bedtime</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Route of Administration
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                  value={prescription.route}
                  onChange={(e) => setPrescription({...prescription, route: e.target.value})}
                >
                  <option value="Oral">Oral (PO)</option>
                  <option value="Intravenous">Intravenous (IV)</option>
                  <option value="Intramuscular">Intramuscular (IM)</option>
                  <option value="Subcutaneous">Subcutaneous (SC)</option>
                  <option value="Topical">Topical</option>
                  <option value="Inhalation">Inhalation</option>
                  <option value="Sublingual">Sublingual</option>
                  <option value="Rectal">Rectal</option>
                  <option value="Transdermal">Transdermal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Treatment Duration Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Calendar size={20} className="mr-3 text-green-600" />
              Treatment Duration
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Calendar size={16} className="mr-2 text-green-500" />
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm"
                  value={prescription.startDate}
                  onChange={(e) => setPrescription({...prescription, startDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Calendar size={16} className="mr-2 text-orange-500" />
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm"
                  value={prescription.endDate}
                  onChange={(e) => setPrescription({...prescription, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Special Instructions Section */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <FileText size={20} className="mr-3 text-amber-600" />
              Special Instructions & Notes
            </h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Patient Instructions
              </label>
              <textarea
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white shadow-sm resize-none"
                value={prescription.instructions}
                onChange={(e) => setPrescription({...prescription, instructions: e.target.value})}
                placeholder="Enter any special instructions, warnings, or notes for the patient..."
              />
              
              {/* Common instruction quick-add buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="px-3 py-1 text-xs bg-white border border-amber-200 rounded-full hover:bg-amber-50 transition-colors"
                  onClick={() => setPrescription({...prescription, instructions: prescription.instructions + 'Take with food. '})}
                >
                  + Take with food
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-xs bg-white border border-amber-200 rounded-full hover:bg-amber-50 transition-colors"
                  onClick={() => setPrescription({...prescription, instructions: prescription.instructions + 'Take on empty stomach. '})}
                >
                  + Take on empty stomach
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-xs bg-white border border-amber-200 rounded-full hover:bg-amber-50 transition-colors"
                  onClick={() => setPrescription({...prescription, instructions: prescription.instructions + 'Complete the full course. '})}
                >
                  + Complete full course
                </button>
                <button
                  type="button"
                  className="px-3 py-1 text-xs bg-white border border-amber-200 rounded-full hover:bg-amber-50 transition-colors"
                  onClick={() => setPrescription({...prescription, instructions: prescription.instructions + 'Do not exceed recommended dose. '})}
                >
                  + Do not exceed dose
                </button>
              </div>
            </div>
          </div>
        </form>
        </div>

        {/* Enhanced Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <AlertCircle size={16} />
              <span>Please review all details before generating prescription</span>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <FileText size={18} />
                <span>Generate E-Prescription</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;