import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import ApiService from "../services/apiService";
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const HRDashboard = () => {
  const { hasPermission } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeDepartments: 0,
    pendingLeaves: 0,
    monthlyPayroll: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const newStats = { ...stats };

      if (hasPermission("hr.employees.read")) {
        const res = await ApiService.getAllEmployees();
        if (res.success) newStats.totalEmployees = res.data?.length || 0;
      }

      if (hasPermission("hr.departments.read")) {
        const res = await ApiService.getAllDepartments();
        if (res.success)
          newStats.activeDepartments =
            res.data?.filter((d) => d.isActive)?.length || 0;
      }

      if (hasPermission("hr.leaves.read")) {
        const res = await ApiService.getPendingLeaves();
        if (res.success) newStats.pendingLeaves = res.data?.length || 0;
      }

      if (hasPermission("hr.payrolls.read")) {
        const now = new Date();
        const res = await ApiService.getPayrollSummary(
          now.getMonth() + 1,
          now.getFullYear()
        );
        if (res.success) newStats.monthlyPayroll = res.data?.totalNetPay || 0;
      }

      setStats(newStats);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "blue",
      permission: "hr.employees.read",
    },
    {
      title: "Active Departments",
      value: stats.activeDepartments,
      icon: Building2,
      color: "green",
      permission: "hr.departments.read",
    },
    {
      title: "Pending Leaves",
      value: stats.pendingLeaves,
      icon: Calendar,
      color: "yellow",
      permission: "hr.leaves.read",
    },
    {
      title: "Monthly Payroll",
      value: `$${stats.monthlyPayroll.toLocaleString()}`,
      icon: DollarSign,
      color: "purple",
      permission: "hr.payrolls.read",
    },
  ];

  const colorVariants = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
    green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-100" },
    yellow: { bg: "bg-yellow-50", icon: "text-yellow-600", border: "border-yellow-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to HR Dashboard</h2>
        <p className="text-blue-100">Monitor and manage your workforce at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          if (!hasPermission(stat.permission)) return null;
          const Icon = stat.icon;
          const colors = colorVariants[stat.color];
          return (
            <div
              key={stat.title}
              className={`${colors.bg} ${colors.border} border rounded-xl p-6 transition-all hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${colors.bg} rounded-lg ring-2 ring-white`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {hasPermission("hr.employees.manage") && (
              <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Add New Employee</span>
              </button>
            )}
            {hasPermission("hr.payrolls.manage") && (
              <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Generate Payroll</span>
              </button>
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        {hasPermission("hr.leaves.read") && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h3>
            <div className="space-y-3">
              {stats.pendingLeaves > 0 ? (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {stats.pendingLeaves} Leave Request{stats.pendingLeaves !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-gray-500">Awaiting your review</p>
                  </div>
                  {hasPermission("hr.leaves.manage") && (
                    <button className="text-sm font-medium text-yellow-600 hover:text-yellow-700">
                      Review
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <p className="text-sm text-gray-500">No pending approvals</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;
