import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Monitor, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  UserCheck,
  UserX,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function ScheduleView({ 
  sessions, 
  machines, 
  loading, 
  onSessionSelect, 
  selectedSession,
  onAddDetails,
  onMarkAttendance 
}) {
  const [viewType, setViewType] = useState('daily'); // 'daily' or 'weekly'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate time slots for daily view
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  // Filter sessions based on current view
  const filteredSessions = useMemo(() => {
    if (viewType === 'daily') {
      const targetDate = currentDate.toDateString();
      return sessions.filter(session => 
        new Date(session.scheduledDate).toDateString() === targetDate
      );
    } else {
      // Weekly view
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return sessions.filter(session => {
        const sessionDate = new Date(session.scheduledDate);
        return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
      });
    }
  }, [sessions, currentDate, viewType]);

  // Generate week dates for weekly view
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  // Navigation functions
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewType === 'daily') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  // Get session status color
  const getStatusColor = (status, attendance) => {
    if (attendance === 'present' && status === 'completed') return 'bg-green-500';
    if (attendance === 'present' && status === 'in_progress') return 'bg-blue-500';
    if (attendance === 'absent') return 'bg-red-500';
    if (attendance === 'pending') return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  // Get session status text
  const getStatusText = (status, attendance) => {
    if (attendance === 'absent') return 'Absent';
    if (attendance === 'present' && status === 'completed') return 'Completed';
    if (attendance === 'present' && status === 'in_progress') return 'In Progress';
    if (attendance === 'pending') return 'Scheduled';
    return 'Unknown';
  };

  // Session card component
  const SessionCard = ({ session, isSelected }) => (
    <div
      onClick={() => onSessionSelect(session)}
      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status, session.attendance)}`}></div>
          <span className="text-sm font-medium text-gray-900">
            {session.patientName}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {session.startTime} - {session.endTime}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <Monitor size={12} />
          <span>{session.machineName}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          session.attendance === 'present' ? 'bg-green-100 text-green-800' :
          session.attendance === 'absent' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {getStatusText(session.status, session.attendance)}
        </span>
      </div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAttendance(session.sessionId, 'present');
              }}
              className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
            >
              <UserCheck size={12} />
              <span>Present</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAttendance(session.sessionId, 'absent');
              }}
              className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
            >
              <UserX size={12} />
              <span>Absent</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddDetails();
              }}
              className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
            >
              <Eye size={12} />
              <span>Details</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading schedule...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header Controls */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* View Type Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('daily')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === 'daily'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock size={16} />
              <span>Daily View</span>
            </button>
            <button
              onClick={() => setViewType('weekly')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === 'weekly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={16} />
              <span>Weekly View</span>
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {viewType === 'daily' 
                  ? currentDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : `Week of ${weekDates[0].toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })} - ${weekDates[6].toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}`
                }
              </h3>
            </div>

            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="p-6">
        {viewType === 'daily' ? (
          // Daily View
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSessions.length > 0 ? (
                filteredSessions
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((session) => (
                    <SessionCard
                      key={session.sessionId}
                      session={session}
                      isSelected={selectedSession?.sessionId === session.sessionId}
                    />
                  ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Sessions Scheduled
                  </h3>
                  <p className="text-gray-600">
                    There are no dialysis sessions scheduled for this day.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Weekly View
          <div className="grid grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = date.getDate();
              const daySessions = filteredSessions.filter(session =>
                new Date(session.scheduledDate).toDateString() === date.toDateString()
              );

              return (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-600">{dayName}</div>
                      <div className={`text-lg font-semibold ${
                        date.toDateString() === new Date().toDateString()
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}>
                        {dayNumber}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-2 min-h-[200px]">
                    {daySessions
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((session) => (
                        <div
                          key={session.sessionId}
                          onClick={() => onSessionSelect(session)}
                          className={`p-2 border rounded cursor-pointer text-xs transition-all ${
                            selectedSession?.sessionId === session.sessionId
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status, session.attendance)}`}></div>
                            <span className="font-medium text-gray-900 truncate">
                              {session.patientName}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            {session.startTime}
                          </div>
                        </div>
                      ))}
                    
                    {daySessions.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Clock size={16} className="mx-auto mb-1" />
                        <div className="text-xs">No sessions</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Session Info */}
      {selectedSession && (
        <div className="border-t border-gray-100 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Selected Session</h4>
              <p className="text-sm text-blue-700">
                {selectedSession.patientName} • {selectedSession.startTime} - {selectedSession.endTime} • {selectedSession.machineName}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onAddDetails}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                <Activity size={14} />
                <span>Add Details</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}