import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  Users,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  ClipboardCheck,
  UserPlus,
} from "lucide-react";

// HR Components
import EmployeeList from "./components/EmployeeList.jsx";
import EmployeeDetail from "./components/EmployeeDetail.jsx";
import CreateEmployee from "./components/CreateEmployee.jsx";
import DepartmentList from "./components/DepartmentList.jsx";
import PositionList from "./components/PositionList.jsx";
import LeaveManagement from "./components/LeaveManagement.jsx";
import HRDashboard from "./components/HRDashboard.jsx";

const HR = () => {
  const { hasPermission, hasAnyPermission } = useContext(AuthContext);

  // Permissions that allow access to any HR section
  const allowedPermissions = [
    "hr.dashboard.view",
    "hr.employees.read",
    "hr.employees.manage",
    "hr.departments.read",
    "hr.departments.manage",
    "hr.positions.read",
    "hr.positions.manage",
    "hr.attendance.read",
    "hr.attendance.manage",
    "hr.leaves.read",
    "hr.leaves.manage",
    "hr.payroll.read",
    "hr.payroll.manage",
  ];

  // Block users with no HR permissions
  if (!hasAnyPermission(allowedPermissions)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-500">
            You don’t have permission to access this content.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Required permission: hr.employees.manage (or another HR permission)
          </p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Navigation items with permissions
  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: ClipboardCheck,
      permission: "hr.dashboard.view",
      component: HRDashboard,
    },
    {
      id: "employees",
      label: "Employees",
      icon: Users,
      permissions: ["hr.employees.read", "hr.employees.manage"],
      component: EmployeeList,
    },
    {
      id: "departments",
      label: "Departments",
      icon: Building2,
      permissions: ["hr.departments.read", "hr.departments.manage"],
      component: DepartmentList,
    },
    {
      id: "positions",
      label: "Positions",
      icon: Briefcase,
      permissions: ["hr.positions.read", "hr.positions.manage"],
      component: PositionList,
    },

    {
      id: "leaves",
      label: "Leave Requests",
      icon: Calendar,
      permissions: ["hr.LeaveRequests.manage", "hr.LeaveRequests.read"],
      component: LeaveManagement,
    },
  ];

  // Show only tabs the user has permission for
  const visibleNavItems = navigationItems.filter((item) => {
    if (item.permission) return hasPermission(item.permission);
    if (item.permissions) return hasAnyPermission(item.permissions);
    return false;
  });

  const activeItem = navigationItems.find((item) => item.id === activeTab);
  const ActiveComponent = activeItem?.component;

  // Employee handlers
  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setActiveTab("employee-detail");
  };

  const handleBackToList = () => {
    setSelectedEmployeeId(null);
    setActiveTab("employees");
  };

  const handleCreateEmployee = () => {
    setActiveTab("create-employee");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  HR Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your workforce efficiently
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              {hasPermission("hr.employees.manage") && (
                <button
                  onClick={handleCreateEmployee}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Employee
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 overflow-x-auto">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === item.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "employee-detail" && selectedEmployeeId ? (
          <EmployeeDetail
            employeeId={selectedEmployeeId}
            onBack={handleBackToList}
          />
        ) : activeTab === "create-employee" ? (
          hasPermission("hr.employees.manage") ? (
            <CreateEmployee onBack={() => setActiveTab("employees")} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              You don’t have permission to create employees.
            </div>
          )
        ) : ActiveComponent ? (
          <ActiveComponent onEmployeeSelect={handleEmployeeSelect} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            You don't have permission to access this section.
          </div>
        )}
      </div>
    </div>
  );
};

export default HR;
