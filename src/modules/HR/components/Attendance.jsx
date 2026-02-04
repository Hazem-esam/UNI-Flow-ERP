import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import apiService from "../services/apiService";

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);

  const isManager = user?.roles?.some(r => ["CompanyOwner", "HRHead", "HRManager"].includes(r));

  const [manualFormData, setManualFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split('T')[0],
    checkInTime: "09:00",
    checkOutTime: "17:00",
    status: 1,
    notes: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadSummary();
      checkTodayStatus();
    }
  }, [selectedEmployee, month, year]);

  const loadEmployees = async () => {
    const result = await apiService.getAllEmployees();
    if (result.success) {
      setEmployees(result.data || []);
      // Auto-select current user if employee
      if (!isManager && result.data.length > 0) {
        const currentUserEmp = result.data.find(e => e.email === user.email);
        if (currentUserEmp) {
          setSelectedEmployee(currentUserEmp.id);
        }
      }
    }
  };

  const loadSummary = async () => {
    setLoading(true);
    const result = await apiService.getAttendanceSummary(selectedEmployee, month, year);
    if (result.success) {
      setSummary(result.data);
    }
    setLoading(false);
  };

  const checkTodayStatus = async () => {
    // This would check if user already checked in/out today
    // For now, we'll set a mock status
    setTodayStatus({
      hasCheckedIn: false,
      hasCheckedOut: false,
      checkInTime: null,
      checkOutTime: null,
    });
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    
    // Clean the form data by removing empty strings from optional fields
    const cleanedData = {
      employeeId: selectedEmployee,
      checkInTime: new Date().toISOString(),
      location: "Office",
    };
    
    // Only add notes if not empty
    const notes = "";
    if (notes) {
      cleanedData.notes = notes;
    }

    const result = await apiService.checkIn(cleanedData);

    if (result.success) {
      alert("Checked in successfully!");
      loadSummary();
      checkTodayStatus();
    } else {
      alert(result.error || "Check-in failed");
    }
    setCheckInLoading(false);
  };

  const handleCheckOut = async () => {
    setCheckInLoading(true);
    
    // Clean the form data by removing empty strings from optional fields
    const cleanedData = {
      employeeId: selectedEmployee,
      checkOutTime: new Date().toISOString(),
    };
    
    // Only add notes if not empty
    const notes = "";
    if (notes) {
      cleanedData.notes = notes;
    }

    const result = await apiService.checkOut(cleanedData);

    if (result.success) {
      alert("Checked out successfully!");
      loadSummary();
      checkTodayStatus();
    } else {
      alert(result.error || "Check-out failed");
    }
    setCheckInLoading(false);
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    
    // Clean the form data by removing empty strings from optional fields
    const cleanedData = { ...manualFormData };
    
    const optionalFields = ['notes', 'checkInTime', 'checkOutTime'];
    
    optionalFields.forEach(field => {
      if (cleanedData[field] === '') {
        delete cleanedData[field];
      }
    });

    const result = await apiService.createManualAttendance(cleanedData);
    if (result.success) {
      alert("Manual attendance created!");
      setShowManualModal(false);
      resetManualForm();
      loadSummary();
    } else {
      alert(result.error || "Failed to create attendance");
    }
  };

  const resetManualForm = () => {
    setManualFormData({
      employeeId: "",
      date: new Date().toISOString().split('T')[0],
      checkInTime: "09:00",
      checkOutTime: "17:00",
      status: 1,
      notes: "",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      1: "bg-green-100 text-green-800", // Present
      2: "bg-red-100 text-red-800", // Absent
      3: "bg-yellow-100 text-yellow-800", // Late
      4: "bg-blue-100 text-blue-800", // On Leave
      5: "bg-orange-100 text-orange-800", // Half Day
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusName = (status) => {
    const names = {
      1: "Present",
      2: "Absent",
      3: "Late",
      4: "On Leave",
      5: "Half Day",
    };
    return names[status] || "Unknown";
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee attendance</p>
        </div>
        {isManager && (
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            onClick={() => setShowManualModal(true)}
          >
            <span className="text-xl">➕</span>
            Manual Entry
          </button>
        )}
      </div>

      {/* Quick Actions & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Status Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Status</h3>
            <span className="text-3xl">⏰</span>
          </div>
          <div className="text-4xl font-bold mb-2">{getCurrentTime()}</div>
          <p className="text-blue-100 text-sm mb-4">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {selectedEmployee && (
            <div className="flex gap-2">
              <button 
                className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                onClick={handleCheckIn}
                disabled={checkInLoading || todayStatus?.hasCheckedIn}
              >
                ▶️ Check In
              </button>
              <button 
                className="flex-1 bg-blue-800 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
                onClick={handleCheckOut}
                disabled={checkInLoading || !todayStatus?.hasCheckedIn || todayStatus?.hasCheckedOut}
              >
                ⏸️ Check Out
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">View Attendance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={!isManager}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={month} 
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading summary...</p>
          </div>
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Employee Info Header */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{summary.employeeName}</h2>
                <p className="text-gray-600">
                  Attendance Report - {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{summary.attendanceRate?.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{summary.totalWorkingDays}</div>
              <div className="text-xs text-gray-600 mt-1">Working Days</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-green-500">
              <div className="text-2xl font-bold text-green-600">{summary.presentDays}</div>
              <div className="text-xs text-gray-600 mt-1">Present</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-red-500">
              <div className="text-2xl font-bold text-red-600">{summary.absentDays}</div>
              <div className="text-xs text-gray-600 mt-1">Absent</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-yellow-500">
              <div className="text-2xl font-bold text-yellow-600">{summary.lateDays}</div>
              <div className="text-xs text-gray-600 mt-1">Late Arrivals</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-blue-500">
              <div className="text-2xl font-bold text-blue-600">{summary.leaveDays}</div>
              <div className="text-xs text-gray-600 mt-1">Leave Days</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{summary.totalWorkedHours?.toFixed(1)}h</div>
              <div className="text-xs text-gray-600 mt-1">Total Hours</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-purple-500">
              <div className="text-2xl font-bold text-purple-600">{summary.totalOvertimeHours?.toFixed(1)}h</div>
              <div className="text-xs text-gray-600 mt-1">Overtime</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {summary.totalWorkedHours > 0 ? (summary.totalWorkedHours / summary.presentDays).toFixed(1) : 0}h
              </div>
              <div className="text-xs text-gray-600 mt-1">Avg Hours/Day</div>
            </div>
          </div>

          {/* Detailed Records Table */}
          {summary.records && summary.records.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Detailed Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.records.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {record.workedHours?.toFixed(1) || 0}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {getStatusName(record.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">Select an employee to view attendance summary</p>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowManualModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Manual Attendance Entry</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowManualModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={manualFormData.employeeId}
                  onChange={(e) => setManualFormData({...manualFormData, employeeId: e.target.value})}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={manualFormData.date}
                  onChange={(e) => setManualFormData({...manualFormData, date: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={manualFormData.checkInTime}
                    onChange={(e) => setManualFormData({...manualFormData, checkInTime: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={manualFormData.checkOutTime}
                    onChange={(e) => setManualFormData({...manualFormData, checkOutTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={manualFormData.status}
                  onChange={(e) => setManualFormData({...manualFormData, status: parseInt(e.target.value)})}
                >
                  <option value={1}>Present</option>
                  <option value={2}>Absent</option>
                  <option value={3}>Late</option>
                  <option value={4}>On Leave</option>
                  <option value={5}>Half Day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={manualFormData.notes}
                  onChange={(e) => setManualFormData({...manualFormData, notes: e.target.value})}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setShowManualModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;