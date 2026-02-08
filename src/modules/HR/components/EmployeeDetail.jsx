import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import ApiService from "../services/ApiService.js";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  FileText,
  Edit,
  Download,
} from "lucide-react";

const EmployeeDetail = ({ employeeId, onBack }) => {
  const { hasPermission } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (employeeId && hasPermission("hr.employees.read")) {
      loadEmployeeDetails();
    } else {
      setLoading(false); // stop spinner if no permission
    }
  }, [employeeId, hasPermission]);

  const loadEmployeeDetails = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getEmployeeById(employeeId);
      if (response.success) {
        setEmployee(response.data);
      }
    } catch (error) {
      console.error("Error loading employee details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Employee not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "employment", label: "Employment Info" },
    { id: "documents", label: "Documents" },
  ];

  const canViewSalary = hasPermission("hr.employees.salary.view");
  const canManageEmployee = hasPermission("hr.employees.manage");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </button>

        {canManageEmployee && (
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit className="w-4 h-4 mr-2" />
            Edit Employee
          </button>
        )}
      </div>

      {/* Employee Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-3xl">
                {employee.firstName?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          </div>

          {/* Employee Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {employee.employeeCode || "N/A"}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  employee.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {employee.status || "N/A"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{employee.email || "N/A"}</span>
              </div>
              {employee.phoneNumber && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phoneNumber}</span>
                </div>
              )}
              {employee.department && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{employee.department.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h3>
                  <p>
                    <span className="font-medium text-gray-500">Full Name: </span>
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Date of Birth: </span>
                    {employee.dateOfBirth
                      ? new Date(employee.dateOfBirth).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Gender: </span>
                    {employee.gender || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Nationality: </span>
                    {employee.nationality || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Marital Status: </span>
                    {employee.maritalStatus || "N/A"}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h3>
                  <p>
                    <span className="font-medium text-gray-500">Email: </span>
                    {employee.email || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Phone: </span>
                    {employee.phoneNumber || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Address: </span>
                    {employee.currentAddress
                      ? `${employee.currentAddress.city}, ${employee.currentAddress.country}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "employment" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Employment Details
                  </h3>
                  <p>
                    <span className="font-medium text-gray-500">Department: </span>
                    {employee.department?.name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Position: </span>
                    {employee.position?.title || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Hire Date: </span>
                    {employee.hireDate
                      ? new Date(employee.hireDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Reports To: </span>
                    {employee.reportsTo?.fullName || "N/A"}
                  </p>
                </div>

                {canViewSalary && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Compensation
                    </h3>
                    <p>
                      <span className="font-medium text-gray-500">Salary: </span>
                      {employee.currency || "$"} {employee.salary || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-500">Bank Account: </span>
                      {employee.bankAccountNumber || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-500">Bank Name: </span>
                      {employee.bankName || "N/A"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                {canManageEmployee && (
                  <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                    <FileText className="w-4 h-4 mr-2" />
                    Upload Document
                  </button>
                )}
              </div>

              {employee.documents && employee.documents.length > 0 ? (
                <div className="space-y-2">
                  {employee.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {doc.documentName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.documentType} •{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No documents uploaded</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
