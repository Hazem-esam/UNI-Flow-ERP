import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Calendar } from "lucide-react";

export default function FinancialOverview({ salesOrders, expenses }) {
  const totalRevenue = salesOrders.reduce((s, o) => s + o.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const data = [
    {
      month: "Jan",
      revenue: totalRevenue * 0.7,
      expenses: totalExpenses * 0.7,
    },
    {
      month: "Feb",
      revenue: totalRevenue * 0.75,
      expenses: totalExpenses * 0.75,
    },
    {
      month: "Mar",
      revenue: totalRevenue * 0.85,
      expenses: totalExpenses * 0.85,
    },
    {
      month: "Apr",
      revenue: totalRevenue * 0.9,
      expenses: totalExpenses * 0.9,
    },
    {
      month: "May",
      revenue: totalRevenue * 0.95,
      expenses: totalExpenses * 0.95,
    },
    { month: "Jun", revenue: totalRevenue, expenses: totalExpenses },
  ];

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Financial Overview</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Last 6 months</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            fill="url(#rev)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            fill="url(#exp)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
