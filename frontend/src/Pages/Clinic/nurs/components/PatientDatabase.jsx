import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Users, UserPlus, Search, User, Phone, MapPin, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';

const PatientDatabase = ({ 
  patients, 
  loading, 
  submitting, 
  onRegisterPatient, 
  onUpdatePatient, 
  onDeletePatient 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showPatientView, setShowPatientView] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  
  const [newPatient, setNewPatient] = useState({
    nationalId: '',
    fullName: '',
    address: '',
    dateOfBirth: '',
    contactNumber: '',
    emergencyContactNumber: '',
    gender: ''
  });

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.nationalId.includes(searchTerm) ||
      patient.contactNumber.includes(searchTerm)
    );
  }, [patients, searchTerm]);

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

  const handleRegisterPatient = async (e) => {
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

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientView(true);
  };

  const handleEditPatient = (patient) => {
    setEditingPatient({...patient});
    setShowEditForm(true);
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    const success = await onUpdatePatient(editingPatient.nationalId, editingPatient);
    if (success) {
      setShowEditForm(false);
      setEditingPatient(null);
    }
  };

  const handleDeletePatient = async (patient) => {
    await onDeletePatient(patient.nationalId, patient.fullName);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Registry</h2>
            <p className="text-gray-600">Comprehensive patient information and medical records</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-80 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
              />
              <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowPatientForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold"
            >
              <UserPlus size={18} />
              <span>Add Patient</span>
            </button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Users size={24} className="mr-3 text-blue-600" />
              Patient Database
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {filteredPatients.length} patients
              </span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Patient Information</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Identification</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Demographics</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-gray-500 text-lg font-medium">Loading patient data...</p>
                          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the information</p>
                        </>
                      ) : patients.length === 0 ? (
                        <>
                          <Users size={48} className="text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No patients registered</p>
                          <p className="text-gray-400 text-sm mt-2">Click 'Add Patient' to register your first patient</p>
                          <button
                            onClick={() => setShowPatientForm(true)}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                          >
                            Register First Patient
                          </button>
                        </>
                      ) : (
                        <>
                          <Search size={48} className="text-gray-300 mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No patients match your search</p>
                          <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                          <span className="text-white font-bold text-sm">
                            {patient.fullName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{patient.fullName}</div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <User size={12} className="mr-1" />
                            Patient ID: {patient.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{patient.nationalId}</div>
                      <div className="text-xs text-gray-500 mt-1">National ID</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{calculateAge(patient.dateOfBirth)} years</div>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          patient.gender === 'Male' ? 'bg-blue-100 text-blue-800' :
                          patient.gender === 'Female' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.gender}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-gray-900 flex items-center">
                          <Phone size={12} className="mr-2 text-green-600" />
                          {patient.contactNumber}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <AlertCircle size={12} className="mr-2 text-orange-500" />
                          Emergency: {patient.emergencyContactNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-900 flex items-start max-w-xs">
                        <MapPin size={12} className="mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span className="line-clamp-2 text-xs leading-relaxed">{patient.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Patient Registration Form Modal */}
        {showPatientForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-2xl my-8 relative">
              {/* Close button */}
              <button 
                onClick={() => setShowPatientForm(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-8">
                <h4 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
                  <UserPlus size={24} className="mr-3 text-blue-600" />
                  Register New Patient
                </h4>
                <p className="text-gray-600">Add a new patient to the database with complete information</p>
              </div>

              <form onSubmit={handleRegisterPatient} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                    <input
                      type="text"
                      value={newPatient.nationalId}
                      onChange={(e) => setNewPatient({...newPatient, nationalId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="200112345678"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={newPatient.fullName}
                      onChange={(e) => setNewPatient({...newPatient, fullName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Full Address"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="tel"
                      value={newPatient.contactNumber}
                      onChange={(e) => setNewPatient({...newPatient, contactNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0771234567"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <input
                      type="tel"
                      value={newPatient.emergencyContactNumber}
                      onChange={(e) => setNewPatient({...newPatient, emergencyContactNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0712345678"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowPatientForm(false)}
                    disabled={submitting}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      submitting 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg ${
                      submitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>Register Patient</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Fixed Patient View Modal */}
        {showPatientView && selectedPatient && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-4xl my-8 relative">
              {/* Close button */}
              <button 
                onClick={() => setShowPatientView(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center mb-2">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg mr-4">
                    <span className="text-white font-bold text-xl">
                      {selectedPatient.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{selectedPatient.fullName}</h4>
                    <p className="text-gray-500 text-lg">Patient ID: {selectedPatient.id}</p>
                  </div>
                </div>
              </div>
              
              {/* Patient Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h5 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h5>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">National ID</label>
                        <div className="text-lg font-semibold text-gray-900 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                          {selectedPatient.nationalId}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Date of Birth</label>
                          <div className="text-gray-900 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                            {formatDate(selectedPatient.dateOfBirth)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Age</label>
                          <div className="text-gray-900 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                            {calculateAge(selectedPatient.dateOfBirth)} years
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Gender</label>
                        <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                            selectedPatient.gender === 'Male' ? 'bg-blue-100 text-blue-800' :
                            selectedPatient.gender === 'Female' ? 'bg-pink-100 text-pink-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedPatient.gender}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <h5 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Contact Information
                    </h5>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Primary Contact</label>
                        <div className="text-gray-900 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center">
                          <svg className="w-4 h-4 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {selectedPatient.contactNumber}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Emergency Contact</label>
                        <div className="text-gray-900 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center">
                          <svg className="w-4 h-4 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          {selectedPatient.emergencyContactNumber}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Address</label>
                        <div className="text-gray-900 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-start">
                          <svg className="w-4 h-4 mr-3 mt-1 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="leading-relaxed">{selectedPatient.address}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Registration Date</label>
                        <div className="text-gray-900 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center">
                          <svg className="w-4 h-4 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(selectedPatient.registrationDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPatientView(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPatientView(false);
                    handleEditPatient(selectedPatient);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Patient</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Patient Edit Modal */}
        {showEditForm && editingPatient && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-4xl my-8 relative">
              {/* Close button */}
              <button 
                onClick={() => {
                  setShowEditForm(false);
                  setEditingPatient(null);
                }}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-8">
                <div className="flex items-center mb-2">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">Edit Patient Information</h4>
                    <p className="text-gray-600">Update patient details and medical information</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdatePatient} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                    <input
                      type="text"
                      value={editingPatient.nationalId}
                      onChange={(e) => setEditingPatient({...editingPatient, nationalId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editingPatient.fullName}
                      onChange={(e) => setEditingPatient({...editingPatient, fullName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={editingPatient.address}
                    onChange={(e) => setEditingPatient({...editingPatient, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={editingPatient.dateOfBirth}
                      onChange={(e) => setEditingPatient({...editingPatient, dateOfBirth: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={editingPatient.gender}
                      onChange={(e) => setEditingPatient({...editingPatient, gender: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="tel"
                      value={editingPatient.contactNumber}
                      onChange={(e) => setEditingPatient({...editingPatient, contactNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <input
                      type="tel"
                      value={editingPatient.emergencyContactNumber}
                      onChange={(e) => setEditingPatient({...editingPatient, emergencyContactNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingPatient(null);
                    }}
                    disabled={submitting}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      submitting 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg ${
                      submitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Update Patient</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Portaled Modals */}
      {showPatientForm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-2xl my-8 relative">
            {/* Close button */}
            <button 
              onClick={() => setShowPatientForm(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-8">
              <h4 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
                <UserPlus size={24} className="mr-3 text-blue-600" />
                Register New Patient
              </h4>
              <p className="text-gray-600">Add a new patient to the database with complete information</p>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                  <input
                    type="text"
                    value={newPatient.nationalId}
                    onChange={(e) => setNewPatient({...newPatient, nationalId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="200112345678"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newPatient.fullName}
                    onChange={(e) => setNewPatient({...newPatient, fullName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Full Address"
                  rows="3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={newPatient.contactNumber}
                    onChange={(e) => setNewPatient({...newPatient, contactNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0771234567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    value={newPatient.emergencyContactNumber}
                    onChange={(e) => setNewPatient({...newPatient, emergencyContactNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0712345678"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPatientForm(false)}
                  disabled={submitting}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    submitting 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg ${
                    submitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:scale-105 hover:shadow-xl'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Register Patient</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showPatientView && selectedPatient && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[85vh] relative flex flex-col">
            {/* Close button */}
            <button 
              onClick={() => setShowPatientView(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-6 pb-0">
              <div className="flex items-center mb-2">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg mr-3">
                  <span className="text-white font-bold">
                    {selectedPatient.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedPatient.fullName}</h4>
                  <p className="text-gray-500">Patient ID: {selectedPatient.id}</p>
                </div>
              </div>
            </div>
            
            {/* Patient Information Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <User size={16} className="mr-2 text-blue-600" />
                  Personal Information
                </h5>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">National ID</label>
                    <div className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      {selectedPatient.nationalId}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                    <div className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      {calculateAge(selectedPatient.dateOfBirth)} years
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                    <div className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      {formatDate(selectedPatient.dateOfBirth)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        selectedPatient.gender === 'Male' ? 'bg-blue-100 text-blue-800' :
                        selectedPatient.gender === 'Female' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPatient.gender}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <Phone size={16} className="mr-2 text-green-600" />
                  Contact Information
                </h5>
                
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Primary Contact</label>
                    <div className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center">
                      <Phone size={12} className="mr-2 text-green-600" />
                      {selectedPatient.contactNumber}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Emergency Contact</label>
                    <div className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center">
                      <AlertCircle size={12} className="mr-2 text-orange-500" />
                      {selectedPatient.emergencyContactNumber}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                    <div className="text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-start">
                      <MapPin size={12} className="mr-2 mt-1 text-blue-600 flex-shrink-0" />
                      <span className="leading-relaxed">{selectedPatient.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            
            {/* Action Buttons - Fixed */}
            <div className="flex-shrink-0 flex justify-end space-x-4 p-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPatientView(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPatientView(false);
                  handleEditPatient(selectedPatient);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Patient</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showEditForm && editingPatient && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            {/* Close button */}
            <button 
              onClick={() => {
                setShowEditForm(false);
                setEditingPatient(null);
              }}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg mr-3">
                  <Edit size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">Edit Patient Information</h4>
                  <p className="text-gray-600 text-sm">Update patient details</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdatePatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                  <input
                    type="text"
                    value={editingPatient.nationalId}
                    onChange={(e) => setEditingPatient({...editingPatient, nationalId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingPatient.fullName}
                    onChange={(e) => setEditingPatient({...editingPatient, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={editingPatient.address}
                  onChange={(e) => setEditingPatient({...editingPatient, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                  rows="2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingPatient.dateOfBirth}
                    onChange={(e) => setEditingPatient({...editingPatient, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={editingPatient.gender}
                    onChange={(e) => setEditingPatient({...editingPatient, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
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
                    value={editingPatient.contactNumber}
                    onChange={(e) => setEditingPatient({...editingPatient, contactNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    value={editingPatient.emergencyContactNumber}
                    onChange={(e) => setEditingPatient({...editingPatient, emergencyContactNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingPatient(null);
                  }}
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
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
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg text-sm ${
                    submitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Update</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PatientDatabase;