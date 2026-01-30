import { useState } from "react";
import { X ,ArrowUpCircle ,Ruler    } from "lucide-react";
export default function StockInModal({
  product,
  warehouses,
  getUnitSymbol,
  getUnitName,
  getUnitId,
  onSave,
  onClose,
}) {
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState(product.defaultPrice || "");
  const [notes, setNotes] = useState("");

  const unitSymbol = getUnitSymbol(product.unitOfMeasureId, product);
  const unitName = getUnitName(product.unitOfMeasureId, product);
  const unitId = getUnitId(product);

  const handleSubmit = () => {
    if (!selectedWarehouse) {
      alert("Please select a warehouse");
      return;
    }
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (!unitId) {
      alert("Product must have a unit of measure assigned");
      console.error("Unit ID missing:", {
        productId: product.id,
        unitOfMeasureId: product.unitOfMeasureId,
        unitOfMeasureName: product.unitOfMeasureName,
        derivedUnitId: unitId,
      });
      return;
    }

    console.log(
      "Submitting stock in with unit ID:",
      unitId,
      "for product:",
      product.name,
    );

    onSave({
      productId: product.id,
      warehouseId: parseInt(selectedWarehouse),
      quantity: parseInt(quantity),
      unitId: unitId,
      unitCost: parseFloat(unitCost) || 0,
      notes: notes,
      lineNotes: `Added ${quantity} ${unitSymbol}`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Add Stock</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900">{product.name}</h4>
          <p className="text-sm text-gray-600">Barcode: {product.code}</p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
            <Ruler className="w-3 h-3" />
            Unit: {unitName} ({unitSymbol})
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Warehouse *
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity to Add ({unitSymbol}) *
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder={`Enter quantity in ${unitSymbol}`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unit Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter cost per unit"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Optional notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {quantity && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-green-700">
                $
                {(
                  (parseFloat(quantity) || 0) * (parseFloat(unitCost) || 0)
                ).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {quantity} {unitSymbol} × ${parseFloat(unitCost) || 0} per{" "}
                {unitSymbol}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Add Stock
          </button>
        </div>
      </div>
    </div>
  );
}