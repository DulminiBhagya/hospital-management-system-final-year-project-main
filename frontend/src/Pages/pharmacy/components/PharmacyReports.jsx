import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  BarChart3,
  PieChart,
  DollarSign,
  Package,
  Activity
} from 'lucide-react';

export default function PharmacyReports({ prescriptions, inventory, stats }) {
  const [reportType, setReportType] = useState('utilization');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate report data based on type
  const reportData = useMemo(() => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const filteredPrescriptions = prescriptions.filter(p => {
      const date = new Date(p.receivedDate);
      return date >= startDate && date <= endDate;
    });

    switch (reportType) {
      case 'utilization':
        return generateUtilizationReport(filteredPrescriptions, inventory);
      case 'consumption':
        return generateConsumptionReport(filteredPrescriptions);
      case 'compliance':
        return generateComplianceReport(filteredPrescriptions, inventory);
      case 'cost-analysis':
        return generateCostAnalysisReport(filteredPrescriptions, inventory);
      default:
        return {};
    }
  }, [reportType, dateRange, prescriptions, inventory]);

  function generateUtilizationReport(prescriptions, inventory) {
    const totalPrescriptions = prescriptions.length;
    const dispensedPrescriptions = prescriptions.filter(p => p.status === 'dispensed').length;
    const utilizationRate = totalPrescriptions > 0 ? (dispensedPrescriptions / totalPrescriptions * 100) : 0;
    
    // Top prescribed medications
    const medicationCounts = {};
    prescriptions.forEach(prescription => {
      prescription.medications.forEach(med => {
        medicationCounts[med.drugName] = (medicationCounts[med.drugName] || 0) + 1;
      });
    });
    
    const topMedications = Object.entries(medicationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Daily prescription volume
    const dailyVolume = {};
    prescriptions.forEach(prescription => {
      const date = new Date(prescription.receivedDate).toLocaleDateString();
      dailyVolume[date] = (dailyVolume[date] || 0) + 1;
    });

    return {
      summary: {
        totalPrescriptions,
        dispensedPrescriptions,
        utilizationRate: Math.round(utilizationRate),
        averageProcessingTime: 45, // minutes - would calculate from real data
        patientsSeparated: new Set(prescriptions.map(p => p.patientId)).size
      },
      topMedications,
      dailyVolume
    };
  }

  function generateConsumptionReport(prescriptions) {
    const consumptionByCategory = {};
    const consumptionByMedication = {};
    
    prescriptions.forEach(prescription => {
      prescription.medications.forEach(med => {
        const category = med.category || 'other';
        const quantity = med.quantity || 1;
        
        consumptionByCategory[category] = (consumptionByCategory[category] || 0) + quantity;
        consumptionByMedication[med.drugName] = (consumptionByMedication[med.drugName] || 0) + quantity;
      });
    });

    const topCategories = Object.entries(consumptionByCategory)
      .sort(([,a], [,b]) => b - a)
      .map(([category, amount]) => ({ category, amount }));

    const topConsumed = Object.entries(consumptionByMedication)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([medication, amount]) => ({ medication, amount }));

    return {
      consumptionByCategory: topCategories,
      topConsumed,
      summary: {
        totalConsumption: Object.values(consumptionByMedication).reduce((a, b) => a + b, 0),
        uniqueMedications: Object.keys(consumptionByMedication).length,
        topCategory: topCategories[0]?.category || 'N/A'
      }
    };
  }

  function generateComplianceReport(prescriptions, inventory) {
    const expiryAlerts = inventory.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return expiryDate <= thirtyDaysFromNow;
    }).length;

    const lowStockAlerts = inventory.filter(item => 
      item.currentStock <= item.minimumStock
    ).length;

    const outOfStockAlerts = inventory.filter(item => 
      item.currentStock === 0
    ).length;

    const prescriptionsWithWarnings = prescriptions.filter(p => 
      p.warnings && p.warnings.length > 0
    ).length;

    const complianceScore = Math.max(0, 100 - (expiryAlerts * 5) - (lowStockAlerts * 3) - (outOfStockAlerts * 10));

    return {
      summary: {
        complianceScore: Math.round(complianceScore),
        expiryAlerts,
        lowStockAlerts,
        outOfStockAlerts,
        prescriptionsWithWarnings
      },
      alerts: {
        expiring: inventory.filter(item => {
          const expiryDate = new Date(item.expiryDate);
          const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          return expiryDate <= thirtyDaysFromNow;
        }).slice(0, 10),
        lowStock: inventory.filter(item => 
          item.currentStock <= item.minimumStock && item.currentStock > 0
        ).slice(0, 10),
        outOfStock: inventory.filter(item => 
          item.currentStock === 0
        ).slice(0, 10)
      }
    };
  }

  function generateCostAnalysisReport(prescriptions, inventory) {
    let totalCost = 0;
    const costByCategory = {};
    const costByMedication = {};

    prescriptions.forEach(prescription => {
      prescription.medications.forEach(med => {
        const cost = med.cost || 0; // Use actual cost from medication data
        const quantity = med.quantity || 1;
        const totalMedCost = cost * quantity;
        
        totalCost += totalMedCost;
        
        const category = med.category || 'other';
        costByCategory[category] = (costByCategory[category] || 0) + totalMedCost;
        costByMedication[med.drugName] = (costByMedication[med.drugName] || 0) + totalMedCost;
      });
    });

    const inventoryValue = inventory.reduce((total, item) => {
      return total + ((item.unitCost || 50) * item.currentStock);
    }, 0);

    const topCostCategories = Object.entries(costByCategory)
      .sort(([,a], [,b]) => b - a)
      .map(([category, cost]) => ({ category, cost: Math.round(cost) }));

    const topCostMedications = Object.entries(costByMedication)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([medication, cost]) => ({ medication, cost: Math.round(cost) }));

    return {
      summary: {
        totalCost: Math.round(totalCost),
        inventoryValue: Math.round(inventoryValue),
        averageCostPerPrescription: prescriptions.length > 0 ? Math.round(totalCost / prescriptions.length) : 0,
        costSavingsGeneric: Math.round(totalCost * 0.3) // Estimated savings from generics
      },
      costByCategory: topCostCategories,
      topCostMedications
    };
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const reportContent = {
        title: `Pharmacy ${reportType.replace('-', ' ').toUpperCase()} Report`,
        dateRange: `${dateRange.startDate} to ${dateRange.endDate}`,
        data: reportData,
        generatedAt: new Date().toISOString()
      };
      
      downloadReport(reportContent, exportFormat);
      setIsGenerating(false);
    }, 2000);
  };

  const downloadReport = (content, format) => {
    const filename = `pharmacy_${reportType}_${Date.now()}.${format === 'pdf' ? 'json' : 'csv'}`;
    
    if (format === 'pdf') {
      // In real app, this would generate actual PDF
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Generate CSV format
      let csvContent = 'Data,Value\n';
      Object.entries(content.data.summary || {}).forEach(([key, value]) => {
        csvContent += `${key},${value}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const reportTypes = [
    { 
      value: 'utilization', 
      label: 'Pharmacy Utilization', 
      icon: TrendingUp,
      description: 'Prescription volumes and processing efficiency'
    },
    { 
      value: 'consumption', 
      label: 'Medication Consumption', 
      icon: BarChart3,
      description: 'Usage patterns by medication and category'
    },
    { 
      value: 'compliance', 
      label: 'Regulatory Compliance', 
      icon: Activity,
      description: 'Stock alerts and safety compliance metrics'
    },
    { 
      value: 'cost-analysis', 
      label: 'Cost Analysis', 
      icon: DollarSign,
      description: 'Financial analysis and cost optimization'
    }
  ];

  const currentReportType = reportTypes.find(type => type.value === reportType);

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-green-600" />
          Pharmacy Reports & Analytics
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Report Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value={type.value}
                      checked={reportType === type.value}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <type.icon className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">{type.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pdf"
                    checked={exportFormat === 'pdf'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mr-2"
                  />
                  <span>PDF Report</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="excel"
                    checked={exportFormat === 'excel'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mr-2"
                  />
                  <span>Excel Spreadsheet</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Report Summary */}
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-900 mb-3 flex items-center">
                {currentReportType && <currentReportType.icon className="w-4 h-4 mr-2" />}
                {currentReportType?.label} Report
              </h4>
              <div className="text-sm text-green-800 space-y-2">
                <div>Period: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}</div>
                <div>Data Points: {prescriptions.length} prescriptions</div>
                <div>Inventory Items: {inventory.length} medications</div>
                <div>Format: {exportFormat.toUpperCase()}</div>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Report Preview - {currentReportType?.label}
        </h3>

        {/* Report Content based on type */}
        {reportType === 'utilization' && reportData.summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{reportData.summary.totalPrescriptions}</div>
                <div className="text-sm text-blue-800">Total Prescriptions</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{reportData.summary.dispensedPrescriptions}</div>
                <div className="text-sm text-green-800">Dispensed</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{reportData.summary.utilizationRate}%</div>
                <div className="text-sm text-purple-800">Utilization Rate</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{reportData.summary.patientsSeparated}</div>
                <div className="text-sm text-orange-800">Unique Patients</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Prescribed Medications</h4>
              <div className="space-y-2">
                {reportData.topMedications.slice(0, 5).map((med, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{med.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{med.count} prescriptions</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(med.count / reportData.topMedications[0].count) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {reportType === 'compliance' && reportData.summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{reportData.summary.complianceScore}</div>
                <div className="text-sm text-green-800">Compliance Score</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{reportData.summary.expiryAlerts}</div>
                <div className="text-sm text-yellow-800">Expiry Alerts</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{reportData.summary.lowStockAlerts}</div>
                <div className="text-sm text-orange-800">Low Stock</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{reportData.summary.outOfStockAlerts}</div>
                <div className="text-sm text-red-800">Out of Stock</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.alerts.expiring.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Expiring Soon</h4>
                  <div className="space-y-2">
                    {reportData.alerts.expiring.slice(0, 5).map((item, index) => (
                      <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <div className="font-medium">{item.drugName}</div>
                        <div className="text-yellow-600">Expires: {new Date(item.expiryDate).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!reportData.summary && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              Adjust your date range or report type to view data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}