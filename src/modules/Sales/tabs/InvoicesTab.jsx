import {
  Search,
  Plus,
  FileText,
  Send,
  Edit,
  Trash2,
  Truck,
  CreditCard,
  CheckCircle,
  Ban,
  Eye,
} from "lucide-react";

export default function InvoicesTab({
  invoices,
  searchQuery,
  setSearchQuery,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onPost,
  onCancel,
  onCreateDelivery,
  onCreateReceipt,
  hasInventoryModule,
  deliveries,
  receipts,
  canDraft = false, // Can create/edit/delete/cancel drafts
  canPost = false,  // Can post invoices
}) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-700";
      case "Posted":
      case "Open":
        return "bg-blue-100 text-blue-700";
      case "Delivered":
        return "bg-purple-100 text-purple-700";
      case "Paid":
        return "bg-indigo-100 text-indigo-700";
      case "Completed":
        return "bg-green-100 text-green-700 font-semibold";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusInfo = (status) => {
    const displayStatus = getDisplayStatus({ status });
    const icons = {
      Draft: FileText,
      Posted: Send,
      Delivered: Truck,
      Paid: CreditCard,
      Completed: CheckCircle,
      Cancelled: Ban,
    };

    return {
      label: displayStatus,
      color: getStatusStyle(displayStatus),
      icon: icons[displayStatus] || FileText,
    };
  };

  const getDisplayStatus = (inv) => {
    if (inv.status === "Cancelled" || inv.status === "Completed") {
      return inv.status;
    }

    const hasDelivery = deliveries?.some((d) => d.salesInvoiceId === inv.id);
    const hasReceipt = receipts?.some((r) =>
      r.allocations?.some((a) => a.salesInvoiceId === inv.id)
    );

    const isFullyDelivered =
      inv.lines?.every((line) => (line.remainingQuantity || 0) <= 0) ?? false;

    const balanceDue = parseFloat(inv.balanceDue || 0);
    const grandTotal = parseFloat(inv.grandTotal || 0);
    const isFullyPaid = balanceDue <= 0 || (inv.totalPaid || 0) >= grandTotal;

    if (isFullyDelivered && isFullyPaid) {
      return "Completed";
    }
    if (isFullyDelivered) {
      return "Delivered";
    }
    if (isFullyPaid) {
      return "Paid";
    }

    return inv.status || "Draft";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-md flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        {canDraft && (
          <button
            onClick={onAdd}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Invoice #
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Balance Due
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No invoices found.
                  {canDraft && ' Click "New Invoice" to create one.'}
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const statusInfo = getStatusInfo(inv.status);
                const StatusIcon = statusInfo.icon;
                const balanceDue = parseFloat(
                  inv.balanceDue || inv.grandTotal || 0
                );

                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {inv.invoiceNumber || `#${inv.id}`}
                    </td>
                    <td className="px-6 py-4">{inv.customerName}</td>
                    <td className="px-6 py-4">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ${(inv.grandTotal || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        ${balanceDue.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(getDisplayStatus(inv))}`}
                      >
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {getDisplayStatus(inv)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* View is always available */}
                        <button
                          onClick={() => onView(inv.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Draft invoice actions - require canDraft permission */}
                        {inv.status === "Draft" && canDraft && (
                          <>
                            {canPost && (
                              <button
                                onClick={() => onPost(inv.id)}
                                className="p-2 hover:bg-blue-50 text-blue-600 rounded"
                                title="Post"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onEdit(inv)}
                              className="p-2 hover:bg-green-50 text-green-600 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(inv.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Posted invoice actions */}
                        {inv.status === "Posted" && (
                          <>
                            {hasInventoryModule && canDraft && (
                              <button
                                onClick={() => onCreateDelivery(inv)}
                                className="p-2 hover:bg-purple-50 text-purple-600 rounded"
                                title="Create Delivery"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            )}
                            {/* Only show payment button if there's a balance due (not fully paid) */}
                            {balanceDue > 0 && canDraft && getDisplayStatus(inv) !== "Paid" && getDisplayStatus(inv) !== "Completed" && (
                              <button
                                onClick={() => onCreateReceipt(inv)}
                                className="p-2 hover:bg-indigo-50 text-indigo-600 rounded"
                                title="Record Payment"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            {canDraft && (
                              <button
                                onClick={() => onCancel(inv.id)}
                                className="p-2 hover:bg-red-50 text-red-600 rounded"
                                title="Cancel"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}