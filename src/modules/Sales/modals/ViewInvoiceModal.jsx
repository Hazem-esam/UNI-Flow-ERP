import { X, Warehouse as WarehouseIcon } from "lucide-react";
export default function ViewInvoiceModal({ invoice, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Invoice {invoice.invoiceNumber || `#${invoice.id}`}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Customer
              </h4>
              <p className="text-lg font-bold text-gray-900">
                {invoice.customerName}
              </p>
            </div>

            <div className="text-right">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Invoice Details
              </h4>
              <p className="text-sm text-gray-600">
                Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Due: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Line Items
            </h4>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Unit Price
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Discount
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Tax
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.lines?.map((line, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {line.productName || `Product #${line.productId}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {line.quantity} {line.unitName || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      ${parseFloat(line.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {line.discountPercent || 0}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {line.taxPercent || 0}%
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      ${parseFloat(line.lineTotal || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">
                      ${parseFloat(invoice.subTotal || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Discount:</span>
                    <span className="font-semibold text-red-600">
                      -${parseFloat(invoice.discountAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tax:</span>
                    <span className="font-semibold">
                      ${parseFloat(invoice.taxAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Grand Total:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      $
                      {parseFloat(
                        invoice.grandTotal || invoice.totalAmount || 0,
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Notes
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
