import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Clock, Plus, UserCheck, Search } from 'lucide-react';
import StatusBadge from './StatusBadge';

const AppointmentScheduler = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    patientNationalId: '',
    date: '',
    time: ''
  });

  // Mock 4 doctors data
  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Nephrology',
      avatar: 'SJ',
      color: 'from-blue-200 to-blue-300',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      available: true
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Dialysis Specialist',
      avatar: 'MC',
      color: 'from-green-200 to-green-300',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      available: true
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      specialization: 'Transplant Surgery',
      avatar: 'ED',
      color: 'from-purple-200 to-purple-300',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      available: false
    },
    {
      id: 4,
      name: 'Dr. Ahmed Hassan',
      specialization: 'Internal Medicine',
      avatar: 'AH',
      color: 'from-orange-200 to-orange-300',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      available: true
    }
  ];

    // ✅ Fetch patients & appointments on mount
  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/patients'); // Your backend endpoint
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setPatients([]);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/appointments'); // Your backend endpoint
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    try {
      const selectedPatient = patients.find(
        p => p.nationalId === newAppointment.patientNationalId
      );

      if (!selectedPatient) return;

      const appointmentData = {
        patientNationalId: selectedPatient.nationalId,
        patientName: selectedPatient.fullName,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: newAppointment.date,
        time: newAppointment.time,
        status: 'scheduled'
      };

      const res = await axios.post('/api/appointments', appointmentData);
      setAppointments(prev => [...prev, res.data]);
      
      setNewAppointment({
        patientNationalId: '',
        date: '',
        time: ''
      });
      setPatientSearch('');
      setShowAppointmentForm(false);
    } catch (err) {
      console.error('Error scheduling appointment:', err);
    }
  };

  const getDoctorAppointments = (doctorId) => {
    if (!Array.isArray(appointments)) return [];
    return appointments.filter(apt => apt.doctorId === doctorId);
  };

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!Array.isArray(patients)) return [];
    return patients.filter(patient =>
      patient.fullName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.nationalId?.includes(patientSearch) ||
      patient.contactNumber?.includes(patientSearch)
    );
  }, [patients, patientSearch]);

  const handlePatientSelect = (nationalId) => {
    setNewAppointment({...newAppointment, patientNationalId: nationalId});
    setPatientSearch('');
  };

  const handleCloseForm = () => {
    setShowAppointmentForm(false);
    setPatientSearch('');
    setNewAppointment({
      patientNationalId: '',
      date: '',
      time: ''
    });
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Scheduling</h2>
        <p className="text-gray-600">Select a doctor to view and schedule appointments</p>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            onClick={() => setSelectedDoctor(doctor)}
            className={`relative bg-white rounded-2xl shadow-sm border-2 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-102 ${
              selectedDoctor?.id === doctor.id 
                ? `border-${doctor.textColor.split('-')[1]}-300 ring-4 ring-${doctor.textColor.split('-')[1]}-50` 
                : 'border-gray-100 hover:border-gray-200'
            } ${!doctor.available ? 'opacity-60' : ''}`}
          >
            {/* Doctor Card */}
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${doctor.color} flex items-center justify-center ${doctor.textColor} font-bold text-lg mb-4 shadow-sm`}>
                  {doctor.avatar}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{doctor.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{doctor.specialization}</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-300' : 'bg-red-300'}`}></div>
                  <span className={`text-xs font-medium ${doctor.available ? 'text-green-500' : 'text-red-500'}`}>
                    {doctor.available ? 'Available' : 'Unavailable'}</span>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  {getDoctorAppointments(doctor.id).length} appointments today
                </div>
              </div>
            </div>
            
            {/* Selection Indicator */}
            {selectedDoctor?.id === doctor.id && (
              <div className="absolute top-3 right-3">
                <div className={`w-6 h-6 ${doctor.bgColor} rounded-full flex items-center justify-center border-2 border-${doctor.textColor.split('-')[1]}-200`}>
                  <UserCheck size={14} className={doctor.textColor} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Doctor Section */}
      {selectedDoctor && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Doctor Header */}
          <div className={`${selectedDoctor.bgColor} p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${selectedDoctor.color} rounded-full flex items-center justify-center ${selectedDoctor.textColor} font-bold shadow-sm`}>
                  {selectedDoctor.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedDoctor.name}</h3>
                  <p className="text-gray-600">{selectedDoctor.specialization}</p>
                </div>
              </div>
              {selectedDoctor.available && (
                <button
                  onClick={() => setShowAppointmentForm(true)}
                  className={`${selectedDoctor.bgColor} hover:bg-opacity-80 ${selectedDoctor.textColor} px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 border border-${selectedDoctor.textColor.split('-')[1]}-200`}
                >
                  <Plus size={16} />
                  <span>Schedule Patient</span>
                </button>
              )}
            </div>
          </div>

          {/* Appointments List */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar size={20} className="mr-2" />
              Today's Appointments
            </h4>
            
            {getDoctorAppointments(selectedDoctor.id).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No appointments scheduled</p>
                <p className="text-sm">Schedule a patient to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getDoctorAppointments(selectedDoctor.id).map((appointment) => (
                  <div key={appointment.id} className="bg-gray-25 rounded-xl p-4 flex items-center justify-between border border-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-gray-500">{appointment.time}</div>
                      <div>
                        <div className="font-medium text-gray-800">{appointment.patientName}</div>
                        <div className="text-sm text-gray-400">ID: {appointment.patientNationalId}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={appointment.status} />
                      <button className="text-blue-400 hover:text-blue-600 font-medium text-sm">Edit</button>
                      <button className="text-red-400 hover:text-red-600 font-medium text-sm">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Form Modal */}
      {showAppointmentForm && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
            <div className={`${selectedDoctor.bgColor} p-6 rounded-t-2xl border-b border-gray-100`}>
              <h4 className="text-xl font-bold text-gray-800">Schedule Appointment</h4>
              <p className="text-gray-600">Book a patient with {selectedDoctor.name}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Patient</label>
                
                {/* Search Field */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search patients by name, ID, or phone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
                </div>

                {/* Selected Patient Display */}
                {newAppointment.patientNationalId && (
                  <div className="bg-blue-25 border border-blue-100 rounded-xl p-4 mb-4">
                    {(() => {
                      const selectedPatient = patients.find(p => p.nationalId === newAppointment.patientNationalId);
                      return selectedPatient ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-800">{selectedPatient.fullName}</div>
                            <div className="text-sm text-gray-500">ID: {selectedPatient.nationalId}</div>
                            <div className="text-sm text-gray-500">Phone: {selectedPatient.contactNumber}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewAppointment({...newAppointment, patientNationalId: ''})}
                            className="text-red-400 hover:text-red-600 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Patient List */}
                {patientSearch && !newAppointment.patientNationalId && (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-sm">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map(patient => (
                        <div
                          key={patient.nationalId}
                          onClick={() => handlePatientSelect(patient.nationalId)}
                          className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-blue-700 font-bold text-sm">
                              {patient.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{patient.fullName}</div>
                              <div className="text-sm text-gray-500">ID: {patient.nationalId}</div>
                              <div className="text-sm text-gray-500">Phone: {patient.contactNumber}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <Search size={32} className="mx-auto mb-2 text-gray-300" />
                        <p>No patients found matching your search</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback message when no patient is selected and no search */}
                {!newAppointment.patientNationalId && !patientSearch && (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                    <User size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-medium">Search and select a patient</p>
                    <p className="text-sm">Type in the search box above to find patients</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time</label>
                <input
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-400 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-colors shadow-sm"
                >
                  Schedule Appointment
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-3 rounded-xl font-medium transition-colors border border-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduler;