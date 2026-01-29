import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
  Sparkles,
  Zap,
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
  Sales: "from-green-500 to-emerald-600",
  HR: "from-purple-500 to-violet-600",
  Expenses: "from-red-500 to-rose-600",
  CRM: "from-pink-500 to-fuchsia-600",
  Inventory: "from-orange-500 to-amber-600",
  Dashboard: "from-blue-500 to-indigo-600",
  Contacts: "from-indigo-500 to-purple-600",
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [subscribedModules, setSubscribedModules] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load modules on mount
  useEffect(() => {
    try {
      const modules = JSON.parse(localStorage.getItem("modules")) || [];
      setSubscribedModules(modules);
    } catch (error) {
      console.error("Failed to load modules:", error);
      setSubscribedModules([]);
    }
  }, []);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  const hasModules = subscribedModules.length > 0;

  const handleModuleClick = (moduleName) => {
    setIsSidebarOpen(false);
    navigate(`/modules/${moduleName.toLowerCase().trim()}`);
  };

  // Check if module is active
  const isModuleActive = (moduleName) => {
    return location.pathname.includes(
      `/modules/${moduleName.toLowerCase().trim()}`
    );
  };

  return (
    <>
      {/* Mobile Toggle Button - FIXED: Better positioning, not covering content */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`md:hidden fixed top-20 left-4 z-50 p-3.5 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-300 hover:scale-110 ${
          isSidebarOpen ? "rotate-180 scale-110" : "rotate-0"
        }`}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isSidebarOpen}
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Overlay for mobile - Enhanced blur */}
      {isSidebarOpen && (
        <div
          className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-300 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - FIXED: Proper positioning below navbar on mobile */}
      <aside
        className={`
          fixed md:static 
          top-16 md:top-0 
          left-0 
          h-[calc(100vh-4rem)] md:h-auto 
          bg-white/95 md:bg-white 
          backdrop-blur-2xl 
          border-r border-gray-200/50 
          flex flex-col 
          shadow-2xl md:shadow-none 
          z-40
          transform transition-all duration-300 ease-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 
          w-80 md:w-72 lg:w-80
        `}
        aria-label="Sidebar navigation"
      >
        {/* Header - Gradient Style */}
        <div className="relative p-6 md:p-8 border-b border-gray-200/50 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex-shrink-0 overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
          </div>

          <div className="relative flex items-center gap-4 text-white">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-xl shadow-black/20">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Your Modules</h2>
              <p className="text-sm text-blue-100 font-medium">
                {subscribedModules.length} active module
                {subscribedModules.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Modules List - Modern Cards with custom scrollbar */}
        <nav className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
          {hasModules ? (
            <ul className="space-y-2" role="list">
              {subscribedModules.map((mod, index) => {
                const moduleName = typeof mod === "string" ? mod : mod?.name;

                if (!moduleName) return null;

                const Icon = moduleIcons[moduleName] || Package;
                const gradientClass = moduleColors[moduleName] || "from-gray-500 to-gray-600";
                const isActive = isModuleActive(moduleName);

                return (
                  <li key={index}>
                    <Link
                      to={`/modules/${moduleName.toLowerCase().trim()}`}
                      onClick={() => handleModuleClick(moduleName)}
                      className={`group relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20 scale-[1.02]"
                          : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 hover:scale-[1.01]"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full" />
                      )}

                      {/* Icon with gradient background */}
                      <div
                        className={`relative w-12 h-12 bg-gradient-to-br ${gradientClass} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 ${
                          isActive
                            ? "shadow-blue-500/50 scale-110"
                            : "group-hover:scale-110 group-hover:shadow-xl"
                        }`}
                      >
                        <Icon className="w-6 h-6 text-white relative z-10" aria-hidden="true" />
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Module name and arrow */}
                      <div className="flex-1 flex items-center justify-between">
                        <span
                          className={`font-semibold text-base transition-colors duration-300 ${
                            isActive ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"
                          }`}
                        >
                          {moduleName}
                        </span>
                        <ChevronRight
                          className={`w-5 h-5 transition-all duration-300 ${
                            isActive
                              ? "text-blue-600 translate-x-1"
                              : "text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1"
                          }`}
                          aria-hidden="true"
                        />
                      </div>

                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl opacity-10 animate-pulse" />
                <div className="absolute inset-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No Modules Yet
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-xs">
                Get started by subscribing to modules and unlock powerful features
              </p>
              <Link
                to="/dashboard"
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Browse Modules
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          )}
        </nav>

        {/* Footer - Modern Button */}
        {hasModules && (
          <div className="p-4 md:p-6 border-t border-gray-200/50 bg-gradient-to-br from-gray-50 to-white flex-shrink-0">
            <Link
              to="/dashboard"
              className="group relative flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Zap className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Manage Modules</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}