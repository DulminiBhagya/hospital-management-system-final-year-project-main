import React, { useState } from 'react';
import { Download, Printer } from 'lucide-react';

const LabResultsModal = ({ isOpen, onClose, patient }) => {
  const [labResults] = useState([
    {
      id: 1,
      testName: 'Complete Blood Count',
      date: '2025-01-18',
      status: 'completed',
      results: {
        'WBC': '7.2 K/uL',
        'RBC': '4.1 M/uL',
        'Hemoglobin': '12.8 g/dL',
        'Hematocrit': '38.2%',
        'Platelets': '285 K/uL'
      }
    },
    {
      id: 2,
      testName: 'Basic Metabolic Panel',
      date: '2025-01-18',
      status: 'completed',
      results: {
        'Glucose': '95 mg/dL',
        'BUN': '18 mg/dL',
        'Creatinine': '1.1 mg/dL',
        'Sodium': '140 mEq/L',
        'Potassium': '4.2 mEq/L'
      }
    },
    {
      id: 3,
      testName: 'Urine Analysis',
      date: '2025-01-17',
      status: 'pending',
      results: null
    }
  ]);

  if (!isOpen) return null;

  const handleExport = () => {
    console.log('Exporting lab results for patient:', patient?.name);
  };

  const handlePrint = () => {
    console.log('Printing lab results for patient:', patient?.name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Lab Results</h2>
          <p className="text-sm text-gray-600">Patient: {patient?.name} - Bed: {patient?.bedNumber}</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {labResults.map((test) => (
              <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{test.testName}</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">{test.date}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      test.status === 'completed' ? 'bg-green-100 text-green-800' :
                      test.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                </div>
                {test.results ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(test.results).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded">
                        <div className="text-sm font-medium text-gray-900">{key}</div>
                        <div className="text-lg text-gray-700">{value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">Results pending...</div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Export Results</span>
            </button>
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabResultsModal;