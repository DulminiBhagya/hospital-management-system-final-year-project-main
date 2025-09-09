import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  Search,
  Filter,
  Calendar
} from 'lucide-react';

export default function AttendanceTracker({ 
  sessions, 
  loading, 
  onAttendanceUpdate, 
  stats 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter sessions based on search and filters
  const filteredSessions = useMemo(() => {
    const targetDate = new Date(selectedDate).toDateString();
    
    return sessions
      .filter(session => new Date(session.scheduledDate).toDateString() === targetDate)
      .filter(session => {
        const matchesSearch = !searchTerm || 
          session.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.patientNationalId?.includes(searchTerm) ||
          session.machineName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || session.attendance === filterStatus;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [sessions, searchTerm, filterStatus, selectedDate]);

  // Calculate attendance statistics for selected date
  const dayStats = useMemo(() => {
    const targetDate = new Date(selectedDate).toDateString();
    const daySessions = sessions.filter(session => 
      new Date(session.scheduledDate).toDateString() === targetDate
    );
    
    const present = daySessions.filter(s => s.attendance === 'present').length;
    const absent = daySessions.filter(s => s.attendance === 'absent').length;
    const pending = daySessions.filter(s => s.attendance === 'pending').length;
    const total = daySessions.length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      pending,
      attendanceRate
    };
  }, [sessions, selectedDate]);

  const handleAttendanceChange = async (sessionId, status, currentStatus) => {
    if (currentStatus === status) return; // No change needed
    
    try {
      await onAttendanceUpdate(sessionId, status);
    } catch (error) {
      console.error('Failed to update attendance:', error);
    }
  };

  const getAttendanceButtonStyle = (currentStatus, buttonStatus) => {
    if (currentStatus === buttonStatus) {
      switch (buttonStatus) {
        case 'present':
          return 'bg-green-600 text-white shadow-md';
        case 'absent':
          return 'bg-red-600 text-white shadow-md';
        default:
          return 'bg-yellow-600 text-white shadow-md';
      }
    }
    
    switch (buttonStatus) {
      case 'present':
        return 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300';
      case 'absent':
        return 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading attendance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{dayStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-3xl font-bold text-green-600">{dayStats.present}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-3xl font-bold text-red-600">{dayStats.absent}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-3xl font-bold text-indigo-600">{dayStats.attendanceRate}%</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${dayStats.attendanceRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Date Picker */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredSessions.length} of {dayStats.total} sessions
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Session Attendance - {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div key={session.sessionId} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {session.patientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {session.patientName}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{session.startTime} - {session.endTime}</span>
                          </span>
                          <span>{session.machineName}</span>
                          {session.patientNationalId && (
                            <span>ID: {session.patientNationalId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleAttendanceChange(session.sessionId, 'present', session.attendance)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        getAttendanceButtonStyle(session.attendance, 'present')
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Present</span>
                    </button>

                    <button
                      onClick={() => handleAttendanceChange(session.sessionId, 'absent', session.attendance)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        getAttendanceButtonStyle(session.attendance, 'absent')
                      }`}
                    >
                      <UserX className="w-4 h-4" />
                      <span>Absent</span>
                    </button>

                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.attendance === 'present' ? 'bg-green-100 text-green-800' :
                      session.attendance === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.attendance === 'present' ? 'Present' :
                       session.attendance === 'absent' ? 'Absent' : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Sessions Found
              </h3>
              <p className="text-gray-600">
                {dayStats.total === 0 
                  ? "No dialysis sessions are scheduled for this date." 
                  : "No sessions match your current search criteria."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}