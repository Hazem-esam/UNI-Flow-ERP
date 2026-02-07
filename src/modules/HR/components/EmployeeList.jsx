import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import PermissionGuard from "../../../components/PermissionGuard";
import ApiService from "../services/apiService";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Phone,
} from "lucide-react";

const EmployeeList = ({ onEmployeeSelect }) => {
  const { hasPermission } = useContext(AuthContext);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [showActionMenu, setShowActionMenu] = useState(null);

  useEffect(() => {
    if (hasPermission("hr.employees.read")) {
      loadEmployees();
      loadDepartments();
    } else {
      setLoading(false); // stop spinner if no permission
    }
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAllEmployees();
      if (res.success) setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await ApiService.getAllDepartments();
      if (res.success) setDepartments(res.data || []);
    } catch {}
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await ApiService.deleteEmployee(id);
      loadEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await ApiService.updateEmployeeStatus(id, {
        status,
        effectiveDate: new Date().toISOString(),
      });
      loadEmployees();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredEmployees = employees.filter((e) => {
    const search =
      e.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const status =
      filterStatus === "all" ||
      e.status?.toLowerCase() === filterStatus.toLowerCase();

    const dept =
      selectedDepartment === "all" ||
      e.departmentName === selectedDepartment;

    return search && status && dept;
  });

  const getStatusColor = (status) =>
    ({
      Active: "bg-green-100 text-green-800",
      OnProbation: "bg-yellow-100 text-yellow-800",
      OnLeave: "bg-blue-100 text-blue-800",
      Terminated: "bg-red-100 text-red-800",
    }[status] || "bg-gray-100 text-gray-800");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <PermissionGuard permission="hr.employees.read">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees..."
                className="pl-9 w-full border rounded-lg py-2"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="OnProbation">On Probation</option>
              <option value="OnLeave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white border rounded-xl overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                {["Employee", "Department", "Position", "Status", "Contact", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredEmployees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{e.fullName}</td>
                  <td className="px-6 py-4">{e.departmentName}</td>
                  <td className="px-6 py-4">{e.positionTitle}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(e.status)}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4" />
                      {e.email}
                    </div>
                    {e.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4" />
                        {e.phoneNumber}
                      </div>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEmployeeSelect?.(e.id)}
                        className="text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <PermissionGuard
                        permission="hr.employees.manage"
                        showDenied={false}
                        fullScreen={false}
                      >
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowActionMenu(
                                showActionMenu === e.id ? null : e.id
                              )
                            }
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showActionMenu === e.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow z-10">
                              <button
                                onClick={() => handleStatusChange(e.id, "Active")}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                              >
                                <UserCheck className="w-4 h-4" />
                                Activate
                              </button>
                              <button
                                onClick={() => handleStatusChange(e.id, "Terminated")}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                              >
                                <UserX className="w-4 h-4" />
                                Terminate
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(e.id)}
                                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No employees found
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
};

export default EmployeeList;
