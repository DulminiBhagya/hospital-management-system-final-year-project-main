import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

<<<<<<< HEAD
const usePatients = (showToast = null) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastError, setLastError] = useState(null);
=======
const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1

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
      
<<<<<<< HEAD
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
=======
      alert(errorMessage);
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
    } finally {
      setLoading(false);
    }
  }, []);

  const registerPatient = useCallback(async (patientData) => {
    try {
      setSubmitting(true);
      
      const jwtToken = localStorage.getItem('jwtToken');
      
      if (!jwtToken) {
<<<<<<< HEAD
        if (showToast) {
          showToast('error', 'Authentication Required', 'Please log in again.');
        }
        return false;
      }

      const response = await axios.post('http://localhost:8080/api/patients/register', patientData, {
=======
        alert('Authentication required. Please log in again.');
        return false;
      }

      await axios.post('http://localhost:8080/api/patients/register', patientData, {
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

<<<<<<< HEAD
      // Check if the backend indicates success
      if (response.data && response.data.isSuccess === false) {
        setLastError(response.data.message || 'Registration failed.');
        return false;
      }

      // Clear any previous errors on successful registration
      setLastError(null);
      await fetchPatients();
=======
      await fetchPatients();
      alert('Patient registered successfully!');
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
      return true;
      
    } catch (error) {
      console.error('Error registering patient:', error);
      
<<<<<<< HEAD
      // Set error message for component to use
      if (error.response && error.response.data && error.response.data.message) {
        setLastError(error.response.data.message);
      } else {
        setLastError('An error occurred while registering the patient.');
      }
      
=======
      if (error.response) {
        if (error.response.status === 401) {
          alert('Authentication failed. Please log in again.');
        } else if (error.response.status === 403) {
          alert('You do not have permission to register patients.');
        } else {
          const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
          alert(`Failed to register patient: ${errorMessage}`);
        }
      } else if (error.request) {
        alert('Failed to register patient. Please check your connection and try again.');
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
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
<<<<<<< HEAD
        if (showToast) {
          showToast('error', 'Authentication Required', 'Please log in again.');
        }
        return false;
      }

      const response = await axios.put(`http://localhost:8080/api/patients/${nationalId}`, patientData, {
=======
        alert('Authentication required. Please log in again.');
        return false;
      }

      await axios.put(`http://localhost:8080/api/patients/${nationalId}`, patientData, {
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

<<<<<<< HEAD
      // Check if the backend indicates success
      if (response.data && response.data.isSuccess === false) {
        // Don't show toast here - let components handle their own error messaging
        return false;
      }

      await fetchPatients();
=======
      await fetchPatients();
      alert('Patient updated successfully!');
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
      return true;
      
    } catch (error) {
      console.error('Error updating patient:', error);
      
<<<<<<< HEAD
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
=======
      if (error.response) {
        if (error.response.status === 401) {
          alert('Authentication failed. Please log in again.');
        } else if (error.response.status === 403) {
          alert('You do not have permission to update patients.');
        } else {
          const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
          alert(`Failed to update patient: ${errorMessage}`);
        }
      } else if (error.request) {
        alert('Failed to update patient. Please check your connection and try again.');
      } else {
        alert('An unexpected error occurred. Please try again.');
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchPatients]);

  const deletePatient = useCallback(async (nationalId, patientName) => {
<<<<<<< HEAD
=======
    if (!window.confirm(`Are you sure you want to delete patient ${patientName}? This action cannot be undone.`)) {
      return false;
    }
    
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      
      if (!jwtToken) {
<<<<<<< HEAD
        if (showToast) {
          showToast('error', 'Authentication Required', 'Please log in again.');
        }
        return false;
      }

      const response = await axios.delete(`http://localhost:8080/api/patients/${nationalId}`, {
=======
        alert('Authentication required. Please log in again.');
        return false;
      }

      await axios.delete(`http://localhost:8080/api/patients/${nationalId}`, {
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

<<<<<<< HEAD
      // Check if the backend indicates success
      if (response.data && response.data.isSuccess === false) {
        // Don't show toast here - let components handle their own error messaging
        return false;
      }

      await fetchPatients();
=======
      await fetchPatients();
      alert('Patient deleted successfully!');
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
      return true;
      
    } catch (error) {
      console.error('Error deleting patient:', error);
      
<<<<<<< HEAD
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
=======
      if (error.response) {
        if (error.response.status === 401) {
          alert('Authentication failed. Please log in again.');
        } else if (error.response.status === 403) {
          alert('You do not have permission to delete patients.');
        } else {
          const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
          alert(`Failed to delete patient: ${errorMessage}`);
        }
      } else if (error.request) {
        alert('Failed to delete patient. Please check your connection and try again.');
      } else {
        alert('An unexpected error occurred. Please try again.');
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
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
<<<<<<< HEAD
    lastError,
=======
>>>>>>> e8cac8427eae8630a9ad8699b26eb7d5040668b1
    fetchPatients,
    registerPatient,
    updatePatient,
    deletePatient
  };
};

export default usePatients;