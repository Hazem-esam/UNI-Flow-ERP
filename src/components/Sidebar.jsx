import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  TrendingUp,
  Users,
  Receipt,
  MessageSquare,
  Package,
  LayoutDashboard,
  BookUser,
  Menu,
  X,
  ChevronRight,
  Layers,
} from "lucide-react";

const moduleIcons = {
  Sales: TrendingUp,
  HR: Users,
  Expenses: Receipt,
  CRM: MessageSquare,
  Inventory: Package,
  Dashboard: LayoutDashboard,
  Contacts: BookUser,
};

const moduleColors = {
  Sales: "bg-green-500",
  HR: "bg-purple-500",
  Expenses: "bg-red-500",
  CRM: "bg-pink-500",
  Inventory: "bg-orange-500",
  Dashboard: "bg-blue-500",
  Contacts: "bg-indigo-500",
};

export default function Sidebar() {
  let subscribedModules = [];
  const navigate = useNavigate();
  try {
    subscribedModules = JSON.parse(localStorage.getItem("modules")) || [];
  } catch {
    subscribedModules = [];
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const hasModules = subscribedModules.length > 0;

  const handleModuleClick = (moduleName) => {
    setActiveModule(moduleName);
    setIsSidebarOpen(false);
    navigate(`modules/${moduleName}`);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-20 left-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen md:h-auto bg-white border-r border-gray-200 flex flex-col shadow-xl z-40
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 w-72 md:w-64`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Your Modules</h2>
              <p className="text-xs text-blue-100">
                {subscribedModules.length} active
              </p>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <nav className="flex-1 overflow-y-auto p-4">
          {hasModules ? (
            <ul className="space-y-2">
              {subscribedModules.map((mod, index) => {
                const moduleName = typeof mod === "string" ? mod : mod?.name;

                if (!moduleName) return null;

                const Icon = moduleIcons[moduleName] || Package;
                const colorClass = moduleColors[moduleName] || "bg-gray-500";
                const isActive = activeModule === moduleName;

                return (
                  <li key={index}>
                    <Link
                      to={`/modules/${moduleName.toLowerCase().trim()}`}
                      onClick={() => handleModuleClick(moduleName)}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? "shadow-md" : "group-hover:shadow-md"
                        } transition-shadow`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="flex-1 font-medium">{moduleName}</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive
                            ? "text-blue-700"
                            : "text-gray-400 group-hover:text-blue-600"
                        } ${isActive || "group-hover:translate-x-1"}`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                No Modules Yet
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Subscribe to modules to get started
              </p>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                Browse Modules
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        {hasModules && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Layers className="w-4 h-4" />
              Manage Modules
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
