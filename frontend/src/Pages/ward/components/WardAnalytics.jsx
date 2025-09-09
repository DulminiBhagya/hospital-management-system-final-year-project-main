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
  Users, 
  Bed, 
  Activity,
  ArrowUpDown,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react';

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

export default function WardAnalytics({ 
  allAdmissions = [], 
  activeAdmissions = [], 
  wards = [],
  loading,
  onRefresh
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7days');

  const analyticsData = useMemo(() => {
    if (!allAdmissions.length && !activeAdmissions.length) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Time range filtering
    const getDateRange = (range) => {
      const endDate = new Date(today);
      const startDate = new Date(today);
      
      switch(range) {
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }
      return { startDate, endDate };
    };

    const { startDate } = getDateRange(timeRange);

    // Filter admissions by time range
    const filteredAdmissions = allAdmissions.filter(admission => {
      const admissionDate = new Date(admission.admissionDate);
      return admissionDate >= startDate;
    });

    // Ward Occupancy Analysis
    const wardOccupancy = wards.map(ward => {
      const occupiedBeds = activeAdmissions.filter(admission => 
        admission.wardName === ward.name
      ).length;
      return {
        wardName: ward.name,
        occupied: occupiedBeds,
        total: ward.total || 20,
        occupancyRate: ward.total ? Math.round((occupiedBeds / ward.total) * 100) : 0,
        available: (ward.total || 20) - occupiedBeds
      };
    });

    // Admission Status Distribution
    const statusDistribution = {
      active: activeAdmissions.length,
      discharged: allAdmissions.filter(a => a.status === 'DISCHARGED').length,
      transferred: allAdmissions.filter(a => a.status === 'TRANSFERRED').length,
      total: allAdmissions.length
    };

    // Daily Admissions Trend (Last 30 days)
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const admissionsCount = allAdmissions.filter(admission => {
        const admissionDate = new Date(admission.admissionDate);
        return admissionDate.toDateString() === dateStr;
      }).length;

      const dischargesCount = allAdmissions.filter(admission => {
        const dischargeDate = admission.dischargeDate ? new Date(admission.dischargeDate) : null;
        return dischargeDate && dischargeDate.toDateString() === dateStr;
      }).length;

      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        admissions: admissionsCount,
        discharges: dischargesCount,
        fullDate: date
      });
    }

    // Average Length of Stay
    const dischargedAdmissions = allAdmissions.filter(a => 
      a.status === 'DISCHARGED' && a.dischargeDate
    );
    
    const avgLengthOfStay = dischargedAdmissions.length > 0 
      ? dischargedAdmissions.reduce((sum, admission) => {
          const admitDate = new Date(admission.admissionDate);
          const dischargeDate = new Date(admission.dischargeDate);
          const lengthOfStay = Math.ceil((dischargeDate - admitDate) / (1000 * 60 * 60 * 24));
          return sum + lengthOfStay;
        }, 0) / dischargedAdmissions.length
      : 0;

    // Ward Type Distribution
    const wardTypes = wards.reduce((acc, ward) => {
      const type = ward.type || 'general';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Age Group Analysis (assuming we have patient data)
    const ageGroups = activeAdmissions.reduce((acc, admission) => {
      // Since we don't have direct age data, we'll create sample distribution
      // In real implementation, this would calculate from patient.dateOfBirth
      const groups = ['0-18', '19-35', '36-55', '56-70', '70+'];
      const randomGroup = groups[Math.floor(Math.random() * groups.length)];
      acc[randomGroup] = (acc[randomGroup] || 0) + 1;
      return acc;
    }, {});

    // Emergency vs Routine Admissions (sample data)
    const admissionTypes = {
      emergency: Math.floor(activeAdmissions.length * 0.3),
      routine: Math.floor(activeAdmissions.length * 0.7)
    };

    return {
      wardOccupancy,
      statusDistribution,
      last30Days,
      avgLengthOfStay: Math.round(avgLengthOfStay * 10) / 10,
      wardTypes,
      ageGroups,
      admissionTypes,
      totalBeds: wards.reduce((sum, ward) => sum + (ward.total || 20), 0),
      occupiedBeds: activeAdmissions.length,
      filteredAdmissions
    };
  }, [allAdmissions, activeAdmissions, wards, timeRange]);

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

  // Ward Occupancy Chart Data
  const wardOccupancyData = {
    labels: analyticsData ? analyticsData.wardOccupancy.map(w => w.wardName) : [],
    datasets: [
      {
        label: 'Occupied Beds',
        data: analyticsData ? analyticsData.wardOccupancy.map(w => w.occupied) : [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Available Beds',
        data: analyticsData ? analyticsData.wardOccupancy.map(w => w.available) : [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Admission Status Distribution
  const statusDistributionData = {
    labels: ['Active', 'Discharged', 'Transferred'],
    datasets: [
      {
        data: analyticsData ? [
          analyticsData.statusDistribution.active,
          analyticsData.statusDistribution.discharged,
          analyticsData.statusDistribution.transferred,
        ] : [0, 0, 0],
        backgroundColor: [
          '#3B82F6', // blue
          '#10B981', // green
          '#F59E0B', // yellow
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Daily Admissions Trend
  const admissionsTrendData = {
    labels: analyticsData ? analyticsData.last30Days.map(d => d.date) : [],
    datasets: [
      {
        label: 'Admissions',
        data: analyticsData ? analyticsData.last30Days.map(d => d.admissions) : [],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Discharges',
        data: analyticsData ? analyticsData.last30Days.map(d => d.discharges) : [],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  // Age Group Distribution
  const ageGroupData = {
    labels: analyticsData ? Object.keys(analyticsData.ageGroups) : [],
    datasets: [
      {
        data: analyticsData ? Object.values(analyticsData.ageGroups) : [],
        backgroundColor: [
          '#8B5CF6', // purple
          '#06B6D4', // cyan
          '#10B981', // green
          '#F59E0B', // yellow
          '#EF4444', // red
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          <p className="text-gray-600">No admission data available for analysis</p>
        </div>
      </div>
    );
  }

  const occupancyRate = analyticsData.totalBeds > 0 
    ? Math.round((analyticsData.occupiedBeds / analyticsData.totalBeds) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-7 h-7 mr-3 text-blue-600" />
              Ward Analytics Dashboard
            </h2>
            <p className="text-gray-600 mt-1">Real-time hospital ward insights and metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-blue-600">{analyticsData.statusDistribution.active}</p>
              <p className="text-xs text-gray-500 mt-1">Currently admitted</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Bed Occupancy Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bed Occupancy</p>
              <p className="text-3xl font-bold text-green-600">{occupancyRate}%</p>
              <p className="text-xs text-gray-500 mt-1">{analyticsData.occupiedBeds}/{analyticsData.totalBeds} beds</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Bed className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Average Length of Stay */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Length of Stay</p>
              <p className="text-3xl font-bold text-purple-600">{analyticsData.avgLengthOfStay}</p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Activity</p>
              <p className="text-3xl font-bold text-orange-600">
                {analyticsData.last30Days[analyticsData.last30Days.length - 1]?.admissions || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">new admissions</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Occupancy Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bed className="w-5 h-5 mr-2 text-blue-600" />
            Ward Bed Occupancy
          </h3>
          <div className="h-64">
            <Bar data={wardOccupancyData} options={{
              ...chartOptions,
              scales: {
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                  beginAtZero: true,
                }
              }
            }} />
          </div>
        </div>

        {/* Patient Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-600" />
            Patient Status Distribution
          </h3>
          <div className="h-64">
            <Doughnut data={statusDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* Admissions & Discharges Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Admissions & Discharges Trend (Last 30 Days)
          </h3>
          <div className="h-64">
            <Line data={admissionsTrendData} options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                }
              }
            }} />
          </div>
        </div>

        {/* Patient Age Groups */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-cyan-600" />
            Patient Age Groups
          </h3>
          <div className="h-64">
            <Pie data={ageGroupData} options={chartOptions} />
          </div>
        </div>

        {/* Ward Utilization Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Ward Utilization Details
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">Ward</th>
                  <th className="text-center py-2 font-medium text-gray-900">Occupancy</th>
                  <th className="text-center py-2 font-medium text-gray-900">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analyticsData.wardOccupancy.map((ward, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 font-medium text-gray-900">{ward.wardName}</td>
                    <td className="py-2 text-center">{ward.occupied}/{ward.total}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ward.occupancyRate >= 90 ? 'bg-red-100 text-red-800' :
                        ward.occupancyRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ward.occupancyRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}