import { useState } from "react";
import { X ,Plus   } from "lucide-react";

export default function ProductModal({
  product,
  categories,
  unitsOfMeasure,
  onSave,
  onClose,
  onAddCategory,
  onAddUnit,
}) {
  console.log("ProductModal opened with product:", product);

  const getCategoryIdFromName = (categoryName) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.id || "";
  };

  const getUnitIdFromName = (unitName) => {
    const unit = unitsOfMeasure.find((u) => u.name === unitName);
    return unit?.id || "";
  };

  const [formData, setFormData] = useState(
    product
      ? {
          code: product.code || "",
          name: product.name || "",
          description: product.description || "",
          categoryId:
            product.categoryId ||
            getCategoryIdFromName(product.categoryName) ||
            "",
          unitOfMeasureId:
            product.unitOfMeasureId ||
            getUnitIdFromName(product.unitOfMeasureName) ||
            "",
          defaultPrice: product.defaultPrice || "",
          minQuantity: product.minQuantity || "", // ADDED
          isActive: product.isActive !== false,
        }
      : {
          code: "",
          name: "",
          description: "",
          categoryId: "",
          unitOfMeasureId: "",
          defaultPrice: "",
          minQuantity: "", // ADDED
          isActive: true,
        },
  );

  console.log("ProductModal formData initialized:", formData);

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      alert("Product code and name are required");
      return;
    }

    if (!formData.unitOfMeasureId) {
      alert(
        "Unit of Measure is required. Please select a unit or create a new one.",
      );
      return;
    }

    onSave({
      ...formData,
      categoryId: parseInt(formData.categoryId) || null,
      unitOfMeasureId: parseInt(formData.unitOfMeasureId) || null,
      defaultPrice: parseFloat(formData.defaultPrice) || 0,
      minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : null, // ADDED
      isActive: formData.isActive !== false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {product ? "Edit Product" : "Add Product"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Barcode / Product Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Enter product barcode"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <div className="flex gap-2">
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onAddCategory}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                title="Add new category"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unit of Measure *
              <span className="ml-2 text-xs font-normal text-gray-500">
                (Required for stock operations)
              </span>
            </label>
            <div className="flex gap-2">
              <select
                value={formData.unitOfMeasureId}
                onChange={(e) =>
                  setFormData({ ...formData, unitOfMeasureId: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select Unit</option>
                {unitsOfMeasure.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onAddUnit}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                title="Add new unit"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {!formData.unitOfMeasureId && (
              <p className="mt-1 text-xs text-red-600">
                ⚠️ Unit is required to perform stock in/out operations
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Default Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.defaultPrice}
              onChange={(e) =>
                setFormData({ ...formData, defaultPrice: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* ADDED: Min Quantity Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Quantity
              <span className="ml-2 text-xs font-normal text-gray-500">
                (Reorder level)
              </span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.minQuantity}
              onChange={(e) =>
                setFormData({ ...formData, minQuantity: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Enter minimum stock level"
            />
            <p className="mt-1 text-xs text-gray-500">
              Alert when stock falls below this level
            </p>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Active Product
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (Uncheck to deactivate this product)
                </span>
              </span>
            </label>
          </div>
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
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700"
          >
            {product ? "Update" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
