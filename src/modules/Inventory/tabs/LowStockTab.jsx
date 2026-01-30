import { AlertTriangle  } from "lucide-react";
export default function LowStockTab({
  products,
  warehouses,
  getProductStock,
  getUnitSymbol,
  getLowStockThreshold,
}) {
  const lowStockProducts = products.filter((p) => {
    const totalStock = getProductStock(p.id);
    const threshold = getLowStockThreshold(p);
    return totalStock > 0 && totalStock <= threshold;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
          <h3 className="text-2xl font-bold text-gray-900">Low Stock Alert</h3>
        </div>
        <div className="space-y-4">
          {lowStockProducts.map((product) => {
            const totalStock = getProductStock(product.id);
            const unitSymbol = getUnitSymbol(product.unitOfMeasureId, product);
            const threshold = getLowStockThreshold(product);
            const warehouseStocks = warehouses
              .map((wh) => ({
                warehouse: wh,
                stock: getProductStock(product.id, wh.id),
              }))
              .filter((ws) => ws.stock > 0);

            return (
              <div
                key={product.id}
                className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      Total Stock: {totalStock} {unitSymbol} | Threshold:{" "}
                      {threshold} {unitSymbol}
                    </p>
                  </div>
                </div>
                {warehouseStocks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Stock by Warehouse:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {warehouseStocks.map((ws) => (
                        <div key={ws.warehouse.id} className="text-sm">
                          <span className="text-gray-600">
                            {ws.warehouse.name}:
                          </span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {ws.stock} {unitSymbol}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {lowStockProducts.length === 0 && (
            <p className="text-center text-gray-500 py-8">No low stock items</p>
          )}
        </div>
      </div>
    </div>
  );
}
