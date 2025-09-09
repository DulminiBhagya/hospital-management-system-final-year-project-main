import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Activity, 
  FileText, 
  Settings,
  Droplets,
  Monitor
} from 'lucide-react';

// Import components
import DialysisHeader from './components/DialysisHeader';
import ScheduleView from './components/ScheduleView';
import AttendanceTracker from './components/AttendanceTracker';
import SessionDetailsModal from './components/SessionDetailsModal';
import ScheduleSessionModal from './components/ScheduleSessionModal';
import ReportsModule from './components/ReportsModule';
import MachineManagement from './components/MachineManagement';
import { ToastContainer } from '../Clinic/nurs/components/Toast';

// Import custom hooks
import useDialysisSessions from './hooks/useDialysisSessions';
import useDialysisMachines from './hooks/useDialysisMachines';

export default function DialysisDashboard() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Custom hooks for data management
  const {
    sessions,
    loading: sessionsLoading,
    createSession,
    markAttendance,
    addSessionDetails
  } = useDialysisSessions(addToast);

  const {
    machines,
    loading: machinesLoading,
    updateMachine
  } = useDialysisMachines(addToast);

  // Toast functions
  function addToast(type, title, message) {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }

  // Calculate dashboard statistics
  const dialysisStats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => 
      new Date(s.scheduledDate).toDateString() === today
    );
    
    const totalPatients = new Set(sessions.map(s => s.patientId)).size;
    const presentToday = todaySessions.filter(s => s.attendance === 'present').length;
    const absentToday = todaySessions.filter(s => s.attendance === 'absent').length;
    const pendingToday = todaySessions.filter(s => s.attendance === 'pending').length;
    
    const activeMachines = machines.filter(m => m.status === 'active').length;
    const totalMachines = machines.length;
    
    const completedSessions = todaySessions.filter(s => s.status === 'completed').length;
    const inProgressSessions = todaySessions.filter(s => s.status === 'in_progress').length;

    return {
      totalPatients,
      todaySessions: todaySessions.length,
      presentToday,
      absentToday,
      pendingToday,
      activeMachines,
      totalMachines,
      completedSessions,
      inProgressSessions,
      attendanceRate: todaySessions.length > 0 ? 
        Math.round((presentToday / todaySessions.length) * 100) : 0
    };
  }, [sessions, machines]);

  // Tab configuration
  const tabs = [
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Daily/Weekly View' },
    { id: 'attendance', label: 'Attendance', icon: Users, description: 'Mark Present/Absent' },
    { id: 'sessions', label: 'Session Details', icon: Activity, description: 'Add Session Data' },
    { id: 'machines', label: 'Machines', icon: Monitor, description: 'Equipment Management' },
    { id: 'reports', label: 'Reports', icon: FileText, description: 'Generate Reports' },
    { id: 'schedule-new', label: 'New Session', icon: Clock, description: 'Schedule Sessions' }
  ];

  // Handle session actions
  const handleSessionSelect = (session) => {
    setSelectedSession(session);
  };

  const handleAddSessionDetails = () => {
    if (selectedSession) {
      setShowSessionDetails(true);
    }
  };

  const handleScheduleNewSession = () => {
    setShowScheduleModal(true);
  };

  const handleAttendanceUpdate = async (sessionId, status) => {
    try {
      await markAttendance(sessionId, status);
      addToast('success', 'Attendance Updated', `Patient marked as ${status}`);
    } catch {
      addToast('error', 'Update Failed', 'Could not update attendance');
    }
  };

  const handleSessionDetailsSubmit = async (sessionId, details) => {
    try {
      await addSessionDetails(sessionId, details);
      setShowSessionDetails(false);
      setSelectedSession(null);
      addToast('success', 'Details Added', 'Session details saved successfully');
    } catch {
      addToast('error', 'Save Failed', 'Could not save session details');
    }
  };

  const handleNewSessionSubmit = async (sessionData) => {
    try {
      await createSession(sessionData);
      setShowScheduleModal(false);
      addToast('success', 'Session Scheduled', 'New dialysis session created');
    } catch {
      addToast('error', 'Schedule Failed', 'Could not create session');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return (
          <ScheduleView
            sessions={sessions}
            machines={machines}
            loading={sessionsLoading}
            onSessionSelect={handleSessionSelect}
            selectedSession={selectedSession}
            onAddDetails={handleAddSessionDetails}
            onMarkAttendance={handleAttendanceUpdate}
          />
        );
      case 'attendance':
        return (
          <AttendanceTracker
            sessions={sessions}
            loading={sessionsLoading}
            onAttendanceUpdate={handleAttendanceUpdate}
            stats={dialysisStats}
          />
        );
      case 'sessions':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Session Details Management
              </h3>
              <p className="text-gray-600 mb-6">
                Select a session from the Schedule tab to add detailed information
              </p>
              {selectedSession ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-4">
                  <p className="text-sm font-medium text-blue-900">Selected Session:</p>
                  <p className="text-blue-800">{selectedSession.patientName}</p>
                  <p className="text-blue-700 text-sm">
                    {new Date(selectedSession.scheduledDate).toLocaleDateString()} at {selectedSession.startTime}
                  </p>
                </div>
              ) : null}
              <button
                onClick={handleAddSessionDetails}
                disabled={!selectedSession}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {selectedSession ? 'Add Session Details' : 'No Session Selected'}
              </button>
            </div>
          </div>
        );
      case 'machines':
        return (
          <MachineManagement
            machines={machines}
            sessions={sessions}
            loading={machinesLoading}
            onUpdateMachine={updateMachine}
          />
        );
      case 'reports':
        return (
          <ReportsModule
            sessions={sessions}
            machines={machines}
            stats={dialysisStats}
          />
        );
      case 'schedule-new':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Schedule New Dialysis Session
              </h3>
              <p className="text-gray-600 mb-6">
                Create new dialysis appointments for patients
              </p>
              <button
                onClick={handleScheduleNewSession}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center mx-auto"
              >
                <Clock className="w-5 h-5 mr-2" />
                Schedule New Session
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <DialysisHeader stats={dialysisStats} />

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className={`text-xs ${
                    activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Modals */}
      <SessionDetailsModal
        isOpen={showSessionDetails}
        onClose={() => {
          setShowSessionDetails(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSubmit={handleSessionDetailsSubmit}
      />

      <ScheduleSessionModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        machines={machines}
        onSubmit={handleNewSessionSubmit}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}