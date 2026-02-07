import { X, Warehouse as WarehouseIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
export default function DeliveryModal({
  invoice,
  warehouses,
  onSave,
  onClose,
  getAuthHeaders, // MUST be passed from parent component
}) {
  const [stockMap, setStockMap] = useState({}); // { productId: { warehouseId: quantityOnHand } }
  const [loadingStock, setLoadingStock] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5225";

  // Fetch stock only for products in this invoice
  useEffect(() => {
    const fetchStock = async () => {
      if (!invoice?.lines?.length || !warehouses?.length || !getAuthHeaders) {
        setLoadingStock(false);
        return;
      }

      setLoadingStock(true);
      const newStockMap = {};

      try {
        // 1. Get unique product IDs from invoice lines
        const productIds = [...new Set(invoice.lines.map((l) => l.productId))];
        if (productIds.length === 0) {
          console.warn("No products in invoice");
          setStockMap({});
          return;
        }

        console.log("Fetching stock for products:", productIds);

        // 2. Fetch stock from each warehouse
        for (const wh of warehouses) {
          try {
            const res = await fetch(
              `${API_BASE_URL}/api/InventoryReports/warehouse/${wh.id}/stock`,
              {
                headers: getAuthHeaders(),
              },
            );

            console.log(
              `Warehouse ${wh.id} (${wh.name}) status: ${res.status}`,
            );

            if (!res.ok) {
              const errText = await res.text().catch(() => "No error text");
              console.warn(
                `Failed warehouse ${wh.id}: ${res.status} - ${errText}`,
              );
              continue;
            }

            const stockList = await res.json();
            console.log(`Stock from warehouse ${wh.id}:`, stockList);

            // 3. Only keep entries for products in this invoice
            stockList.forEach((item) => {
              if (productIds.includes(item.productId)) {
                if (!newStockMap[item.productId]) {
                  newStockMap[item.productId] = {};
                }
                newStockMap[item.productId][wh.id] = item.quantityOnHand ?? 0;
              }
            });
          } catch (innerErr) {
            console.error(`Error fetching warehouse ${wh.id}:`, innerErr);
          }
        }

        console.log("Final stock map:", newStockMap);
        setStockMap(newStockMap);
      } catch (err) {
        console.error("Stock fetch error:", err);
        setStockMap({});
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStock();
  }, [invoice.lines, warehouses, getAuthHeaders]);

  // Group invoice lines by productId (aggregate remaining qty)
  const groupedLines = useMemo(() => {
    return invoice.lines.reduce((acc, line) => {
      const pid = line.productId;
      if (!acc[pid]) {
        acc[pid] = {
          productId: pid,
          productName: line.productName || "Unknown",
          remainingQuantity: line.remainingQuantity || line.quantity || 0,
          unitId: line.unitId,
          unitName: line.unitName || "unit",
          allocated: 0,
          warehouseAllocations: [],
        };
      } else {
        acc[pid].remainingQuantity +=
          line.remainingQuantity || line.quantity || 0;
      }
      return acc;
    }, {});
  }, [invoice.lines]);

  const [formData, setFormData] = useState({
    deliveryDate: new Date().toISOString().split("T")[0],
    salesInvoiceId: invoice.id,
    notes: "",
    lines: Object.values(groupedLines).map((g) => ({
      productId: g.productId,
      productName: g.productName || "Unknown Product",
      remainingQuantity: g.remainingQuantity,
      unitId: g.unitId,
      unitName: g.unitName || "unit",
      warehouseAllocations: [],
      allocated: 0,
    })),
  });

  const updateAllocation = (productId, warehouseId, qty) => {
    setFormData((prev) => {
      const newLines = prev.lines.map((line) => {
        if (line.productId !== productId) return line;

        const avail = stockMap[productId]?.[warehouseId] ?? 0;
        const maxAllowed = Math.min(
          line.remainingQuantity -
            line.allocated +
            (line.warehouseAllocations.find(
              (a) => a.warehouseId === warehouseId,
            )?.quantity || 0),
          avail,
        );

        const safeQty = Math.max(0, Math.min(qty, maxAllowed));

        let newAllocs = line.warehouseAllocations;
        const existing = newAllocs.find((a) => a.warehouseId === warehouseId);

        if (existing) {
          newAllocs = newAllocs.map((a) =>
            a.warehouseId === warehouseId ? { ...a, quantity: safeQty } : a,
          );
        } else if (safeQty > 0) {
          newAllocs = [...newAllocs, { warehouseId, quantity: safeQty }];
        }

        const total = newAllocs.reduce((s, a) => s + a.quantity, 0);

        return {
          ...line,
          warehouseAllocations: newAllocs,
          allocated: total,
        };
      });

      return { ...prev, lines: newLines };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Validation ───────────────────────────────────────────────
    const invalidLines = formData.lines.filter((line) => {
      const total = line.allocated;
      return (
        total > line.remainingQuantity ||
        (total === 0 && line.remainingQuantity > 0)
      );
    });

    if (invalidLines.length > 0) {
      alert(
        `Invalid allocation:\n` +
          invalidLines
            .map(
              (l) =>
                `• ${l.productName}: ${l.allocated}/${l.remainingQuantity}`,
            )
            .join("\n") +
          "\n\nAll remaining quantities must be fully (or partially) allocated.",
      );
      return;
    }

    if (formData.lines.every((l) => l.allocated === 0)) {
      alert("No items allocated – please enter quantities");
      return;
    }

    // ── Group allocations by warehouse ─────────────────────────────
    const allocationsByWarehouse = {};

    formData.lines.forEach((line) => {
      line.warehouseAllocations.forEach((alloc) => {
        if (alloc.quantity <= 0) return;

        if (!allocationsByWarehouse[alloc.warehouseId]) {
          allocationsByWarehouse[alloc.warehouseId] = [];
        }

        const originalLine = invoice.lines.find(
          (l) => l.productId === line.productId,
        );

        allocationsByWarehouse[alloc.warehouseId].push({
          salesInvoiceLineId: originalLine?.id || 0,
          quantity: alloc.quantity,
          notes: "", // or line.notes || ""
        });
      });
    });

    const warehouseIdsWithAllocations = Object.keys(allocationsByWarehouse).map(
      Number,
    );

    if (warehouseIdsWithAllocations.length === 0) {
      alert("No valid allocations found");
      return;
    }

    // ── Create one delivery per warehouse ──────────────────────────
    const createdDeliveries = [];
    let hasError = false;

    for (const warehouseId of warehouseIdsWithAllocations) {
      const linesForThisWarehouse = allocationsByWarehouse[warehouseId];

      const payload = {
        deliveryDate: formData.deliveryDate + "T12:00:00.000Z", // or use full ISO
        salesInvoiceId: formData.salesInvoiceId,
        warehouseId: warehouseId, // ← top-level warehouse
        notes: formData.notes
          ? `${formData.notes} (multi-warehouse delivery)`
          : "Delivery via frontend (multi-warehouse)",
        lines: linesForThisWarehouse,
      };

      console.log(
        `Sending delivery for warehouse ${warehouseId}:`,
        JSON.stringify(payload, null, 2),
      );

      try {
        const res = await fetch(`${API_BASE_URL}/api/sales/deliveries`, {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          let errorDetail = `HTTP ${res.status}`;
          try {
            const errBody = await res.json();
            errorDetail += ` - ${errBody.message || errBody.title || JSON.stringify(errBody)}`;
          } catch {
            errorDetail += ` - ${(await res.text()) || "No details"}`;
          }
          throw new Error(errorDetail);
        }

        const created = await res.json();
        createdDeliveries.push(created);
        console.log(`Delivery created for WH ${warehouseId}:`, created);
        onSave();
      } catch (err) {
        console.error("Delivery creation failed:", err);
        let msg = "Failed to create delivery";
        if (err.message) msg += `: ${err.message}`;
        alert(msg + "\nCheck browser console for full details.");
      }
    }

    // ── Final feedback ─────────────────────────────────────────────
    if (createdDeliveries.length > 0) {
      alert(`Successfully created ${createdDeliveries.length} delivery(ies)!`);
      // onSave(createdDeliveries); // ← maybe change onSave to accept array
      onClose();
    } else if (hasError) {
      alert("All delivery creations failed. Check console for details.");
    }
  };

  if (loadingStock) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <p className="text-lg font-medium">Loading warehouse stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">
            Create Delivery – {invoice.invoiceNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg text-sm">
          <p>
            <strong>Customer:</strong> {invoice.customerName}
          </p>
          <p>
            <strong>Invoice Total:</strong> ${invoice.grandTotal?.toFixed(2)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Delivery Date *
            </label>
            <input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) =>
                setFormData({ ...formData, deliveryDate: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="space-y-8">
            {formData.lines.map((line, idx) => {
              const remaining = line.remainingQuantity;
              const allocated = line.allocated;
              const left = remaining - allocated;

              return (
                <div key={idx} className="border rounded-lg p-5 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {line.productName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Remaining to deliver: <strong>{remaining}</strong>{" "}
                        {line.unitName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${left < 0 ? "text-red-600" : left === 0 ? "text-green-600" : "text-amber-600"}`}
                      >
                        Allocated: {allocated} / {remaining}
                      </p>
                      {left < 0 && (
                        <p className="text-red-600 text-xs mt-1">
                          Over-allocated!
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {warehouses.map((wh) => {
                      const avail = stockMap[line.productId]?.[wh.id] ?? 0;
                      const current =
                        line.warehouseAllocations.find(
                          (a) => a.warehouseId === wh.id,
                        )?.quantity || 0;
                      const maxPerWh = Math.min(
                        remaining - allocated + current,
                        avail,
                      );

                      return (
                        <div
                          key={wh.id}
                          className="bg-white p-4 rounded border shadow-sm"
                        >
                          <label className="block text-sm font-medium mb-2">
                            {wh.name} ({wh.code})
                          </label>
                          <p className="text-xs text-gray-600 mb-2">
                            Available:{" "}
                            <strong
                              className={
                                avail === 0 ? "text-red-600" : "text-green-600"
                              }
                            >
                              {avail}
                            </strong>{" "}
                            {line.unitName}
                          </p>
                          <input
                            type="number"
                            min="0"
                            max={maxPerWh}
                            step="0.01"
                            value={current}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              updateAllocation(line.productId, wh.id, val);
                            }}
                            className={`w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 ${
                              current > avail
                                ? "border-red-500 bg-red-50"
                                : current > 0
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-300"
                            }`}
                          />
                          {current > avail && (
                            <p className="text-red-600 text-xs mt-1">
                              Exceeds available stock ({avail})
                            </p>
                          )}
                          {current > maxPerWh && current <= avail && (
                            <p className="text-amber-600 text-xs mt-1">
                              Exceeds remaining on invoice
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}