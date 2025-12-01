import {
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function Alerts({ inventory, salesOrders, leads }) {
  const lowStock = inventory.filter((p) => p.quantity <= p.reorderLevel).length;
  const pendingOrders = salesOrders.filter(
    (o) => o.status === "pending"
  ).length;
  const totalLeads = leads.length;
  const pipelineValue = leads.reduce((s, l) => s + l.value, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Alerts & Notifications
      </h3>

      <div className="space-y-4">
        {lowStock > 0 && (
          <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Low Stock Alert</p>
              <p className="text-sm text-gray-600">
                {lowStock} products are below reorder level
              </p>
            </div>
          </div>
        )}

        {pendingOrders > 0 && (
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <ShoppingCart className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Pending Orders</p>
              <p className="text-sm text-gray-600">
                {pendingOrders} orders awaiting fulfillment
              </p>
            </div>
          </div>
        )}

        {totalLeads > 0 && (
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Active Leads</p>
              <p className="text-sm text-gray-600">
                {totalLeads} leads worth ${(pipelineValue / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">Monthly Review</p>
            <p className="text-sm text-gray-600">
              Team meeting scheduled for next Monday
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
