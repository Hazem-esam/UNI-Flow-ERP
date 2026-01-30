import { Warehouse, MapPin } from "lucide-react";
export default function WarehousesTab({
  warehouses,
  products,
  getProductStock,
  getUnitSymbol,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => {
          const warehouseProducts = products.filter(
            (p) => getProductStock(p.id, warehouse.id) > 0,
          );
          const totalItems = warehouseProducts.reduce(
            (sum, p) => sum + getProductStock(p.id, warehouse.id),
            0,
          );
          const totalValue = warehouseProducts.reduce(
            (sum, p) =>
              sum + getProductStock(p.id, warehouse.id) * (p.defaultPrice || 0),
            0,
          );

          return (
            <div
              key={warehouse.id}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Warehouse className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {warehouse.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Code: {warehouse.code}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    warehouse.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {warehouse.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{warehouse.address || "No address"}</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Products</p>
                      <p className="text-lg font-bold text-gray-900">
                        {warehouseProducts.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Units</p>
                      <p className="text-lg font-bold text-gray-900">
                        {totalItems}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-600">Stock Value</p>
                    <p className="text-xl font-bold text-green-600">
                      ${totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>

                {warehouseProducts.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Top Products
                    </p>
                    <div className="space-y-1">
                      {warehouseProducts.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">{p.name}</span>
                          <span className="font-semibold text-gray-900">
                            {getProductStock(p.id, warehouse.id)}{" "}
                            {getUnitSymbol(p.unitOfMeasureId, p)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {warehouses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No warehouses found. Go to Master Data to add warehouses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}