import { AlertCircle,Send ,Ban , Warehouse as WarehouseIcon } from "lucide-react";
export default function ReceiptsTab({ receipts, onPost, onCancel, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Receipt #
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Customer
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Amount
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
          {receipts.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                No receipts yet
              </td>
            </tr>
          ) : (
            receipts.map((r) => {
              const statusLower = (r.status || "").toLowerCase().trim();

              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {r.receiptNumber || `#${r.id}`}
                  </td>
                  <td className="px-6 py-4">{r.customerName || "—"}</td>
                  <td className="px-6 py-4">
                    {new Date(r.receiptDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    ${parseFloat(r.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        statusLower === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : statusLower === "posted"
                            ? "bg-blue-100 text-blue-800"
                            : statusLower === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {r.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {statusLower === "draft" && (
                        <>
                          <button
                            onClick={() => onPost(r.id)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                            title="Post Receipt"
                          >
                            <Send className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => onCancel(r.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                            title="Cancel Receipt"
                          >
                            <Ban className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => onDelete(r.id)}
                            className="p-2 hover:bg-red-50 text-red-700 rounded-lg font-medium border border-red-300"
                            title="Delete Receipt"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {statusLower === "posted" && (
                        <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          Posted – cannot modify
                        </span>
                      )}

                      {statusLower === "cancelled" && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <Ban className="w-4 h-4" />
                          Cancelled
                        </span>
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
  );
}
