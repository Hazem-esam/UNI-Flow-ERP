import {
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Calendar,
} from "lucide-react";
export default function Alerts({ products, stock, salesInvoices, leads }) {
  const flatStock = stock.flat();

  const lowStock = flatStock
    .map((s) => {
      const p = products.find((p) => p.id === s.productId);
      if (!p) return null;

      return {
        productId: s.productId,
        productName: s.productName,
        quantityOnHand: s.quantityOnHand,
        minQuantity: p.minQuantity,
        isLowStock: s.quantityOnHand <= p.minQuantity,
      };
    })
    .filter((i) => i && i.isLowStock);

  const pendingOrders =
    salesInvoices?.filter((o) => o.status === 0)?.length || 0;
  const totalLeads = leads?.length || 0;
  const pipelineValue = leads?.reduce((s, l) => s + (l.dealValue || 0), 0) || 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Alerts & Notifications
      </h3>

      <div className="space-y-4">
        {lowStock.length > 0 && (
          <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Low Stock Alert</p>
              <p className="text-sm text-gray-600">
                {lowStock.length} products are below reorder level
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
      </div>
    </div>
  );
}
