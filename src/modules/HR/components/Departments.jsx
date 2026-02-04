import { useState, useEffect } from "react";
import apiService from "../services/apiService";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    managerId: "",
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        apiService.getAllDepartments(),
        apiService.getAllEmployees(),
      ]);

      if (deptRes.success) setDepartments(deptRes.data || []);
      if (empRes.success) setEmployees(empRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Clean the form data by removing empty strings from optional fields
      const cleanedData = { ...formData };
      
      // List of optional fields that should be removed if empty
      const optionalFields = ['description', 'managerId'];
      
      // Remove optional fields if they are empty strings
      optionalFields.forEach(field => {
        if (cleanedData[field] === '') {
          delete cleanedData[field];
        }
      });

      let result;
      if (selectedDept) {
        const updateData = { ...cleanedData };
        delete updateData.code; // Can't update code
        result = await apiService.updateDepartment(selectedDept.id, updateData);
      } else {
        result = await apiService.createDepartment(cleanedData);
      }

      if (result.success) {
        alert(selectedDept ? "Department updated!" : "Department created!");
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
    const dept = departments.find(d => d.id === id);
    const hasEmployees = dept?.employeeCount > 0;
    
    const confirmMessage = hasEmployees 
      ? `This department has ${dept.employeeCount} employee(s). All associated positions will be deleted. Are you sure you want to delete this department?`
      : "All associated positions will be deleted. Are you sure you want to delete this department?";
    
    if (!confirm(confirmMessage)) return;

    try {
      // First, get all positions
      const positionsRes = await apiService.getAllPositions();
      
      if (positionsRes.success) {
        const positions = positionsRes.data || [];
        // Filter positions that belong to this department
        const departmentPositions = positions.filter(pos => pos.departmentId === id);
        
        // Delete all positions in this department
        if (departmentPositions.length > 0) {
          const deletePromises = departmentPositions.map(pos => 
            apiService.deletePosition(pos.id)
          );
          
          const results = await Promise.all(deletePromises);
          const failedDeletes = results.filter(r => !r.success);
          
          if (failedDeletes.length > 0) {
            alert(`Warning: ${failedDeletes.length} position(s) could not be deleted. Department deletion cancelled.`);
            return;
          }
        }
      }

      // Now delete the department
      const result = await apiService.deleteDepartment(id);
      if (result.success) {
        alert("Department and all associated positions deleted successfully!");
        loadData();
      } else {
        alert(result.error || "Failed to delete department");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleEdit = (dept) => {
    setSelectedDept(dept);
    setFormData({
      code: dept.code || "",
      name: dept.name || "",
      description: dept.description || "",
      managerId: dept.managerId || "",
      isActive: dept.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedDept(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      managerId: "",
      isActive: true,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage organizational structure</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <span className="text-xl">➕</span>
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No departments found</p>
          </div>
        ) : (
          departments.map(dept => (
            <div key={dept.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{dept.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{dept.code}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  dept.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {dept.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 min-h-[3rem]">
                {dept.description || "No description"}
              </p>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Employees:</span>
                  <span className="text-sm font-semibold text-gray-900">{dept.employeeCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Manager:</span>
                  <span className="text-sm font-semibold text-gray-900">{dept.managerName || "Not assigned"}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => handleEdit(dept)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => handleDelete(dept.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDept ? "Edit Department" : "Add Department"}
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!selectedDept && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.managerId}
                  onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                >
                  <option value="">Select Manager</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
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
                  {selectedDept ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;