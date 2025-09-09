import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Monitor, 
  Activity, 
  AlertTriangle, 
  Droplets,
  Heart,
  ThermometerSun,
  Scale,
  FileText,
  Save
} from 'lucide-react';

export default function SessionDetailsModal({ isOpen, onClose, session, onSubmit }) {
  const [formData, setFormData] = useState({
    actualStartTime: '',
    actualEndTime: '',
    duration: '',
    preWeight: '',
    postWeight: '',
    fluidRemoval: '',
    preBloodPressure: '',
    postBloodPressure: '',
    preHeartRate: '',
    postHeartRate: '',
    temperature: '',
    complications: '',
    medicationsGiven: '',
    notes: '',
    treatmentGoals: '',
    patientComfort: 'good',
    dialysisAccess: 'av_fistula',
    bloodFlow: '',
    dialysateFlow: '',
    treatmentEfficiency: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when session changes
  useEffect(() => {
    if (session) {
      setFormData({
        actualStartTime: session.actualStartTime || session.startTime || '',
        actualEndTime: session.actualEndTime || session.endTime || '',
        duration: session.duration || '',
        preWeight: session.preWeight || '',
        postWeight: session.postWeight || '',
        fluidRemoval: session.fluidRemoval || '',
        preBloodPressure: session.preBloodPressure || '',
        postBloodPressure: session.postBloodPressure || '',
        preHeartRate: session.preHeartRate || '',
        postHeartRate: session.postHeartRate || '',
        temperature: session.temperature || '',
        complications: session.complications || '',
        medicationsGiven: session.medicationsGiven || '',
        notes: session.notes || '',
        treatmentGoals: session.treatmentGoals || '',
        patientComfort: session.patientComfort || 'good',
        dialysisAccess: session.dialysisAccess || 'av_fistula',
        bloodFlow: session.bloodFlow || '',
        dialysateFlow: session.dialysateFlow || '',
        treatmentEfficiency: session.treatmentEfficiency || ''
      });
      setErrors({});
    }
  }, [session]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-calculate duration
    if (field === 'actualStartTime' || field === 'actualEndTime') {
      const startTime = field === 'actualStartTime' ? value : formData.actualStartTime;
      const endTime = field === 'actualEndTime' ? value : formData.actualEndTime;
      
      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
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
    }

    // Auto-calculate fluid removal
    if (field === 'preWeight' || field === 'postWeight') {
      const preWeight = parseFloat(field === 'preWeight' ? value : formData.preWeight);
      const postWeight = parseFloat(field === 'postWeight' ? value : formData.postWeight);
      
      if (preWeight && postWeight && preWeight > postWeight) {
        const removal = ((preWeight - postWeight) * 1000).toFixed(0); // Convert to ml
        setFormData(prev => ({
          ...prev,
          fluidRemoval: removal
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.actualStartTime) {
      newErrors.actualStartTime = 'Start time is required';
    }

    if (!formData.actualEndTime) {
      newErrors.actualEndTime = 'End time is required';
    }

    if (formData.actualStartTime && formData.actualEndTime) {
      const start = new Date(`2000-01-01T${formData.actualStartTime}`);
      const end = new Date(`2000-01-01T${formData.actualEndTime}`);
      if (end <= start) {
        newErrors.actualEndTime = 'End time must be after start time';
      }
    }

    if (formData.preWeight && (isNaN(formData.preWeight) || formData.preWeight <= 0)) {
      newErrors.preWeight = 'Please enter a valid weight';
    }

    if (formData.postWeight && (isNaN(formData.postWeight) || formData.postWeight <= 0)) {
      newErrors.postWeight = 'Please enter a valid weight';
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
      await onSubmit(session.sessionId, formData);
      onClose();
    } catch (error) {
      console.error('Failed to save session details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Session Details</h2>
              <p className="text-blue-100 text-sm">
                {session.patientName} • {new Date(session.scheduledDate).toLocaleDateString()}
              </p>
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Session Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Session Timing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.actualStartTime}
                    onChange={(e) => handleInputChange('actualStartTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.actualStartTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.actualStartTime && (
                    <p className="text-red-600 text-sm mt-1">{errors.actualStartTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.actualEndTime}
                    onChange={(e) => handleInputChange('actualEndTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.actualEndTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.actualEndTime && (
                    <p className="text-red-600 text-sm mt-1">{errors.actualEndTime}</p>
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
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>
            </div>

            {/* Vital Signs */}
            <div className="bg-red-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-600" />
                Vital Signs
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pre-Treatment BP
                  </label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={formData.preBloodPressure}
                    onChange={(e) => handleInputChange('preBloodPressure', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post-Treatment BP
                  </label>
                  <input
                    type="text"
                    placeholder="110/70"
                    value={formData.postBloodPressure}
                    onChange={(e) => handleInputChange('postBloodPressure', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pre Heart Rate
                  </label>
                  <input
                    type="number"
                    placeholder="72"
                    value={formData.preHeartRate}
                    onChange={(e) => handleInputChange('preHeartRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Weight and Fluid Management */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-blue-600" />
                Weight & Fluid Management
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pre-Treatment Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="70.0"
                    value={formData.preWeight}
                    onChange={(e) => handleInputChange('preWeight', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.preWeight ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.preWeight && (
                    <p className="text-red-600 text-sm mt-1">{errors.preWeight}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post-Treatment Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="68.0"
                    value={formData.postWeight}
                    onChange={(e) => handleInputChange('postWeight', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.postWeight ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.postWeight && (
                    <p className="text-red-600 text-sm mt-1">{errors.postWeight}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fluid Removal (ml)
                  </label>
                  <input
                    type="number"
                    placeholder="2000"
                    value={formData.fluidRemoval}
                    onChange={(e) => handleInputChange('fluidRemoval', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Treatment Parameters */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-green-600" />
                Treatment Parameters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dialysis Access
                  </label>
                  <select
                    value={formData.dialysisAccess}
                    onChange={(e) => handleInputChange('dialysisAccess', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="av_fistula">AV Fistula</option>
                    <option value="av_graft">AV Graft</option>
                    <option value="central_catheter">Central Catheter</option>
                    <option value="peritoneal">Peritoneal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Flow (ml/min)
                  </label>
                  <input
                    type="number"
                    placeholder="300"
                    value={formData.bloodFlow}
                    onChange={(e) => handleInputChange('bloodFlow', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dialysate Flow (ml/min)
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={formData.dialysateFlow}
                    onChange={(e) => handleInputChange('dialysateFlow', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Comfort
                  </label>
                  <select
                    value={formData.patientComfort}
                    onChange={(e) => handleInputChange('patientComfort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complications & Notes */}
            <div className="bg-yellow-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Complications & Notes
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complications
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Record any complications during treatment..."
                    value={formData.complications}
                    onChange={(e) => handleInputChange('complications', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medications Given
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Heparin 5000u, EPO 4000u"
                    value={formData.medicationsGiven}
                    onChange={(e) => handleInputChange('medicationsGiven', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Additional notes about the session..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
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
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Details'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}