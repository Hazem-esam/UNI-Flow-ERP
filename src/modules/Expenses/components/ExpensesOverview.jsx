import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
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

export default function ExpensesOverview({ expenses }) {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyData = expenses.map((e) => ({
    date: e.date,
    amount: e.amount,
  }));

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <>
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <DollarSign className="w-10 h-10 text-green-600 mb-2" />
          <h2 className="text-xl font-semibold">Total Spending</h2>
          <p className="text-3xl font-bold mt-2">
            ${totalSpent.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <TrendingUp className="w-10 h-10 text-blue-600 mb-2" />
          <h2 className="text-xl font-semibold">Highest Expense</h2>
          <p className="text-3xl font-bold mt-2">
            ${Math.max(...expenses.map((e) => e.amount)).toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <TrendingDown className="w-10 h-10 text-red-600 mb-2" />
          <h2 className="text-xl font-semibold">Lowest Expense</h2>
          <p className="text-3xl font-bold mt-2">
            ${Math.min(...expenses.map((e) => e.amount)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Spending Over Time</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#ef4444"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PIE CHART */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
        <div className="h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {categoryData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      [
                        "#ef4444",
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#6366f1",
                        "#14b8a6",
                      ][i % 6]
                    }
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
