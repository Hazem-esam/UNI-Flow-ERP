import { useState, useEffect } from "react";
import apiService from "../services/apiService";

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPos, setSelectedPos] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    level: 1,
    departmentId: "",
    minSalary: 0,
    maxSalary: 0,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [posRes, deptRes] = await Promise.all([
        apiService.getAllPositions(),
        apiService.getAllDepartments(),
      ]);

      if (posRes.success) setPositions(posRes.data || []);
      if (deptRes.success) setDepartments(deptRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log(positions);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Clean the form data by removing empty strings from optional fields
      const cleanedData = { ...formData };
      console.log(cleanedData);
      // List of optional fields that should be removed if empty
      const optionalFields = ["description", "departmentId"];

      // Remove optional fields if they are empty strings
      optionalFields.forEach((field) => {
        if (cleanedData[field] === "") {
          delete cleanedData[field];
        }
      });

      let result;
      if (selectedPos) {
        const updateData = { ...cleanedData };
        delete updateData.code;
        result = await apiService.updatePosition(selectedPos.id, updateData);
      } else {
        result = await apiService.createPosition(cleanedData);
      }

      if (result.success) {
        alert(selectedPos ? "Position updated!" : "Position created!");
        setShowModal(false);
        resetForm();
        loadData();
      } else {
        alert(result.error || "Operation failed");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this position?")) return;

    const result = await apiService.deletePosition(id);
    if (result.success) {
      alert("Position deleted!");
      loadData();
    } else {
      alert(result.error || "Failed to delete position");
    }
  };

  const handleEdit = (pos) => {
    setSelectedPos(pos);
    setFormData({
      code: pos.code || "",
      title: pos.title || "",
      description: pos.description || "",
      level: pos.level || 1,
      departmentId: pos.departmentId || "",
      minSalary: pos.minSalary || 0,
      maxSalary: pos.maxSalary || 0,
      isActive: pos.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedPos(null);
    setFormData({
      code: "",
      title: "",
      description: "",
      level: 1,
      departmentId: "",
      minSalary: 0,
      maxSalary: 0,
      isActive: true,
    });
  };

  const getLevelName = (level) => {
    const levels = {
      1: "Junior",
      2: "Mid",
      3: "Senior",
      4: "Lead",
      5: "Manager",
      6: "Director",
    };
    return levels[level] || "Unknown";
  };

  const getLevelColor = (level) => {
    const colors = {
      1: "bg-gray-100 text-gray-800",
      2: "bg-blue-100 text-blue-800",
      3: "bg-green-100 text-green-800",
      4: "bg-purple-100 text-purple-800",
      5: "bg-orange-100 text-orange-800",
      6: "bg-red-100 text-red-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Positions</h1>
          <p className="text-gray-600 mt-1">Manage organizational positions</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <span className="text-xl">➕</span>
          Add Position
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positions.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No positions found</p>
          </div>
        ) : (
          positions.map((pos) => (
            <div
              key={pos.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {pos.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{pos.code}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    pos.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {pos.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 min-h-[3rem]">
                {pos.description || "No description"}
              </p>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Level:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(pos.level)}`}
                  >
                    {pos.level}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Department:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {pos.departmentName || "Not assigned"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Salary Range:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {pos.minSalary.toLocaleString()} -{" "}
                    {pos.maxSalary.toLocaleString()} EGP
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => handleEdit(pos)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => handleDelete(pos.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedPos ? "Edit Position" : "Add Position"}
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!selectedPos && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: parseInt(e.target.value),
                    })
                  }
                >     
                  <option value={1}>Junior</option>
                  <option value={2}>Mid</option>
                  <option value={3}>Senior</option>
                  <option value={4}>Lead</option>
                  <option value={5}>Manager</option>
                  <option value={6}>Director</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Salary *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.minSalary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minSalary: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Salary *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.maxSalary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxSalary: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>
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
                  {selectedPos ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;
