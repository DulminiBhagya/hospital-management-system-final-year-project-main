import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Monitor,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

export default function ReportsModule({ sessions, machines, stats }) {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedMachine, setSelectedMachine] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get unique patients from sessions
  const uniquePatients = useMemo(() => {
    const patients = [...new Set(sessions.map(s => ({ id: s.patientId, name: s.patientName })))];
    return patients.filter((p, index, self) => 
      index === self.findIndex(patient => patient.id === p.id)
    );
  }, [sessions]);

  // Filter sessions based on criteria
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      const inDateRange = sessionDate >= startDate && sessionDate <= endDate;
      const matchesMachine = selectedMachine === 'all' || session.machineId === selectedMachine;
      const matchesPatient = selectedPatient === 'all' || session.patientId === selectedPatient;
      
      return inDateRange && matchesMachine && matchesPatient;
    });
  }, [sessions, dateRange, selectedMachine, selectedPatient]);

  // Generate report data based on type
  const reportData = useMemo(() => {
    switch (reportType) {
      case 'attendance':
        return generateAttendanceReport(filteredSessions);
      case 'treatment':
        return generateTreatmentReport(filteredSessions);
      case 'machine_utilization':
        return generateMachineUtilizationReport(filteredSessions, machines);
      case 'patient_progress':
        return generatePatientProgressReport(filteredSessions);
      default:
        return {};
    }
  }, [reportType, filteredSessions, machines]);

  // Report generation functions
  function generateAttendanceReport(sessions) {
    const totalSessions = sessions.length;
    const presentSessions = sessions.filter(s => s.attendance === 'present').length;
    const absentSessions = sessions.filter(s => s.attendance === 'absent').length;
    const pendingSessions = sessions.filter(s => s.attendance === 'pending').length;
    
    const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions * 100) : 0;
    
    // Daily breakdown
    const dailyBreakdown = {};
    sessions.forEach(session => {
      const date = new Date(session.scheduledDate).toLocaleDateString();
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = { present: 0, absent: 0, pending: 0, total: 0 };
      }
      dailyBreakdown[date][session.attendance]++;
      dailyBreakdown[date].total++;
    });

    return {
      summary: {
        totalSessions,
        presentSessions,
        absentSessions,
        pendingSessions,
        attendanceRate: Math.round(attendanceRate)
      },
      dailyBreakdown
    };
  }

  function generateTreatmentReport(sessions) {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const averageDuration = completedSessions.reduce((total, session) => {
      const duration = session.duration || '0h 0m';
      const hours = parseFloat(duration.match(/(\d+)h/) || [0, 0])[1];
      const minutes = parseFloat(duration.match(/(\d+)m/) || [0, 0])[1];
      return total + hours + (minutes / 60);
    }, 0) / completedSessions.length || 0;

    const complications = sessions.filter(s => s.complications && s.complications.trim() !== '').length;
    
    return {
      summary: {
        totalTreatments: completedSessions.length,
        averageDuration: averageDuration.toFixed(1),
        complications,
        complicationRate: completedSessions.length > 0 ? Math.round((complications / completedSessions.length) * 100) : 0
      },
      treatmentTypes: {
        hemodialysis: sessions.filter(s => s.sessionType === 'hemodialysis').length,
        peritoneal: sessions.filter(s => s.sessionType === 'peritoneal_dialysis').length,
        crrt: sessions.filter(s => s.sessionType === 'continuous_renal_replacement').length
      }
    };
  }

  function generateMachineUtilizationReport(sessions, machines) {
    const machineUsage = {};
    
    machines.forEach(machine => {
      const machineSessions = sessions.filter(s => s.machineId === machine.machineId);
      const utilizationHours = machineSessions.reduce((total, session) => {
        const duration = session.duration || '0h 0m';
        const hours = parseFloat(duration.match(/(\d+)h/) || [0, 0])[1];
        const minutes = parseFloat(duration.match(/(\d+)m/) || [0, 0])[1];
        return total + hours + (minutes / 60);
      }, 0);

      machineUsage[machine.machineId] = {
        machineName: machine.machineName,
        sessions: machineSessions.length,
        utilizationHours: utilizationHours.toFixed(1),
        utilizationRate: Math.round((utilizationHours / (16 * 7)) * 100) // 16 hours/day * 7 days
      };
    });

    return {
      machineUsage,
      summary: {
        totalMachines: machines.length,
        activeMachines: machines.filter(m => m.status === 'active').length,
        averageUtilization: Math.round(
          Object.values(machineUsage).reduce((total, machine) => total + machine.utilizationRate, 0) / machines.length
        )
      }
    };
  }

  function generatePatientProgressReport(sessions) {
    const patientData = {};
    
    uniquePatients.forEach(patient => {
      const patientSessions = sessions.filter(s => s.patientId === patient.id);
      const presentSessions = patientSessions.filter(s => s.attendance === 'present');
      
      patientData[patient.id] = {
        name: patient.name,
        totalSessions: patientSessions.length,
        attendedSessions: presentSessions.length,
        attendanceRate: patientSessions.length > 0 ? Math.round((presentSessions.length / patientSessions.length) * 100) : 0,
        complications: patientSessions.filter(s => s.complications && s.complications.trim() !== '').length
      };
    });

    return {
      patientData,
      summary: {
        totalPatients: uniquePatients.length,
        averageAttendance: Math.round(
          Object.values(patientData).reduce((total, patient) => total + patient.attendanceRate, 0) / uniquePatients.length
        )
      }
    };
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const reportContent = generateReportContent();
      downloadReport(reportContent, exportFormat);
      setIsGenerating(false);
    }, 2000);
  };

  const generateReportContent = () => {
    const reportTitle = `Dialysis ${reportType.replace('_', ' ').toUpperCase()} Report`;
    const dateRangeText = `${dateRange.startDate} to ${dateRange.endDate}`;
    
    return {
      title: reportTitle,
      dateRange: dateRangeText,
      data: reportData,
      generatedAt: new Date().toISOString()
    };
  };

  const downloadReport = (content, format) => {
    const filename = `dialysis_${reportType}_${Date.now()}.${format}`;
    
    if (format === 'pdf') {
      // In real app, this would generate actual PDF
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.replace('.pdf', '.json');
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // In real app, this would generate actual Excel file
      const csv = convertToCSV(content.data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.replace('.excel', '.csv');
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const convertToCSV = (data) => {
    // Simple CSV conversion - would be more sophisticated in real app
    return JSON.stringify(data);
  };

  const reportTypes = [
    { value: 'attendance', label: 'Attendance Report', icon: Users },
    { value: 'treatment', label: 'Treatment Summary', icon: Activity },
    { value: 'machine_utilization', label: 'Machine Utilization', icon: Monitor },
    { value: 'patient_progress', label: 'Patient Progress', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Report Configuration
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Report Type and Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machine Filter
              </label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Machines</option>
                {machines.map((machine) => (
                  <option key={machine.machineId} value={machine.machineId}>
                    {machine.machineName} - {machine.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Filter
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Patients</option>
                {uniquePatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column - Export Options */}
          <div className="space-y-4">
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

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Report Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>Sessions: {filteredSessions.length}</div>
                <div>Date Range: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}</div>
                <div>Machines: {selectedMachine === 'all' ? 'All' : machines.find(m => m.machineId === selectedMachine)?.machineName}</div>
                <div>Patients: {selectedPatient === 'all' ? 'All' : uniquePatients.find(p => p.id === selectedPatient)?.name}</div>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || filteredSessions.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
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
          <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
          Report Preview - {reportTypes.find(t => t.value === reportType)?.label}
        </h3>

        {/* Report Content based on type */}
        {reportType === 'attendance' && reportData.summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{reportData.summary.totalSessions}</div>
                <div className="text-sm text-blue-800">Total Sessions</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{reportData.summary.presentSessions}</div>
                <div className="text-sm text-green-800">Present</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{reportData.summary.absentSessions}</div>
                <div className="text-sm text-red-800">Absent</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{reportData.summary.attendanceRate}%</div>
                <div className="text-sm text-indigo-800">Attendance Rate</div>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Daily Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(reportData.dailyBreakdown).map(([date, data]) => (
                  <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{date}</span>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600">Present: {data.present}</span>
                      <span className="text-red-600">Absent: {data.absent}</span>
                      <span className="text-gray-600">Total: {data.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              No sessions found for the selected criteria. Please adjust your filters and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}