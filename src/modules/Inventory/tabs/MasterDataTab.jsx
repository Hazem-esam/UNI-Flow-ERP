import { Tags  ,Plus ,Edit  ,Trash2 ,Warehouse,Ruler  } from "lucide-react";
export default function MasterDataTab({
  categories,
  warehouses,
  unitsOfMeasure,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddWarehouse,
  onEditWarehouse,
  onDeleteWarehouse,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
}) {
  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Tags className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Categories</h3>
          </div>
          <button
            onClick={onAddCategory}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                  <p className="text-sm text-gray-600">
                    {cat.description || "No description"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditCategory(cat)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No categories. Click "Add Category" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Warehouses Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Warehouse className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Warehouses</h3>
          </div>
          <button
            onClick={onAddWarehouse}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{wh.name}</h4>
                  <p className="text-sm text-gray-600">Code: {wh.code}</p>
                  <p className="text-sm text-gray-600">{wh.address}</p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                      wh.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {wh.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditWarehouse(wh)}
                    className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteWarehouse(wh.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {warehouses.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No warehouses. Click "Add Warehouse" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Units of Measure Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Ruler className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Units of Measure
            </h3>
          </div>
          <button
            onClick={onAddUnit}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Add Unit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {unitsOfMeasure.map((unit) => (
            <div
              key={unit.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{unit.name}</h4>
                  <p className="text-sm text-gray-600">Symbol: {unit.symbol}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditUnit(unit)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteUnit(unit.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {unitsOfMeasure.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No units of measure. Click "Add Unit" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}