import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch inventory from API
  const fetchInventoryFromAPI = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/pharmacy/medications/inventory');
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        console.error('API returned unsuccessful response:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch inventory from API:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      return [];
    }
  };

  // Refresh inventory data
  const refreshInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchInventoryFromAPI();
      setInventory(data);
      setError(null);
    } catch (err) {
      setError('Failed to refresh inventory');
      console.error('Error refreshing inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize inventory
  useEffect(() => {
    const initializeInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInventoryFromAPI();
        setInventory(data);
      } catch (err) {
        setError('Failed to load inventory');
        console.error('Error loading inventory:', err);
        setInventory([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    initializeInventory();
  }, []);

  // Update stock
  const updateStock = useCallback(async (drugId, newStock) => {
    try {
      setInventory(prev => prev.map(item => 
        item.drugId === drugId 
          ? { 
              ...item, 
              currentStock: newStock,
              lastUpdated: new Date().toISOString()
            }
          : item
      ));
      
      return { success: true };
    } catch (err) {
      setError('Failed to update stock');
      throw err;
    }
  }, []);

  // Add inventory item
  const addInventoryItem = useCallback(async (itemData) => {
    try {
      setError(null);
      
      const response = await axios.post('http://localhost:8080/api/pharmacy/medications/add', itemData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = response.data;

      if (result.success) {
        // Refresh the inventory data from the API to get the latest state
        await refreshInventory();
        
        return { 
          success: true, 
          message: result.message,
          data: result.data 
        };
      } else {
        throw new Error(result.message || 'Failed to add medication');
      }
    } catch (err) {
      let errorMessage = 'Failed to add inventory item';

      // Handle axios errors
      if (err.response) {
        // Server responded with error status code
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 409:
            errorMessage = `Batch number already exists: ${itemData.batchNumber}`;
            break;
          case 422:
            errorMessage = data.data || 'Validation failed';
            break;
          case 400:
            errorMessage = 'Invalid data provided';
            break;
          case 500:
            errorMessage = 'Server error occurred';
            break;
          default:
            errorMessage = data.message || `Server error (${status})`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network error - Could not connect to server';
      } else {
        // Something else happened
        errorMessage = err.message || 'Failed to add medication';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshInventory]);

  // Get low stock items
  const getLowStockItems = useCallback(() => {
    return inventory.filter(item => 
      item.currentStock <= item.minimumStock && item.currentStock > 0
    );
  }, [inventory]);

  // Get out of stock items
  const getOutOfStockItems = useCallback(() => {
    return inventory.filter(item => item.currentStock === 0);
  }, [inventory]);

  // Get expiring items (within 60 days)
  const getExpiringItems = useCallback((days = 60) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return inventory.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= cutoffDate;
    });
  }, [inventory]);

  // Search inventory
  const searchInventory = useCallback((searchTerm, category = 'all') => {
    return inventory.filter(item => {
      const matchesSearch = !searchTerm || 
        item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = category === 'all' || item.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }, [inventory]);

  // Get inventory statistics
  const getStats = useCallback(() => {
    const totalItems = inventory.length;
    const lowStockCount = getLowStockItems().length;
    const outOfStockCount = getOutOfStockItems().length;
    const expiringCount = getExpiringItems(30).length; // Items expiring in 30 days
    
    const totalValue = inventory.reduce((total, item) => {
      return total + (item.currentStock * item.unitCost);
    }, 0);

    const categories = [...new Set(inventory.map(item => item.category))];
    
    return {
      totalItems,
      lowStockAlerts: lowStockCount,
      outOfStockAlerts: outOfStockCount,
      expiryAlerts: expiringCount,
      totalValue: Math.round(totalValue),
      categories,
      averageStockLevel: totalItems > 0 ? Math.round(
        inventory.reduce((sum, item) => sum + (item.currentStock / item.maximumStock * 100), 0) / totalItems
      ) : 0
    };
  }, [inventory, getLowStockItems, getOutOfStockItems, getExpiringItems]);

  // Reorder suggestions
  const getReorderSuggestions = useCallback(() => {
    return inventory.filter(item => {
      const stockPercent = (item.currentStock / item.maximumStock) * 100;
      return stockPercent <= 30; // Items with less than 30% stock
    }).map(item => ({
      ...item,
      suggestedOrder: item.maximumStock - item.currentStock,
      urgency: item.currentStock <= item.minimumStock ? 'high' : 'medium'
    }));
  }, [inventory]);

  // Batch operations
  const updateMultipleStock = useCallback(async (updates) => {
    try {
      setInventory(prev => prev.map(item => {
        const update = updates.find(u => u.drugId === item.drugId);
        return update ? {
          ...item,
          currentStock: update.newStock,
          lastUpdated: new Date().toISOString()
        } : item;
      }));
      
      return { success: true };
    } catch (err) {
      setError('Failed to update multiple stock items');
      throw err;
    }
  }, []);

  return {
    inventory,
    loading,
    error,
    updateStock,
    addInventoryItem,
    refreshInventory,
    getLowStockItems,
    getOutOfStockItems,
    getExpiringItems,
    searchInventory,
    getStats,
    getReorderSuggestions,
    updateMultipleStock
  };
}