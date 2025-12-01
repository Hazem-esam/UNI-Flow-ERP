import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ExpensesCategories({ expenses }) {
  const totals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const data = Object.keys(totals).map((cat) => ({
    category: cat,
    amount: totals[cat],
  }));

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((d, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl shadow flex flex-col items-center"
          >
            <p className="text-lg font-semibold">{d.category}</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              ${d.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
