import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import apiService from "../services/apiService";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    activeDepartments: 0,
    totalDepartments: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    todayAttendance: 0,
    totalPositions: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [employeesRes, departmentsRes, leavesRes, positionsRes] =
        await Promise.all([
          apiService.getAllEmployees(),
          apiService.getAllDepartments(),
          apiService.getAllLeaves(),
          apiService.getAllPositions(),
        ]);

      if (employeesRes.success) {
        const employees = employeesRes.data || [];
        const activeEmployees = employees.filter(
          (e) => e.status === "Active",
        ).length;

        setStats((prev) => ({
          ...prev,
          totalEmployees: employees.length,
          activeEmployees,
        }));

        // Calculate department breakdown
        const deptCounts = {};
        employees.forEach((emp) => {
          const deptName = emp.departmentName || "Unassigned";
          deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
        });

        const breakdown = Object.entries(deptCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setDepartmentBreakdown(breakdown);
      }

      if (departmentsRes.success) {
        const departments = departmentsRes.data || [];
        setStats((prev) => ({
          ...prev,
          activeDepartments: departments.filter((d) => d.isActive).length,
          totalDepartments: departments.length,
        }));
      }

      if (leavesRes.success) {
        const leaves = leavesRes.data || [];
        setStats((prev) => ({
          ...prev,
          pendingLeaves: leaves.filter((l) => l.status === "Pending").length,
          approvedLeaves: leaves.filter((l) => l.status === "Approved").length,
        }));

        // Generate upcoming events from approved leaves
        const now = new Date();
        const upcoming = leaves
          .filter((l) => l.status === "Approved" && new Date(l.startDate) > now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .slice(0, 5)
          .map((l) => ({
            title: `${l.employeeName} - ${l.leaveType}`,
            date: new Date(l.startDate).toLocaleDateString(),
            type: "leave",
          }));

        setUpcomingEvents(upcoming);
      }

      if (positionsRes.success) {
        setStats((prev) => ({
          ...prev,
          totalPositions: (positionsRes.data || []).length,
        }));
      }

      // Generate sample recent activities
      generateRecentActivities(employeesRes.data, leavesRes.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (employees, leaves) => {
    const activities = [];

    // Recent employee additions
    if (employees && employees.length > 0) {
      const recentEmployees = [...employees]
        .sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate))
        .slice(0, 3);

      recentEmployees.forEach((emp) => {
        activities.push({
          icon: "👤",
          text: `${emp.fullName} joined as ${emp.positionTitle}`,
          time: formatTimeAgo(new Date(emp.hireDate)),
          type: "employee",
        });
      });
    }

    // Recent leave requests
    if (leaves && leaves.length > 0) {
      const recentLeaves = [...leaves]
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.startDate) -
            new Date(a.createdAt || a.startDate),
        )
        .slice(0, 2);

      recentLeaves.forEach((leave) => {
        const statusEmoji =
          leave.status === "Approved"
            ? "✅"
            : leave.status === "Rejected"
              ? "❌"
              : "⏳";
        activities.push({
          icon: statusEmoji,
          text: `Leave request by ${leave.employeeName} - ${leave.status}`,
          time: formatTimeAgo(new Date(leave.createdAt || leave.startDate)),
          type: "leave",
        });
      });
    }

    setRecentActivities(activities.slice(0, 5));
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? "text-green-600" : "text-red-600"}`}
            >
              <span>{trend > 0 ? "↑" : "↓"}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`text-4xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const QuickAction = ({ title, icon, onClick, color = "blue" }) => (
    <button
      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-${color}-500 hover:bg-${color}-50 transition-all group`}
      onClick={onClick}
    >
      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
        {title}
      </span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={loadDashboardData}
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          subtitle={`${stats.activeEmployees} active`}
          icon="👥"
          color="text-blue-600"
        />
        <StatCard
          title="Departments"
          value={stats.activeDepartments}
          subtitle={`${stats.totalDepartments} total`}
          icon="🏢"
          color="text-green-600"
        />
        <StatCard
          title="Leave Requests"
          value={stats.pendingLeaves}
          subtitle={`${stats.approvedLeaves} approved`}
          icon="📋"
          color="text-orange-600"
        />
        <StatCard
          title="Job Positions"
          value={stats.totalPositions}
          subtitle="Active positions"
          icon="💼"
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction
              title="Check In"
              icon="▶️"
              onClick={() => alert("Check-in functionality")}
              color="green"
            />
            <QuickAction
              title="Check Out"
              icon="⏸️"
              onClick={() => alert("Check-out functionality")}
              color="red"
            />
            <QuickAction
              title="Request Leave"
              icon="🏖️"
              onClick={() => alert("Leave request functionality")}
              color="blue"
            />
            <QuickAction
              title="View Payroll"
              icon="💰"
              onClick={() => alert("Payroll functionality")}
              color="purple"
            />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Activities
          </h2>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No recent activities
              </p>
            ) : (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0">
                    {activity.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.text}
                    </p>
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Department Distribution
          </h2>
          <div className="space-y-3">
            {departmentBreakdown.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No department data
              </p>
            ) : (
              departmentBreakdown.map((dept, index) => {
                const percentage =
                  stats.totalEmployees > 0
                    ? ((dept.count / stats.totalEmployees) * 100).toFixed(1)
                    : 0;

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {dept.name}
                      </span>
                      <span className="text-gray-600">
                        {dept.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h2>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No upcoming events
              </p>
            ) : (
              upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200"
                >
                  <span className="text-2xl">📅</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {event.title}
                    </p>
                    <span className="text-xs text-gray-600">{event.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-black">
        <h2 className="text-xl font-bold mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm  mb-1 ">Company ID</p>
            <p className="font-mono font-semibold">
              {user?.companyId || "N/A"}
            </p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm  mb-1">Your Role</p>
            <p className="font-semibold">{user?.roles?.[0] || "Employee"}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm ">
            <p className="text-sm  mb-1">User ID</p>
            <p className="font-mono font-semibold truncate">
              {user?.userId || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
