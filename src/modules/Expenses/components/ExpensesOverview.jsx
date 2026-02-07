import { DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function ExpensesOverview({ expenses, stats }) {
  // Use stats from API if available, otherwise calculate from expenses
  const totalSpent =
    stats?.totalSpending || expenses.reduce((sum, e) => sum + e.amount, 0);
  const highestExpense =
    stats?.highestExpense ||
    (expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0);
  const lowestExpense =
    stats?.lowestExpense ||
    (expenses.length > 0 ? Math.min(...expenses.map((e) => e.amount)) : 0);
  const expenseCount = stats?.expenseCount || expenses.length;
  const averageExpense =
    stats?.averageExpense ||
    (expenses.length > 0 ? totalSpent / expenses.length : 0);

  // Prepare time series data for line chart
  const monthlyData = expenses
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((e) => ({
      date: e.date,
      amount: e.amount,
    }));

  // Calculate category totals for pie chart
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    "#ef4444", // red-500
    "#3b82f6", // blue-500
    "#10b981", // green-500
    "#f59e0b", // amber-500
    "#6366f1", // indigo-500
    "#14b8a6", // teal-500
    "#ec4899", // pink-500
    "#8b5cf6", // violet-500
  ];

  return (
    <>
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-10 h-10 text-red-600" />
            <span className="text-sm font-medium text-gray-500">Total</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            Total Spending
          </h2>
          <p className="text-3xl font-bold text-red-600 mt-2">
            $
            {totalSpent.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Receipt className="w-10 h-10 text-blue-600" />
            <span className="text-sm font-medium text-gray-500">Count</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            Total Expenses
          </h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {expenseCount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-10 h-10 text-green-600" />
            <span className="text-sm font-medium text-gray-500">Highest</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            Highest Expense
          </h2>
          <p className="text-3xl font-bold text-green-600 mt-2">
            $
            {highestExpense.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-10 h-10 text-orange-600" />
            <span className="text-sm font-medium text-gray-500">Average</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            Average Expense
          </h2>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            $
            {averageExpense.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-lg text-center">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No Expenses Yet
          </h3>
          <p className="text-gray-600">
            Start tracking your expenses by adding your first entry.
          </p>
        </div>
      ) : (
        <>
          {/* LINE CHART */}
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Spending Over Time
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Amount",
                    ]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART */}
          {categoryData.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Expenses by Category
              </h2>
              <div className="h-96">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                      labelLine={{ stroke: "#6b7280" }}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `$${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category breakdown list */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryData
                  .sort((a, b) => b.value - a.value)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {item.name}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          $
                          {item.value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
