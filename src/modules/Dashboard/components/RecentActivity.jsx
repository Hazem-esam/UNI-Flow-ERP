import { ShoppingCart, Receipt, Users } from "lucide-react";

export default function RecentActivity({ salesOrders, expenses, leads }) {
  const recent = [
    ...salesOrders.slice(0, 3).map((o) => ({
      type: "sale",
      description: `New order from ${o.customer}`,
      amount: o.amount,
      time: o.date,
    })),
    ...expenses.slice(0, 2).map((e) => ({
      type: "expense",
      description: e.description,
      amount: -e.amount,
      time: e.date,
    })),
    ...leads.slice(0, 2).map((l) => ({
      type: "lead",
      description: `New lead: ${l.name}`,
      amount: l.value,
      time: l.lastContact,
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>

      <div className="space-y-4">
        {recent.map((item, index) => (
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
              <p className="text-xs text-gray-500">{item.time}</p>
            </div>

            <div
              className={`font-bold ${
                item.amount > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.amount > 0 ? "+" : ""}$
              {Math.abs(item.amount).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
