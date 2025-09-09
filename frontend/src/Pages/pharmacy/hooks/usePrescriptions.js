import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function usePrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch prescriptions from API
  const fetchPrescriptionsFromAPI = async () => {
    try {
      // TODO: Replace with actual API endpoint for fetching prescriptions
      // const response = await axios.get('http://localhost:8080/api/pharmacy/prescriptions');
      // return response.data.data || [];
      
      // For now, return empty array until API is ready
      return [];
    } catch (error) {
      console.error('Failed to fetch prescriptions from API:', error);
      return [];
    }
  };

  // Initialize prescriptions
  useEffect(() => {
    const initializePrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPrescriptionsFromAPI();
        setPrescriptions(data);
      } catch (err) {
        setError('Failed to load prescriptions');
        console.error('Error loading prescriptions:', err);
        setPrescriptions([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    initializePrescriptions();
  }, []);

  // Process prescription
  const processPrescription = useCallback(async (prescriptionId) => {
    try {
      setPrescriptions(prev => prev.map(p => 
        p.prescriptionId === prescriptionId 
          ? { ...p, status: 'processing' }
          : p
      ));
      
      // Simulate processing time
      setTimeout(() => {
        setPrescriptions(prev => prev.map(p => 
          p.prescriptionId === prescriptionId 
            ? { ...p, status: 'ready', readyDate: new Date().toISOString() }
            : p
        ));
      }, 2000);
      
      return { success: true };
    } catch (err) {
      setError('Failed to process prescription');
      throw err;
    }
  }, []);

  // Dispense medication
  const dispenseMedication = useCallback(async (dispensingRecord) => {
    try {
      setPrescriptions(prev => prev.map(p => 
        p.prescriptionId === dispensingRecord.prescriptionId 
          ? { 
              ...p, 
              status: 'dispensed',
              dispensedDate: dispensingRecord.dispensedAt,
              dispensedBy: dispensingRecord.dispensedBy
            }
          : p
      ));
      
      return { success: true };
    } catch (err) {
      setError('Failed to dispense medication');
      throw err;
    }
  }, []);

  // Verify drug interactions
  const verifyInteractions = useCallback(async (medications) => {
    try {
      // TODO: Replace with actual API endpoint for drug interactions
      // const drugNames = medications.map(med => med.drugName);
      // const response = await axios.post('http://localhost:8080/api/pharmacy/drug-interactions', {
      //   drugs: drugNames
      // });
      // return response.data.data || [];

      // For now, return empty array until API is ready
      return [];
    } catch (err) {
      setError('Failed to verify drug interactions');
      throw err;
    }
  }, []);

  // Add prescription
  const addPrescription = useCallback(async (prescriptionData) => {
    try {
      const newPrescription = {
        ...prescriptionData,
        prescriptionId: `RX${String(Date.now()).slice(-3)}`,
        receivedDate: new Date().toISOString(),
        status: 'pending'
      };
      
      setPrescriptions(prev => [newPrescription, ...prev]);
      return { success: true };
    } catch (err) {
      setError('Failed to add prescription');
      throw err;
    }
  }, []);

  // Get prescriptions by status
  const getPrescriptionsByStatus = useCallback((status) => {
    return prescriptions.filter(p => p.status === status);
  }, [prescriptions]);

  // Get prescriptions statistics
  const getStats = useCallback(() => {
    const total = prescriptions.length;
    const pending = prescriptions.filter(p => p.status === 'pending').length;
    const processing = prescriptions.filter(p => p.status === 'processing').length;
    const ready = prescriptions.filter(p => p.status === 'ready').length;
    const dispensed = prescriptions.filter(p => p.status === 'dispensed').length;
    
    const today = new Date().toDateString();
    const dispensedToday = prescriptions.filter(p => 
      p.status === 'dispensed' && 
      p.dispensedDate && 
      new Date(p.dispensedDate).toDateString() === today
    ).length;
    
    return {
      totalPrescriptions: total,
      pendingPrescriptions: pending,
      processingPrescriptions: processing,
      readyPrescriptions: ready,
      dispensedPrescriptions: dispensed,
      dispensedToday,
      processingRate: total > 0 ? Math.round(((ready + dispensed) / total) * 100) : 0
    };
  }, [prescriptions]);

  return {
    prescriptions,
    loading,
    error,
    processPrescription,
    dispenseMedication,
    verifyInteractions,
    addPrescription,
    getPrescriptionsByStatus,
    getStats
  };
}