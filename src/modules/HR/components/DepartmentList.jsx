import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import ApiService from "../services/apiService";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Building2,
  X,
  Save,
  Search,
} from "lucide-react";

const DepartmentList = () => {
  const { hasPermission } = useContext(AuthContext);

  // PAGE-LEVEL PERMISSION CHECK: at least read or manage required
  const canRead =
    hasPermission("hr.departments.read") ||
    hasPermission("hr.departments.manage");
  const canManage = hasPermission("hr.departments.manage");
  const canAccessPage = canRead || canManage;

  if (!canAccessPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">
          You do not have access to department management.
        </p>
      </div>
    );
  }

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    managerId: "",
    isActive: true,
  });

  // Load departments if user has read access
  useEffect(() => {
    if (canRead) loadDepartments();
  }, [canRead]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getAllDepartments();
      if (response.success) setDepartments(response.data || []);
    } catch (error) {
      console.error("Error loading departments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open create modal
  const handleCreate = () => {
    if (!canManage) return;
    setEditingDept(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      managerId: "",
      isActive: true,
    });
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (dept) => {
    if (!canManage) return;
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      description: dept.description || "",
      managerId: dept.managerId || "",
      isActive: dept.isActive,
    });
    setShowModal(true);
  };

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;

    try {
      let response;
      if (editingDept) {
        const { code, ...updateData } = formData;
        response = await ApiService.updateDepartment(
          editingDept.id,
          updateData,
        );
      } else {
        response = await ApiService.createDepartment(formData);
      }

      if (response.success) {
        alert(
          `Department ${editingDept ? "updated" : "created"} successfully!`,
        );
        setShowModal(false);
        loadDepartments();
      } else {
        alert(`Failed to ${editingDept ? "update" : "create"} department`);
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert("An error occurred");
    }
  };

  // Delete department
  const handleDelete = async (id) => {
    if (!canManage) return;
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      const response = await ApiService.deleteDepartment(id);
      if (response.success) {
        alert("Department deleted successfully");
        loadDepartments();
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department");
    }
  };

  // Filter departments by search
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {canManage && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </button>
        )}
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {dept.name}
                  </h3>
                  <p className="text-sm text-gray-500">{dept.code}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  dept.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {dept.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {dept.description && (
              <p className="text-sm text-gray-600 mb-4">{dept.description}</p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{dept.employeeCount || 0} employees</span>
              </div>

              {canManage && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No departments found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && canManage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4
                bg-black/40 backdrop-blur-sm"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDept ? "Edit Department" : "Create Department"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  disabled={!!editingDept}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingDept ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
