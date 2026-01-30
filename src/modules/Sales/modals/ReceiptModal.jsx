import { X, Warehouse as WarehouseIcon } from "lucide-react";
import { useState } from "react";
export default function ReceiptModal({ invoice, onSave, onClose }) {
  const balanceDue =
    parseFloat(invoice?.balanceDue || invoice?.grandTotal || 0) || 0;

  const [formData, setFormData] = useState({
    receiptDate: new Date().toISOString().split("T")[0],
    customerId: invoice.customerId || "",
    amount: balanceDue > 0 ? balanceDue : 0,
    paymentMethod: "Cash",
    referenceNumber: "",
    notes: "",
    allocations: [
      {
        salesInvoiceId: invoice.id,
        allocatedAmount: balanceDue > 0 ? balanceDue : 0,
      },
    ],
  });

  const [validationError, setValidationError] = useState("");

  const validateAmount = (amount) => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setValidationError("Amount must be greater than zero");
      return false;
    }
    if (amt > balanceDue) {
      setValidationError(
        `Cannot exceed balance due ($${balanceDue.toFixed(2)})`,
      );
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleAmountChange = (value) => {
    const amt = parseFloat(value) || 0;
    validateAmount(amt);
    setFormData({
      ...formData,
      amount: amt,
      allocations: [{ ...formData.allocations[0], allocatedAmount: amt }],
    });
  };

  const canSubmit =
    formData.amount > 0 &&
    formData.amount <= balanceDue &&
    formData.paymentMethod &&
    formData.allocations[0]?.allocatedAmount === formData.amount &&
    !validationError;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAmount(formData.amount)) {
      return;
    }

    // FIXED: Add branchId field
    const payload = {
      branchId: 0, // Default branch - backend might require this
      receiptDate: formData.receiptDate,
      customerId: parseInt(formData.customerId),
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber,
      notes: formData.notes,
      allocations: formData.allocations.map((a) => ({
        salesInvoiceId: parseInt(a.salesInvoiceId),
        allocatedAmount: parseFloat(a.allocatedAmount),
      })),
    };

    console.log(
      "Receipt payload (with branchId):",
      JSON.stringify(payload, null, 2),
    );
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Record Payment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Invoice:</span>{" "}
              {invoice.invoiceNumber || `#${invoice.id}`}
            </p>
            <p className="text-sm text-blue-900 mt-1">
              <span className="font-semibold">Customer:</span>{" "}
              {invoice.customerName}
            </p>
            <p className="text-lg text-blue-900 mt-2 font-bold">
              Balance Due: ${balanceDue.toFixed(2)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Receipt Date *
              </label>
              <input
                type="date"
                required
                value={formData.receiptDate}
                onChange={(e) =>
                  setFormData({ ...formData, receiptDate: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Amount *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                max={balanceDue}
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
                  validationError
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-green-500"
                }`}
              />
              {validationError && (
                <p className="text-red-600 text-sm mt-1">{validationError}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Maximum: ${balanceDue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) =>
                  setFormData({ ...formData, referenceNumber: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Check # or Transaction ID"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition ${
                canSubmit
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
