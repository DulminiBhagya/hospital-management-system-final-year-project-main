import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const usePatients = (showToast = null) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastError, setLastError] = useState(null);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const jwtToken = localStorage.getItem('jwtToken');
      
      if (!jwtToken) {
        console.warn('No JWT token found');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/patients/all', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      
      let errorMessage = 'Failed to load patient data. ';
      
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to view patient data.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      if (showToast) {
        if (error.response?.status === 401) {
          showToast('error', 'Session Expired', errorMessage);
        } else if (error.response?.status === 403) {
          showToast('error', 'Access Denied', errorMessage);
        } else if (error.response?.status === 500) {
          showToast('error', 'Server Error', errorMessage);
        } else {
          showToast('error', 'Loading Failed', errorMessage);
        }
      } else {
        console.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const registerPatient = useCallback(async (patientData) => {
    try {
      setSubmitting(true);
      
      const jwtToken = localStorage.getItem('jwtToken');
      
      if (!jwtToken) {
        if (showToast) {
          showToast('error', 'Authentication Required', 'Please log in again.');
        }
        return false;
      }

      const response = await axios.post('http://localhost:8080/api/patients/register', patientData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      // Check if the backend indicates success
      if (response.data && response.data.isSuccess === false) {
        setLastError(response.data.message || 'Registration failed.');
        return false;
      }

      // Clear any previous errors on successful registration
      setLastError(null);
      await fetchPatients();
      return true;
      
    } catch (error) {
      console.error('Error registering patient:', error);
      
      // Set error message for component to use
      if (error.response && error.response.data && error.response.data.message) {
        setLastError(error.response.data.message);
      } else {
        setLastError('An error occurred while registering the patient.');
      }
      
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchPatients]);

  const updatePatient = useCallback(async (nationalId, patientData) => {
    try {
      setSubmitting(true);
      
      const jwtToken = localStorage.getItem('jwtToken');
      
      if (!jwtToken) {
        if (showToast) {
          showToast('error', 'Authentication Required', 'Please log in again.');
        }
        return false;
      }

      const response = await axios.put(`http://localhost:8080/api/patients/${nationalId}`, patientData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      // Check if the backend indicates success
      if (response.data && response.data.isSuccess === false) {
        // Don't show toast here - let components handle their own error messaging
        return false;
      }

      await fetchPatients();
      return true;
      
    } catch (error) {
      console.error('Error updating patient:', error);
      
      if (showToast) {
        if (error.response) {
          if (error.response.status === 401) {
            showToast('error', 'Authentication Failed', 'Please log in again.');
          } else if (error.response.status === 403) {
            showToast('error', 'Access Denied', 'You do not have permission to update patients.');
          } else {
            const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            showToast('error', 'Update Failed', errorMessage);
          }
        } else if (error.request) {
          showToast('error', 'Network Error', 'Please check your connection and try again.');
        } else {
          showToast('error', 'Unexpected Error', 'An unexpected error occurred. Please try again.');
        }
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchPatients]);

  const deletePatient = useCallback(async (nationalId, patientName) => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      
      if (!jwtToken) {
        if (showToast) {
          showToast('error', 'Authentication Required', 'Please log in again.');
        }
        return false;
      }

      const response = await axios.delete(`http://localhost:8080/api/patients/${nationalId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      // Check if the backend indicates success
      if (response.data && response.data.isSuccess === false) {
        // Don't show toast here - let components handle their own error messaging
        return false;
      }

      await fetchPatients();
      return true;
      
    } catch (error) {
      console.error('Error deleting patient:', error);
      
      if (showToast) {
        if (error.response) {
          if (error.response.status === 401) {
            showToast('error', 'Authentication Failed', 'Please log in again.');
          } else if (error.response.status === 403) {
            showToast('error', 'Access Denied', 'You do not have permission to delete patients.');
          } else {
            const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            showToast('error', 'Delete Failed', errorMessage);
          }
        } else if (error.request) {
          showToast('error', 'Network Error', 'Please check your connection and try again.');
        } else {
          showToast('error', 'Unexpected Error', 'An unexpected error occurred. Please try again.');
        }
      }
      return false;
    }
  }, [fetchPatients]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    submitting,
    lastError,
    fetchPatients,
    registerPatient,
    updatePatient,
    deletePatient
  };
};

export default usePatients;