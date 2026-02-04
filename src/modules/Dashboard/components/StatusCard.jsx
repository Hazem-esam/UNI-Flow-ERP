import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function SalesStatusChart({ salesInvoices }) {
  const draft = salesInvoices?.filter((o) => o.status === "Draft")?.length || 0;
  const completed =
    salesInvoices?.filter(
      (o) => o.status === "FullyDelivered" && o.paymentStatus === "Paid",
    )?.length || 0;
  const partiallyDelivered =
    salesInvoices?.filter((o) => o.status === "PartiallyDelivered")?.length ||
    0;
  const posted =
    salesInvoices?.filter((o) => o.status === "Posted")?.length || 0;
  const cancelled =
    salesInvoices?.filter((o) => o.status === "Cancelled")?.length || 0;

  const data = [
    { name: "Completed", value: completed, color: "#10b981" },
    { name: "Posted", value: posted, color: "#3b82f6" },
    {
      name: "Partially Delivered",
      value: partiallyDelivered,
      color: "#f59e0b",
    },
    { name: "Draft", value: draft, color: "#94a3b8" },
    { name: "Cancelled", value: cancelled, color: "#ef4444" },
  ].filter((item) => item.value > 0); // Only show categories with data

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} invoices ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Sales Status Distribution
        </h3>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{total}</span>{" "}
          invoices
        </div>
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="font-medium">No invoices found</p>
            <p className="text-sm">
              Create your first invoice to see statistics
            </p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={110}
                innerRadius={60}
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
