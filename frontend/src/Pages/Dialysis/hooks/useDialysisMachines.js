import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useDialysisMachines = (showToast = null) => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for development - replace with actual API calls
  const mockMachines = [
    {
      machineId: 'M001',
      machineName: 'Fresenius 4008S - Unit 1',
      location: 'Dialysis Room A',
      status: 'active',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      specifications: {
        maxBloodFlow: 450,
        maxDialysateFlow: 800,
        maxUltrafiltrationRate: 4000
      },
      maintenanceHistory: [
        { date: '2024-01-15', type: 'Routine', notes: 'All systems normal' },
        { date: '2023-10-15', type: 'Preventive', notes: 'Filter replacement' }
      ]
    },
    {
      machineId: 'M002',
      machineName: 'Fresenius 4008S - Unit 2',
      location: 'Dialysis Room A',
      status: 'active',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-04-20',
      specifications: {
        maxBloodFlow: 450,
        maxDialysateFlow: 800,
        maxUltrafiltrationRate: 4000
      }
    },
    {
      machineId: 'M003',
      machineName: 'Fresenius 4008S - Unit 3',
      location: 'Dialysis Room B',
      status: 'active',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-04-10',
      specifications: {
        maxBloodFlow: 450,
        maxDialysateFlow: 800,
        maxUltrafiltrationRate: 4000
      }
    },
    {
      machineId: 'M004',
      machineName: 'Fresenius 5008 - Unit 4',
      location: 'Dialysis Room B',
      status: 'maintenance',
      lastMaintenance: '2024-01-25',
      nextMaintenance: '2024-04-25',
      specifications: {
        maxBloodFlow: 500,
        maxDialysateFlow: 800,
        maxUltrafiltrationRate: 4500
      }
    },
    {
      machineId: 'M005',
      machineName: 'Gambro AK 200',
      location: 'Dialysis Room C',
      status: 'offline',
      lastMaintenance: '2023-12-01',
      nextMaintenance: '2024-03-01',
      specifications: {
        maxBloodFlow: 400,
        maxDialysateFlow: 700,
        maxUltrafiltrationRate: 3500
      }
    },
    {
      machineId: 'M006',
      machineName: 'Fresenius 4008S - Unit 6',
      location: 'Dialysis Room C',
      status: 'active',
      lastMaintenance: '2024-02-01',
      nextMaintenance: '2024-05-01',
      specifications: {
        maxBloodFlow: 450,
        maxDialysateFlow: 800,
        maxUltrafiltrationRate: 4000
      }
    }
  ];

  const fetchMachines = useCallback(async (silent = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      /* 
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.get('http://localhost:8080/api/dialysis/machines', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      setMachines(response.data);
      */
      
      // For now, use mock data
      setMachines(mockMachines);
      
      if (showToast && !silent) {
        showToast('success', 'Machines Loaded', 'Dialysis machines loaded successfully');
      }
    } catch (error) {
      console.error('Error fetching dialysis machines:', error);
      setError(error.message);
      
      if (showToast && !silent) {
        showToast('error', 'Load Failed', 'Failed to load dialysis machines');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMachine = useCallback(async (machineId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      /*
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.put(`http://localhost:8080/api/dialysis/machines/${machineId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      */
      
      // For now, update mock data
      setMachines(prev => prev.map(machine => 
        machine.machineId === machineId 
          ? { ...machine, ...updateData }
          : machine
      ));
      
      if (showToast) {
        showToast('success', 'Machine Updated', 'Machine status updated successfully');
      }
    } catch (error) {
      console.error('Error updating dialysis machine:', error);
      setError(error.message);
      
      if (showToast) {
        showToast('error', 'Update Failed', 'Failed to update machine');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const addMachine = useCallback(async (machineData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      /*
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.post('http://localhost:8080/api/dialysis/machines', machineData, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      */
      
      // For now, add to mock data
      const newMachine = {
        ...machineData,
        machineId: `M${Date.now()}`,
        status: 'active',
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      setMachines(prev => [...prev, newMachine]);
      
      if (showToast) {
        showToast('success', 'Machine Added', 'New dialysis machine added successfully');
      }
      
      return newMachine;
    } catch (error) {
      console.error('Error adding dialysis machine:', error);
      setError(error.message);
      
      if (showToast) {
        showToast('error', 'Add Failed', 'Failed to add dialysis machine');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const deleteMachine = useCallback(async (machineId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      /*
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.delete(`http://localhost:8080/api/dialysis/machines/${machineId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      */
      
      // Remove from mock data
      setMachines(prev => prev.filter(machine => machine.machineId !== machineId));
      
      if (showToast) {
        showToast('success', 'Machine Removed', 'Dialysis machine removed successfully');
      }
    } catch (error) {
      console.error('Error deleting dialysis machine:', error);
      setError(error.message);
      
      if (showToast) {
        showToast('error', 'Delete Failed', 'Failed to remove machine');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const scheduleMaintenance = useCallback(async (machineId, maintenanceData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      /*
      // Real API call would be:
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.post(`http://localhost:8080/api/dialysis/machines/${machineId}/maintenance`, 
        maintenanceData, 
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      */
      
      // Update machine with maintenance info
      setMachines(prev => prev.map(machine => 
        machine.machineId === machineId 
          ? { 
              ...machine, 
              status: 'maintenance',
              lastMaintenance: maintenanceData.scheduledDate,
              nextMaintenance: maintenanceData.nextMaintenanceDate,
              maintenanceHistory: [
                ...(machine.maintenanceHistory || []),
                {
                  date: maintenanceData.scheduledDate,
                  type: maintenanceData.type,
                  notes: maintenanceData.notes
                }
              ]
            }
          : machine
      ));
      
      if (showToast) {
        showToast('success', 'Maintenance Scheduled', 'Machine maintenance scheduled successfully');
      }
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      setError(error.message);
      
      if (showToast) {
        showToast('error', 'Schedule Failed', 'Failed to schedule maintenance');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getMachineUtilization = useCallback((machineId, sessions) => {
    const today = new Date().toDateString();
    const machineSessions = sessions.filter(session => 
      session.machineId === machineId && 
      new Date(session.scheduledDate).toDateString() === today
    );

    const utilizationHours = machineSessions.reduce((total, session) => {
      const duration = session.duration || '0h 0m';
      const hours = parseFloat(duration.match(/(\d+)h/) || [0, 0])[1];
      const minutes = parseFloat(duration.match(/(\d+)m/) || [0, 0])[1];
      return total + hours + (minutes / 60);
    }, 0);

    return {
      sessions: machineSessions.length,
      hours: utilizationHours.toFixed(1),
      percentage: Math.round((utilizationHours / 16) * 100) // 16 hours max per day
    };
  }, []);

  const getAvailableMachines = useCallback((date, startTime, endTime) => {
    // This would check against actual scheduled sessions in a real app
    return machines.filter(machine => 
      machine.status === 'active'
    );
  }, [machines]);

  // Load machines on component mount
  useEffect(() => {
    fetchMachines(true); // Silent load on mount
  }, [fetchMachines]);

  return {
    machines,
    loading,
    error,
    fetchMachines,
    updateMachine,
    addMachine,
    deleteMachine,
    scheduleMaintenance,
    getMachineUtilization,
    getAvailableMachines
  };
};

export default useDialysisMachines;