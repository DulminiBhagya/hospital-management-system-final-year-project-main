import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerPatient = useCallback(async (patientData) => {
    try {
      setSubmitting(true);
      
      const jwtToken = localStorage.getItem('jwtToken');
      
      if (!jwtToken) {
        alert('Authentication required. Please log in again.');
        return false;
      }

      await axios.post('http://localhost:8080/api/patients/register', patientData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      await fetchPatients();
      alert('Patient registered successfully!');
      return true;
      
    } catch (error) {
      console.error('Error registering patient:', error);
      
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
        alert('Authentication required. Please log in again.');
        return false;
      }

      await axios.put(`http://localhost:8080/api/patients/${nationalId}`, patientData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      await fetchPatients();
      alert('Patient updated successfully!');
      return true;
      
    } catch (error) {
      console.error('Error updating patient:', error);
      
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
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchPatients]);

  const deletePatient = useCallback(async (nationalId, patientName) => {
    if (!window.confirm(`Are you sure you want to delete patient ${patientName}? This action cannot be undone.`)) {
      return false;
    }
    
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      
      if (!jwtToken) {
        alert('Authentication required. Please log in again.');
        return false;
      }

      await axios.delete(`http://localhost:8080/api/patients/${nationalId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      await fetchPatients();
      alert('Patient deleted successfully!');
      return true;
      
    } catch (error) {
      console.error('Error deleting patient:', error);
      
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
    fetchPatients,
    registerPatient,
    updatePatient,
    deletePatient
  };
};

export default usePatients;