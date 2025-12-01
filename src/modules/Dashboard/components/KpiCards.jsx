import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUp,
  AlertTriangle,
} from "lucide-react";

export default function KPICards({
  salesOrders,
  expenses,
  employees,
  inventory,
}) {
  const totalRevenue = salesOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalOrders = salesOrders.length;
  const completed = salesOrders.filter((o) => o.status === "completed").length;
  const pending = salesOrders.filter((o) => o.status === "pending").length;

  const activeEmployees = employees.filter((e) => e.status === "active").length;

  const lowStock = inventory.filter((p) => p.quantity <= p.reorderLevel).length;
  const inventoryValue = inventory.reduce(
    (s, p) => s + p.quantity * p.price,
    0
  );
  const totalProducts = inventory.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Revenue */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="w-10 h-10 opacity-80" />
          <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
            <ArrowUp className="w-4 h-4" />
            <span>12.5%</span>
          </div>
        </div>
        <p className="text-green-100 text-sm mb-1">Total Revenue</p>
        <p className="text-3xl font-bold mb-1">
          ${totalRevenue.toLocaleString()}
        </p>
        <p className="text-green-100 text-xs">
          +${(totalRevenue * 0.125).toFixed(0)} from last month
        </p>
      </div>

      {/* Orders */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <ShoppingCart className="w-10 h-10 opacity-80" />
          <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
            <ArrowUp className="w-4 h-4" />
            <span>8.2%</span>
          </div>
        </div>
        <p className="text-blue-100 text-sm mb-1">Total Orders</p>
        <p className="text-3xl font-bold mb-1">{totalOrders}</p>
        <p className="text-blue-100 text-xs">
          {completed} completed, {pending} pending
        </p>
      </div>

      {/* Employees */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <Users className="w-10 h-10 opacity-80" />
          <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
            <ArrowUp className="w-4 h-4" />
            <span>5.1%</span>
          </div>
        </div>
        <p className="text-purple-100 text-sm mb-1">Active Employees</p>
        <p className="text-3xl font-bold mb-1">{activeEmployees}</p>
        <p className="text-purple-100 text-xs">
          Out of {employees.length} total
        </p>
      </div>

      {/* Inventory */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <Package className="w-10 h-10 opacity-80" />
          {lowStock > 0 ? (
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
              <AlertTriangle className="w-4 h-4" />
              <span>{lowStock}</span>
            </div>
          ) : (
            <div className="text-sm bg-white/20 px-2 py-1 rounded-full">
              ✓ OK
            </div>
          )}
        </div>
        <p className="text-orange-100 text-sm mb-1">Inventory Value</p>
        <p className="text-3xl font-bold mb-1">
          ${(inventoryValue / 1000).toFixed(0)}K
        </p>
        <p className="text-orange-100 text-xs">
          {totalProducts} products in stock
        </p>
      </div>
    </div>
  );
}
