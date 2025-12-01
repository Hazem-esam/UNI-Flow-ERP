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

export default function DepartmentChart({ employees }) {
  const departmentData = employees.reduce((acc, emp) => {
    const found = acc.find((d) => d.name === emp.department);
    if (found) {
      found.count += 1;
    } else {
      acc.push({ name: emp.department, count: 1 });
    }
    return acc;
  }, []);

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
