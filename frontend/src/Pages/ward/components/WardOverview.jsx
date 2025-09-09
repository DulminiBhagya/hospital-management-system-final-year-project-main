import React, { useMemo, useState, useEffect } from 'react';
import { Bed, Users, CheckCircle, Activity, Heart, Shield, Droplets, Stethoscope, AlertTriangle, Ban } from 'lucide-react';
import useWards from '../hooks/useWards';
import useAdmissions from '../hooks/useAdmissions';

const WardOverview = ({ wardStats = {}, showToast, activeAdmissions = [], allAdmissions = [] }) => {
  const { wards, loading: wardsLoading, lastError } = useWards(showToast);
  const { 
    activeAdmissions: hookActiveAdmissions, 
    allAdmissions: hookAllAdmissions, 
    loading: admissionsLoading, 
    fetchActiveAdmissions, 
    fetchAllAdmissions 
  } = useAdmissions(showToast);
  const [selectedWardType, setSelectedWardType] = useState('All');

  // Use passed data if available, otherwise use hook data
  const actualActiveAdmissions = activeAdmissions.length > 0 ? activeAdmissions : hookActiveAdmissions;
  const actualAllAdmissions = allAdmissions.length > 0 ? allAdmissions : hookAllAdmissions;

  // Fetch admission data when component mounts if no data is passed
  useEffect(() => {
    if (activeAdmissions.length === 0 && allAdmissions.length === 0) {
      fetchActiveAdmissions();
      fetchAllAdmissions();
    }
  }, [activeAdmissions.length, allAdmissions.length, fetchActiveAdmissions, fetchAllAdmissions]);

  const wardTypeConfig = useMemo(() => ({
    'General': {
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: Bed,
      description: 'General Medical Care'
    },
    'ICU': {
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      badgeColor: 'bg-red-100 text-red-800',
      icon: Heart,
      description: 'Intensive Care Unit'
    },
    'Dialysis': {
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Droplets,
      description: 'Dialysis Treatment'
    },
    'Emergency': {
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      badgeColor: 'bg-orange-100 text-orange-800',
      icon: Shield,
      description: 'Emergency Care'
    },
    'Surgery': {
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      badgeColor: 'bg-green-100 text-green-800',
      icon: Stethoscope,
      description: 'Surgical Ward'
    }
  }), []);

  const processedWards = useMemo(() => {
    return wards.map(ward => {
      // Calculate actual bed occupancy from active admissions
      const wardActiveAdmissions = actualActiveAdmissions.filter(
        admission => admission.wardId === ward.wardId && admission.status?.toLowerCase() === 'active'
      );
      
      const total = ward.bedCapacity || 20;
      const occupied = wardActiveAdmissions.length;
      const available = total - occupied;
      const occupancyRate = total > 0 ? (occupied / total) : 0;
      
      // Determine ward status
      let status = 'available';
      let statusMessage = `${available} beds available`;
      let statusColor = 'text-green-600';
      let statusBg = 'bg-green-100';
      
      if (occupied >= total) {
        status = 'full';
        statusMessage = 'Ward Full - No Admissions';
        statusColor = 'text-red-600';
        statusBg = 'bg-red-100';
      } else if (occupancyRate >= 0.9) {
        status = 'critical';
        statusMessage = `Only ${available} bed${available !== 1 ? 's' : ''} left`;
        statusColor = 'text-orange-600';
        statusBg = 'bg-orange-100';
      } else if (occupancyRate >= 0.75) {
        status = 'warning';
        statusMessage = `${available} beds remaining`;
        statusColor = 'text-yellow-600';
        statusBg = 'bg-yellow-100';
      }
      
      return {
        id: ward.wardId,
        name: ward.wardName,
        type: ward.wardType,
        total,
        occupied,
        available,
        occupancyRate,
        status,
        statusMessage,
        statusColor,
        statusBg,
        config: wardTypeConfig[ward.wardType] || wardTypeConfig['General']
      };
    });
  }, [wards, actualActiveAdmissions, wardTypeConfig]);

  const filteredWards = useMemo(() => {
    if (selectedWardType === 'All') return processedWards;
    return processedWards.filter(ward => ward.type === selectedWardType);
  }, [processedWards, selectedWardType]);

  const wardTypes = useMemo(() => {
    const types = [...new Set(processedWards.map(ward => ward.type))];
    return ['All', ...types];
  }, [processedWards]);

  const calculatedStats = useMemo(() => {
    const totalBeds = processedWards.reduce((sum, ward) => sum + ward.total, 0);
    const occupiedBeds = processedWards.reduce((sum, ward) => sum + ward.occupied, 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Calculate real patient status counts from all admissions
    const activePatients = actualActiveAdmissions.filter(admission => admission.status?.toLowerCase() === 'active');
    const totalActivePatients = activePatients.length;
    const dischargedPatients = actualAllAdmissions.filter(admission => admission.status?.toLowerCase() === 'discharged').length;

    // For now, we'll calculate based on total active patients since we don't have medical status data
    // You can replace this with actual patient condition data when available
    const criticalPatients = Math.floor(totalActivePatients * 0.15); // 15% critical
    const stablePatients = Math.floor(totalActivePatients * 0.70); // 70% stable
    const improvingPatients = totalActivePatients - criticalPatients - stablePatients; // remainder improving

    return {
      totalBeds: wardStats.totalBeds || totalBeds,
      occupiedBeds: wardStats.occupiedBeds || occupiedBeds,
      availableBeds: wardStats.availableBeds || availableBeds,
      occupancyRate: wardStats.occupancyRate || occupancyRate,
      totalPatients: totalActivePatients,
      dischargedPatients,
      criticalPatients: wardStats.criticalPatients || criticalPatients,
      stablePatients: wardStats.stablePatients || stablePatients,
      improvingPatients: wardStats.improvingPatients || improvingPatients,
    };
  }, [processedWards, wardStats, actualActiveAdmissions, actualAllAdmissions]);

  // Calculate capacity alerts
  const capacityAlerts = useMemo(() => {
    const fullWards = processedWards.filter(ward => ward.status === 'full');
    const criticalWards = processedWards.filter(ward => ward.status === 'critical');
    const warningWards = processedWards.filter(ward => ward.status === 'warning');
    
    return {
      fullWards,
      criticalWards,
      warningWards,
      hasAlerts: fullWards.length > 0 || criticalWards.length > 0 || warningWards.length > 0
    };
  }, [processedWards]);

  const loading = wardsLoading || admissionsLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (lastError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{lastError}</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Ward Type Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ward Types</h3>
        <div className="flex flex-wrap gap-3">
          {wardTypes.map((type) => {
            const config = wardTypeConfig[type];
            const IconComponent = config?.icon || Bed;
            const isSelected = selectedWardType === type;
            const wardCount = type === 'All' ? processedWards.length : processedWards.filter(w => w.type === type).length;
            
            return (
              <button
                key={type}
                onClick={() => setSelectedWardType(type)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? type === 'All' 
                      ? 'bg-gray-100 border-gray-300 text-gray-800'
                      : `${config.bgColor} ${config.borderColor} ${config.textColor}`
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {type !== 'All' && <IconComponent className="h-4 w-4" />}
                <span className="font-medium">{type}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isSelected && type !== 'All' ? config.badgeColor : 'bg-gray-100 text-gray-600'
                }`}>
                  {wardCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Beds</p>
              <p className="text-2xl font-bold text-gray-900">{calculatedStats.totalBeds}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bed className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">{calculatedStats.occupiedBeds}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{calculatedStats.availableBeds}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{calculatedStats.occupancyRate}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Alerts */}
      {capacityAlerts.hasAlerts && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Capacity Alerts</h3>
          </div>
          <div className="space-y-3">
            {capacityAlerts.fullWards.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <Ban className="w-5 h-5 text-red-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {capacityAlerts.fullWards.length} Ward{capacityAlerts.fullWards.length !== 1 ? 's' : ''} at Full Capacity
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      No new admissions possible: {capacityAlerts.fullWards.map(w => w.name).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {capacityAlerts.criticalWards.length > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      {capacityAlerts.criticalWards.length} Ward{capacityAlerts.criticalWards.length !== 1 ? 's' : ''} Near Capacity
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Limited beds remaining: {capacityAlerts.criticalWards.map(w => `${w.name} (${w.available} bed${w.available !== 1 ? 's' : ''})`).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {capacityAlerts.warningWards.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {capacityAlerts.warningWards.length} Ward{capacityAlerts.warningWards.length !== 1 ? 's' : ''} High Occupancy
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Monitor capacity: {capacityAlerts.warningWards.map(w => `${w.name} (${w.available} bed${w.available !== 1 ? 's' : ''})`).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ward Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ward Status</h3>
          {selectedWardType !== 'All' && (
            <span className="text-sm text-gray-500">
              Showing {filteredWards.length} {selectedWardType} ward{filteredWards.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWards.map((ward) => {
            const IconComponent = ward.config.icon;
            return (
              <div 
                key={ward.id} 
                className={`p-4 border-2 rounded-lg transition-all duration-200 ${ward.config.bgColor} ${ward.config.borderColor}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${ward.config.badgeColor.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{ward.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ward.config.badgeColor}`}>
                          {ward.type}
                        </span>
                        <span className="text-xs text-gray-500">{ward.config.description}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ward.occupancyRate > 0.8 ? 'bg-red-100 text-red-800' :
                      ward.occupancyRate > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {Math.round(ward.occupancyRate * 100)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* Capacity Status Message */}
                  <div className={`flex items-center justify-center p-2 rounded-lg ${ward.statusBg} border-2 ${
                    ward.status === 'full' ? 'border-red-200' :
                    ward.status === 'critical' ? 'border-orange-200' :
                    ward.status === 'warning' ? 'border-yellow-200' :
                    'border-green-200'
                  }`}>
                    {ward.status === 'full' && <Ban className="w-4 h-4 mr-2 text-red-600" />}
                    {ward.status === 'critical' && <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />}
                    {ward.status === 'warning' && <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />}
                    {ward.status === 'available' && <CheckCircle className="w-4 h-4 mr-2 text-green-600" />}
                    <span className={`text-sm font-medium ${ward.statusColor}`}>
                      {ward.statusMessage}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className={ward.config.textColor}>Occupied: {ward.occupied}/{ward.total} beds</span>
                    <span className={ward.status === 'full' ? 'text-red-600 font-medium' : 'text-gray-500'}>
                      Available: {ward.available}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        ward.occupancyRate >= 1 ? 'bg-red-500' :
                        ward.occupancyRate > 0.8 ? 'bg-red-400' :
                        ward.occupancyRate > 0.6 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(ward.occupancyRate * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default WardOverview;