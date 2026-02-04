import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Dashboard from "./components/Dashboard";
import Employees from "./components/Employees";
import Departments from "./components/Departments";
import Positions from "./components/Positions";
import Attendance from "./components/Attendance";
import LeaveManagement from "./components/LeaveManagement";
import Payroll from "./components/Payroll";
import CompanyUsers from "./components/CompanyUsers";

const HR = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      roles: ["all"],
    },
    {
      id: "employees",
      label: "Employees",
      icon: "👥",
      roles: ["CompanyOwner", "HRHead", "HRManager"],
    },
    {
      id: "departments",
      label: "Departments",
      icon: "🏢",
      roles: ["CompanyOwner", "HRHead", "HRManager"],
    },
    {
      id: "positions",
      label: "Positions",
      icon: "💼",
      roles: ["CompanyOwner", "HRHead", "HRManager"],
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: "⏰",
      roles: ["all"],
    },
    {
      id: "leaves",
      label: "Leaves",
      icon: "🏖️",
      roles: ["all"],
    },
    {
      id: "payroll",
      label: "Payroll",
      icon: "💰",
      roles: ["CompanyOwner", "HRHead", "HRManager"],
    },
    {
      id: "users",
      label: "Users",
      icon: "🔐",
      roles: ["CompanyOwner", "HRHead"],
    },
  ];

  const hasAccess = (item) => {
    if (item.roles.includes("all")) return true;
    return item.roles.some((role) => user?.roles?.includes(role));
  };

  const getUserInitials = () => {
    const email = user?.email || "";
    return email.substring(0, 2).toUpperCase();
  };

  const getUserRoleDisplay = () => {
    const roles = user?.roles || [];
    if (roles.includes("CompanyOwner")) return "Company Owner";
    if (roles.includes("HRHead")) return "HR Head";
    if (roles.includes("HRManager")) return "HR Manager";
    if (roles.includes("Employee")) return "Employee";
    return "User";
  };

  const renderContent = () => {
    const item = navigationItems.find((nav) => nav.id === activeTab);

    if (!item || !hasAccess(item)) {
      return <AccessDenied />;
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "employees":
        return <Employees />;
      case "departments":
        return <Departments />;
      case "positions":
        return <Positions />;
      case "attendance":
        return <Attendance />;
      case "leaves":
        return <LeaveManagement />;
      case "payroll":
        return <Payroll />;
      case "users":
        return <CompanyUsers />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col   bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {navigationItems
                .filter((item) => hasAccess(item))
                .map((item) => (
                  <button
                    key={item.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === item.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
            </div>

            {/* User Menu */}
            <div className="relative ml-4">
              <button
                className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full w-9 h-9 flex items-center justify-center font-semibold text-sm">
                  {getUserInitials()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {user?.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getUserRoleDisplay()}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                        {getUserInitials()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.email}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getUserRoleDisplay()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      onClick={() => {
                        setShowUserMenu(false);
                        // Add profile navigation if needed
                      }}
                    >
                      <span className="text-xl">👤</span>
                      <div>
                        <div className="font-medium">Profile Settings</div>
                        <div className="text-xs text-gray-500">
                          Manage your account
                        </div>
                      </div>
                    </button>
                    <button
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      onClick={() => {
                        setShowUserMenu(false);
                        if (logout) logout();
                      }}
                    >
                      <span className="text-xl">🚪</span>
                      <div>
                        <div className="font-medium">Logout</div>
                        <div className="text-xs text-red-400">
                          Sign out of your account
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Info Bar */}
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="font-medium">Module:</span>
                <span className="text-blue-600 font-semibold">
                  HR Management
                </span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Section:</span>
                <span>
                  {navigationItems.find((item) => item.id === activeTab)?.label}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-gray-300">•</span>
              <span>
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>

      {/* Close user menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

const AccessDenied = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <span className="text-6xl">🚫</span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h2>
      <p className="text-gray-600 mb-6">
        You don't have the necessary permissions to access this section. Please
        contact your administrator if you believe this is an error.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Need access?</strong> Contact your HR department or system
          administrator to request the appropriate permissions.
        </p>
      </div>
    </div>
  </div>
);

export default HR;
