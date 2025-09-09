import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function useDrugDatabase() {
  const [drugDatabase, setDrugDatabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch drug database from API
  const fetchDrugDatabaseFromAPI = async () => {
    try {
      // TODO: Replace with actual API endpoint for fetching drug database
      // const response = await axios.get('http://localhost:8080/api/pharmacy/drugs');
      // return response.data.data || [];
      
      // For now, return empty array until API is ready
      return [];
    } catch (error) {
      console.error('Failed to fetch drug database from API:', error);
      return [];
    }
  };

  // Initialize drug database
  useEffect(() => {
    const initializeDrugDatabase = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDrugDatabaseFromAPI();
        setDrugDatabase(data);
      } catch (err) {
        setError('Failed to load drug database');
        console.error('Error loading drug database:', err);
        setDrugDatabase([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    initializeDrugDatabase();
  }, []);

  // Search drugs
  const searchDrug = useCallback(async (searchTerm, category = 'all') => {
    try {
      const results = drugDatabase.filter(drug => {
        const matchesSearch = !searchTerm || 
          drug.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drug.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = category === 'all' || drug.category === category;
        
        return matchesSearch && matchesCategory;
      });

      return results;
    } catch (err) {
      setError('Failed to search drugs');
      throw err;
    }
  }, [drugDatabase]);

  // Get detailed drug information
  const getDrugInfo = useCallback(async (drugId) => {
    try {
      const drug = drugDatabase.find(d => d.drugId === drugId);
      if (!drug) {
        throw new Error('Drug not found');
      }

      // Simulate API call with additional details
      return {
        ...drug,
        pharmacokinetics: {
          absorption: 'Well absorbed orally',
          distribution: 'Widely distributed',
          metabolism: 'Hepatic',
          elimination: 'Renal'
        },
        monitoring: [
          'Efficacy',
          'Side effects',
          'Drug interactions'
        ],
        patientCounseling: [
          'Take as directed',
          'Do not stop abruptly',
          'Report side effects'
        ]
      };
    } catch (err) {
      setError('Failed to get drug information');
      throw err;
    }
  }, [drugDatabase]);

  // Check drug interactions
  const checkInteractions = useCallback(async (drugNames) => {
    try {
      if (drugNames.length < 2) {
        return [];
      }

      // TODO: Replace with actual API endpoint for checking drug interactions
      // const response = await axios.post('http://localhost:8080/api/pharmacy/drug-interactions', {
      //   drugs: drugNames
      // });
      // return response.data.data || [];

      // For now, return empty array until API is ready
      return [];
    } catch (err) {
      setError('Failed to check drug interactions');
      throw err;
    }
  }, []);

  // Get drugs by category
  const getDrugsByCategory = useCallback((category) => {
    return drugDatabase.filter(drug => drug.category === category);
  }, [drugDatabase]);

  // Get all categories
  const getCategories = useCallback(() => {
    return [...new Set(drugDatabase.map(drug => drug.category))];
  }, [drugDatabase]);

  // Add drug to database
  const addDrug = useCallback(async (drugData) => {
    try {
      const newDrug = {
        ...drugData,
        drugId: `DRUG${String(Date.now()).slice(-3)}`
      };
      
      setDrugDatabase(prev => [newDrug, ...prev]);
      return { success: true };
    } catch (err) {
      setError('Failed to add drug');
      throw err;
    }
  }, []);

  // Update drug information
  const updateDrug = useCallback(async (drugId, updateData) => {
    try {
      setDrugDatabase(prev => prev.map(drug => 
        drug.drugId === drugId 
          ? { ...drug, ...updateData }
          : drug
      ));
      
      return { success: true };
    } catch (err) {
      setError('Failed to update drug');
      throw err;
    }
  }, []);

  return {
    drugDatabase,
    loading,
    error,
    searchDrug,
    getDrugInfo,
    checkInteractions,
    getDrugsByCategory,
    getCategories,
    addDrug,
    updateDrug
  };
}