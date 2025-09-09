import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  Calendar, 
  BarChart3,
  PieChart,
  Activity,
  RefreshCw
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PharmacyAnalytics({ 
  inventory, 
  prescriptions, 
  loading, 
  onRefresh 
}) {
  const [selectedChart, setSelectedChart] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Analytics data processing
  const analyticsData = useMemo(() => {
    if (!inventory.length) return null;

    // Stock Status Analysis
    const stockAnalysis = {
      normal: inventory.filter(item => item.stockStatus === 'NORMAL').length,
      lowStock: inventory.filter(item => item.stockStatus === 'LOW_STOCK').length,
      overStock: inventory.filter(item => item.stockStatus === 'OVERSTOCK').length,
      outOfStock: inventory.filter(item => item.currentStock === 0).length
    };

    // Category Analysis
    const categoryData = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    // Value Analysis by Category
    const categoryValue = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + (item.totalValue || 0);
      return acc;
    }, {});

    // Expiry Analysis
    const expiryAnalysis = {
      expired: inventory.filter(item => item.daysUntilExpiry < 0).length,
      expiringSoon: inventory.filter(item => item.daysUntilExpiry >= 0 && item.daysUntilExpiry <= 30).length,
      expiring60Days: inventory.filter(item => item.daysUntilExpiry > 30 && item.daysUntilExpiry <= 60).length,
      good: inventory.filter(item => item.daysUntilExpiry > 60).length
    };

    // Top Items by Value
    const topValueItems = [...inventory]
      .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
      .slice(0, 10);

    // Stock Distribution
    const stockDistribution = inventory.map(item => ({
      name: item.drugName,
      current: item.currentStock,
      minimum: item.minimumStock,
      maximum: item.maximumStock,
      utilization: (item.currentStock / item.maximumStock) * 100
    }));

    return {
      stockAnalysis,
      categoryData,
      categoryValue,
      expiryAnalysis,
      topValueItems,
      stockDistribution,
      totalItems: inventory.length,
      totalValue: inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0),
      averageStockLevel: inventory.reduce((sum, item) => sum + ((item.currentStock / item.maximumStock) * 100), 0) / inventory.length
    };
  }, [inventory]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  const stockStatusData = {
    labels: ['Normal Stock', 'Low Stock', 'Overstock', 'Out of Stock'],
    datasets: [
      {
        data: analyticsData ? [
          analyticsData.stockAnalysis.normal,
          analyticsData.stockAnalysis.lowStock,
          analyticsData.stockAnalysis.overStock,
          analyticsData.stockAnalysis.outOfStock,
        ] : [0, 0, 0, 0],
        backgroundColor: [
          '#10B981', // green
          '#F59E0B', // yellow
          '#3B82F6', // blue
          '#EF4444', // red
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const categoryDistributionData = {
    labels: analyticsData ? Object.keys(analyticsData.categoryData) : [],
    datasets: [
      {
        label: 'Number of Medications',
        data: analyticsData ? Object.values(analyticsData.categoryData) : [],
        backgroundColor: [
          '#8B5CF6',
          '#06B6D4',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#6366F1',
          '#EC4899',
          '#14B8A6',
        ],
      },
    ],
  };

  const categoryValueData = {
    labels: analyticsData ? Object.keys(analyticsData.categoryValue) : [],
    datasets: [
      {
        label: 'Inventory Value ($)',
        data: analyticsData ? Object.values(analyticsData.categoryValue) : [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const expiryStatusData = {
    labels: ['Expired', 'Expiring Soon (30d)', 'Expiring (60d)', 'Good'],
    datasets: [
      {
        data: analyticsData ? [
          analyticsData.expiryAnalysis.expired,
          analyticsData.expiryAnalysis.expiringSoon,
          analyticsData.expiryAnalysis.expiring60Days,
          analyticsData.expiryAnalysis.good,
        ] : [0, 0, 0, 0],
        backgroundColor: [
          '#DC2626', // red
          '#EA580C', // orange
          '#D97706', // amber
          '#059669', // green
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Add some medications to view analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="w-7 h-7 mr-3 text-green-600" />
              Pharmacy Analytics Dashboard
            </h2>
            <p className="text-gray-600 mt-1">Real-time insights and data visualization</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Medications</p>
              <p className="text-3xl font-bold text-blue-600">{analyticsData.totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
              <p className="text-3xl font-bold text-green-600">${analyticsData.totalValue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Stock Level</p>
              <p className="text-3xl font-bold text-purple-600">{analyticsData.averageStockLevel.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Need Attention</p>
              <p className="text-3xl font-bold text-orange-600">
                {analyticsData.stockAnalysis.lowStock + analyticsData.expiryAnalysis.expiringSoon}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Status Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-600" />
            Stock Status Distribution
          </h3>
          <div className="h-64">
            <Doughnut data={stockStatusData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Medication Categories
          </h3>
          <div className="h-64">
            <Pie data={categoryDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* Category Value Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
            Inventory Value by Category
          </h3>
          <div className="h-64">
            <Bar data={categoryValueData} options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Expiry Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-orange-600" />
            Expiry Status Analysis
          </h3>
          <div className="h-64">
            <Doughnut data={expiryStatusData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Top Value Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Top 10 Medications by Total Value
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-900">Medication</th>
                <th className="text-left py-3 font-medium text-gray-900">Category</th>
                <th className="text-right py-3 font-medium text-gray-900">Stock</th>
                <th className="text-right py-3 font-medium text-gray-900">Unit Cost</th>
                <th className="text-right py-3 font-medium text-gray-900">Total Value</th>
                <th className="text-center py-3 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analyticsData.topValueItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div>
                      <div className="font-medium text-gray-900">{item.drugName}</div>
                      <div className="text-gray-600 text-xs">{item.genericName}</div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 text-right">{item.currentStock}</td>
                  <td className="py-3 text-right">${item.unitCost?.toFixed(2)}</td>
                  <td className="py-3 text-right font-medium">${item.totalValue?.toLocaleString()}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.stockStatus === 'NORMAL' ? 'bg-green-100 text-green-800' :
                      item.stockStatus === 'LOW_STOCK' ? 'bg-red-100 text-red-800' :
                      item.stockStatus === 'OVERSTOCK' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.stockStatus?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}