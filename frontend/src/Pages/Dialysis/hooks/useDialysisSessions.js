import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useDialysisSessions = (showToast = null) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for development - replace with actual API calls
  const mockSessions = [
    {
      sessionId: 'DS001',
      patientId: 'P001',
      patientName: 'Ahmed Hassan',
      patientNationalId: '12345678901',
      machineId: 'M001',
      machineName: 'Fresenius 4008S - Unit 1',
      scheduledDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '12:00',
      duration: '4h 0m',
      status: 'completed',
      attendance: 'present',
      sessionType: 'hemodialysis',
      priority: 'normal',
      complications: '',
      notes: 'Normal session, patient stable',
      preWeight: '72.5',
      postWeight: '70.0',
      fluidRemoval: '2500',
      preBloodPressure: '140/90',
      postBloodPressure: '120/80'
    },
    {
      sessionId: 'DS002',
      patientId: 'P002',
      patientName: 'Fatima Ali',
      patientNationalId: '12345678902',
      machineId: 'M002',
      machineName: 'Fresenius 4008S - Unit 2',
      scheduledDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '12:00',
      duration: '4h 0m',
      status: 'in_progress',
      attendance: 'present',
      sessionType: 'hemodialysis',
      priority: 'normal',
      complications: '',
      notes: ''
    },
    {
      sessionId: 'DS003',
      patientId: 'P003',
      patientName: 'Mohamed Youssef',
      patientNationalId: '12345678903',
      machineId: 'M003',
      machineName: 'Fresenius 4008S - Unit 3',
      scheduledDate: new Date().toISOString().split('T')[0],
      startTime: '13:00',
      endTime: '17:00',
      duration: '4h 0m',
      status: 'scheduled',
      attendance: 'pending',
      sessionType: 'hemodialysis',
      priority: 'normal',
      complications: '',
      notes: ''
    },
    {
      sessionId: 'DS004',
      patientId: 'P004',
      patientName: 'Layla Mahmoud',
      patientNationalId: '12345678904',
      machineId: 'M001',
      machineName: 'Fresenius 4008S - Unit 1',
      scheduledDate: new Date().toISOString().split('T')[0],
      startTime: '13:00',
      endTime: '17:00',
      duration: '4h 0m',
      status: 'scheduled',
      attendance: 'absent',
      sessionType: 'hemodialysis',
      priority: 'urgent',
      complications: '',
      notes: 'Patient called in sick'
    },
    // Previous day sessions
    {
      sessionId: 'DS005',
      patientId: 'P001',
      patientName: 'Ahmed Hassan',
      patientNationalId: '12345678901',
      machineId: 'M001',
      machineName: 'Fresenius 4008S - Unit 1',
      scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '12:00',
      duration: '4h 0m',
      status: 'completed',
      attendance: 'present',
      sessionType: 'hemodialysis',
      priority: 'normal',
      complications: '',
      notes: 'Good session'
    }
  ];

  const fetchSessions = useCallback(async (silent = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      /* 
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.get('http://localhost:8080/api/dialysis/sessions', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      setSessions(response.data);
      */
      
      // For now, use mock data
      setSessions(mockSessions);
      
      if (showToast && !silent) {
        showToast('success', 'Sessions Loaded', 'Dialysis sessions loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching dialysis sessions:', error);
      setError(error.message);
      
      if (showToast && !silent) {
        showToast('error', 'Load Failed', 'Failed to load dialysis sessions');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (sessionData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      /*
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.post('http://localhost:8080/api/dialysis/sessions', sessionData, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      */
      
      // For now, add to mock data
      const newSession = {
        ...sessionData,
        sessionId: `DS${Date.now()}`,
        status: 'scheduled',
        attendance: 'pending'
      };
      
      setSessions(prev => [...prev, newSession]);
      
      if (showToast) {
        showToast('success', 'Session Created', 'Dialysis session scheduled successfully');
      }
      
      return newSession;
    } catch (error) {
      console.error('Error creating dialysis session:', error);
      setError(error.message);
      
      if (showToast) {
        showToast('error', 'Create Failed', 'Failed to schedule dialysis session');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateSession = useCallback(async (sessionId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      /*
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.put(`http://localhost:8080/api/dialysis/sessions/${sessionId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      */
      
      // For now, update mock data
      setSessions(prev => prev.map(session => 
        session.sessionId === sessionId 
          ? { ...session, ...updateData }
          : session
      ));
      
      if (showToast) {
        showToast('success', 'Session Updated', 'Session details updated successfully');
      }
    } catch (error) {
      console.error('Error updating dialysis session:', error);
      setError(error.message);
      
      if (showToast) {
        showToast('error', 'Update Failed', 'Failed to update session');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const markAttendance = useCallback(async (sessionId, attendanceStatus) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      /*
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.patch(`http://localhost:8080/api/dialysis/sessions/${sessionId}/attendance`, 
        { attendance: attendanceStatus }, 
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      */
      
      // Update attendance in mock data
      setSessions(prev => prev.map(session => 
        session.sessionId === sessionId 
          ? { ...session, attendance: attendanceStatus }
          : session
      ));
      
      if (showToast) {
        showToast('success', 'Attendance Updated', `Patient marked as ${attendanceStatus}`);
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      setError(error.message);
      
      if (showToast) {
        showToast('error', 'Update Failed', 'Failed to update attendance');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const addSessionDetails = useCallback(async (sessionId, detailsData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      /*
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.patch(`http://localhost:8080/api/dialysis/sessions/${sessionId}/details`, 
        detailsData, 
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      */
      
      // Update session details in mock data
      setSessions(prev => prev.map(session => 
        session.sessionId === sessionId 
          ? { 
              ...session, 
              ...detailsData,
              status: detailsData.actualEndTime ? 'completed' : session.status
            }
          : session
      ));
      
      if (showToast) {
        showToast('success', 'Details Saved', 'Session details saved successfully');
      }
    } catch (error) {
      console.error('Error adding session details:', error);
      setError(error.message);
      
      if (showToast) {
        showToast('error', 'Save Failed', 'Failed to save session details');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const deleteSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      /*
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.delete(`http://localhost:8080/api/dialysis/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      */
      
      // Remove from mock data
      setSessions(prev => prev.filter(session => session.sessionId !== sessionId));
      
      if (showToast) {
        showToast('success', 'Session Deleted', 'Session deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting dialysis session:', error);
      setError(error.message);
      
      if (showToast) {
        showToast('error', 'Delete Failed', 'Failed to delete session');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Load sessions on component mount
  useEffect(() => {
    fetchSessions(true); // Silent load on mount
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    markAttendance,
    addSessionDetails,
    deleteSession
  };
};

export default useDialysisSessions;