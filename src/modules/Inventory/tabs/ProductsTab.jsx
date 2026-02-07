import {
  AlertTriangle,
  Search,
  RefreshCw,
  Plus,
  Ruler,
  Eye,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit,
  Trash2,
} from "lucide-react";

export default function ProductsTab({
  products,
  categories,
  unitsOfMeasure,
  getProductStock,
  getUnitSymbol,
  lowStockThreshold,
  searchQuery,
  setSearchQuery,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onStockIn,
  onStockOut,
  onViewDetails,
  onRefresh,
  canManage,
  canManageStock,
}) {
  const productsWithoutUnits = products.filter(
    (p) => !p.unitOfMeasureId && !p.unitOfMeasureName,
  );

  return (
    <div className="space-y-6">
      {/* Warning Banner for Products without Units */}
      {productsWithoutUnits.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900">
                {productsWithoutUnits.length}{" "}
                {productsWithoutUnits.length === 1
                  ? "product needs"
                  : "products need"}{" "}
                a unit of measure
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Stock operations (Add/Remove) are disabled for products without
                a unit of measure. Click the Edit button to assign a unit.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {productsWithoutUnits.slice(0, 3).map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs"
                  >
                    {p.name}
                  </span>
                ))}
                {productsWithoutUnits.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                    +{productsWithoutUnits.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-md flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {canManage && (
            <button
              onClick={onAddProduct}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Barcode
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Product Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Unit
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Total Stock
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Min Stock
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stock = getProductStock(product.id);
                  const category = categories.find(
                    (c) => c.id === product.categoryId,
                  );
                  const unit = unitsOfMeasure.find(
                    (u) => u.id === product.unitOfMeasureId,
                  );

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {product.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.categoryName || category?.name || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {product.unitOfMeasureId ||
                        product.unitOfMeasureName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                            <Ruler className="w-3 h-3" />
                            {product.unitOfMeasureName || unit?.name || "N/A"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            Not Set
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {stock}{" "}
                          {getUnitSymbol(product.unitOfMeasureId, product)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {product.minQuantity || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${product.defaultPrice || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              stock === 0
                                ? "bg-red-100 text-red-700"
                                : stock <= lowStockThreshold
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {stock === 0
                              ? "Out of Stock"
                              : stock <= lowStockThreshold
                                ? "Low Stock"
                                : "In Stock"}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              product.isActive
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewDetails(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <>
                              {" "}
                              <button
                                onClick={() => onStockIn(product)}
                                disabled={
                                  !product.unitOfMeasureId &&
                                  !product.unitOfMeasureName
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  product.unitOfMeasureId ||
                                  product.unitOfMeasureName
                                    ? "text-green-600 hover:bg-green-50"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                                title={
                                  product.unitOfMeasureId ||
                                  product.unitOfMeasureName
                                    ? "Add Stock"
                                    : "Unit of measure required"
                                }
                              >
                                <ArrowUpCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onStockOut(product)}
                                disabled={
                                  !product.unitOfMeasureId &&
                                  !product.unitOfMeasureName
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  product.unitOfMeasureId ||
                                  product.unitOfMeasureName
                                    ? "text-purple-600 hover:bg-purple-50"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                                title={
                                  product.unitOfMeasureId ||
                                  product.unitOfMeasureName
                                    ? "Remove Stock"
                                    : "Unit of measure required"
                                }
                              >
                                <ArrowDownCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onEditProduct(product)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteProduct(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
    </div>
  );
}
