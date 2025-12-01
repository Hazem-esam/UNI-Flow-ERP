// src/modules/HRModule.jsx
import { useState, useEffect } from "react";

import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Clock,
  User,
  X,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function HRModule() {
  const [activeTab, setActiveTab] = useState("overview");
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Load data from localStorage
  useEffect(() => {
    const savedEmployees = localStorage.getItem("hr_employees");
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    } else {
      const sampleEmployees = [
        { id: 1, name: "John Doe", email: "john@company.com", phone: "555-0101", position: "Software Engineer", department: "Engineering", salary: 95000, joinDate: "2023-01-15", status: "active" },
        { id: 2, name: "Jane Smith", email: "jane@company.com", phone: "555-0102", position: "Product Manager", department: "Product", salary: 110000, joinDate: "2022-06-20", status: "active" },
        { id: 3, name: "Mike Johnson", email: "mike@company.com", phone: "555-0103", position: "Designer", department: "Design", salary: 85000, joinDate: "2023-03-10", status: "active" },
        { id: 4, name: "Sarah Williams", email: "sarah@company.com", phone: "555-0104", position: "HR Manager", department: "HR", salary: 90000, joinDate: "2021-09-01", status: "active" },
        { id: 5, name: "Tom Brown", email: "tom@company.com", phone: "555-0105", position: "Sales Rep", department: "Sales", salary: 75000, joinDate: "2023-07-15", status: "on_leave" },
      ];
      setEmployees(sampleEmployees);
      localStorage.setItem("hr_employees", JSON.stringify(sampleEmployees));
    }

    // Sample attendance data
    const attendanceData = [
      { date: "2025-01-20", present: 48, absent: 2, leave: 3 },
      { date: "2025-01-21", present: 50, absent: 1, leave: 2 },
      { date: "2025-01-22", present: 49, absent: 3, leave: 1 },
      { date: "2025-01-23", present: 51, absent: 1, leave: 1 },
      { date: "2025-01-24", present: 47, absent: 4, leave: 2 },
    ];
    setAttendance(attendanceData);
  }, []);

  // Save employees
  const saveEmployees = (newEmployees) => {
    setEmployees(newEmployees);
    localStorage.setItem("hr_employees", JSON.stringify(newEmployees));
  };

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const onLeaveEmployees = employees.filter(e => e.status === "on_leave").length;
  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);

  // Department distribution
  const departmentData = employees.reduce((acc, emp) => {
    const existing = acc.find(item => item.name === emp.department);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: emp.department, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Filter employees
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CRUD operations
  const handleSaveEmployee = (employeeData) => {
    if (editingEmployee) {
      const updatedEmployees = employees.map(e =>
        e.id === editingEmployee.id ? { ...employeeData, id: editingEmployee.id } : e
      );
      saveEmployees(updatedEmployees);
    } else {
      const newEmployee = {
        ...employeeData,
        id: Math.max(...employees.map(e => e.id), 0) + 1,
      };
      saveEmployees([...employees, newEmployee]);
    }
    setShowEmployeeModal(false);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      saveEmployees(employees.filter(e => e.id !== id));
    }
  };

  return (
    <>
      <div className="flex">
        <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">HR Module</h1>
                  <p className="text-gray-600">Manage employees, payroll, and attendance</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md">
              {["overview", "employees", "attendance", "payroll"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <Users className="w-10 h-10 text-blue-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                    <p className="text-3xl font-bold text-gray-900">{totalEmployees}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <Briefcase className="w-10 h-10 text-green-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">Active</p>
                    <p className="text-3xl font-bold text-gray-900">{activeEmployees}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <Calendar className="w-10 h-10 text-yellow-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">On Leave</p>
                    <p className="text-3xl font-bold text-gray-900">{onLeaveEmployees}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <DollarSign className="w-10 h-10 text-purple-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">Total Payroll</p>
                    <p className="text-3xl font-bold text-gray-900">${totalPayroll.toLocaleString()}</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Attendance Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={attendance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="present" fill="#10b981" name="Present" />
                        <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                        <Bar dataKey="leave" fill="#f59e0b" name="Leave" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Department Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Employees Tab */}
            {activeTab === "employees" && (
              <div className="space-y-6">
                {/* Toolbar */}
                <div className="bg-white rounded-xl p-4 shadow-md flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-3 flex-1 min-w-[300px]">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() => {
                        setEditingEmployee(null);
                        setShowEmployeeModal(true);
                      }}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Add Employee
                    </button>
                  </div>
                </div>

                {/* Employees Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          employee.status === "active" ? "bg-green-100 text-green-700" :
                          employee.status === "on_leave" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {employee.status === "active" ? "Active" : employee.status === "on_leave" ? "On Leave" : "Inactive"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-1">{employee.name}</h3>
                      <p className="text-sm text-purple-600 font-medium mb-3">{employee.position}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{employee.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{employee.department}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">${employee.salary.toLocaleString()}/year</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setEditingEmployee(employee);
                            setShowEmployeeModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-purple-600 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Attendance Tracker</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Present</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Absent</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">On Leave</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Attendance Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendance.map((record, index) => {
                        const total = record.present + record.absent + record.leave;
                        const rate = ((record.present / total) * 100).toFixed(1);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                                {record.present}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                                {record.absent}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                                {record.leave}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{rate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payroll Tab */}
            {activeTab === "payroll" && (
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Payroll Calculator</h3>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <p className="text-sm text-purple-600 mb-2">Monthly Payroll</p>
                      <p className="text-3xl font-bold text-purple-900">
                        ${(totalPayroll / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <p className="text-sm text-blue-600 mb-2">Annual Payroll</p>
                      <p className="text-3xl font-bold text-blue-900">${totalPayroll.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <p className="text-sm text-green-600 mb-2">Average Salary</p>
                      <p className="text-3xl font-bold text-green-900">
                        ${(totalPayroll / totalEmployees).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Employee</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Department</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Annual Salary</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Monthly Salary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {employees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{employee.department}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ${employee.salary.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-purple-600">
                              ${(employee.salary / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Employee Modal */}
          {showEmployeeModal && (
            <EmployeeModal
              employee={editingEmployee}
              onSave={handleSaveEmployee}
              onClose={() => {
                setShowEmployeeModal(false);
                setEditingEmployee(null);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

// Employee Modal Component
function EmployeeModal({ employee, onSave, onClose }) {
  const [formData, setFormData] = useState(
    employee || {
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      salary: "",
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
    }
  );

  const handleSubmit = () => {
    onSave({
      ...formData,
      salary: parseFloat(formData.salary),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {employee ? "Edit Employee" : "Add Employee"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
            <input
              type="text"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Salary ($)</label>
            <input
              type="number"
              required
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Join Date</label>
            <input
              type="date"
              required
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700"
          >
            {employee ? "Update" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}