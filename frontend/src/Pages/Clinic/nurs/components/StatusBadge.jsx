import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    available: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    busy: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertCircle },
    unavailable: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    completed: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    'in-progress': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
    scheduled: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock }
  };

  const config = statusConfig[status] || statusConfig.scheduled;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
      <Icon size={12} className="mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;