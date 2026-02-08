import { X, Eye, Ruler, Warehouse, Package } from "lucide-react";
export default function ProductDetailModal({
  product,
  warehouses,
  categories,
  unitsOfMeasure,
  stockBalances,
  getProductStock,
  getUnitSymbol,
  onClose,
}) {
  const category =
    categories.find((c) => c.id === product.categoryId) ||
    (product.categoryName ? { name: product.categoryName } : null);
  const unit =
    unitsOfMeasure.find((u) => u.id === product.unitOfMeasureId) ||
    unitsOfMeasure.find((u) => u.name === product.unitOfMeasureName);
  const totalStock = getProductStock(product.id);
  const unitSymbol = getUnitSymbol(product.unitOfMeasureId, product);

  const warehouseStocks = warehouses
    .map((wh) => ({
      warehouse: wh,
      stock: getProductStock(product.id, wh.id),
    }))
    .filter((ws) => ws.stock > 0);

  const totalValue = totalStock * (product.defaultPrice || 0);

  // Debug logging
  console.log("ProductDetailModal Debug:", {
    productId: product.id,
    productName: product.name,
    barcode: product.barcode,
    barcodeType: typeof product.barcode,
    barcodeLength: product.barcode?.length,
    totalStock,
    warehouseStocks,
    stockBalances: stockBalances.filter((b) => b.productId === product.id),
    allStockBalances: stockBalances,
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Product Details
              </h3>
              <p className="text-sm text-gray-600">
                Complete product information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="col-span-2 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-1">
                  {product.name}
                </h4>
                <p className="text-gray-600">Barcode: {product.code}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  product.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Category</p>
            <p className="text-lg font-semibold text-gray-900">
              {category?.name || "N/A"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Unit of Measure</p>
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-600" />
              <p className="text-lg font-semibold text-gray-900">
                {unit?.name || "N/A"} ({unit?.symbol || "-"})
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Default Price</p>
            <p className="text-lg font-semibold text-green-600">
              ${product.defaultPrice || 0} per {unitSymbol}
            </p>
          </div>

          {product.description && product.description.trim() !== "" && (
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-gray-900">{product.description}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Stock Summary
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total Stock</p>
              <p className="text-3xl font-bold text-blue-600">
                {totalStock} {unitSymbol}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-3xl font-bold text-green-600">
                ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Stock by Warehouse
          </h4>
          {warehouseStocks.length > 0 ? (
            <div className="space-y-3">
              {warehouseStocks.map((ws) => (
                <div
                  key={ws.warehouse.id}
                  className="p-4 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Warehouse className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {ws.warehouse.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ws.warehouse.address}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      {ws.stock}
                    </p>
                    <p className="text-sm text-gray-600">{unitSymbol}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No stock in any warehouse</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
