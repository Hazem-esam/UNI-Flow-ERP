import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  TrendingUp,
  Loader,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import OverviewTab from "./tabs/OverviewTab";
import InvoicesTab from "./tabs/InvoicesTab";
import CustomersTab from "./tabs/CustomersTab";
import DeliveriesTab from "./tabs/DeliveriesTab";
import ReceiptsTab from "./tabs/ReceiptsTab";
import ReturnsTab from "./tabs/ReturnsTab";

import CustomerModal from "./modals/CustomerModal";
import InvoiceModal from "./modals/InvoiceModal";
import DeliveryModal from "./modals/DeliveryModal";
import ReceiptModal from "./modals/ReceiptModal";
import ReturnModal from "./modals/ReturnModal";
import ViewInvoiceModal from "./modals/ViewInvoiceModal";

import {
  getAuthHeaders,
  getDisplayStatus,
  getStatusStyle,
} from "./utils/salesHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5225";

export default function SalesModule() {
  const { user } = useContext(AuthContext);
  const handleAction = async (type, id, action) => {
    const actions = {
      delivery: {
        post: `/api/sales/deliveries/${id}/post`,
        cancel: `/api/sales/deliveries/${id}/cancel`,
        delete: `/api/sales/deliveries/${id}`,
      },
      receipt: {
        post: `/api/sales/receipts/${id}/post`,
        cancel: `/api/sales/receipts/${id}/cancel`,
        delete: `/api/sales/receipts/${id}`,
      },
      return: {
        post: `/api/sales/returns/${id}/post`,
        cancel: `/api/sales/returns/${id}/cancel`,
        delete: `/api/sales/returns/${id}`,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${actions[type][action]}`, {
        method: action === "delete" ? "DELETE" : "POST",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        await fetchAllData(); // REFETCH ALL DATA
        showSuccess(
          `${type.charAt(0).toUpperCase() + type.slice(1)} ${action}ed!`,
        );
      }
    } catch (err) {
      console.error(`Error ${action}ing ${type}:`, err);
    }
  };
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Data
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [returns, setReturns] = useState([]);

  const [hasInventoryModule, setHasInventoryModule] = useState(false);

  // UI / Modals
  const [searchQuery, setSearchQuery] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await checkModuleSubscription();
      await Promise.all([
        fetchCustomers(),
        fetchInvoices(),
        fetchDeliveries(),
        fetchReceipts(),
        fetchReturns(),
      ]);
    } catch (err) {
      console.error(err);
      setError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const checkModuleSubscription = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/company-modules`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const modules = await res.json();
      const invModule = modules.find(
        (m) => m.moduleKey === "INVENTORY" && m.isEnabled,
      );
      setHasInventoryModule(!!invModule);
      if (invModule) await fetchInventoryData();
    } catch (err) {
      console.error("Module check failed:", err);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const [p, w, u, c] = await Promise.all([
        fetch(`${API_BASE_URL}/api/Products`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/api/Warehouses`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/api/Category`, { headers: getAuthHeaders() }),
      ]);
      if (p.ok) setProducts(await p.json());
      if (w.ok) setWarehouses(await w.json());
      if (u.ok) setUnits(await u.json());
      if (c.ok) setCategories(await c.json());
    } catch (err) {
      console.error("Inventory data fetch failed:", err);
    }
  };

  // ───────────────────────────────────────
  //  Fetch functions (shortened)
  // ───────────────────────────────────────

  const fetchCustomers = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/sales/Customers?isActive=true`,
        {
          headers: getAuthHeaders(),
        },
      );
      if (res.ok) setCustomers(await res.json());
    } catch {}
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/invoices`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setInvoices(await res.json());
    } catch {}
  };

  const fetchDeliveries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/deliveries`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setDeliveries(await res.json());
    } catch {}
  };

  const fetchReceipts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/receipts`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setReceipts(await res.json());
    } catch {}
  };

  const fetchReturns = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/returns`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const list = await res.json();
      const detailed = await Promise.all(
        list.map(async (r) => {
          const det = await fetch(`${API_BASE_URL}/api/sales/returns/${r.id}`, {
            headers: getAuthHeaders(),
          });
          return det.ok ? await det.json() : null;
        }),
      );
      setReturns(detailed.filter(Boolean));
    } catch {}
  };

  // ───────────────────────────────────────
  //  CRUD Handlers (moved logic here)
  // ───────────────────────────────────────

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      const response = await fetch(
        editingItem
          ? `${API_BASE_URL}/api/sales/Customers/${editingItem.id}`
          : `${API_BASE_URL}/api/sales/Customers`,
        {
          method: editingItem ? "PUT" : "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(customerData),
        },
      );
      if (response.ok) {
        await fetchAllData(); // REFETCH ALL DATA
        setShowCustomerModal(false);
        setEditingItem(null);
        showSuccess(editingItem ? "Customer updated!" : "Customer created!");
      }
    } catch (err) {
      console.error("Error saving customer:", err);
      alert("Failed to save customer");
    }
  };
  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sales/Customers/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );
      if (response.ok) {
        await fetchAllData(); // REFETCH ALL DATA
        showSuccess("Customer deleted!");
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };
  const handleSaveInvoice = async (invoiceData) => {
    try {
      // Process lines and create products/units as needed
      const processedLines = await Promise.all(
        invoiceData.lines.map(async (line) => {
          let productId = line.productId ? parseInt(line.productId) : null;
          let unitId = line.unitId ? parseInt(line.unitId) : null;

          // If we don't have IDs but have names, create them
          if (!productId && line.productName) {
            console.log(
              `Auto-creating: "${line.productName}" (${line.unitName})`,
            );

            try {
              const created = await createProductFromManualEntry(
                line.productName,
                line.unitName || "unit",
              );
              productId = created.productId;
              unitId = created.unitId;
              console.log(
                `✓ Created product ID ${productId}, unit ID ${unitId}`,
              );
            } catch (createErr) {
              throw new Error(
                `Failed to create product "${line.productName}": ${createErr.message}`,
              );
            }
          }

          const processedLine = {
            productId: productId,
            unitId: unitId,
            quantity: parseFloat(line.quantity),
            unitPrice: parseFloat(line.unitPrice),
            discountPercent: parseFloat(line.discountPercent) || 0,
            taxPercent: parseFloat(line.taxPercent) || 0,
            notes: line.notes || "",
          };

          if (editingItem && line.id) {
            processedLine.id = line.id;
          }

          return processedLine;
        }),
      );

      const payload = {
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        customerId: parseInt(invoiceData.customerId),
        notes: invoiceData.notes || "",
        lines: processedLines,
      };

      console.log("Sending invoice:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        editingItem
          ? `${API_BASE_URL}/api/sales/invoices/${editingItem.id}`
          : `${API_BASE_URL}/api/sales/invoices`,
        {
          method: editingItem ? "PUT" : "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        await fetchAllData();
        setShowInvoiceModal(false);
        setEditingItem(null);

        const hasAutoCreated = invoiceData.lines.some(
          (line) => !line.productId && line.productName,
        );

        showSuccess(
          editingItem
            ? "Invoice updated!"
            : hasAutoCreated
              ? "Invoice created! (New products added to inventory)"
              : "Invoice created!",
        );
      } else {
        const error = await response.text();
        console.error("API Error:", error);
        throw new Error(error);
      }
    } catch (err) {
      console.error("Error saving invoice:", err);
      alert(`Failed to save invoice: ${err.message}`);
    }
  };
  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/invoices/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        await fetchAllData(); // REFETCH ALL DATA
        showSuccess("Invoice deleted!");
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
    }
  };
  const handlePostInvoice = async (id) => {
    if (!window.confirm("Post this invoice?")) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sales/invoices/${id}/post`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );
      if (response.ok) {
        await fetchAllData(); // REFETCH ALL DATA
        showSuccess("Invoice posted!");
      }
    } catch (err) {
      console.error("Error posting invoice:", err);
    }
  };
  const handleCancelInvoice = async (id) => {
    if (!window.confirm("Cancel this invoice?")) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sales/invoices/${id}/cancel`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );
      if (response.ok) {
        await fetchAllData(); // REFETCH ALL DATA
        showSuccess("Invoice cancelled!");
      }
    } catch (err) {
      console.error("Error cancelling invoice:", err);
    }
  };
  const handleViewInvoice = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/invoices/${id}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const invoice = await response.json();
        setSelectedInvoice(invoice);
        setShowViewModal(true);
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
    }
  };
  const handleSaveDelivery = async (deliveryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/deliveries`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(deliveryData),
      });
      if (response.ok) {
        await fetchAllData(); // REFETCH ALL DATA
        setShowDeliveryModal(false);
        setSelectedInvoice(null);
        showSuccess("Delivery created!");
      }
    } catch (err) {
      console.error("Error saving delivery:", err);
      alert("Failed to save delivery");
    }
  };
  const handleSaveReceipt = async (receiptData) => {
    try {
      console.log("Sending receipt:", JSON.stringify(receiptData, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/sales/receipts`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(receiptData), // receiptData now includes branchId
      });

      if (response.ok) {
        const createdReceipt = await response.json();
        console.log("Receipt created successfully:", createdReceipt);
        await fetchAllData(); // REFETCH ALL DATA
        setShowReceiptModal(false);
        setSelectedInvoice(null);
        showSuccess(
          `Receipt ${createdReceipt.receiptNumber || "#" + createdReceipt.id} created!`,
        );
      } else {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorDetails = await response.json();
            console.error("Receipt error:", errorDetails);

            if (errorDetails.errors) {
              const errorMessages = Object.entries(errorDetails.errors)
                .map(
                  ([key, values]) =>
                    `${key}: ${Array.isArray(values) ? values.join(", ") : values}`,
                )
                .join("\n");
              errorMsg = `Validation errors:\n${errorMessages}`;
            } else if (errorDetails.title) {
              errorMsg = errorDetails.title;
            }
          } else {
            const textError = await response.text();
            errorMsg += `: ${textError}`;
          }
        } catch (e) {
          // ignore
        }

        console.error("Receipt creation failed:", errorMsg);
        alert(`Failed to create receipt:\n\n${errorMsg}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert(`Network error:\n${err.message}`);
    }
  };
  const handleSaveReturn = async (returnData) => {
    try {
      console.log("Sending return:", JSON.stringify(returnData, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/sales/returns`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(returnData),
      });

      if (response.ok) {
        await fetchAllData(); // REFETCH ALL DATA
        setShowReturnModal(false);
        showSuccess("Return created! (Products auto-created if needed)");
      } else {
        const error = await response.text();
        console.error("API Error:", error);
        throw new Error(error);
      }
    } catch (err) {
      console.error("Error saving return:", err);
      alert(`Failed to save return: ${err.message}`);
    }
  };
  const handleCreateProductFromInvoice = async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Products`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          code: productData.code || "",
          name: productData.name,
          description: productData.description || "",
          categoryId: productData.categoryId
            ? parseInt(productData.categoryId)
            : null,
          unitOfMeasureId: parseInt(productData.unitOfMeasureId),
          defaultPrice: parseFloat(productData.defaultPrice) || 0,
          barcode: productData.barcode || "",
        }),
      });

      if (response.ok) {
        const createdProduct = await response.json();
        await fetchInventoryData(); // Refresh products list
        return createdProduct;
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (err) {
      console.error("Error creating product:", err);
      throw err;
    }
  };
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-16 h-16 text-green-600 animate-spin" />
      </div>
    );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchAllData}
            className="px-6 py-3 bg-green-600 text-white rounded-lg"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {!hasInventoryModule && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
            <AlertCircle className="inline w-5 h-5 text-amber-600 mr-2" />
            <strong>Manual Entry Mode</strong> — Inventory module is disabled.
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Sales Module</h1>
            <p className="text-gray-600">Manage invoices, customers & sales</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md overflow-x-auto">
          {[
            "overview",
            "invoices",
            "customers",
            ...(hasInventoryModule ? ["deliveries"] : []),
            "receipts",
            ...(hasInventoryModule ? ["returns"] : []),
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <OverviewTab
            totalRevenue={invoices.reduce((s, i) => s + (i.grandTotal || 0), 0)}
            totalCustomers={customers.length}
            postedInvoices={
              invoices.filter(
                (i) => i.status !== "Draft" && i.status !== "Cancelled",
              ).length
            }
            draftInvoices={invoices.filter((i) => i.status === "Draft").length}
            invoices={invoices}
          />
        )}

        {activeTab === "invoices" && (
          <InvoicesTab
            invoices={invoices.filter((i) =>
              i.customerName?.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            deliveries={deliveries}
            receipts={receipts}
            onAdd={() => {
              setEditingItem(null);
              setShowInvoiceModal(true);
            }}
            onView={(id) => {
              fetch(`${API_BASE_URL}/api/sales/invoices/${id}`, {
                headers: getAuthHeaders(),
              })
                .then((r) => (r.ok ? r.json() : Promise.reject()))
                .then(setSelectedInvoice)
                .then(() => setShowViewModal(true))
                .catch(() => alert("Cannot load invoice"));
            }}
            onEdit={(inv) => {
              setEditingItem(inv);
              setShowInvoiceModal(true);
            }}
            onDelete={handleDeleteInvoice}
            onPost={handlePostInvoice}
            onCancel={handleCancelInvoice}
            onCreateDelivery={(inv) => {
              fetch(`${API_BASE_URL}/api/sales/invoices/${inv.id}`, {
                headers: getAuthHeaders(),
              })
                .then((res) => {
                  if (!res.ok)
                    throw new Error(`Failed to load invoice: ${res.status}`);
                  return res.json();
                })
                .then((fullInvoice) => {
                  if (!fullInvoice.lines || fullInvoice.lines.length === 0) {
                    alert("This invoice has no lines or cannot be delivered.");
                    return;
                  }
                  const hasRemaining = fullInvoice.lines.some(
                    (line) =>
                      (line.remainingQuantity || line.quantity || 0) > 0,
                  );
                  if (!hasRemaining) {
                    alert(
                      "Nothing left to deliver (all quantities already delivered).",
                    );
                    return;
                  }
                  setSelectedInvoice(fullInvoice);
                  setShowDeliveryModal(true);
                })
                .catch((err) => {
                  console.error("Cannot open delivery modal:", err);
                  alert(
                    "Failed to load invoice details for delivery.\n" +
                      err.message,
                  );
                });
            }}
            onCreateReceipt={(inv) => {
              fetch(`${API_BASE_URL}/api/sales/invoices/${inv.id}`, {
                headers: getAuthHeaders(),
              })
                .then((res) => {
                  if (!res.ok)
                    throw new Error(`Cannot load invoice: ${res.status}`);
                  return res.json();
                })
                .then((fullInvoice) => {
                  if (!fullInvoice.customerId) {
                    alert(
                      "Cannot record payment: Customer ID missing from invoice.",
                    );
                    return;
                  }
                  const balanceDue = parseFloat(
                    fullInvoice.balanceDue || fullInvoice.grandTotal || 0,
                  );
                  if (balanceDue <= 0) {
                    alert(
                      "This invoice is already fully paid or has no balance due.",
                    );
                    return;
                  }
                  setSelectedInvoice(fullInvoice);
                  setShowReceiptModal(true);
                })
                .catch((err) => {
                  console.error("Failed to load invoice for receipt:", err);
                  alert("Cannot open payment modal: " + err.message);
                });
            }}
            hasInventoryModule={hasInventoryModule}
          />
        )}

        {activeTab === "customers" && (
          <CustomersTab
            customers={customers.filter((c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAdd={() => {
              setEditingItem(null);
              setShowCustomerModal(true);
            }}
            onEdit={(c) => {
              setEditingItem(c);
              setShowCustomerModal(true);
            }}
            onDelete={handleDeleteCustomer}
          />
        )}

        {activeTab === "deliveries" && hasInventoryModule && (
          <DeliveriesTab
            deliveries={deliveries}
            invoices={invoices}
            warehouses={warehouses}
            hasInventoryModule={hasInventoryModule}
            onPost={(id) => handleAction("delivery", id, "post")}
            onCancel={(id) => handleAction("delivery", id, "cancel")}
            onDelete={(id) => handleAction("delivery", id, "delete")}
          />
        )}

        {activeTab === "receipts" && (
          <ReceiptsTab
            receipts={receipts}
            onPost={(id) => handleAction("receipt", id, "post")}
            onCancel={(id) => handleAction("receipt", id, "cancel")}
            onDelete={(id) => handleAction("receipt", id, "delete")}
          />
        )}

        {activeTab === "returns" && hasInventoryModule && (
          <ReturnsTab
            returns={returns}
            onAdd={() => setShowReturnModal(true)}
            onPost={(id) => handleAction("return", id, "post")}
            onCancel={(id) => handleAction("return", id, "cancel")}
            onDelete={(id) => handleAction("return", id, "delete")}
          />
        )}

        {/* ─── Modals ─── */}
        {showCustomerModal && (
          <CustomerModal
            customer={editingItem}
            onSave={handleSaveCustomer}
            onClose={() => {
              setShowCustomerModal(false);
              setEditingItem(null);
            }}
          />
        )}

        {showInvoiceModal && (
          <InvoiceModal
            invoice={editingItem}
            customers={customers}
            products={products}
            units={units}
            categories={categories}
            hasInventoryModule={hasInventoryModule}
            onSave={handleSaveInvoice}
            onClose={() => {
              setShowInvoiceModal(false);
              setEditingItem(null);
            }}
            onCreateProduct={handleCreateProductFromInvoice}
          />
        )}

        {showDeliveryModal && selectedInvoice && hasInventoryModule && (
          <DeliveryModal
            invoice={selectedInvoice}
            warehouses={warehouses}
            getAuthHeaders={getAuthHeaders}
            onClose={() => {
              setShowDeliveryModal(false);
              setSelectedInvoice(null);
              fetchDeliveries();
            }}
            onSave={fetchDeliveries}
          />
        )}

        {showReceiptModal && selectedInvoice && (
          <ReceiptModal
            invoice={selectedInvoice}
            onSave={handleSaveReceipt}
            onClose={() => {
              setShowReceiptModal(false);
              setSelectedInvoice(null);
            }}
          />
        )}

        {showReturnModal && hasInventoryModule && (
          <ReturnModal
            customers={customers}
            invoices={invoices}
            products={products}
            warehouses={warehouses}
            units={units}
            hasInventoryModule={hasInventoryModule}
            onSave={handleSaveReturn}
            onClose={() => setShowReturnModal(false)}
            getAuthHeaders={getAuthHeaders}
            API_BASE_URL={API_BASE_URL}
          />
        )}

        {showViewModal && selectedInvoice && (
          <ViewInvoiceModal
            invoice={selectedInvoice}
            onClose={() => {
              setShowViewModal(false);
              setSelectedInvoice(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
