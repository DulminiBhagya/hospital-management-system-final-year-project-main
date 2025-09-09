import React, { useState } from 'react';
import {
  X,
  User,
  MapPin,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Stethoscope,
  Bed,
  Phone,
  Mail
} from 'lucide-react';

const TransferDetailsModal = ({ isOpen, onClose, transfer }) => {
  const [activeDetailsTab, setActiveDetailsTab] = useState('overview');

  if (!isOpen || !transfer) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'approved': return <CheckCircle className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'urgent': return 'text-orange-600 bg-orange-100';
      case 'routine': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const detailsTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'checklist', label: 'Transfer Checklist' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'documents', label: 'Documents' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Patient Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Patient Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Name</label>
            <p className="text-sm text-gray-900">{transfer.patient.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Patient ID</label>
            <p className="text-sm text-gray-900">{transfer.patient.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Age</label>
            <p className="text-sm text-gray-900">{transfer.patient.age} years</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Gender</label>
            <p className="text-sm text-gray-900">{transfer.patient.gender}</p>
          </div>
        </div>
      </div>

      {/* Transfer Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Transfer Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">From</label>
            <p className="text-sm text-gray-900">{transfer.from} - Bed {transfer.fromBed}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">To</label>
            <p className="text-sm text-gray-900">{transfer.to} - Bed {transfer.toBed}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Requested By</label>
            <p className="text-sm text-gray-900">{transfer.requestedBy}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Approved By</label>
            <p className="text-sm text-gray-900">{transfer.approvedBy || 'Pending approval'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Request Date & Time</label>
            <p className="text-sm text-gray-900">{transfer.requestDate} at {transfer.requestTime}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Scheduled Date & Time</label>
            <p className="text-sm text-gray-900">
              {transfer.scheduledDate && transfer.scheduledTime 
                ? `${transfer.scheduledDate} at ${transfer.scheduledTime}`
                : 'Not scheduled'}
            </p>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Stethoscope className="h-4 w-4 mr-2" />
          Medical Information
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600">Reason for Transfer</label>
            <p className="text-sm text-gray-900 mt-1">{transfer.reason}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Additional Notes</label>
            <p className="text-sm text-gray-900 mt-1">{transfer.notes}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Urgency Level</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(transfer.urgency)} mt-1`}>
              <AlertTriangle size={12} className="mr-1" />
              {transfer.urgency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChecklist = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">Pre-Transfer Checklist</h4>
        <div className="space-y-3">
          {Object.entries(transfer.checklist).map(([item, completed]) => (
            <div key={item} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 ${
                  completed ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}>
                  {completed && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm text-gray-900">
                  {item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {completed ? 'Complete' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <strong>Note:</strong> All checklist items must be completed before transfer can proceed.
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      <div className="flow-root">
        <ul className="-mb-8">
          <li>
            <div className="relative pb-8">
              <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <FileText className="h-4 w-4 text-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-900">Transfer request submitted</p>
                    <p className="text-sm text-gray-500">by {transfer.requestedBy}</p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    {transfer.requestDate} {transfer.requestTime}
                  </div>
                </div>
              </div>
            </div>
          </li>

          {transfer.status !== 'pending' && (
            <li>
              <div className="relative pb-8">
                <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      transfer.status === 'approved' ? 'bg-green-500' : 
                      transfer.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      {transfer.status === 'approved' ? <CheckCircle className="h-4 w-4 text-white" /> :
                       transfer.status === 'rejected' ? <XCircle className="h-4 w-4 text-white" /> :
                       <Clock className="h-4 w-4 text-white" />}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-900">Transfer {transfer.status}</p>
                      {transfer.approvedBy && (
                        <p className="text-sm text-gray-500">by {transfer.approvedBy}</p>
                      )}
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      {transfer.scheduledDate || transfer.requestDate}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )}

          {transfer.status === 'completed' && (
            <li>
              <div className="relative">
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-900">Transfer completed</p>
                      <p className="text-sm text-gray-500">Patient successfully transferred</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      {transfer.scheduledDate} {transfer.scheduledTime}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Documents required for transfer:
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-gray-400 mr-3" />
            <span className="text-sm text-gray-900">Patient Medical Records</span>
          </div>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Attached</span>
        </div>
        
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-gray-400 mr-3" />
            <span className="text-sm text-gray-900">Current Medications List</span>
          </div>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Attached</span>
        </div>
        
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-gray-400 mr-3" />
            <span className="text-sm text-gray-900">Recent Lab Results</span>
          </div>
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
        </div>
        
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-gray-400 mr-3" />
            <span className="text-sm text-gray-900">Nursing Care Plan</span>
          </div>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Attached</span>
        </div>
      </div>
    </div>
  );

  const renderDetailsContent = () => {
    switch (activeDetailsTab) {
      case 'overview': return renderOverview();
      case 'checklist': return renderChecklist();
      case 'timeline': return renderTimeline();
      case 'documents': return renderDocuments();
      default: return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transfer Details</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                  {getStatusIcon(transfer.status)}
                  <span className="ml-1 capitalize">{transfer.status}</span>
                </span>
                <span className="text-sm text-gray-600">Transfer ID: #{transfer.id}</span>
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

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {detailsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDetailsTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeDetailsTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {renderDetailsContent()}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {transfer.status === 'pending' && (
                <>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Approve Transfer
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Reject Transfer
                  </button>
                </>
              )}
              {transfer.status === 'approved' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Mark as Completed
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Print Details
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferDetailsModal;