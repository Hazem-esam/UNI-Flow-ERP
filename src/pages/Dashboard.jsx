import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  TrendingUp,
  Users,
  Receipt,
  MessageSquare,
  Package,
  LayoutDashboard,
  BookUser,
  Check,
  Save,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

const availableModules = [
  {
    name: "Sales",
    key: "SALES",
    description: "Manage sales orders and invoices",
    price: 20,
    icon: TrendingUp,
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "HR",
    key: "HR",
    description: "Employee records, payroll, and attendance",
    price: 15,
    icon: Users,
    color: "from-purple-500 to-purple-600",
  },
  {
    name: "Expenses",
    key: "EXPENSES",
    description: "Track company expenses and budgets",
    price: 10,
    icon: Receipt,
    color: "from-red-500 to-red-600",
  },
  {
    name: "CRM",
    key: "CRM",
    description: "Customer relationship management",
    price: 25,
    icon: MessageSquare,
    color: "from-pink-500 to-pink-600",
  },
  {
    name: "Inventory",
    key: "INVENTORY",
    description: "Stock levels and warehouse management",
    price: 30,
    icon: Package,
    color: "from-orange-500 to-orange-600",
  },
  {
    name: "Dashboard",
    key: "DASHBOARD",
    description: "Analytics and insights overview",
    price: 10,
    icon: LayoutDashboard,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Contacts",
    key: "CONTACT",
    description: "Centralized contacts directory",
    price: 5,
    icon: BookUser,
    color: "from-indigo-500 to-indigo-600",
  },
];

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyModules, setCompanyModules] = useState([]);
  const [saving, setSaving] = useState(false);

  // Get company name from user context
  const companyName = user?.companyName || user?.fullName || "Your Company";

  // Fetch company modules from API
  useEffect(() => {
    const fetchCompanyModules = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/api/company-modules`, {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch company modules");
        }

        const data = await response.json();
        setCompanyModules(data);
      } catch (err) {
        console.error("Error fetching modules:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyModules();
  }, []);

  // Get currently enabled modules
  const selectedModules = companyModules
    .filter((mod) => mod.isEnabled)
    .map((mod) => {
      const moduleInfo = availableModules.find((m) => m.key === mod.moduleKey);
      return {
        moduleId: mod.moduleId,
        name: mod.moduleName,
        key: mod.moduleKey,
        price: moduleInfo?.price || 0,
      };
    });

  const handleToggle = async (module) => {
    const companyModule = companyModules.find(
      (m) => m.moduleKey === module.key,
    );
    if (!companyModule) return;

    const isCurrentlyEnabled = companyModule.isEnabled;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/company-modules/${companyModule.moduleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isEnabled: !isCurrentlyEnabled,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update module");
      }

      // Update local state
      setCompanyModules((prev) =>
        prev.map((m) =>
          m.moduleId === companyModule.moduleId
            ? { ...m, isEnabled: !isCurrentlyEnabled }
            : m,
        ),
      );

      // ⭐ IMPORTANT: Notify sidebar to refresh modules
      window.dispatchEvent(new Event("modulesUpdated"));
      localStorage.setItem("modulesLastUpdated", Date.now().toString());

      console.log(
        `Module ${module.name} ${!isCurrentlyEnabled ? "enabled" : "disabled"} - sidebar notified`,
      );
    } catch (err) {
      console.error("Error toggling module:", err);
      setError(err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalPrice = selectedModules.reduce(
    (sum, m) => sum + (m?.price || 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {companyName}
              </h1>
              <p className="text-gray-600">
                Select the modules you want to subscribe to
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <p className="text-green-700 font-medium">
              Modules saved successfully!
            </p>
          </div>
        )}

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {availableModules.map((mod) => {
            const Icon = mod.icon;
            const companyModule = companyModules.find(
              (m) => m.moduleKey === mod.key,
            );
            const isSelected = companyModule?.isEnabled || false;

            return (
              <div
                key={mod.key}
                onClick={() => handleToggle(mod)}
                className={`group relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                  isSelected
                    ? "border-blue-500 shadow-lg shadow-blue-100"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${mod.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {mod.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{mod.description}</p>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-2xl font-bold text-gray-900">
                    <DollarSign className="w-5 h-5" />
                    <span>{mod.price}</span>
                    <span className="text-sm font-normal text-gray-500">
                      /mo
                    </span>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isSelected ? "Selected" : "Available"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Summary Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Subscription Summary
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Selected Modules:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedModules.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-gray-900">Total Monthly Cost:</span>
                  <div className="flex items-center gap-1 text-blue-600">
                    <DollarSign className="w-5 h-5" />
                    <span>{totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

   
          </div>

          {/* Selected Modules List */}
          {selectedModules.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Selected Modules:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedModules.map((mod) => (
                  <div
                    key={mod.key}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{mod.name}</span>
                    <span className="text-blue-500">${mod.price}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
