import { AlertTriangle, TrendingUp, TrendingDown, Box } from "lucide-react";
import {
  ResponsiveContainer,
  Bar,
  Pie,
  Cell,
  BarChart,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function OverviewTab({
  totalProducts,
  totalValue,
  lowStockItems,
  outOfStock,
  stockLevelsData,
  categoryData,
  COLORS,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <Box className="w-10 h-10 text-blue-600 mb-4" />
          <p className="text-sm text-gray-600 mb-1">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <TrendingUp className="w-10 h-10 text-green-600 mb-4" />
          <p className="text-sm text-gray-600 mb-1">Total Value</p>
          <p className="text-3xl font-bold text-gray-900">
            ${totalValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <AlertTriangle className="w-10 h-10 text-yellow-600 mb-4" />
          <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
          <p className="text-3xl font-bold text-gray-900">{lowStockItems}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <TrendingDown className="w-10 h-10 text-red-600 mb-4" />
          <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
          <p className="text-3xl font-bold text-gray-900">{outOfStock}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Stock Levels</h3>
          {stockLevelsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockLevelsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#3b82f6" name="Current Stock" />
                <Bar dataKey="reorder" fill="#ef4444" name="Reorder Level" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">
              No stock data available
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Category Distribution
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">
              No category data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
