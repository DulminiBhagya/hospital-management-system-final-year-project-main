import React, { useState, useMemo } from 'react';
import { Activity, Calendar, UserPlus, Users, FileText, Heart, Shield } from 'lucide-react';

// Import custom hooks
import usePatients from './hooks/usePatients';

// Import components
import Header from './components/Header';
import TabButton from './components/TabButton';
import ClinicOverview from './components/ClinicOverview';
import AppointmentScheduler from './components/AppointmentScheduler';
import PatientRegistration from './components/PatientRegistration';
import PatientDatabase from './components/PatientDatabase';
import ReportsModule from './components/ReportsModule';

export default function ClinicDashboard() {
  const [activeTab, setActiveTab] = useState('status');
  const [doctors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Nephrology',
      status: 'available',
      todayPatients: 8,
      completed: 6,
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Dialysis Specialist',
      status: 'busy',
      todayPatients: 12,
      completed: 10,
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      specialization: 'Transplant Surgery',
      status: 'unavailable',
      todayPatients: 4,
      completed: 4,
      avatar: 'ED'
    },
    {
      id: 4,
      name: 'Dr. Ahmed Hassan',
      specialization: 'Internal Medicine',
      status: 'available',
      todayPatients: 10,
      completed: 7,
      avatar: 'AH'
    }
  ]);
  const [appointments, setAppointments] = useState([]);

  // Use custom hook for patient management
  const {
    patients,
    loading,
    submitting,
    registerPatient,
    updatePatient,
    deletePatient
  } = usePatients();

  // Statistics calculations
  const todayStats = useMemo(() => {
    const totalDoctors = doctors.length;
    const availableDoctors = doctors.filter(d => d.status === 'available').length;
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const totalPatients = patients.length;
    const todayRegistrations = patients.filter(p => {
      const today = new Date().toDateString();
      const regDate = new Date(p.registrationDate).toDateString();
      return today === regDate;
    }).length;
    const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;
    const doctorUtilization = totalDoctors > 0 ? Math.round((availableDoctors / totalDoctors) * 100) : 0;

    return {
      totalDoctors,
      availableDoctors,
      totalAppointments,
      completedAppointments,
      totalPatients,
      todayRegistrations,
      completionRate,
      doctorUtilization
    };
  }, [doctors, appointments, patients]);

  const handleScheduleAppointment = (appointment) => {
    setAppointments([...appointments, appointment]);
  };

  const tabs = [
    { id: 'status', label: 'Hospital Overview', icon: Activity },
    { id: 'schedule', label: 'Appointments', icon: Calendar },
    { id: 'register', label: 'Patient Registration', icon: UserPlus },
    { id: 'patients', label: 'Patient Database', icon: Users },
    { id: 'reports', label: 'Medical Reports', icon: FileText }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'status':
        return (
          <ClinicOverview 
            todayStats={todayStats} 
            doctors={doctors} 
            onTabChange={setActiveTab}
          />
        );
      case 'schedule':
        return (
          <AppointmentScheduler 
            patients={patients}
            doctors={doctors}
            appointments={appointments}
            onScheduleAppointment={handleScheduleAppointment}
          />
        );
      case 'register':
        return (
          <PatientRegistration 
            patients={patients}
            loading={loading}
            submitting={submitting}
            onRegisterPatient={registerPatient}
          />
        );
      case 'patients':
        return (
          <PatientDatabase 
            patients={patients}
            loading={loading}
            submitting={submitting}
            onRegisterPatient={registerPatient}
            onUpdatePatient={updatePatient}
            onDeletePatient={deletePatient}
          />
        );
      case 'reports':
        return (
          <ReportsModule 
            todayStats={todayStats}
          />
        );
      default:
        return (
          <ClinicOverview 
            todayStats={todayStats} 
            doctors={doctors} 
            onTabChange={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <Header todayStats={todayStats} />

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b-2 border-blue-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 py-6 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
              >
                {tab.label}
              </TabButton>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[60vh]">
          {renderContent()}
        </div>
        
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Heart size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">HMS - Hospital Management System</p>
                <p className="text-xs text-gray-500">National Institute of Nephrology, Dialysis and Transplantation</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Shield size={14} className="mr-1" />
                Secure & HIPAA Compliant
              </span>
              <span>Version 2.1.0</span>
              <span>{new Date().getFullYear()} - All Rights Reserved</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}