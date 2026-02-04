import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUp,
  AlertTriangle,
} from "lucide-react";

export default function KPICards({
  salesInvoices,
  expenses,
  employees,
  products,
  stock,
  invoice,
}) {
  // Calculate total revenue from invoices
  console.log(salesInvoices);
  console.log(products);
  console.log(stock);
  console.log(expenses);
  console.log(invoice);

  // Paid revenue from invoices after discount
  const Revenue = invoice
    .filter((inv) => inv.paymentStatus === "Paid")
    .reduce((sum, inv) => sum + (inv.subTotal - inv.discountAmount), 0);
  // Total paid expenses
  const paidExpenses = expenses.items
    .filter((exp) => exp.status === "Paid")
    .reduce((sum, exp) => sum + exp.amount, 0);
  // Net revenue
  const netProfit = Revenue - paidExpenses;
  console.log("totalRevenue:", netProfit);

  const totalOrders = salesInvoices?.length || 0;
  const completed =
    salesInvoices?.filter(
      (o) => o.status === "FullyDelivered" && o.paymentStatus === "Paid",
    )?.length || 0; // Posted
  const pending =
    salesInvoices?.filter((o) => o.status === "PartiallyDelivered")?.length ||
    0; // Draft

  const activeEmployees =
    employees?.filter((e) => e.status === "Active")?.length || 0;
  const totalEmployees = employees?.length || 0;

  // Calculate inventory value and low stock
  const inventoryValue = stock.flat().reduce((sum, s) => sum + s.totalValue, 0);
  console.log(inventoryValue);
  const lowStock =
    products?.filter((p) => (p.currentStock || 0) <= (p.minQuantity || 0))
      ?.length || 0;
  const totalProducts = products?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Revenue */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="w-10 h-10 opacity-80" />
          <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
            <ArrowUp className="w-4 h-4" />
            <span>{((netProfit / Revenue) * 100).toFixed(2)} %</span>
          </div>
        </div>
        <p className="text-green-100 text-sm mb-1">Total Revenue</p>
        <p className="text-3xl font-bold mb-1">
          $
          {Revenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-green-100 text-xs">
          -${paidExpenses.toFixed(0)} Expenses
        </p>
      </div>

      {/* Orders */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between mb-4">
          <ShoppingCart className="w-10 h-10 opacity-80" />
          <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
            <ArrowUp className="w-4 h-4" />
            <span>{(completed / (pending + completed)) * 100} %</span>
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
        <p className="text-purple-100 text-xs">Out of {totalEmployees} total</p>
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
          ${(inventoryValue / 1000).toFixed(3)}K
        </p>
        <p className="text-orange-100 text-xs">
          {totalProducts} products in stock
        </p>
      </div>
    </div>
  );
}
