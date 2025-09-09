import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  ClipboardList, 
  Package, 
  Shield, 
  FileText, 
  AlertTriangle,
  Search,
  Database,
  TrendingUp
} from 'lucide-react';

// Import components
import PharmacyHeader from './components/PharmacyHeader';
import PrescriptionProcessing from './components/PrescriptionProcessing';
import InventoryManagement from './components/InventoryManagement';
import DispensingControl from './components/DispensingControl';
import DrugDatabase from './components/DrugDatabase';
import PharmacyReports from './components/PharmacyReports';
import PharmacyAnalytics from './components/PharmacyAnalytics';
import { ToastContainer } from '../Clinic/nurs/components/Toast';

// Import custom hooks
import usePrescriptions from './hooks/usePrescriptions';
import useInventory from './hooks/useInventory';
import useDrugDatabase from './hooks/useDrugDatabase';

export default function PharmacyDashboard() {
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [toasts, setToasts] = useState([]);

  // Custom hooks for data management
  const {
    prescriptions,
    loading: prescriptionsLoading,
    processPrescription,
    updatePrescriptionStatus,
    dispenseMedication,
    checkDrugInteractions
  } = usePrescriptions(addToast);

  const {
    inventory,
    loading: inventoryLoading,
    updateStock,
    addInventoryItem,
    refreshInventory,
    getExpiringItems,
    getReorderSuggestions
  } = useInventory(addToast);

  const {
    drugDatabase,
    loading: drugLoading,
    searchDrug,
    getDrugInfo,
    checkInteractions
  } = useDrugDatabase(addToast);

  // Toast functions
  function addToast(type, title, message) {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }

  // Calculate pharmacy statistics
  const pharmacyStats = useMemo(() => {
    const today = new Date().toDateString();
    
    // Prescription statistics
    const totalPrescriptions = prescriptions.length;
    const todayPrescriptions = prescriptions.filter(p => 
      new Date(p.receivedDate).toDateString() === today
    ).length;
    const pendingPrescriptions = prescriptions.filter(p => p.status === 'received' || p.status === 'in-progress').length;
    const readyPrescriptions = prescriptions.filter(p => p.status === 'ready').length;
    const dispensedToday = prescriptions.filter(p => 
      p.status === 'dispensed' && 
      new Date(p.dispensedDate).toDateString() === today
    ).length;

    // Inventory statistics
    const totalMedications = inventory.length;
    const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock).length;
    const expiringItems = inventory.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return expiryDate <= thirtyDaysFromNow;
    }).length;
    const outOfStockItems = inventory.filter(item => item.currentStock === 0).length;

    // Alert counts
    const criticalAlerts = lowStockItems + expiringItems + outOfStockItems;
    
    // Processing efficiency
    const processedToday = prescriptions.filter(p => 
      p.status === 'dispensed' && 
      new Date(p.processedDate).toDateString() === today
    ).length;

    return {
      totalPrescriptions,
      todayPrescriptions,
      pendingPrescriptions,
      readyPrescriptions,
      dispensedToday,
      totalMedications,
      lowStockItems,
      expiringItems,
      outOfStockItems,
      criticalAlerts,
      processedToday,
      processingRate: todayPrescriptions > 0 ? Math.round((processedToday / todayPrescriptions) * 100) : 0
    };
  }, [prescriptions, inventory]);

  // Tab configuration
  const tabs = [
    { 
      id: 'prescriptions', 
      label: 'Prescriptions', 
      icon: ClipboardList, 
      description: 'Process & Track',
      count: pharmacyStats.pendingPrescriptions
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: Package, 
      description: 'Stock Management',
      count: pharmacyStats.lowStockItems
    },
    { 
      id: 'dispensing', 
      label: 'Dispensing', 
      icon: Shield, 
      description: 'Medication Control',
      count: pharmacyStats.readyPrescriptions
    },
    { 
      id: 'database', 
      label: 'Drug Info', 
      icon: Database, 
      description: 'Medication Database'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: TrendingUp, 
      description: 'Data Visualization'
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FileText, 
      description: 'Analytics & Compliance'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'prescriptions':
        return (
          <PrescriptionProcessing
            prescriptions={prescriptions}
            loading={prescriptionsLoading}
            onProcessPrescription={processPrescription}
            onUpdateStatus={updatePrescriptionStatus}
            onCheckInteractions={checkDrugInteractions}
            drugDatabase={drugDatabase}
            stats={pharmacyStats}
          />
        );
      case 'inventory':
        return (
          <InventoryManagement
            inventory={inventory}
            loading={inventoryLoading}
            onUpdateStock={updateStock}
            onAddMedication={addInventoryItem}
            onGenerateAlerts={getReorderSuggestions}
            stats={pharmacyStats}
          />
        );
      case 'dispensing':
        return (
          <DispensingControl
            prescriptions={prescriptions.filter(p => p.status === 'ready' || p.status === 'in-progress')}
            inventory={inventory}
            loading={prescriptionsLoading}
            onDispenseMedication={dispenseMedication}
            onVerifyPatient={() => {}} // Patient verification logic
            stats={pharmacyStats}
          />
        );
      case 'database':
        return (
          <DrugDatabase
            drugDatabase={drugDatabase}
            loading={drugLoading}
            onSearchDrug={searchDrug}
            onGetDrugInfo={getDrugInfo}
            onCheckInteractions={checkInteractions}
          />
        );
      case 'analytics':
        return (
          <PharmacyAnalytics
            inventory={inventory}
            prescriptions={prescriptions}
            loading={inventoryLoading}
            onRefresh={refreshInventory}
          />
        );
      case 'reports':
        return (
          <PharmacyReports
            prescriptions={prescriptions}
            inventory={inventory}
            stats={pharmacyStats}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Header */}
      <PharmacyHeader stats={pharmacyStats} />

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className={`text-xs ${
                    activeTab === tab.id ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
                
                {/* Alert badges */}
                {tab.count > 0 && (
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    tab.id === 'inventory' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {tab.count > 99 ? '99+' : tab.count}
                  </div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Critical Alerts Banner */}
      {pharmacyStats.criticalAlerts > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-medium text-sm">Critical Alerts</div>
              <div className="text-xs opacity-90">
                {pharmacyStats.criticalAlerts} items need attention
              </div>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              View
            </button>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}