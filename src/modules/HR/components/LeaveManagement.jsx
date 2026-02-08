import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import PermissionGuard from "../../../components/Permissionguard.jsx";
import ApiService from "../services/ApiService.js";
import {
  Calendar,
  Plus,
  Check,
  X,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const LeaveManagement = () => {
  const { hasPermission, hasAnyPermission, user } = useContext(AuthContext);

  // Permission checks
  const canManageLeaves = hasPermission("hr.LeaveRequests.manage");
  const canReadLeaves = hasPermission("hr.LeaveRequests.read");
  const hasAnyLeavePermission = hasAnyPermission([
    "hr.LeaveRequests.manage",
    "hr.LeaveRequests.read",
  ]);

  const [leaves, setLeaves] = useState([]);
  const [allEmployeeLeaves, setAllEmployeeLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    leaveType: 1,
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    if (hasAnyLeavePermission) {
      loadEmployees();
    }
  }, [hasAnyLeavePermission]);

  useEffect(() => {
    if (hasAnyLeavePermission) {
      loadLeaves();
    }
  }, [filter, employees, hasAnyLeavePermission]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      if (filter === "pending") {
        // Load pending leaves
        const response = await ApiService.getPendingLeaves();
        if (response.success) {
          setLeaves(response.data || []);
        }
      } else {
        // Load all leaves by fetching each employee's leaves
        // Since API doesn't have a "get all leaves" endpoint
        await loadAllEmployeeLeaves();
      }
    } catch (error) {
      console.error("Error loading leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllEmployeeLeaves = async () => {
    if (employees.length === 0) {
      return;
    }

    try {
      // Fetch leaves for all employees
      const leavePromises = employees.map((emp) =>
        ApiService.getEmployeeLeaves(emp.id)
      );

      const results = await Promise.all(leavePromises);

      // Combine all leaves
      const combinedLeaves = [];
      results.forEach((result) => {
        if (result.success && result.data) {
          combinedLeaves.push(...result.data);
        }
      });

      // Sort by request date (newest first)
      combinedLeaves.sort(
        (a, b) => new Date(b.requestDate) - new Date(a.requestDate)
      );

      setLeaves(combinedLeaves);
    } catch (error) {
      console.error("Error loading all employee leaves:", error);
    }
  };

  const loadEmployees = async () => {
    try {
      console.log("Loading employees..."); // Debug
      const response = await ApiService.getAllEmployees();
      console.log("Employees response:", response); // Debug
      if (response.success) {
        const employeeData = response.data || [];
        console.log("Loaded employees:", employeeData.length); // Debug
        setEmployees(employeeData);
      } else {
        console.error("Failed to load employees:", response.error);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const handleCreateLeave = async (e) => {
    e.preventDefault();

    if (!canManageLeaves) {
      alert("You don't have permission to create leave requests");
      return;
    }

    // Validation
    if (!formData.employeeId) {
      alert("Please select an employee");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Please select start and end dates");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert("End date must be after start date");
      return;
    }

    if (!formData.reason.trim()) {
      alert("Please provide a reason for the leave request");
      return;
    }

    try {
      // Build payload according to API spec
      const payload = {
        employeeId: formData.employeeId,
        leaveType: Number(formData.leaveType),
        startDate: formData.startDate, // YYYY-MM-DD format
        endDate: formData.endDate, // YYYY-MM-DD format
        reason: formData.reason.trim(),
      };

      console.log("Submitting leave request:", payload);

      const response = await ApiService.createLeaveRequest(payload);

      if (response.success) {
        alert("Leave request created successfully!");
        setShowModal(false);
        resetForm();
        loadLeaves();
      } else {
        alert(response.error || "Failed to create leave request");
      }
    } catch (error) {
      console.error("Error creating leave:", error);
      alert("An error occurred while creating the leave request");
    }
  };

  const handleApprove = async (leaveId) => {
    if (!canManageLeaves) {
      alert("You don't have permission to approve leave requests");
      return;
    }

    if (
      !window.confirm("Are you sure you want to approve this leave request?")
    ) {
      return;
    }

    try {
      const response = await ApiService.approveLeave(
        leaveId,
        "Approved by HR Manager"
      );
      if (response.success) {
        alert("Leave request approved successfully!");
        loadLeaves();
      } else {
        alert("Failed to approve leave request");
      }
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Failed to approve leave request");
    }
  };

  const handleReject = async (leaveId) => {
    if (!canManageLeaves) {
      alert("You don't have permission to reject leave requests");
      return;
    }

    const reason = window.prompt("Enter rejection reason:");
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      const response = await ApiService.rejectLeave(leaveId, reason.trim());
      if (response.success) {
        alert("Leave request rejected!");
        loadLeaves();
      } else {
        alert("Failed to reject leave request");
      }
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert("Failed to reject leave request");
    }
  };

  const handleViewDetails = async (leaveId) => {
    if (!hasAnyLeavePermission) {
      alert("You don't have permission to view leave details");
      return;
    }

    try {
      const response = await ApiService.getLeaveRequestById(leaveId);
      if (response.success) {
        setSelectedLeave(response.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error loading leave details:", error);
      alert("Failed to load leave details");
    }
  };

  const handleCancel = async (leaveId) => {
    if (!canManageLeaves) {
      alert("You don't have permission to cancel leave requests");
      return;
    }

    const reason = window.prompt("Enter cancellation reason:");
    if (!reason || !reason.trim()) {
      return;
    }

    try {
      const response = await ApiService.cancelLeave(leaveId, reason.trim());
      if (response.success) {
        alert("Leave request cancelled!");
        loadLeaves();
      } else {
        alert("Failed to cancel leave request");
      }
    } catch (error) {
      console.error("Error cancelling leave:", error);
      alert("Failed to cancel leave request");
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      leaveType: 1,
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const leaveTypes = [
    { value: 1, label: "Annual Leave" },
    { value: 2, label: "Sick Leave" },
    { value: 3, label: "Personal Leave" },
    { value: 4, label: "Maternity Leave" },
    { value: 5, label: "Paternity Leave" },
    { value: 6, label: "Unpaid Leave" },
  ];

  const getLeaveTypeLabel = (typeValue) => {
    // Handle if it's already a string (like "Annual" from API response)
    if (typeof typeValue === "string") {
      return typeValue;
    }
    // Handle if it's a number
    return leaveTypes.find((t) => t.value === typeValue)?.label || "Unknown";
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter leaves based on selected filter
  const filteredLeaves = leaves.filter((leave) => {
    if (filter === "all") return true;
    if (filter === "pending") return leave.status?.toLowerCase() === "pending";
    if (filter === "approved")
      return leave.status?.toLowerCase() === "approved";
    if (filter === "rejected")
      return leave.status?.toLowerCase() === "rejected";
    return true;
  });

  // Check if user has any leave permission
  if (!hasAnyLeavePermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">
            You don't have permission to view leave requests.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="all">All Requests</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <p className="text-sm text-gray-600">
            Showing {filteredLeaves.length} request
            {filteredLeaves.length !== 1 ? "s" : ""}
          </p>
        </div>

        {canManageLeaves && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Leave Request
          </button>
        )}
      </div>

      {/* Permission Notice for Read-Only Users */}
      {canReadLeaves && !canManageLeaves && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              <strong>Read-Only Access:</strong> You can view leave requests but
              cannot create, approve, or reject them.
            </p>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {leave.employeeName?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {leave.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {leave.employeeCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getLeaveTypeLabel(leave.leaveType)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString()} –{" "}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {leave.totalDays} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center space-x-1 ${getStatusColor(
                        leave.status
                      )}`}
                    >
                      {getStatusIcon(leave.status)}
                      <span className="ml-1">{leave.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(leave.requestDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* View Details - Available to all with read or manage permission */}
                      <button
                        onClick={() => handleViewDetails(leave.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Approve/Reject - Only for manage permission */}
                      {canManageLeaves &&
                        leave.status?.toLowerCase() === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(leave.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(leave.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeaves.length === 0 && (
            <div className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leave requests found</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE LEAVE MODAL */}
      {showModal && canManageLeaves && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4
                bg-black/40 backdrop-blur-sm"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                New Leave Request
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4">
              {/* Debug info */}
              {employees.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  ⚠️ No employees loaded. Please refresh the page.
                </div>
              )}

              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *{" "}
                  {employees.length > 0 && (
                    <span className="text-xs text-gray-500">
                      ({employees.length} available)
                    </span>
                  )}
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} - {emp.employeeCode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type *
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leaveType: Number(e.target.value),
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {leaveTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  required
                  rows="3"
                  placeholder="Please provide a reason for this leave request"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAVE DETAILS MODAL */}
      {showDetailsModal && selectedLeave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4
                bg-black/40 backdrop-blur-sm"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Leave Request Details
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLeave(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Employee
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedLeave.employeeName} ({selectedLeave.employeeCode})
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Leave Type
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {getLeaveTypeLabel(selectedLeave.leaveType)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Start Date
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedLeave.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    End Date
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedLeave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Total Days
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedLeave.totalDays} days
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        selectedLeave.status
                      )}`}
                    >
                      {selectedLeave.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Reason
                </label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                  {selectedLeave.reason}
                </p>
              </div>

              {selectedLeave.approvedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Approved By
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedLeave.approvedBy} on{" "}
                    {new Date(selectedLeave.approvedDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {selectedLeave.rejectedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rejected By
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedLeave.rejectedBy} on{" "}
                    {new Date(selectedLeave.rejectedDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {selectedLeave.currentBalance !== undefined && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Current Balance
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedLeave.currentBalance} days
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Balance After
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedLeave.balanceAfter} days
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLeave(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;