import {
  Plus ,
Send ,Ban ,
  AlertCircle ,
  Warehouse as WarehouseIcon,
} from "lucide-react";
export default function ReturnsTab({
  returns,
  onAdd,
  onPost,
  onCancel,
  onDelete,
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Return
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Return #
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
                Reason
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {returns.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No returns yet
                </td>
              </tr>
            ) : (
              returns.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{r.returnNumber || `#${r.id}`}</td>
                  <td className="px-6 py-4">{r.customerName || "—"}</td>
                  <td className="px-6 py-4">
                    {new Date(r.returnDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-red-600">
                    ${(r.grandTotal || r.subTotal || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{r.reason || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {r.status?.toLowerCase() === "draft" && (
                        <>
                          <button
                            onClick={() => onPost(r.id)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                            title="Post Return"
                          >
                            <Send className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => onCancel(r.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                            title="Cancel Return"
                          >
                            <Ban className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => onDelete(r.id)}
                            className="p-2 hover:bg-red-100 text-red-700 rounded-lg font-medium border border-red-300"
                            title="Delete Return (only Draft)"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {r.status?.toLowerCase() === "posted" && (
                        <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          Posted – cannot delete or modify
                        </span>
                      )}

                      {r.status?.toLowerCase() === "cancelled" && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <Ban className="w-4 h-4" />
                          Cancelled – cannot delete
                        </span>
                      )}

                      {!["draft", "posted", "cancelled"].includes(
                        r.status?.toLowerCase() || "",
                      ) && (
                        <span className="text-xs text-red-600">
                          Invalid status: {r.status}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
