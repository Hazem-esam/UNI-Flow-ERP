import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function DepartmentChart({ departments }) {
  console.log(departments);
  const departmentData =
    departments?.map((dept) => ({
      name: dept.name || "Unknown",
      count: dept.employeeCount || 0,
    })) || [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Department Overview
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={departmentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#3b82f6" name="Employees" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
