// ============================================
// SALES MODULE - ENHANCED VERSION
// Features:
// - Comprehensive data refetching after all operations
// - Manual product/unit entry when Inventory Module is disabled
// - Improved error handling and user feedback
// ============================================
import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  TrendingUp,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  FileText,
  Users,
  Package,
  Loader,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle,
  Send,
  Ban,
  Truck,
  X,
  CreditCard,
  Download,
  CheckCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Calendar,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5225";

// Helper function for status
const getStatusInfo = (status) => {
  const statusMap = {
    Draft: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: Clock },
    Posted: {
      label: "Posted",
      color: "bg-blue-100 text-blue-700",
      icon: CheckCircle2,
    },
    "Partially Paid": {
      label: "Partially Paid",
      color: "bg-yellow-100 text-yellow-700",
      icon: DollarSign,
    },
    Paid: {
      label: "Paid",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    },
    Cancelled: {
      label: "Cancelled",
      color: "bg-red-100 text-red-700",
      icon: XCircle,
    },
  };
  return statusMap[status] || statusMap["Draft"];
};

export default function SalesModule() {
  // Helper: Create or find unit by name
  // Helper: Create or find unit by name
  const createOrFindUnit = async (unitName) => {
    try {
      console.log(`[CREATE UNIT] Searching for: "${unitName}"`);

      const response = await fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const units = await response.json();
        console.log(`[CREATE UNIT] Found ${units.length} existing units`);

        const existingUnit = units.find(
          (u) =>
            u.name.toLowerCase() === unitName.toLowerCase() ||
            u.symbol.toLowerCase() === unitName.toLowerCase(),
        );

        if (existingUnit) {
          console.log(
            `[CREATE UNIT] ✓ Using existing: ${existingUnit.name} (ID: ${existingUnit.id})`,
          );
          return existingUnit.id;
        }
      }

      // Create new unit
      console.log(`[CREATE UNIT] Creating new unit: "${unitName}"`);

      const createResponse = await fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: unitName,
          symbol: unitName.toLowerCase().substring(0, 5),
        }),
      });

      if (createResponse.ok) {
        const newUnit = await createResponse.json();
        const unitId = newUnit.id || newUnit;
        console.log(`[CREATE UNIT] ✓ Created with ID: ${unitId}`);
        return unitId;
      }

      throw new Error("Failed to create unit");
    } catch (err) {
      console.error("[CREATE UNIT] Error:", err);
      throw err;
    }
  };
  const createProductFromManualEntry = async (productName, unitName) => {
    try {
      console.log(`[CREATE PRODUCT] Starting: "${productName}" (${unitName})`);

      const unitId = await createOrFindUnit(unitName);
      console.log(`[CREATE PRODUCT] ✓ Unit ID: ${unitId}`);

      // FIXED: Generate UNIQUE code using timestamp + random number
      const uniqueCode = `AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const productPayload = {
        code: uniqueCode, // FIXED: Unique code instead of empty string
        name: productName,
        description: "Auto-created from invoice",
        categoryId: null, // Null is allowed
        unitOfMeasureId: unitId,
        defaultPrice: 0,
        barcode: "",
      };

      console.log(
        "[CREATE PRODUCT] Payload:",
        JSON.stringify(productPayload, null, 2),
      );

      const response = await fetch(`${API_BASE_URL}/api/Products`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(productPayload),
      });

      console.log(`[CREATE PRODUCT] Response: ${response.status}`);

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorBody = await response.json();
            console.error("[CREATE PRODUCT] Error:", errorBody);

            if (errorBody.errors) {
              const errorMessages = Object.entries(errorBody.errors)
                .map(([field, messages]) => {
                  const msgArray = Array.isArray(messages)
                    ? messages
                    : [messages];
                  return `${field}: ${msgArray.join(", ")}`;
                })
                .join("\n");
              errorDetail = `Validation failed:\n${errorMessages}`;
            } else if (errorBody.title || errorBody.message) {
              errorDetail = errorBody.title || errorBody.message;
            }
          } else {
            const textError = await response.text();
            console.error("[CREATE PRODUCT] Error text:", textError);
            errorDetail = textError || errorDetail;
          }
        } catch (e) {
          console.error("[CREATE PRODUCT] Parse error:", e);
        }

        throw new Error(`Failed to create product: ${errorDetail}`);
      }

      const result = await response.json();
      const newProductId = result.id || result;
      console.log(
        `[CREATE PRODUCT] ✓ Success! ID: ${newProductId}, Code: ${uniqueCode}`,
      );

      return {
        productId: newProductId,
        unitId: unitId,
      };
    } catch (err) {
      console.error("[CREATE PRODUCT] FINAL ERROR:", err);
      throw err;
    }
  };
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ========== COMPREHENSIVE DATA FETCHING ==========
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
      console.error("Error fetching sales data:", err);
      setError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const checkModuleSubscription = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company-modules`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const modules = await response.json();
        console.log("Company modules:", modules);
        const inventoryModule = modules.find(
          (m) => m.moduleKey === "INVENTORY" && m.isEnabled,
        );
        setHasInventoryModule(!!inventoryModule);
        if (inventoryModule) {
          await fetchInventoryData();
        }
      }
    } catch (err) {
      console.error("Error checking modules:", err);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const [productsRes, warehousesRes, unitsRes, categoriesRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/Products`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/Warehouses`, {
            headers: getAuthHeaders(),
          }),
          fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
            headers: getAuthHeaders(),
          }),
          fetch(`${API_BASE_URL}/api/Category`, { headers: getAuthHeaders() }),
        ]);

      if (productsRes.ok) {
        const prods = await productsRes.json();
        console.log("Products loaded:", prods.length);
        setProducts(prods);
      }
      if (warehousesRes.ok) setWarehouses(await warehousesRes.json());
      if (unitsRes.ok) setUnits(await unitsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (err) {
      console.error("Error fetching inventory data:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sales/Customers?isActive=true`,
        {
          headers: getAuthHeaders(),
        },
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Customers loaded:", data.length);
        setCustomers(data);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/invoices`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Invoices from API:", data);
        setInvoices(data);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/deliveries`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) setDeliveries(await response.json());
    } catch (err) {
      console.error("Error fetching deliveries:", err);
    }
  };

  const fetchReceipts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/receipts`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) setReceipts(await response.json());
    } catch (err) {
      console.error("Error fetching receipts:", err);
    }
  };

  const fetchReturns = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/returns`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return;
      const returnsList = await response.json();

      const detailedReturns = await Promise.all(
        returnsList.map(async (ret) => {
          const res = await fetch(
            `${API_BASE_URL}/api/sales/returns/${ret.id}`,
            { headers: getAuthHeaders() },
          );
          return res.ok ? await res.json() : null;
        }),
      );

      setReturns(detailedReturns.filter(Boolean));
    } catch (err) {
      console.error("Error fetching return details:", err);
    }
  };

  // ========== CRUD OPERATIONS WITH REFETCH ==========

  // Customer CRUD
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

  // Invoice CRUD
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

  // Other handlers
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

  // NEW: Create product from invoice modal
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

  // Calculate stats
  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.grandTotal || 0),
    0,
  );
  const postedInvoices = invoices.filter(
    (i) => i.status !== "Draft" && i.status !== "Cancelled",
  ).length;
  const draftInvoices = invoices.filter((i) => i.status === "Draft").length;

  const filteredInvoices = invoices.filter((inv) =>
    inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-16 h-16 text-green-600 animate-spin" />
      </div>
    );
  }

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
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
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
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">
                  Manual Entry Mode
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Inventory Module is disabled. You can enter product names and
                  units of measurement manually when creating invoices.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Sales Module</h1>
              <p className="text-gray-600">
                Manage invoices, customers, and sales
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md overflow-x-auto">
          {[
            "overview",
            "invoices",
            "customers",
            ...(hasInventoryModule ? ["deliveries"] : []), // Only show if inventory enabled
            "receipts",
            ...(hasInventoryModule ? ["returns"] : []), // Only show if inventory enabled
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

        {activeTab === "overview" && (
          <OverviewTab
            totalRevenue={totalRevenue}
            totalCustomers={customers.length}
            postedInvoices={postedInvoices}
            draftInvoices={draftInvoices}
            invoices={invoices}
          />
        )}

        {activeTab === "invoices" && (
          <InvoicesTab
            deliveries={deliveries}
            receipts={receipts}
            invoices={filteredInvoices}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAdd={() => {
              setEditingItem(null);
              setShowInvoiceModal(true);
            }}
            onView={handleViewInvoice}
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
            customers={filteredCustomers}
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

        {activeTab === "deliveries" && (
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

        {activeTab === "returns" && (
          <ReturnsTab
            returns={returns}
            onAdd={() => setShowReturnModal(true)}
            onPost={(id) => handleAction("return", id, "post")}
            onCancel={(id) => handleAction("return", id, "cancel")}
            onDelete={(id) => handleAction("return", id, "delete")}
          />
        )}
      </div>

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
          onClose={() => {
            setShowDeliveryModal(false);
            setSelectedInvoice(null);
          }}
          getAuthHeaders={getAuthHeaders}
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
  );
}

// ========== TAB COMPONENTS ==========

function OverviewTab({
  totalRevenue,
  totalCustomers,
  postedInvoices,
  draftInvoices,
  invoices,
}) {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      sales: 0,
      count: 0,
    };
  });

  invoices.forEach((inv) => {
    if (inv.invoiceDate) {
      const month = new Date(inv.invoiceDate).toLocaleDateString("en-US", {
        month: "short",
      });
      const item = last6Months.find((m) => m.month === month);
      if (item) {
        item.sales += inv.grandTotal || 0;
        item.count += 1;
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          color="green"
        />
        <StatsCard
          icon={FileText}
          label="Posted Invoices"
          value={postedInvoices}
          color="blue"
        />
        <StatsCard
          icon={Clock}
          label="Draft Invoices"
          value={draftInvoices}
          color="yellow"
        />
        <StatsCard
          icon={Users}
          label="Total Customers"
          value={totalCustomers}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Invoice Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Invoices" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, color }) {
  const colors = {
    green: "text-green-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <Icon className={`w-10 h-10 ${colors[color]} mb-4`} />
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InvoicesTab({
  invoices,
  searchQuery,
  setSearchQuery,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onPost,
  onCancel,
  onCreateDelivery,
  onCreateReceipt,
  hasInventoryModule,
  deliveries,
  receipts,
}) {
  // Status color & icon mapping
  const getStatusStyle = (status) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-700";
      case "Posted":
      case "Open":
        return "bg-blue-100 text-blue-700";
      case "Delivered":
        return "bg-purple-100 text-purple-700";
      case "Paid":
        return "bg-indigo-100 text-indigo-700";
      case "Completed":
        return "bg-green-100 text-green-700 font-semibold";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusInfo = (status) => {
    const displayStatus = getDisplayStatus({ status });
    const icons = {
      Draft: FileText,
      Posted: Send,
      Delivered: Truck,
      Paid: CreditCard,
      Completed: CheckCircle,
      Cancelled: Ban,
    };

    return {
      label: displayStatus,
      color: getStatusStyle(displayStatus),
      icon: icons[displayStatus] || FileText,
    };
  };

  const getDisplayStatus = (inv) => {
    if (inv.status === "Cancelled" || inv.status === "Completed") {
      return inv.status;
    }

    const hasDelivery = deliveries?.some((d) => d.salesInvoiceId === inv.id);
    const hasReceipt = receipts?.some((r) =>
      r.allocations?.some((a) => a.salesInvoiceId === inv.id),
    );

    const isFullyDelivered =
      inv.lines?.every((line) => (line.remainingQuantity || 0) <= 0) ?? false;

    const balanceDue = parseFloat(inv.balanceDue || 0);
    const grandTotal = parseFloat(inv.grandTotal || 0);
    const isFullyPaid = balanceDue <= 0 || (inv.totalPaid || 0) >= grandTotal;

    if (isFullyDelivered && isFullyPaid) {
      return "Completed";
    }
    if (isFullyDelivered) {
      return "Delivered";
    }
    if (isFullyPaid) {
      return "Paid";
    }

    return inv.status || "Draft";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-md flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          onClick={onAdd}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Invoice #
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Balance Due
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No invoices found. Click "New Invoice" to create one.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const statusInfo = getStatusInfo(inv.status);
                const StatusIcon = statusInfo.icon;
                const balanceDue = parseFloat(
                  inv.balanceDue || inv.grandTotal || 0,
                );

                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {inv.invoiceNumber || `#${inv.id}`}
                    </td>
                    <td className="px-6 py-4">{inv.customerName}</td>
                    <td className="px-6 py-4">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ${(inv.grandTotal || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        ${balanceDue.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(getDisplayStatus(inv))}`}
                      >
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {getDisplayStatus(inv)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onView(inv.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.status === "Draft" && (
                          <>
                            <button
                              onClick={() => onPost(inv.id)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded"
                              title="Post"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEdit(inv)}
                              className="p-2 hover:bg-green-50 text-green-600 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(inv.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {inv.status === "Posted" && (
                          <>
                            {hasInventoryModule && (
                              <button
                                onClick={() => onCreateDelivery(inv)}
                                className="p-2 hover:bg-purple-50 text-purple-600 rounded"
                                title="Create Delivery"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            )}
                            {balanceDue > 0 && (
                              <button
                                onClick={() => onCreateReceipt(inv)}
                                className="p-2 hover:bg-indigo-50 text-indigo-600 rounded"
                                title="Record Payment"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onCancel(inv.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded"
                              title="Cancel"
                            >
                              <Ban className="w-4 h-4" />
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
  );
}

function CustomersTab({
  customers,
  searchQuery,
  setSearchQuery,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-md flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          onClick={onAdd}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Customers</h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first customer
            </p>
            <button
              onClick={onAdd}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Customer
            </button>
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
            >
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="p-2 hover:bg-green-50 text-green-600 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{c.name}</h3>
              {c.email && <p className="text-sm text-gray-600">📧 {c.email}</p>}
              {c.phone && <p className="text-sm text-gray-600">📞 {c.phone}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DeliveriesTab({
  deliveries,
  invoices,
  warehouses,
  hasInventoryModule,
  onPost,
  onCancel,
  onDelete,
}) {
  const [expandedInvoices, setExpandedInvoices] = useState(new Set());
  const [groupByInvoice, setGroupByInvoice] = useState(true);

  // Group deliveries by invoice
  const groupedDeliveries = useMemo(() => {
    if (!groupByInvoice) {
      return deliveries.map((d) => ({
        invoiceId: d.salesInvoiceId,
        invoiceNumber: d.invoiceNumber,
        deliveries: [d],
      }));
    }

    const groups = {};

    deliveries.forEach((delivery) => {
      const key = delivery.salesInvoiceId || "no-invoice";

      if (!groups[key]) {
        const invoice = invoices.find((i) => i.id === delivery.salesInvoiceId);
        groups[key] = {
          invoiceId: delivery.salesInvoiceId,
          invoiceNumber:
            delivery.invoiceNumber ||
            invoice?.invoiceNumber ||
            `#${delivery.salesInvoiceId}`,
          customerName:
            invoice?.customerName ||
            delivery.customerName ||
            "Unknown Customer",
          invoiceAmount: invoice?.grandTotal || 0,
          deliveries: [],
        };
      }

      groups[key].deliveries.push(delivery);
    });

    return Object.values(groups).sort(
      (a, b) => (b.invoiceId || 0) - (a.invoiceId || 0),
    );
  }, [deliveries, invoices, groupByInvoice]);

  const toggleInvoice = (invoiceId) => {
    const newExpanded = new Set(expandedInvoices);
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId);
    } else {
      newExpanded.add(invoiceId);
    }
    setExpandedInvoices(newExpanded);
  };

  const toggleAll = () => {
    if (expandedInvoices.size === groupedDeliveries.length) {
      setExpandedInvoices(new Set());
    } else {
      setExpandedInvoices(new Set(groupedDeliveries.map((g) => g.invoiceId)));
    }
  };

  if (!hasInventoryModule) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Inventory Module Required</h3>
        <p className="text-gray-600">
          Enable the Inventory module to create and manage deliveries
        </p>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Deliveries Yet</h3>
        <p className="text-gray-600">
          Deliveries will appear here once you create them from invoices
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-xl p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={groupByInvoice}
              onChange={(e) => setGroupByInvoice(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Group by Invoice
            </span>
          </label>

          {groupByInvoice && (
            <button
              onClick={toggleAll}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {expandedInvoices.size === groupedDeliveries.length
                ? "Collapse All"
                : "Expand All"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-600">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-gray-600">Posted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-gray-600">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Grouped Deliveries */}
      <div className="space-y-3">
        {groupedDeliveries.map((group) => (
          <DeliveryGroup
            key={group.invoiceId}
            group={group}
            expanded={expandedInvoices.has(group.invoiceId)}
            onToggle={() => toggleInvoice(group.invoiceId)}
            warehouses={warehouses}
            onPost={onPost}
            onCancel={onCancel}
            onDelete={onDelete}
            showGrouping={groupByInvoice}
          />
        ))}
      </div>
    </div>
  );
}

function DeliveryGroup({
  group,
  expanded,
  onToggle,
  warehouses,
  onPost,
  onCancel,
  onDelete,
  showGrouping,
}) {
  console.log(group);
  const totalDeliveries = group.deliveries.length;
  const draftCount = group.deliveries.filter(
    (d) => d.status?.toLowerCase() === "draft",
  ).length;
  const postedCount = group.deliveries.filter(
    (d) => d.status?.toLowerCase() === "posted",
  ).length;
  const cancelledCount = group.deliveries.filter(
    (d) => d.status?.toLowerCase() === "cancelled",
  ).length;

  // Calculate split amounts
  const deliveryAmounts = useMemo(() => {
    const invoiceAmount = group.invoiceAmount || 0;
    const postedDeliveries = group.deliveries.filter(
      (d) => d.status?.toLowerCase() === "posted",
    );

    if (postedDeliveries.length === 0) {
      return group.deliveries.map((d) => ({
        deliveryId: d.id,
        amount: 0,
        percentage: 0,
      }));
    }

    // Calculate based on quantity delivered
    const totalQuantities = {};
    postedDeliveries.forEach((delivery) => {
      delivery.lines?.forEach((line) => {
        const pid = line.productId;
        totalQuantities[pid] =
          (totalQuantities[pid] || 0) + (line.quantity || 0);
      });
    });

    return group.deliveries.map((delivery) => {
      let deliveryTotal = 0;

      delivery.lines?.forEach((line) => {
        const pid = line.productId;
        const deliveredQty = line.quantity || 0;
        const totalQty = totalQuantities[pid] || 1;
        const proportion = deliveredQty / totalQty;

        // Assuming proportional split - you may want to adjust this logic
        deliveryTotal += (invoiceAmount * proportion) / postedDeliveries.length;
      });

      return {
        deliveryId: delivery.id,
        amount: deliveryTotal,
        percentage:
          invoiceAmount > 0 ? (deliveryTotal / invoiceAmount) * 100 : 0,
      };
    });
  }, [group.deliveries, group.invoiceAmount]);

  if (!showGrouping) {
    // Show as individual row
    const delivery = group.deliveries[0];
    return (
      <DeliveryRow
        delivery={delivery}
        warehouse={{ name: delivery.warehouseName }}
        onPost={onPost}
        onCancel={onCancel}
        onDelete={onDelete}
        amount={deliveryAmounts[0]?.amount || 0}
        showInvoiceInfo={true}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Group Header */}
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Expand/Collapse Icon */}
            <button className="text-gray-400 hover:text-gray-600">
              {expanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            {/* Invoice Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-lg text-gray-900">
                  Invoice {group.invoiceNumber}
                </h3>
                <span className="text-sm text-gray-500">
                  {group.customerName}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  {totalDeliveries}{" "}
                  {totalDeliveries === 1 ? "Delivery" : "Deliveries"}
                </span>

                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />$
                  {(group.invoiceAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2">
              {draftCount > 0 && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  {draftCount} Draft
                </span>
              )}
              {postedCount > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {postedCount} Posted
                </span>
              )}
              {cancelledCount > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                  {cancelledCount} Cancelled
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Deliveries */}
      {expanded && (
        <div className="divide-y divide-gray-100">
          {group.deliveries.map((delivery, index) => {
            const amountInfo = deliveryAmounts.find(
              (a) => a.deliveryId === delivery.id,
            );
            return (
              <DeliveryRow
                key={delivery.id}
                delivery={delivery}
                warehouse={{ name: delivery.warehouseName }}
                onPost={onPost}
                onCancel={onCancel}
                onDelete={onDelete}
                amount={amountInfo?.amount || 0}
                percentage={amountInfo?.percentage || 0}
                showInvoiceInfo={false}
                isGrouped={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function DeliveryRow({
  delivery,
  warehouse,
  onPost,
  onCancel,
  onDelete,
  amount,
  percentage,
  showInvoiceInfo,
  isGrouped = false,
}) {
  const statusLower = (delivery.status || "").toLowerCase().trim();

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "posted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors ${
        isGrouped ? "pl-14" : "bg-white rounded-xl shadow-md"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Delivery Info */}
        <div className="flex items-center gap-6 flex-1">
          {/* Delivery Number & Status */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                Delivery #{delivery.id}
              </span>
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(
                  statusLower,
                )}`}
              >
                {delivery.status || "Unknown"}
              </span>
            </div>
          </div>

          {/* Invoice Info (if not grouped) */}
          {showInvoiceInfo && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Invoice</span>
              <span className="font-medium text-gray-900">
                {delivery.invoiceNumber || `#${delivery.salesInvoiceId}`}
              </span>
            </div>
          )}

          {/* Warehouse */}
          <div className="flex items-center gap-2">
            <WarehouseIcon className="w-4 h-4 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Warehouse</span>
              <span className="font-medium text-gray-900">
                {warehouse?.name || delivery.warehouseName || "—"}
              </span>
            </div>
          </div>

          {/* Delivery Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Date</span>
              <span className="font-medium text-gray-900">
                {new Date(delivery.deliveryDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Amount Split (if available) */}
          {amount > 0 && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Amount</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">
                    ${amount.toFixed(2)}
                  </span>
                  {percentage > 0 && (
                    <span className="text-xs text-gray-500">
                      ({percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Items Count */}
          {delivery.lines && delivery.lines.length > 0 && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Items</span>
              <span className="font-medium text-gray-900">
                {delivery.lines.length} line
                {delivery.lines.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {statusLower === "draft" && (
            <>
              <button
                onClick={() => onPost(delivery.id)}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                title="Post Delivery"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm font-medium">Post</span>
              </button>

              <button
                onClick={() => onCancel(delivery.id)}
                className="px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2"
                title="Cancel Delivery"
              >
                <Ban className="w-4 h-4" />
                <span className="text-sm font-medium">Cancel</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm(`Delete Delivery #${delivery.id}?`)) {
                    onDelete(delivery.id);
                  }
                }}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                title="Delete Delivery"
              >
                <span className="text-sm font-medium">Delete</span>
              </button>
            </>
          )}

          {statusLower === "posted" && (
            <span className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-2 border border-amber-200">
              <AlertCircle className="w-4 h-4" />
              Posted – cannot modify
            </span>
          )}

          {statusLower === "cancelled" && (
            <span className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2 border border-gray-200">
              <Ban className="w-4 h-4" />
              Cancelled
            </span>
          )}
        </div>
      </div>

      {/* Delivery Lines (if expanded details needed) */}
      {delivery.lines && delivery.lines.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-2 text-xs">
            {delivery.lines.slice(0, 3).map((line, idx) => (
              <div key={idx} className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">
                  {line.productName || `Product #${line.productId}`}
                </span>
                <span className="ml-2 font-medium text-gray-900">
                  × {line.quantity}
                </span>
              </div>
            ))}
            {delivery.lines.length > 3 && (
              <div className="bg-gray-50 p-2 rounded text-center text-gray-500">
                +{delivery.lines.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReceiptsTab({ receipts, onPost, onCancel, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Receipt #
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Customer
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {receipts.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                No receipts yet
              </td>
            </tr>
          ) : (
            receipts.map((r) => {
              const statusLower = (r.status || "").toLowerCase().trim();

              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {r.receiptNumber || `#${r.id}`}
                  </td>
                  <td className="px-6 py-4">{r.customerName || "—"}</td>
                  <td className="px-6 py-4">
                    {new Date(r.receiptDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    ${parseFloat(r.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        statusLower === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : statusLower === "posted"
                            ? "bg-blue-100 text-blue-800"
                            : statusLower === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {r.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {statusLower === "draft" && (
                        <>
                          <button
                            onClick={() => onPost(r.id)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                            title="Post Receipt"
                          >
                            <Send className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => onCancel(r.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                            title="Cancel Receipt"
                          >
                            <Ban className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => onDelete(r.id)}
                            className="p-2 hover:bg-red-50 text-red-700 rounded-lg font-medium border border-red-300"
                            title="Delete Receipt"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {statusLower === "posted" && (
                        <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          Posted – cannot modify
                        </span>
                      )}

                      {statusLower === "cancelled" && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <Ban className="w-4 h-4" />
                          Cancelled
                        </span>
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
  );
}

function ReturnsTab({ returns, onAdd, onPost, onCancel, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Return
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Return #
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Reason
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {returns.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No returns yet
                </td>
              </tr>
            ) : (
              returns.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{r.returnNumber || `#${r.id}`}</td>
                  <td className="px-6 py-4">{r.customerName || "—"}</td>
                  <td className="px-6 py-4">
                    {new Date(r.returnDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-red-600">
                    ${(r.grandTotal || r.subTotal || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{r.reason || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {r.status?.toLowerCase() === "draft" && (
                        <>
                          <button
                            onClick={() => onPost(r.id)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                            title="Post Return"
                          >
                            <Send className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => onCancel(r.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                            title="Cancel Return"
                          >
                            <Ban className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => onDelete(r.id)}
                            className="p-2 hover:bg-red-100 text-red-700 rounded-lg font-medium border border-red-300"
                            title="Delete Return (only Draft)"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {r.status?.toLowerCase() === "posted" && (
                        <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          Posted – cannot delete or modify
                        </span>
                      )}

                      {r.status?.toLowerCase() === "cancelled" && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <Ban className="w-4 h-4" />
                          Cancelled – cannot delete
                        </span>
                      )}

                      {!["draft", "posted", "cancelled"].includes(
                        r.status?.toLowerCase() || "",
                      ) && (
                        <span className="text-xs text-red-600">
                          Invalid status: {r.status}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Receipt Modal
export function ReceiptModal({ invoice, onSave, onClose }) {
  const balanceDue =
    parseFloat(invoice?.balanceDue || invoice?.grandTotal || 0) || 0;

  const [formData, setFormData] = useState({
    receiptDate: new Date().toISOString().split("T")[0],
    customerId: invoice.customerId || "",
    amount: balanceDue > 0 ? balanceDue : 0,
    paymentMethod: "Cash",
    referenceNumber: "",
    notes: "",
    allocations: [
      {
        salesInvoiceId: invoice.id,
        allocatedAmount: balanceDue > 0 ? balanceDue : 0,
      },
    ],
  });

  const [validationError, setValidationError] = useState("");

  const validateAmount = (amount) => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setValidationError("Amount must be greater than zero");
      return false;
    }
    if (amt > balanceDue) {
      setValidationError(
        `Cannot exceed balance due ($${balanceDue.toFixed(2)})`,
      );
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleAmountChange = (value) => {
    const amt = parseFloat(value) || 0;
    validateAmount(amt);
    setFormData({
      ...formData,
      amount: amt,
      allocations: [{ ...formData.allocations[0], allocatedAmount: amt }],
    });
  };

  const canSubmit =
    formData.amount > 0 &&
    formData.amount <= balanceDue &&
    formData.paymentMethod &&
    formData.allocations[0]?.allocatedAmount === formData.amount &&
    !validationError;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAmount(formData.amount)) {
      return;
    }

    // FIXED: Add branchId field
    const payload = {
      branchId: 0, // Default branch - backend might require this
      receiptDate: formData.receiptDate,
      customerId: parseInt(formData.customerId),
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber,
      notes: formData.notes,
      allocations: formData.allocations.map((a) => ({
        salesInvoiceId: parseInt(a.salesInvoiceId),
        allocatedAmount: parseFloat(a.allocatedAmount),
      })),
    };

    console.log(
      "Receipt payload (with branchId):",
      JSON.stringify(payload, null, 2),
    );
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Record Payment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Invoice:</span>{" "}
              {invoice.invoiceNumber || `#${invoice.id}`}
            </p>
            <p className="text-sm text-blue-900 mt-1">
              <span className="font-semibold">Customer:</span>{" "}
              {invoice.customerName}
            </p>
            <p className="text-lg text-blue-900 mt-2 font-bold">
              Balance Due: ${balanceDue.toFixed(2)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Receipt Date *
              </label>
              <input
                type="date"
                required
                value={formData.receiptDate}
                onChange={(e) =>
                  setFormData({ ...formData, receiptDate: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Amount *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                max={balanceDue}
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
                  validationError
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-green-500"
                }`}
              />
              {validationError && (
                <p className="text-red-600 text-sm mt-1">{validationError}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Maximum: ${balanceDue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method *
              </label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) =>
                  setFormData({ ...formData, referenceNumber: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Check # or Transaction ID"
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
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition ${
                canSubmit
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== CUSTOMER MODAL ==========

export function CustomerModal({ customer, onSave, onClose }) {
  const [formData, setFormData] = useState(
    customer || {
      code: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      taxNumber: "",
      creditLimit: 0,
      isActive: true,
    },
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Customer name is required");
      return;
    }
    onSave({
      ...formData,
      creditLimit: parseFloat(formData.creditLimit) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {customer ? "Edit Customer" : "New Customer"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="AUTO"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tax Number
            </label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={(e) =>
                setFormData({ ...formData, taxNumber: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Credit Limit ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.creditLimit}
              onChange={(e) =>
                setFormData({ ...formData, creditLimit: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="col-span-2 flex gap-3 pt-4">
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
              {customer ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== INVOICE MODAL ==========

export function InvoiceModal({
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

export function DeliveryModal({
  invoice,
  warehouses,
  onSave,
  onClose,
  getAuthHeaders, // MUST be passed from parent component
}) {
  const [stockMap, setStockMap] = useState({}); // { productId: { warehouseId: quantityOnHand } }
  const [loadingStock, setLoadingStock] = useState(true);

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

// ========== RETURN MODAL ==========

export function ReturnModal({
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
          // ignore
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
          // ignore parse errors
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

// ========== VIEW INVOICE MODAL ==========

export function ViewInvoiceModal({ invoice, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Invoice {invoice.invoiceNumber || `#${invoice.id}`}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Customer
              </h4>
              <p className="text-lg font-bold text-gray-900">
                {invoice.customerName}
              </p>
            </div>

            <div className="text-right">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Invoice Details
              </h4>
              <p className="text-sm text-gray-600">
                Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Due: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
              <div className="mt-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Line Items
            </h4>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Unit Price
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Discount
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Tax
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.lines?.map((line, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {line.productName || `Product #${line.productId}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {line.quantity} {line.unitName || ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      ${parseFloat(line.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {line.discountPercent || 0}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {line.taxPercent || 0}%
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      ${parseFloat(line.lineTotal || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">
                      ${parseFloat(invoice.subTotal || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Discount:</span>
                    <span className="font-semibold text-red-600">
                      -${parseFloat(invoice.discountAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Tax:</span>
                    <span className="font-semibold">
                      ${parseFloat(invoice.taxAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Grand Total:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      $
                      {parseFloat(
                        invoice.grandTotal || invoice.totalAmount || 0,
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Notes
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {invoice.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
