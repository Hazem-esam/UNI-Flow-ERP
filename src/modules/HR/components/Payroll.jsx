import { useState, useEffect, useCallback } from "react";
import apiService from "../services/apiService";

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [summary, setSummary] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [generateFormData, setGenerateFormData] = useState({
    month,
    year,
    employeeIds: [],
    departmentIds: [],
    includeInactive: false,
  });

  const [markPaidFormData, setMarkPaidFormData] = useState({
    paidDate: "",
    paymentMethod: 1,
    transactionReference: "",
    notes: "",
  });

  /* 🔹 Keep generate form in sync with selected period */
  useEffect(() => {
    setGenerateFormData(prev => ({
      ...prev,
      month,
      year,
    }));
  }, [month, year]);

  /* 🔹 Memoized data loader */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [payrollRes, empRes, deptRes, summaryRes] = await Promise.all([
        apiService.getPeriodPayrolls(month, year),
        apiService.getAllEmployees(),
        apiService.getAllDepartments(),
        apiService.getPayrollSummary(month, year),
      ]);

      if (payrollRes?.success) setPayrolls(payrollRes.data ?? []);
      if (empRes?.success) setEmployees(empRes.data ?? []);
      if (deptRes?.success) setDepartments(deptRes.data ?? []);
      if (summaryRes?.success) setSummary(summaryRes.data ?? null);
    } catch (error) {
      console.error("Error loading payroll data:", error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();

    // Clean the form data by removing empty arrays from optional fields
    const cleanedData = { ...generateFormData };
    
    // Remove empty arrays for optional fields
    if (cleanedData.employeeIds && cleanedData.employeeIds.length === 0) {
      delete cleanedData.employeeIds;
    }
    if (cleanedData.departmentIds && cleanedData.departmentIds.length === 0) {
      delete cleanedData.departmentIds;
    }

    const result = await apiService.generatePayroll(cleanedData);

    if (result.success) {
      alert(`Generated ${result.data.generatedCount} payroll records!`);
      setShowGenerateModal(false);
      loadData();
    } else {
      alert(result.error || "Failed to generate payroll");
    }
  };

  const handleViewDetails = async (id) => {
    const result = await apiService.getPayrollById(id);
    if (result.success) {
      setSelectedPayroll(result.data);
      setShowDetailModal(true);
    }
  };

  const handleProcessPayroll = async (id) => {
    if (!window.confirm("Process this payroll?")) return;

    const result = await apiService.processPayroll(id);
    if (result.success) {
      alert("Payroll processed!");
      loadData();
    }
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();

    // Clean the form data by removing empty strings from optional fields
    const cleanedData = { ...markPaidFormData };
    
    const optionalFields = ['paidDate', 'transactionReference', 'notes'];
    
    optionalFields.forEach(field => {
      if (cleanedData[field] === '') {
        delete cleanedData[field];
      }
    });

    const result = await apiService.markPayrollAsPaid(selectedPayroll.id, cleanedData);
    
    if (result.success) {
      alert("Payroll marked as paid!");
      setShowMarkPaidModal(false);
      setShowDetailModal(false);
      loadData();
    } else {
      alert(result.error || "Failed to mark as paid");
    }
  };

  const getStatusBadge = (status = "Draft") => {
    const badges = {
      Draft: "bg-gray-100 text-gray-800",
      Processed: "bg-yellow-100 text-yellow-800",
      Paid: "bg-green-100 text-green-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const resetMarkPaidForm = () => {
    setMarkPaidFormData({
      paidDate: "",
      paymentMethod: 1,
      transactionReference: "",
      notes: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={() => setShowGenerateModal(true)}
        >
          <span className="text-xl">➕</span>
          Generate Payroll
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <select 
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={month} 
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(2000, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select 
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={year} 
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{summary.totalEmployees}</div>
            <div className="text-gray-600 mt-1">Total Employees</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="text-3xl font-bold text-green-600">
              {summary.totalNetPay?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP
            </div>
            <div className="text-gray-600 mt-1">Total Net Pay</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No payroll records found for this period
                  </td>
                </tr>
              ) : (
                payrolls.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{p.employeeName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{p.employeeCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {p.netSalary?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => handleViewDetails(p.id)}
                        >
                          View
                        </button>
                        {p.status === "Draft" && (
                          <button 
                            className="text-green-600 hover:text-green-800 font-medium"
                            onClick={() => handleProcessPayroll(p.id)}
                          >
                            Process
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowGenerateModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Generate Payroll</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowGenerateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGeneratePayroll} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={generateFormData.month}
                    onChange={(e) => setGenerateFormData({...generateFormData, month: parseInt(e.target.value)})}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {new Date(2000, i).toLocaleString("default", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={generateFormData.year}
                    onChange={(e) => setGenerateFormData({...generateFormData, year: parseInt(e.target.value)})}
                  >
                    {[2023, 2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Employees (Optional)</label>
                <select
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  value={generateFormData.employeeIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setGenerateFormData({...generateFormData, employeeIds: selected});
                  }}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Departments (Optional)</label>
                <select
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  value={generateFormData.departmentIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setGenerateFormData({...generateFormData, departmentIds: selected});
                  }}
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={generateFormData.includeInactive}
                    onChange={(e) => setGenerateFormData({...generateFormData, includeInactive: e.target.checked})}
                  />
                  <span className="text-sm font-medium text-gray-700">Include Inactive Employees</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Payroll Details</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <p className="font-semibold text-gray-900">{selectedPayroll.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedPayroll.status)}`}>
                    {selectedPayroll.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedPayroll.year, selectedPayroll.month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Base Salary</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPayroll.baseSalary?.toLocaleString(undefined, { minimumFractionDigits: 2 })} EGP
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Allowances</h3>
                {selectedPayroll.allowances?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPayroll.allowances.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-medium text-green-600">+{item.amount?.toFixed(2)} EGP</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No allowances</p>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Deductions</h3>
                {selectedPayroll.deductions?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPayroll.deductions.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-medium text-red-600">-{item.amount?.toFixed(2)} EGP</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No deductions</p>
                )}
              </div>

              <div className="border-t pt-4 bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Net Salary</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedPayroll.netSalary?.toLocaleString(undefined, { minimumFractionDigits: 2 })} EGP
                  </span>
                </div>
              </div>

              {selectedPayroll.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700">{selectedPayroll.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                {selectedPayroll.status === "Processed" && (
                  <button 
                    type="button" 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    onClick={() => {
                      resetMarkPaidForm();
                      setShowMarkPaidModal(true);
                    }}
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {showMarkPaidModal && selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowMarkPaidModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Mark as Paid</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowMarkPaidModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMarkPaid} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={markPaidFormData.paidDate}
                  onChange={(e) => setMarkPaidFormData({...markPaidFormData, paidDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={markPaidFormData.paymentMethod}
                  onChange={(e) => setMarkPaidFormData({...markPaidFormData, paymentMethod: parseInt(e.target.value)})}
                >
                  <option value={1}>Bank Transfer</option>
                  <option value={2}>Cash</option>
                  <option value={3}>Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={markPaidFormData.transactionReference}
                  onChange={(e) => setMarkPaidFormData({...markPaidFormData, transactionReference: e.target.value})}
                  placeholder="e.g., TRX123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={markPaidFormData.notes}
                  onChange={(e) => setMarkPaidFormData({...markPaidFormData, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setShowMarkPaidModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;