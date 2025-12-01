import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function SalesStatusChart({ salesOrders }) {
  const completed = salesOrders.filter((o) => o.status === "completed").length;
  const pending = salesOrders.filter((o) => o.status === "pending").length;
  const cancelled = salesOrders.filter((o) => o.status === "cancelled").length;

  const data = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
    { name: "Cancelled", value: cancelled },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Sales Status Distribution
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
