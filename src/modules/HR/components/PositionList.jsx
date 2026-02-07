import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import ApiService from "../services/apiService";
import {
  Plus,
  Edit,
  Trash2,
  Briefcase,
  X,
  DollarSign,
  Search,
} from "lucide-react";

const PositionList = () => {
  const { hasPermission } = useContext(AuthContext);

  // Permissions
  const canRead = hasPermission("hr.positions.read") || hasPermission("hr.positions.manage");
  const canManage = hasPermission("hr.positions.manage");

  if (!canRead) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">
          You do not have access to view positions.
        </p>
      </div>
    );
  }

  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    level: "Entry",
    departmentId: "",
    minSalary: 0,
    maxSalary: 0,
    isActive: true,
  });

  // Load positions & departments
  useEffect(() => {
    if (canRead) {
      loadPositions();
      loadDepartments();
    } else {
      setLoading(false);
    }
  }, [canRead]);

  const loadPositions = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getAllPositions();
      if (response.success) setPositions(response.data || []);
    } catch (error) {
      console.error("Error loading positions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await ApiService.getAllDepartments();
      if (response.success) setDepartments(response.data || []);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  // Modal handlers
  const handleCreate = () => {
    if (!canManage) return;

    setEditingPosition(null);
    setFormData({
      code: "",
      title: "",
      description: "",
      level: "Entry",
      departmentId: "",
      minSalary: 0,
      maxSalary: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (position) => {
    if (!canManage) return;

    setEditingPosition(position);
    setFormData({
      code: position.code,
      title: position.title,
      description: position.description || "",
      level: position.level,
      departmentId: position.departmentId || "",
      minSalary: position.minSalary || 0,
      maxSalary: position.maxSalary || 0,
      isActive: position.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return;

    try {
      let response;
      if (editingPosition) {
        response = await ApiService.updatePosition(editingPosition.id, formData);
      } else {
        response = await ApiService.createPosition(formData);
      }

      if (response.success) {
        alert(`Position ${editingPosition ? "updated" : "created"} successfully!`);
        setShowModal(false);
        loadPositions();
      } else {
        alert(`Failed to ${editingPosition ? "update" : "create"} position`);
      }
    } catch (error) {
      console.error("Error saving position:", error);
      alert("An error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!canManage) return;
    if (!window.confirm("Are you sure you want to delete this position?")) return;

    try {
      const response = await ApiService.deletePosition(id);
      if (response.success) {
        alert("Position deleted successfully");
        loadPositions();
      }
    } catch (error) {
      console.error("Error deleting position:", error);
      alert("Failed to delete position");
    }
  };

  const filteredPositions = positions.filter(
    (pos) =>
      pos.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const levelColors = {
    Entry: "bg-gray-100 text-gray-800",
    Junior: "bg-blue-100 text-blue-800",
    Mid: "bg-green-100 text-green-800",
    Senior: "bg-purple-100 text-purple-800",
    Lead: "bg-orange-100 text-orange-800",
    Manager: "bg-red-100 text-red-800",
    Director: "bg-pink-100 text-pink-800",
    Executive: "bg-indigo-100 text-indigo-800",
  };

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
            placeholder="Search positions..."
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
            Add Position
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{position.title}</div>
                      <div className="text-sm text-gray-500">{position.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.departmentName || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${levelColors[position.level] || levelColors.Entry}`}>
                      {position.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-1 text-sm text-gray-900">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span>{position.minSalary?.toLocaleString() || "0"} - {position.maxSalary?.toLocaleString() || "0"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${position.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {position.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(position)} className="text-blue-600 hover:text-blue-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(position.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPositions.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No positions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && canManage && (
    <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4
                bg-black/40 backdrop-blur-sm"
        >          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editingPosition ? "Edit Position" : "Create Position"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    {["Entry","Junior","Mid","Senior","Lead","Manager","Director","Executive"].map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Active</label>
                  <select
                    value={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Salary</label>
                  <input
                    type="number"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: parseFloat(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Salary</label>
                  <input
                    type="number"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: parseFloat(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingPosition ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionList;
