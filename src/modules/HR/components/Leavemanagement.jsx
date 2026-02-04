import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import apiService from "../services/apiService";

const LeaveManagement = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("my-leaves");
  
  const isManager = user?.roles?.some(r => ["CompanyOwner", "HRHead", "HRManager"].includes(r));

  const [formData, setFormData] = useState({
    employeeId: "",
    leaveType: 1,
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const empRes = await apiService.getAllEmployees();
      if (empRes.success) {
        setEmployees(empRes.data || []);
        
        const currentUserEmp = empRes.data.find(e => e.email === user.email);
        if (currentUserEmp) {
          setFormData(prev => ({ ...prev, employeeId: currentUserEmp.id }));
          
          if (activeTab === "my-leaves") {
            const leavesRes = await apiService.getEmployeeLeaves(currentUserEmp.id);
            if (leavesRes.success) setLeaves(leavesRes.data || []);
            
            const balanceRes = await apiService.getLeaveBalance(currentUserEmp.id, new Date().getFullYear());
            if (balanceRes.success) setBalance(balanceRes.data);
          }
        }
      }

      if (activeTab === "pending" && isManager) {
        const pendingRes = await apiService.getPendingLeaves();
        if (pendingRes.success) setLeaves(pendingRes.data || []);
      }

      if (activeTab === "all-leaves" && isManager) {
        const allLeavesRes = await apiService.getAllLeaves();
        if (allLeavesRes.success) setLeaves(allLeavesRes.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await apiService.createLeaveRequest(formData);
    if (result.success) {
      alert("Leave request submitted!");
      setShowModal(false);
      resetForm();
      loadData();
    } else {
      alert(result.error || "Failed to create leave request");
    }
  };

  const handleApprove = async (id) => {
    const result = await apiService.approveLeave(id);
    if (result.success) {
      alert("Leave approved!");
      loadData();
    } else {
      alert(result.error || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    
    const result = await apiService.rejectLeave(id, reason);
    if (result.success) {
      alert("Leave rejected!");
      loadData();
    } else {
      alert(result.error || "Failed to reject");
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt("Reason for cancellation:");
    if (!reason) return;
    
    const result = await apiService.cancelLeave(id, reason);
    if (result.success) {
      alert("Leave cancelled!");
      loadData();
    } else {
      alert(result.error || "Failed to cancel");
    }
  };

  const resetForm = () => {
    const currentUserEmp = employees.find(e => e.email === user.email);
    setFormData({
      employeeId: currentUserEmp?.id || "",
      leaveType: 1,
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const getLeaveTypeName = (type) => {
    const types = { 1: "Annual", 2: "Sick", 3: "Casual", 4: "Maternity", 5: "Unpaid" };
    return types[type] || "Unknown";
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      "Annual": "bg-blue-100 text-blue-800",
      "Sick": "bg-red-100 text-red-800",
      "Casual": "bg-green-100 text-green-800",
      "Maternity": "bg-purple-100 text-purple-800",
      "Unpaid": "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading leave data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">Manage and track leave requests</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <span className="text-xl">➕</span>
          Request Leave
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-1 mb-6 border border-gray-200 inline-flex">
        <button
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === "my-leaves"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("my-leaves")}
        >
          🏖️ My Leaves
        </button>
        {isManager && (
          <>
            <button
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              ⏳ Pending Approvals
            </button>
            <button
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "all-leaves"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("all-leaves")}
            >
              📋 All Leaves
            </button>
          </>
        )}
      </div>

      {/* Leave Balance */}
      {activeTab === "my-leaves" && balance && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white mb-4">
            <h2 className="text-2xl font-bold mb-1">Leave Balance</h2>
            <p className="text-blue-100">Year {balance.year}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {balance.balances?.map((bal, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{bal.leaveType}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(bal.leaveType)}`}>
                    {bal.available} left
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Entitlement:</span>
                    <span className="font-semibold text-gray-900">{bal.totalEntitlement} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Used:</span>
                    <span className="font-semibold text-red-600">{bal.used} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending:</span>
                    <span className="font-semibold text-yellow-600">{bal.pending} days</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-900">Available:</span>
                    <span className="text-xl font-bold text-green-600">{bal.available} days</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(bal.available / bal.totalEntitlement) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Requests List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {activeTab === "pending" ? "Pending Requests" : activeTab === "all-leaves" ? "All Leave Requests" : "My Leave Requests"}
          </h2>
        </div>

        {leaves.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500 text-lg">
              {activeTab === "pending" ? "No pending requests" : "No leave requests found"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaves.map(leave => (
              <div key={leave.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{leave.employeeName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                        {leave.leaveType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{leave.employeeCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-blue-600 font-semibold">{leave.totalDays} days</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Request Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(leave.requestDate).toLocaleDateString()}
                    </p>
                  </div>

                  {leave.approvedBy && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Approved By</p>
                      <p className="text-sm font-medium text-gray-900">{leave.approvedBy}</p>
                    </div>
                  )}

                  {leave.approvalDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Approval Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(leave.approvalDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Reason</p>
                  <p className="text-sm text-gray-900">{leave.reason}</p>
                </div>

                {leave.notes && (
                  <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                    <p className="text-xs text-yellow-700 mb-1">Notes</p>
                    <p className="text-sm text-yellow-900">{leave.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {leave.status === "Pending" && isManager && activeTab === "pending" && (
                    <>
                      <button 
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        onClick={() => handleApprove(leave.id)}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        onClick={() => handleReject(leave.id)}
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}
                  
                  {leave.status === "Pending" && activeTab === "my-leaves" && (
                    <button 
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      onClick={() => handleCancel(leave.id)}
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Request Leave</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({...formData, leaveType: parseInt(e.target.value)})}
                >
                  <option value={1}>Annual Leave</option>
                  <option value={2}>Sick Leave</option>
                  <option value={3}>Casual Leave</option>
                  <option value={4}>Maternity Leave</option>
                  <option value={5}>Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              {calculateDays() > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Duration:</strong> {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Explain the reason for your leave request..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;