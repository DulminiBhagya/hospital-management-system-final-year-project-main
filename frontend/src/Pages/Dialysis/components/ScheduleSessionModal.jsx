import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Clock, 
  User, 
  Monitor, 
  Calendar,
  Search,
  AlertCircle,
  Save,
  Users
} from 'lucide-react';

// Mock patient data - in real app, this would come from API
const mockPatients = [
  { id: 'P001', name: 'Ahmed Hassan', nationalId: '12345678901', phone: '01234567890' },
  { id: 'P002', name: 'Fatima Ali', nationalId: '12345678902', phone: '01234567891' },
  { id: 'P003', name: 'Mohamed Youssef', nationalId: '12345678903', phone: '01234567892' },
  { id: 'P004', name: 'Layla Mahmoud', nationalId: '12345678904', phone: '01234567893' },
  { id: 'P005', name: 'Omar Ibrahim', nationalId: '12345678905', phone: '01234567894' }
];

export default function ScheduleSessionModal({ isOpen, onClose, machines, onSubmit }) {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientNationalId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '12:00',
    machineId: '',
    sessionType: 'hemodialysis',
    frequency: 'single',
    duration: '4h 0m',
    notes: '',
    priority: 'normal'
  });

  const [errors, setErrors] = useState({});
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSchedules, setExistingSchedules] = useState([]);

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!patientSearch) return mockPatients;
    
    return mockPatients.filter(patient =>
      patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.nationalId.includes(patientSearch) ||
      patient.id.toLowerCase().includes(patientSearch.toLowerCase())
    );
  }, [patientSearch]);

  // Check for scheduling conflicts
  const availableMachines = useMemo(() => {
    if (!formData.scheduledDate || !formData.startTime || !formData.endTime) {
      return machines;
    }

    // In real app, this would check against actual scheduled sessions
    // For now, just return all machines as available
    return machines.filter(machine => machine.status === 'active');
  }, [machines, formData.scheduledDate, formData.startTime, formData.endTime]);

  // Calculate duration when times change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffMs = end - start;
      
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setFormData(prev => ({
          ...prev,
          duration: `${hours}h ${minutes}m`
        }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        patientId: '',
        patientName: '',
        patientNationalId: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '12:00',
        machineId: '',
        sessionType: 'hemodialysis',
        frequency: 'single',
        duration: '4h 0m',
        notes: '',
        priority: 'normal'
      });
      setPatientSearch('');
      setErrors({});
      setShowPatientDropdown(false);
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePatientSelect = (patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      patientNationalId: patient.nationalId
    }));
    setPatientSearch(patient.name);
    setShowPatientDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Please select a patient';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (!formData.machineId) {
      newErrors.machineId = 'Please select a dialysis machine';
    }

    // Check if selected date is in the past
    const selectedDate = new Date(formData.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.scheduledDate = 'Cannot schedule sessions in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare session data
      const sessionData = {
        ...formData,
        sessionId: `DS${Date.now()}`, // Generate temporary ID
        status: 'scheduled',
        attendance: 'pending',
        machineName: machines.find(m => m.machineId === formData.machineId)?.machineName || 'Unknown'
      };

      await onSubmit(sessionData);
      onClose();
    } catch (error) {
      console.error('Failed to schedule session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Schedule Dialysis Session</h2>
              <p className="text-green-100 text-sm">Create new dialysis appointment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Patient Information
              </h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Patient *
                  </label>
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by name, ID, or national ID..."
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        setShowPatientDropdown(true);
                        if (!e.target.value) {
                          setFormData(prev => ({
                            ...prev,
                            patientId: '',
                            patientName: '',
                            patientNationalId: ''
                          }));
                        }
                      }}
                      onFocus={() => setShowPatientDropdown(true)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.patientId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    
                    {/* Patient Dropdown */}
                    {showPatientDropdown && filteredPatients.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-600">
                              ID: {patient.id} • National ID: {patient.nationalId}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.patientId && (
                    <p className="text-red-600 text-sm mt-1">{errors.patientId}</p>
                  )}
                </div>

                {formData.patientName && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">Selected Patient:</span>
                    </div>
                    <div className="mt-1 text-sm text-green-800">
                      <div>{formData.patientName}</div>
                      <div>National ID: {formData.patientNationalId}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Details */}
            <div className="bg-yellow-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
                Schedule Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.scheduledDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.scheduledDate && (
                    <p className="text-red-600 text-sm mt-1">{errors.scheduledDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.startTime && (
                    <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.endTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.endTime && (
                    <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Type
                  </label>
                  <select
                    value={formData.sessionType}
                    onChange={(e) => handleInputChange('sessionType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hemodialysis">Hemodialysis</option>
                    <option value="peritoneal_dialysis">Peritoneal Dialysis</option>
                    <option value="continuous_renal_replacement">CRRT</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Machine Selection */}
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-purple-600" />
                Machine Assignment
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Dialysis Machine *
                </label>
                <select
                  value={formData.machineId}
                  onChange={(e) => handleInputChange('machineId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.machineId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a machine...</option>
                  {availableMachines.map((machine) => (
                    <option key={machine.machineId} value={machine.machineId}>
                      {machine.machineName} - {machine.location} ({machine.status})
                    </option>
                  ))}
                </select>
                {errors.machineId && (
                  <p className="text-red-600 text-sm mt-1">{errors.machineId}</p>
                )}
                
                {availableMachines.length === 0 && (
                  <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-700 text-sm">
                      No machines available for the selected time slot
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Notes
              </label>
              <textarea
                rows={3}
                placeholder="Any special instructions or notes for this session..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || availableMachines.length === 0}
                className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Scheduling...' : 'Schedule Session'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}