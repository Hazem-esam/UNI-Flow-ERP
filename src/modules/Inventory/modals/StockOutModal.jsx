import { useState } from "react";
import { X, ArrowDownCircle, Ruler } from "lucide-react";
export default function StockOutModal({
  product,
  warehouses,
  getProductStock,
  getUnitSymbol,
  getUnitName,
  getUnitId,
  onSave,
  onClose,
}) {
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const currentStock = selectedWarehouse
    ? getProductStock(product.id, parseInt(selectedWarehouse))
    : 0;
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
    if (parseInt(quantity) > currentStock) {
      alert(
        `Cannot remove ${quantity} ${unitSymbol}. Only ${currentStock} ${unitSymbol} available in this warehouse.`,
      );
      return;
    }
    if (!unitId) {
      alert("Product must have a unit of measure assigned");
      return;
    }

    onSave({
      productId: product.id,
      warehouseId: parseInt(selectedWarehouse),
      quantity: parseInt(quantity),
      unitId: unitId,
      notes: notes,
      lineNotes: `Removed ${quantity} ${unitSymbol}`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Remove Stock</h3>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((wh) => {
                const stock = getProductStock(product.id, wh.id);
                return (
                  <option key={wh.id} value={wh.id} disabled={stock === 0}>
                    {wh.name} ({stock} {unitSymbol} available)
                  </option>
                );
              })}
            </select>
          </div>

          {selectedWarehouse && (
            <>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Available Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentStock} {unitSymbol}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Remove ({unitSymbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder={`Max: ${currentStock} ${unitSymbol}`}
                />
              </div>

              {quantity && (
                <div
                  className={`p-3 rounded-lg ${parseInt(quantity) > currentStock ? "bg-red-50" : "bg-purple-50"}`}
                >
                  <p className="text-sm text-gray-600">Remaining Stock</p>
                  <p
                    className={`text-lg font-bold ${parseInt(quantity) > currentStock ? "text-red-700" : "text-purple-700"}`}
                  >
                    {currentStock - parseInt(quantity)} {unitSymbol}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Reason for stock removal..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
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
            disabled={!selectedWarehouse || !quantity}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove Stock
          </button>
        </div>
      </div>
    </div>
  );
}
