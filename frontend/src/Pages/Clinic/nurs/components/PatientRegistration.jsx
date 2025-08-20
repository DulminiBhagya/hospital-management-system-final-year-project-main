import React, { useState } from 'react';
import { UserPlus, User, XCircle } from 'lucide-react';

const PatientRegistration = ({ patients, loading, onRegisterPatient, submitting }) => {
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    nationalId: '',
    fullName: '',
    address: '',
    dateOfBirth: '',
    contactNumber: '',
    emergencyContactNumber: '',
    gender: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onRegisterPatient(newPatient);
    if (success) {
      setNewPatient({
        nationalId: '',
        fullName: '',
        address: '',
        dateOfBirth: '',
        contactNumber: '',
        emergencyContactNumber: '',
        gender: ''
      });
      setShowPatientForm(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Patient Registration</h3>
        <button
          onClick={() => setShowPatientForm(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <UserPlus size={16} />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Patient Registration Form Modal */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-gray-900 flex items-center">
                <UserPlus size={20} className="mr-2 text-blue-600" />
                Register New Patient
              </h4>
              <button 
                onClick={() => setShowPatientForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                  <input
                    type="text"
                    value={newPatient.nationalId}
                    onChange={(e) => setNewPatient({...newPatient, nationalId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="200112345678"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newPatient.fullName}
                    onChange={(e) => setNewPatient({...newPatient, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full Address"
                  rows="2"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={newPatient.contactNumber}
                    onChange={(e) => setNewPatient({...newPatient, contactNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0771234567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    value={newPatient.emergencyContactNumber}
                    onChange={(e) => setNewPatient({...newPatient, emergencyContactNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0712345678"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPatientForm(false)}
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    submitting 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2 ${
                    submitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Register</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Registrations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">Recent Registrations</h4>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading patients...
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No patients registered yet. Register your first patient to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.slice(-6).map((patient) => (
                <div key={patient.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{patient.fullName}</h5>
                      <p className="text-sm text-gray-500">ID: {patient.nationalId}</p>
                      <p className="text-sm text-gray-500">Age: {calculateAge(patient.dateOfBirth)} years</p>
                      <p className="text-sm text-gray-500">Registered: {formatDate(patient.registrationDate)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <User size={16} className="text-green-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;