import {
  Edit,
  X,
  Plus,
  Sparkles,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { useState } from "react";
export default function InvoiceModal({
  invoice,
  customers,
  products,
  units,
  categories,
  hasInventoryModule,
  onSave,
  onClose,
  onCreateProduct,
}) {
  const activeProducts = products.filter((p) => p.isActive !== false);
  const [formData, setFormData] = useState(
    invoice
      ? {
          invoiceDate:
            invoice.invoiceDate?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          dueDate:
            invoice.dueDate?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          customerId: invoice.customerId || "",
          notes: invoice.notes || "",
          lines: invoice.lines || [],
        }
      : {
          invoiceDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          customerId: "",
          notes: "",
          lines: [],
        },
  );

  const [showProductCreator, setShowProductCreator] = useState(false);
  const [creatingProductForLine, setCreatingProductForLine] = useState(null);
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    code: "",
    description: "",
    categoryId: "",
    unitOfMeasureId: "",
    defaultPrice: "",
  });

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        {
          productId: "",
          productName: "",
          unitId: "",
          unitName: "",
          quantity: 1,
          unitPrice: 0,
          discountPercent: 0,
          taxPercent: 0,
          notes: "",
        },
      ],
    });
  };

  const removeLine = (index) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const updateLine = (index, updates) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], ...updates };
    setFormData({ ...formData, lines: newLines });
  };

  const handleCreateProductClick = (lineIndex) => {
    setCreatingProductForLine(lineIndex);
    setNewProductForm({
      name: "",
      code: "",
      description: "",
      categoryId: "",
      unitOfMeasureId: "",
      defaultPrice: "",
    });
    setShowProductCreator(true);
  };

  const handleSaveNewProduct = async () => {
    if (!newProductForm.name) {
      alert("Product name is required");
      return;
    }
    if (!newProductForm.unitOfMeasureId) {
      alert("Unit of measure is required");
      return;
    }

    try {
      const createdProduct = await onCreateProduct(newProductForm);
      if (creatingProductForLine !== null) {
        const unit = units.find(
          (u) => u.id === parseInt(newProductForm.unitOfMeasureId),
        );
        updateLine(creatingProductForLine, {
          productId: createdProduct.id,
          productName: createdProduct.name,
          unitId: createdProduct.unitOfMeasureId,
          unitPrice: createdProduct.defaultPrice || 0,
        });
      }
      setShowProductCreator(false);
      setCreatingProductForLine(null);
      alert("✓ Product created successfully and added to invoice line!");
    } catch (err) {
      alert(`Failed to create product: ${err.message}`);
    }
  };

  const calculateLineTotal = (line) => {
    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.unitPrice) || 0;
    const discount = parseFloat(line.discountPercent) || 0;
    const tax = parseFloat(line.taxPercent) || 0;
    const subtotal = qty * price;
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * tax) / 100;
    return taxableAmount + taxAmount;
  };

  const grandTotal = formData.lines.reduce(
    (sum, line) => sum + calculateLineTotal(line),
    0,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId) {
      alert("Please select a customer");
      return;
    }
    if (formData.lines.length === 0) {
      alert("Please add at least one line item");
      return;
    }

    // Validation for manual entry mode
    if (!hasInventoryModule) {
      const invalidLines = formData.lines.filter(
        (line) =>
          !line.productName ||
          !line.unitName ||
          !line.quantity ||
          line.quantity <= 0,
      );
      if (invalidLines.length > 0) {
        alert(
          "All line items must have product name, unit name, and quantity greater than 0",
        );
        return;
      }
    } else {
      const invalidLines = formData.lines.filter(
        (line) =>
          !line.productId ||
          !line.unitId ||
          !line.quantity ||
          line.quantity <= 0,
      );
      if (invalidLines.length > 0) {
        alert(
          "All line items must have product, unit, and quantity greater than 0",
        );
        return;
      }
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-6xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {invoice ? "Edit Invoice" : "New Invoice"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {hasInventoryModule && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">
              <strong>Inventory Module Active:</strong> You can create products
              on-the-fly while adding invoice lines!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer *
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) =>
                  setFormData({ ...formData, customerId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={formData.invoiceDate}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Line Items
              </h4>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Line
              </button>
            </div>

            {formData.lines.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No line items. Click "Add Line" to add items.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.lines.map((line, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-12 gap-3 mb-3">
                      {/* PRODUCT SELECTION/ENTRY */}
                      {hasInventoryModule && activeProducts.length > 0 ? (
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Product *
                          </label>
                          <div className="flex gap-1">
                            <select
                              required
                              value={line.productId}
                              onChange={(e) => {
                                const productId = e.target.value;
                                const product = activeProducts.find(
                                  (p) => p.id === parseInt(productId),
                                );
                                if (product) {
                                  const productUnit = units.find(
                                    (u) =>
                                      u.name?.toLowerCase() ===
                                        product.unitOfMeasureName?.toLowerCase() ||
                                      u.symbol?.toLowerCase() ===
                                        product.unitOfMeasureName?.toLowerCase(),
                                  );
                                  updateLine(index, {
                                    productId: productId,
                                    productName: product.name,
                                    unitPrice: product.defaultPrice || 0,
                                    unitId: productUnit ? productUnit.id : "",
                                  });
                                }
                              }}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">Select Product</option>
                              {activeProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleCreateProductClick(index)}
                              className="px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                              title="Create new product"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          </div>
                          {line.productName && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {line.productName}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={line.productName || ""}
                            onChange={(e) =>
                              updateLine(index, { productName: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Enter product name"
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            ℹ️ Manual entry
                          </p>
                        </div>
                      )}

                      {/* QUANTITY */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Qty *
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0.01"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(index, { quantity: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      {/* UNIT SELECTION/ENTRY */}
                      {hasInventoryModule && units.length > 0 ? (
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit *
                          </label>
                          <select
                            required
                            value={line.unitId}
                            onChange={(e) =>
                              updateLine(index, { unitId: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select Unit</option>
                            {units.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.symbol} - {u.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit *
                          </label>
                          <input
                            type="text"
                            required
                            value={line.unitName || ""}
                            onChange={(e) =>
                              updateLine(index, { unitName: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="kg, pcs, m"
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            ℹ️ Manual
                          </p>
                        </div>
                      )}

                      {/* UNIT PRICE */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Unit Price *
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) =>
                            updateLine(index, { unitPrice: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Disc%
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={line.discountPercent}
                          onChange={(e) =>
                            updateLine(index, {
                              discountPercent: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tax%
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.taxPercent}
                          onChange={(e) =>
                            updateLine(index, { taxPercent: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="col-span-1 flex items-end">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-700">
                        Line Total: ${calculateLineTotal(line).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.lines.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">
                  Grand Total:
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {!hasInventoryModule && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>Manual Entry Mode:</strong> Enter product names and unit
                names manually. Enable Inventory module for automatic selection
                and product creation.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700"
            >
              {invoice ? "Update Invoice" : "Create Invoice"}
            </button>
          </div>
        </form>

        {/* INLINE PRODUCT CREATION MODAL */}
        {showProductCreator && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Create New Product
                  </h4>
                  <p className="text-sm text-gray-600">
                    Quick product creation for invoice
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductForm.name}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Premium Widget"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Code/Barcode
                  </label>
                  <input
                    type="text"
                    value={newProductForm.code}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        code: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-generated if left blank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newProductForm.categoryId}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        categoryId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category (Optional)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit of Measure *
                  </label>
                  <select
                    required
                    value={newProductForm.unitOfMeasureId}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        unitOfMeasureId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Unit</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProductForm.defaultPrice}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        defaultPrice: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProductForm.description}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        description: e.target.value,
                      })
                    }
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional product description"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductCreator(false);
                    setCreatingProductForLine(null);
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewProduct}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Create & Add to Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
