import {
  Send ,
  X,
  Plus,
  Sparkles,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
export default function ReturnModal({
  customers,
  invoices,
  products,
  warehouses,
  units,
  hasInventoryModule,
  onSave,
  onClose,
  getAuthHeaders, // ADD THIS PROP - needed for auto-creation
  API_BASE_URL, // ADD THIS PROP - needed for auto-creation
}) {
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().split("T")[0],
    salesInvoiceId: "",
    customerId: "",
    warehouseId: warehouses.length > 0 ? warehouses[0].id : "",
    reason: "",
    notes: "",
    lines: [],
  });

  // Filter invoices based on selected customer
  const filteredInvoices = useMemo(() => {
    if (!formData.customerId) return [];
    return invoices.filter(
      (inv) =>
        inv.customerId === parseInt(formData.customerId) &&
        inv.status !== "Draft" &&
        inv.status !== "Cancelled",
    );
  }, [formData.customerId, invoices]);

  // When customer changes, reset invoice selection
  const handleCustomerChange = (customerId) => {
    setFormData({
      ...formData,
      customerId: customerId,
      salesInvoiceId: "", // Reset invoice when customer changes
    });
  };

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

  const createOrFindUnit = async (unitName) => {
    try {
      console.log(`Searching for unit: ${unitName}`);

      // First, try to find existing unit
      const response = await fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const units = await response.json();
        console.log(`Found ${units.length} existing units`);

        const existingUnit = units.find(
          (u) =>
            u.name.toLowerCase() === unitName.toLowerCase() ||
            u.symbol.toLowerCase() === unitName.toLowerCase(),
        );

        if (existingUnit) {
          console.log(
            `✓ Found existing unit: ${existingUnit.name} (ID: ${existingUnit.id})`,
          );
          return existingUnit.id;
        }
      }

      // If not found, create new unit
      console.log(`Creating new unit: ${unitName}`);

      const createPayload = {
        name: unitName,
        symbol: unitName.toLowerCase().substring(0, 5),
      };

      console.log(
        "Unit creation payload:",
        JSON.stringify(createPayload, null, 2),
      );

      const createResponse = await fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(createPayload),
      });

      if (createResponse.ok) {
        const result = await createResponse.json();
        // FIXED: Backend returns {id: number}, not full object
        const newUnitId = result.id || result;
        console.log(`✓ Unit created with ID: ${newUnitId}`);
        return newUnitId;
      } else {
        let errorMsg = `HTTP ${createResponse.status}`;
        try {
          const errorText = await createResponse.text();
          errorMsg += `: ${errorText}`;
        } catch (e) {
          console.error(e);
        }
        throw new Error(`Failed to create unit: ${errorMsg}`);
      }
    } catch (err) {
      console.error("Error in createOrFindUnit:", err);
      throw err;
    }
  };
  // Helper: Create product from manual entry
  const createProductFromManualEntry = async (productName, unitName) => {
    try {
      // First, get or create the unit
      console.log(`Creating/finding unit: ${unitName}`);
      const unitId = await createOrFindUnit(unitName);
      console.log(`✓ Unit ID obtained: ${unitId}`);

      // Now create the product
      console.log(`Creating product: ${productName} with unit ID ${unitId}`);

      const payload = {
        code: `AUTO-${Date.now()}`, // FIXED: Generate unique code instead of empty string
        name: productName,
        description: "Auto-created from sales",
        categoryId: null, // Backend accepts null
        unitOfMeasureId: unitId,
        defaultPrice: 0,
        barcode: "",
      };

      console.log(
        "Product creation payload:",
        JSON.stringify(payload, null, 2),
      );

      const response = await fetch(`${API_BASE_URL}/api/Products`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        // FIXED: Backend returns {id: number}, not full object
        const newProductId = result.id || result;
        console.log(`✓ Product created with ID: ${newProductId}`);

        return {
          productId: newProductId,
          unitId: unitId,
        };
      } else {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorDetails = await response.json();
            console.error("Product creation error:", errorDetails);

            if (errorDetails.errors) {
              const errorMessages = Object.entries(errorDetails.errors)
                .map(
                  ([key, values]) =>
                    `${key}: ${Array.isArray(values) ? values.join(", ") : values}`,
                )
                .join("\n");
              errorMsg = errorMessages;
            } else if (errorDetails.title) {
              errorMsg = errorDetails.title;
            }
          } else {
            const textError = await response.text();
            errorMsg += `: ${textError}`;
          }
        } catch (e) {
          console.error(e);
        }

        throw new Error(`Failed to create product: ${errorMsg}`);
      }
    } catch (err) {
      console.error("Error in createProductFromManualEntry:", err);
      throw err;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ... validation ...

    try {
      // Process lines and create products/units as needed
      const processedLines = await Promise.all(
        formData.lines.map(async (line) => {
          let productId = line.productId ? parseInt(line.productId) : null;
          let unitId = line.unitId ? parseInt(line.unitId) : null;

          // Auto-create if manual entry
          if (!productId && line.productName) {
            console.log(
              `Auto-creating return product: "${line.productName}" (${line.unitName})`,
            );
            try {
              const created = await createProductFromManualEntry(
                line.productName,
                line.unitName || "unit",
              );
              productId = created.productId;
              unitId = created.unitId;
              console.log(`✓ Return product created: ID ${productId}`);
            } catch (createErr) {
              throw new Error(
                `Failed to create product "${line.productName}": ${createErr.message}`,
              );
            }
          }

          return {
            productId: productId,
            unitId: unitId,
            quantity: parseFloat(line.quantity),
            unitPrice: parseFloat(line.unitPrice) || 0,
            taxPercent: parseFloat(line.taxPercent) || 0,
            notes: line.notes || "",
          };
        }),
      );

      const payload = {
        returnDate: formData.returnDate,
        salesInvoiceId: formData.salesInvoiceId
          ? parseInt(formData.salesInvoiceId)
          : null,
        customerId: parseInt(formData.customerId),
        warehouseId: formData.warehouseId
          ? parseInt(formData.warehouseId)
          : null,
        reason: formData.reason,
        notes: formData.notes,
        lines: processedLines,
      };

      console.log("Sending return:", JSON.stringify(payload, null, 2));
      onSave(payload);
    } catch (err) {
      console.error("Error processing return:", err);
      alert(`Failed to create return: ${err.message}`);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">New Sales Return</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!hasInventoryModule && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Manual Entry Mode:</strong> Products and units will be
              auto-created from your entries.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {/* CUSTOMER SELECTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer *
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
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

            {/* ORIGINAL INVOICE - FILTERED BY CUSTOMER */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Original Invoice (Optional)
              </label>
              <select
                value={formData.salesInvoiceId}
                onChange={(e) =>
                  setFormData({ ...formData, salesInvoiceId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                disabled={!formData.customerId}
              >
                <option value="">None</option>
                {filteredInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber || `Invoice #${inv.id}`} - $
                    {(inv.grandTotal || 0).toFixed(2)}
                  </option>
                ))}
              </select>
              {!formData.customerId && (
                <p className="text-xs text-gray-500 mt-1">
                  Select a customer first
                </p>
              )}
              {formData.customerId && filteredInvoices.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No posted invoices for this customer
                </p>
              )}
            </div>

            {/* RETURN DATE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Return Date *
              </label>
              <input
                type="date"
                required
                value={formData.returnDate}
                onChange={(e) =>
                  setFormData({ ...formData, returnDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* WAREHOUSE (if inventory module) */}
          {hasInventoryModule && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Warehouse *
              </label>
              <select
                required
                value={formData.warehouseId}
                onChange={(e) =>
                  setFormData({ ...formData, warehouseId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} - {w.code}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* REASON */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason *
            </label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Defective, Wrong item, Customer request"
            />
          </div>

          {/* RETURN ITEMS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Return Items
              </h4>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {formData.lines.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No items. Click "Add Item" to add return items.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.lines.map((line, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-6 gap-3">
                      {/* PRODUCT */}
                      {hasInventoryModule && products.length > 0 ? (
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Product *
                          </label>
                          <select
                            required
                            value={line.productId}
                            onChange={(e) => {
                              const productId = e.target.value;
                              const product = products.find(
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
                                  unitPrice: product.defaultPrice || 0,
                                  unitId: productUnit ? productUnit.id : "",
                                });
                              }
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          >
                            <option value="">Select Product</option>
                            {products
                              .filter((p) => p.isActive !== false)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      ) : (
                        <div className="col-span-2">
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
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="Enter product name"
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            ℹ️ Will be auto-created
                          </p>
                        </div>
                      )}

                      {/* QUANTITY */}
                      <div>
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>

                      {/* UNIT */}
                      {hasInventoryModule && units.length > 0 ? (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit *
                          </label>
                          <select
                            required
                            value={line.unitId}
                            onChange={(e) =>
                              updateLine(index, { unitId: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          >
                            <option value="">Unit</option>
                            {units.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.symbol}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
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
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="kg, pcs"
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            ℹ️ Manual
                          </p>
                        </div>
                      )}

                      {/* PRICE */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) =>
                            updateLine(index, { unitPrice: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>

                      {/* DELETE */}
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NOTES */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
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

          {/* BUTTONS */}
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
              Create Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
