export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export const getStatusInfo = (status) => {
  const map = {
    Draft:        { label: "Draft",        color: "bg-gray-100 text-gray-700", icon: "Clock" },
    Posted:       { label: "Posted",       color: "bg-blue-100 text-blue-700",  icon: "CheckCircle2" },
    "Partially Paid": { label: "Partially Paid", color: "bg-yellow-100 text-yellow-700", icon: "DollarSign" },
    Paid:         { label: "Paid",         color: "bg-green-100 text-green-700", icon: "CheckCircle2" },
    Cancelled:    { label: "Cancelled",    color: "bg-red-100 text-red-700",   icon: "XCircle" },
  };
  return map[status] || map.Draft;
};

export const getDisplayStatus = (inv, deliveries = [], receipts = []) => {
  if (inv.status === "Cancelled" || inv.status === "Completed") return inv.status;

  const hasDelivery  = deliveries.some(d => d.salesInvoiceId === inv.id);
  const hasReceipt   = receipts.some(r => r.allocations?.some(a => a.salesInvoiceId === inv.id));
  const fullyDelivered = inv.lines?.every(l => (l.remainingQuantity || 0) <= 0) ?? false;
  const balanceDue = parseFloat(inv.balanceDue || 0);
  const fullyPaid  = balanceDue <= 0 || (inv.totalPaid || 0) >= (inv.grandTotal || 0);

  if (fullyDelivered && fullyPaid) return "Completed";
  if (fullyDelivered)              return "Delivered";
  if (fullyPaid)                   return "Paid";
  return inv.status || "Draft";
};

export const getStatusStyle = (status) => {
  const styles = {
    Draft:     "bg-gray-100 text-gray-700",
    Posted:    "bg-blue-100 text-blue-700",
    Open:      "bg-blue-100 text-blue-700",
    Delivered: "bg-purple-100 text-purple-700",
    Paid:      "bg-indigo-100 text-indigo-700",
    Completed: "bg-green-100 text-green-700 font-semibold",
    Cancelled: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};