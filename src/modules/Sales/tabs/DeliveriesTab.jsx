import {
  ChevronRight,
  Truck,
  DollarSign,
  Send,
  Ban,
  ChevronDown,
  Calendar,
  AlertCircle,
  Warehouse as WarehouseIcon,
  Package,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function DeliveriesTab({
  deliveries,
  invoices,
  warehouses,
  hasInventoryModule,
  onPost,
  onCancel,
  onDelete,
  canManage = false, // Permission prop
}) {
  const [expandedInvoices, setExpandedInvoices] = useState(new Set());
  const [groupByInvoice, setGroupByInvoice] = useState(true);

  // Group deliveries by invoice
  const groupedDeliveries = useMemo(() => {
    if (!groupByInvoice) {
      return deliveries.map((d) => ({
        invoiceId: d.salesInvoiceId,
        invoiceNumber: d.invoiceNumber,
        deliveries: [d],
      }));
    }

    const groups = {};

    deliveries.forEach((delivery) => {
      const key = delivery.salesInvoiceId || "no-invoice";

      if (!groups[key]) {
        const invoice = invoices.find((i) => i.id === delivery.salesInvoiceId);
        groups[key] = {
          invoiceId: delivery.salesInvoiceId,
          invoiceNumber:
            delivery.invoiceNumber ||
            invoice?.invoiceNumber ||
            `#${delivery.salesInvoiceId}`,
          customerName:
            invoice?.customerName ||
            delivery.customerName ||
            "Unknown Customer",
          invoiceAmount: invoice?.grandTotal || 0,
          deliveries: [],
        };
      }

      groups[key].deliveries.push(delivery);
    });

    return Object.values(groups).sort(
      (a, b) => (b.invoiceId || 0) - (a.invoiceId || 0),
    );
  }, [deliveries, invoices, groupByInvoice]);

  const toggleInvoice = (invoiceId) => {
    const newExpanded = new Set(expandedInvoices);
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId);
    } else {
      newExpanded.add(invoiceId);
    }
    setExpandedInvoices(newExpanded);
  };

  const toggleAll = () => {
    if (expandedInvoices.size === groupedDeliveries.length) {
      setExpandedInvoices(new Set());
    } else {
      setExpandedInvoices(new Set(groupedDeliveries.map((g) => g.invoiceId)));
    }
  };

  if (!hasInventoryModule) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Inventory Module Required</h3>
        <p className="text-gray-600">
          Enable the Inventory module to create and manage deliveries
        </p>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Deliveries Yet</h3>
        <p className="text-gray-600">
          Deliveries will appear here once you create them from invoices
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-xl p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={groupByInvoice}
              onChange={(e) => setGroupByInvoice(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Group by Invoice
            </span>
          </label>

          {groupByInvoice && (
            <button
              onClick={toggleAll}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {expandedInvoices.size === groupedDeliveries.length
                ? "Collapse All"
                : "Expand All"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-600">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-gray-600">Posted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Grouped Deliveries */}
      <div className="space-y-3">
        {groupedDeliveries.map((group) => (
          <DeliveryGroup
            key={group.invoiceId}
            group={group}
            expanded={expandedInvoices.has(group.invoiceId)}
            onToggle={() => toggleInvoice(group.invoiceId)}
            warehouses={warehouses}
            onPost={onPost}
            onCancel={onCancel}
            onDelete={onDelete}
            showGrouping={groupByInvoice}
            canManage={canManage}
          />
        ))}
      </div>
    </div>
  );
}

function DeliveryGroup({
  group,
  expanded,
  onToggle,
  warehouses,
  onPost,
  onCancel,
  onDelete,
  showGrouping,
  canManage,
}) {
  const totalDeliveries = group.deliveries.length;
  const draftCount = group.deliveries.filter(
    (d) => d.status?.toLowerCase() === "draft",
  ).length;
  const postedCount = group.deliveries.filter(
    (d) => d.status?.toLowerCase() === "posted",
  ).length;
  const cancelledCount = group.deliveries.filter(
    (d) => d.status?.toLowerCase() === "cancelled",
  ).length;

  // Calculate split amounts
  const deliveryAmounts = useMemo(() => {
    const invoiceAmount = group.invoiceAmount || 0;
    const postedDeliveries = group.deliveries.filter(
      (d) => d.status?.toLowerCase() === "posted",
    );

    if (postedDeliveries.length === 0) {
      return group.deliveries.map((d) => ({
        deliveryId: d.id,
        amount: 0,
        percentage: 0,
      }));
    }

    // Calculate based on quantity delivered
    const totalQuantities = {};
    postedDeliveries.forEach((delivery) => {
      delivery.lines?.forEach((line) => {
        const pid = line.productId;
        totalQuantities[pid] =
          (totalQuantities[pid] || 0) + (line.quantity || 0);
      });
    });

    return group.deliveries.map((delivery) => {
      let deliveryTotal = 0;

      delivery.lines?.forEach((line) => {
        const pid = line.productId;
        const deliveredQty = line.quantity || 0;
        const totalQty = totalQuantities[pid] || 1;
        const proportion = deliveredQty / totalQty;

        deliveryTotal += (invoiceAmount * proportion) / postedDeliveries.length;
      });

      return {
        deliveryId: delivery.id,
        amount: deliveryTotal,
        percentage:
          invoiceAmount > 0 ? (deliveryTotal / invoiceAmount) * 100 : 0,
      };
    });
  }, [group.deliveries, group.invoiceAmount]);

  if (!showGrouping) {
    // Show as individual row
    const delivery = group.deliveries[0];
    return (
      <DeliveryRow
        delivery={delivery}
        warehouse={{ name: delivery.warehouseName }}
        onPost={onPost}
        onCancel={onCancel}
        onDelete={onDelete}
        amount={deliveryAmounts[0]?.amount || 0}
        showInvoiceInfo={true}
        canManage={canManage}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Group Header */}
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button className="text-gray-400 hover:text-gray-600">
              {expanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-lg text-gray-900">
                  Invoice {group.invoiceNumber}
                </h3>
                <span className="text-sm text-gray-500">
                  {group.customerName}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  {totalDeliveries}{" "}
                  {totalDeliveries === 1 ? "Delivery" : "Deliveries"}
                </span>

                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />$
                  {(group.invoiceAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {draftCount > 0 && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  {draftCount} Draft
                </span>
              )}
              {postedCount > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {postedCount} Posted
                </span>
              )}
              {cancelledCount > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                  {cancelledCount} Cancelled
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Deliveries */}
      {expanded && (
        <div className="divide-y divide-gray-100">
          {group.deliveries.map((delivery) => {
            const amountInfo = deliveryAmounts.find(
              (a) => a.deliveryId === delivery.id,
            );
            return (
              <DeliveryRow
                key={delivery.id}
                delivery={delivery}
                warehouse={{ name: delivery.warehouseName }}
                onPost={onPost}
                onCancel={onCancel}
                onDelete={onDelete}
                amount={amountInfo?.amount || 0}
                percentage={amountInfo?.percentage || 0}
                showInvoiceInfo={false}
                isGrouped={true}
                canManage={canManage}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function DeliveryRow({
  delivery,
  warehouse,
  onPost,
  onCancel,
  onDelete,
  amount,
  percentage,
  showInvoiceInfo,
  isGrouped = false,
  canManage = false,
}) {
  const statusLower = (delivery.status || "").toLowerCase().trim();

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "posted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors ${
        isGrouped ? "pl-14" : "bg-white rounded-xl shadow-md"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Delivery Info */}
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                Delivery #{delivery.id}
              </span>
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(
                  statusLower,
                )}`}
              >
                {delivery.status || "Unknown"}
              </span>
            </div>
          </div>

          {showInvoiceInfo && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Invoice</span>
              <span className="font-medium text-gray-900">
                {delivery.invoiceNumber || `#${delivery.salesInvoiceId}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <WarehouseIcon className="w-4 h-4 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Warehouse</span>
              <span className="font-medium text-gray-900">
                {warehouse?.name || delivery.warehouseName || "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Date</span>
              <span className="font-medium text-gray-900">
                {new Date(delivery.deliveryDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {amount > 0 && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Amount</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">
                    ${amount.toFixed(2)}
                  </span>
                  {percentage > 0 && (
                    <span className="text-xs text-gray-500">
                      ({percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {delivery.lines && delivery.lines.length > 0 && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Items</span>
              <span className="font-medium text-gray-900">
                {delivery.lines.length} line
                {delivery.lines.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {statusLower === "draft" && canManage && (
            <>
              <button
                onClick={() => onPost(delivery.id)}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                title="Post Delivery"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm font-medium">Post</span>
              </button>

              <button
                onClick={() => onCancel(delivery.id)}
                className="px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2"
                title="Cancel Delivery"
              >
                <Ban className="w-4 h-4" />
                <span className="text-sm font-medium">Cancel</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`Delete Delivery #${delivery.id}?`)) {
                    onDelete(delivery.id);
                  }
                }}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                title="Delete Delivery"
              >
                <span className="text-sm font-medium">Delete</span>
              </button>
            </>
          )}

          {statusLower === "posted" && (
            <span className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-2 border border-amber-200">
              <AlertCircle className="w-4 h-4" />
              Posted – cannot modify
            </span>
          )}

          {statusLower === "cancelled" && (
            <span className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2 border border-gray-200">
              <Ban className="w-4 h-4" />
              Cancelled
            </span>
          )}
        </div>
      </div>

      {delivery.lines && delivery.lines.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-2 text-xs">
            {delivery.lines.slice(0, 3).map((line, idx) => (
              <div key={idx} className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">
                  {line.productName || `Product #${line.productId}`}
                </span>
                <span className="ml-2 font-medium text-gray-900">
                  × {line.quantity}
                </span>
              </div>
            ))}
            {delivery.lines.length > 3 && (
              <div className="bg-gray-50 p-2 rounded text-center text-gray-500">
                +{delivery.lines.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
