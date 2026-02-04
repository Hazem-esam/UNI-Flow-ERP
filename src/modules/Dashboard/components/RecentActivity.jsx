import { ShoppingCart, Receipt, Users } from "lucide-react";

export default function RecentActivity({ salesInvoices, expenses, leads }) {
  const recent = [];
console.log(salesInvoices)
  // Add recent sales
  const recentSales = (salesInvoices || []).slice(0, 3).map((invoice) => ({
    type: "sale",
    description: `Invoice #${invoice.id} - Customer #${invoice.customerName}`,
    amount: invoice.grandTotal || 0,
    time: invoice.invoiceDate || new Date().toISOString(),
  }));

  recent.push(...recentSales);

  // Add recent expenses
  const expenseList = expenses?.items || expenses || [];
  const recentExpenses = expenseList.slice(0, 2).map((e) => ({
    type: "expense",
    description: e.description || "Expense",
    amount: -(e.amount || 0),
    time: e.expenseDate || new Date().toISOString(),
  }));

  recent.push(...recentExpenses);

  // Add recent leads
  const recentLeads = (leads || []).slice(0, 2).map((l) => ({
    type: "lead",
    description: `New lead: ${l.name}`,
    amount: l.dealValue || 0,
    time: l.lastContactDate || new Date().toISOString(),
  }));

  recent.push(...recentLeads);

  // Sort by time
  recent.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Take top 5
  const topRecent = recent.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>

      <div className="space-y-4">
        {topRecent.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          topRecent.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.type === "sale"
                    ? "bg-green-100 text-green-600"
                    : item.type === "expense"
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {item.type === "sale" ? (
                  <ShoppingCart className="w-5 h-5" />
                ) : item.type === "expense" ? (
                  <Receipt className="w-5 h-5" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {item.description}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(item.time).toLocaleDateString()}
                </p>
              </div>

              <div
                className={`font-bold ${
                  item.amount > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.amount > 0 ? "+" : ""}$
                {Math.abs(item.amount).toLocaleString(undefined, { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}