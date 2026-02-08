import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import PermissionGuard from "../../components/Permissionguard";
import {
  TrendingUp,
  Loader,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Lock,
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

import { createProductFromManualEntry } from "./utils/Createproductfrommanualentry.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5225";

export default function SalesModule() {
  const { user, hasPermission, hasAnyPermission } = useContext(AuthContext);

  // Check if user has ANY sales permission to access the module
  const hasSalesAccess = hasAnyPermission([
    "sales.invoices.read",
    "sales.invoices.access",
    "sales.invoices.manage",
    "sales.customers.read",
    "sales.customers.access",
    "sales.customers.manage",
    "sales.deliveries.read",
    "sales.deliveries.access",
    "sales.deliveries.manage",
    "sales.receipts.read",
    "sales.receipts.access",
    "sales.receipts.manage",
    "sales.returns.read",
    "sales.returns.access",
    "sales.returns.manage",
  ]);

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
        await fetchAllData();
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
    if (hasSalesAccess) {
      fetchAllData();
    }
  }, [hasSalesAccess]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await checkModuleSubscription();
      await Promise.all(
        [
          hasPermission("sales.customers.read") && fetchCustomers(),
          hasPermission("sales.invoices.read") && fetchInvoices(),
          hasPermission("sales.deliveries.read") && fetchDeliveries(),
          hasPermission("sales.receipts.read") && fetchReceipts(),
          hasPermission("sales.returns.read") && fetchReturns(),
        ].filter(Boolean),
      );
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

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // ───────────────────────────────────────
  //  Invoice Handler Functions
  // ───────────────────────────────────────

  const handleAddInvoice = () => {
    if (hasAnyPermission(["sales.invoices.manage", "sales.invoices.access"])) {
      setEditingItem(null);
      setShowInvoiceModal(true);
    } else {
      alert("You don't have permission to create invoices");
    }
  };

  const handleEditInvoice = (inv) => {
    if (hasAnyPermission(["sales.invoices.manage", "sales.invoices.access"])) {
      setEditingItem(inv);
      setShowInvoiceModal(true);
    } else {
      alert("You don't have permission to edit invoices");
    }
  };

  const handleCreateDeliveryFromInvoice = (inv) => {
    if (!hasPermission("sales.deliveries.manage")) {
      alert("You don't have permission to create deliveries");
      return;
    }

    fetch(`${API_BASE_URL}/api/sales/invoices/${inv.id}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load invoice: ${res.status}`);
        return res.json();
      })
      .then((fullInvoice) => {
        if (!fullInvoice.lines || fullInvoice.lines.length === 0) {
          alert("This invoice has no lines or cannot be delivered.");
          return;
        }
        const hasRemaining = fullInvoice.lines.some(
          (line) => (line.remainingQuantity || line.quantity || 0) > 0,
        );
        if (!hasRemaining) {
          alert("Nothing left to deliver (all quantities already delivered).");
          return;
        }
        setSelectedInvoice(fullInvoice);
        setShowDeliveryModal(true);
      })
      .catch((err) => {
        console.error("Cannot open delivery modal:", err);
        alert("Failed to load invoice details for delivery.\n" + err.message);
      });
  };

  const handleCreateReceiptFromInvoice = (inv) => {
    if (!hasAnyPermission(["sales.receipts.manage", "sales.receipts.access"])) {
      alert("You don't have permission to create receipts");
      return;
    }

    fetch(`${API_BASE_URL}/api/sales/invoices/${inv.id}`, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Cannot load invoice: ${res.status}`);
        return res.json();
      })
      .then((fullInvoice) => {
        if (!fullInvoice.customerId) {
          alert("Cannot record payment: Customer ID missing from invoice.");
          return;
        }
        const balanceDue = parseFloat(
          fullInvoice.balanceDue || fullInvoice.grandTotal || 0,
        );
        if (balanceDue <= 0) {
          alert("This invoice is already fully paid or has no balance due.");
          return;
        }
        setSelectedInvoice(fullInvoice);
        setShowReceiptModal(true);
      })
      .catch((err) => {
        console.error("Failed to load invoice for receipt:", err);
        alert("Cannot open payment modal: " + err.message);
      });
  };

  // ───────────────────────────────────────
  //  Customer Handler Functions
  // ───────────────────────────────────────

  const handleAddCustomer = () => {
    if (
      hasAnyPermission(["sales.customers.manage", "sales.customers.access"])
    ) {
      setEditingItem(null);
      setShowCustomerModal(true);
    } else {
      alert("You don't have permission to create customers");
    }
  };

  const handleEditCustomer = (c) => {
    if (
      hasAnyPermission(["sales.customers.manage", "sales.customers.access"])
    ) {
      setEditingItem(c);
      setShowCustomerModal(true);
    } else {
      alert("You don't have permission to edit customers");
    }
  };

  // ───────────────────────────────────────
  //  Returns Handler Functions
  // ───────────────────────────────────────

  const handleAddReturn = () => {
    if (hasAnyPermission(["sales.returns.manage", "sales.returns.access"])) {
      setShowReturnModal(true);
    } else {
      alert("You don't have permission to create returns");
    }
  };

  // ───────────────────────────────────────
  //  CRUD Handlers
  // ───────────────────────────────────────

  const handleSaveCustomer = async (customerData) => {
    if (
      !hasAnyPermission(["sales.customers.manage", "sales.customers.access"])
    ) {
      alert("You don't have permission to manage customers");
      return;
    }

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
        await fetchAllData();
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
    if (
      !hasAnyPermission(["sales.customers.manage", "sales.customers.access"])
    ) {
      alert("You don't have permission to delete customers");
      return;
    }

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
        await fetchAllData();
        showSuccess("Customer deleted!");
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  const handleSaveInvoice = async (invoiceData) => {
    if (!hasAnyPermission(["sales.invoices.manage", "sales.invoices.access"])) {
      alert("You don't have permission to manage invoices");
      return;
    }

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
    if (!hasAnyPermission(["sales.invoices.manage", "sales.invoices.access"])) {
      alert("You don't have permission to delete invoices");
      return;
    }

    if (!window.confirm("Delete this invoice?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/invoices/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        await fetchAllData();
        showSuccess("Invoice deleted!");
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
    }
  };

  const handlePostInvoice = async (id) => {
    if (!hasPermission("sales.invoices.manage")) {
      alert("Only users with manage permission can post invoices");
      return;
    }

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
        await fetchAllData();
        showSuccess("Invoice posted!");
      }
    } catch (err) {
      console.error("Error posting invoice:", err);
    }
  };

  const handleCancelInvoice = async (id) => {
    if (!hasAnyPermission(["sales.invoices.manage", "sales.invoices.access"])) {
      alert("You don't have permission to cancel invoices");
      return;
    }

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
        await fetchAllData();
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
    if (!hasPermission("sales.deliveries.manage")) {
      alert("Only users with manage permission can create deliveries");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/deliveries`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(deliveryData),
      });
      if (response.ok) {
        await fetchAllData();
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
    if (!hasAnyPermission(["sales.receipts.manage", "sales.receipts.access"])) {
      alert("You don't have permission to create receipts");
      return;
    }

    try {
      console.log("Sending receipt:", JSON.stringify(receiptData, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/sales/receipts`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(receiptData),
      });

      if (response.ok) {
        const createdReceipt = await response.json();
        console.log("Receipt created successfully:", createdReceipt);
        await fetchAllData();
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
    if (!hasAnyPermission(["sales.returns.manage", "sales.returns.access"])) {
      alert("You don't have permission to create returns");
      return;
    }

    try {
      console.log("Sending return:", JSON.stringify(returnData, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/sales/returns`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(returnData),
      });

      if (response.ok) {
        await fetchAllData();
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
        await fetchInventoryData();
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

  // Show access denied if user has no sales permissions
  if (!hasSalesAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 p-6">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
          <Lock className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the Sales module.
          </p>
          <p className="text-sm text-gray-500">
            Contact your administrator to request access.
          </p>
        </div>
      </div>
    );
  }

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

  // Determine available tabs based on permissions
  const availableTabs = [
    { key: "overview", label: "Overview", permission: null }, // Overview always visible
    {
      key: "invoices",
      label: "Invoices",
      permission: "sales.invoices.read",
    },
    {
      key: "customers",
      label: "Customers",
      permission: "sales.customers.read",
    },
    ...(hasInventoryModule
      ? [
          {
            key: "deliveries",
            label: "Deliveries",
            permission: "sales.deliveries.read",
          },
        ]
      : []),
    {
      key: "receipts",
      label: "Receipts",
      permission: "sales.receipts.read",
    },
    ...(hasInventoryModule
      ? [
          {
            key: "returns",
            label: "Returns",
            permission: "sales.returns.read",
          },
        ]
      : []),
  ].filter((tab) => !tab.permission || hasPermission(tab.permission));

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
            <AlertTriangle className="inline w-5 h-5 text-amber-600 mr-2" />
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
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
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
          <PermissionGuard permission="sales.invoices.read" fullScreen={true}>
            <InvoicesTab
              invoices={invoices.filter((i) =>
                i.customerName
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase()),
              )}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              deliveries={deliveries}
              receipts={receipts}
              onAdd={handleAddInvoice}
              onView={handleViewInvoice}
              onEdit={handleEditInvoice}
              onDelete={handleDeleteInvoice}
              onPost={handlePostInvoice}
              onCancel={handleCancelInvoice}
              onCreateDelivery={handleCreateDeliveryFromInvoice}
              onCreateReceipt={handleCreateReceiptFromInvoice}
              hasInventoryModule={hasInventoryModule}
              canDraft={hasAnyPermission([
                "sales.invoices.manage",
                "sales.invoices.access",
              ])}
              canPost={hasPermission("sales.invoices.manage")}
            />
          </PermissionGuard>
        )}

        {activeTab === "customers" && (
          <PermissionGuard permission="sales.customers.read" fullScreen={true}>
            <CustomersTab
              customers={customers.filter((c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()),
              )}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAdd={handleAddCustomer}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
              canManage={hasAnyPermission([
                "sales.customers.manage",
                "sales.customers.access",
              ])}
            />
          </PermissionGuard>
        )}

        {activeTab === "deliveries" && hasInventoryModule && (
          <PermissionGuard permission="sales.deliveries.read" fullScreen={true}>
            <DeliveriesTab
              deliveries={deliveries}
              invoices={invoices}
              warehouses={warehouses}
              hasInventoryModule={hasInventoryModule}
              onPost={(id) => {
                if (hasPermission("sales.deliveries.manage")) {
                  handleAction("delivery", id, "post");
                } else {
                  alert(
                    "Only users with manage permission can post deliveries",
                  );
                }
              }}
              onCancel={(id) => {
                if (hasPermission("sales.deliveries.manage")) {
                  handleAction("delivery", id, "cancel");
                } else {
                  alert(
                    "Only users with manage permission can cancel deliveries",
                  );
                }
              }}
              onDelete={(id) => {
                if (hasPermission("sales.deliveries.manage")) {
                  handleAction("delivery", id, "delete");
                } else {
                  alert(
                    "Only users with manage permission can delete deliveries",
                  );
                }
              }}
              canManage={hasPermission("sales.deliveries.manage")}
            />
          </PermissionGuard>
        )}

        {activeTab === "receipts" && (
          <PermissionGuard permission="sales.receipts.read" fullScreen={true}>
            <ReceiptsTab
              receipts={receipts}
              onPost={(id) => {
                if (hasPermission("sales.receipts.manage")) {
                  handleAction("receipt", id, "post");
                } else {
                  alert("Only users with manage permission can post receipts");
                }
              }}
              onCancel={(id) => {
                if (
                  hasAnyPermission([
                    "sales.receipts.manage",
                    "sales.receipts.access",
                  ])
                ) {
                  handleAction("receipt", id, "cancel");
                } else {
                  alert("You don't have permission to cancel receipts");
                }
              }}
              onDelete={(id) => {
                if (
                  hasAnyPermission([
                    "sales.receipts.manage",
                    "sales.receipts.access",
                  ])
                ) {
                  handleAction("receipt", id, "delete");
                } else {
                  alert("You don't have permission to delete receipts");
                }
              }}
              canDraft={hasAnyPermission([
                "sales.receipts.manage",
                "sales.receipts.access",
              ])}
              canPost={hasPermission("sales.receipts.manage")}
            />
          </PermissionGuard>
        )}

        {activeTab === "returns" && hasInventoryModule && (
          <PermissionGuard permission="sales.returns.read" fullScreen={true}>
            <ReturnsTab
              returns={returns}
              onAdd={handleAddReturn}
              onPost={(id) => {
                if (hasPermission("sales.returns.manage")) {
                  handleAction("return", id, "post");
                } else {
                  alert("Only users with manage permission can post returns");
                }
              }}
              onCancel={(id) => {
                if (
                  hasAnyPermission([
                    "sales.returns.manage",
                    "sales.returns.access",
                  ])
                ) {
                  handleAction("return", id, "cancel");
                } else {
                  alert("You don't have permission to cancel returns");
                }
              }}
              onDelete={(id) => {
                if (
                  hasAnyPermission([
                    "sales.returns.manage",
                    "sales.returns.access",
                  ])
                ) {
                  handleAction("return", id, "delete");
                } else {
                  alert("You don't have permission to delete returns");
                }
              }}
              canDraft={hasAnyPermission([
                "sales.returns.manage",
                "sales.returns.access",
              ])}
              canPost={hasPermission("sales.returns.manage")}
            />
          </PermissionGuard>
        )}

        {/* Modals */}
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
