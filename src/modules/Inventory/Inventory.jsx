import { useState, useEffect, useContext } from "react";
import {
  Package,
  Settings,
  Loader,
  AlertTriangle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

import OverviewTab from "./tabs/OverviewTab";
import ProductsTab from "./tabs/ProductsTab";
import WarehousesTab from "./tabs/WarehousesTab";
import LowStockTab from "./tabs/LowStockTab";
import MasterDataTab from "./tabs/MasterDataTab";

import ProductModal from "./modals/ProductModal";
import CategoryModal from "./modals/CategoryModal";
import WarehouseModal from "./modals/WarehouseModal";
import UnitModal from "./modals/UnitModal";
import StockInModal from "./modals/StockInModal";
import StockOutModal from "./modals/StockOutModal";
import ProductDetailModal from "./modals/ProductDetailModal";

import {
  getAuthHeaders,
  getProductStock,
  getUnitSymbol,
  getUnitName,
  getUnitId,
  hasUnit,
} from "./helper/inventoryHelpers";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5225";

export default function InventoryModule() {
  const { user, hasPermission, hasAnyPermission } = useContext(AuthContext);

  // ═══════════════════════════════════════════════════════════
  // PERMISSION CHECKS
  // ═══════════════════════════════════════════════════════════

  // Product Permissions (products.products.*)
  // Product Permissions (products.Products.*)
  const canViewProducts = hasAnyPermission([
    "products.Products.read",
    "products.Products.manage",
  ]);

  const canManageProducts = hasPermission("products.Products.manage");

  // Category Permissions (products.categories.*)
  const canViewCategories = hasAnyPermission([
    "products.categories.read",
    "products.categories.manage",
  ]);

  const canManageCategories = hasPermission("products.categories.manage");

  // Unit of Measure Permissions (Products.unitofmeasures.*)
  // NOTE: Module name is capital "Products" and Read is capital "Read"
  const canViewUnits = hasAnyPermission([
    "Products.unitofmeasures.Read",
    "Products.unitofmeasures.manage",
  ]);

  const canManageUnits = hasPermission("Products.unitofmeasures.manage");

  // Warehouse Permissions (inventory.warehouses.*)
  const canViewWarehouses = hasAnyPermission([
    "inventory.warehouses.read",
    "inventory.warehouses.manage",
  ]);

  const canManageWarehouses = hasPermission("inventory.warehouses.manage");

  // Stock Permissions (inventory.stock.*)
  const canManageStock = hasPermission("inventory.stock.manage");

  // Inventory Reports Permission
  const canViewReports = hasPermission("inventory.reports.read");

  // Check if user has ANY inventory-related access
  const hasAnyInventoryAccess = hasAnyPermission([
    "products.Products.read",
    "products.Products.manage",
    "products.categories.read",
    "products.categories.manage",
    "Products.unitofmeasures.Read",
    "Products.unitofmeasures.manage",
    "inventory.warehouses.read",
    "inventory.warehouses.manage",
    "inventory.stock.manage",
    "inventory.reports.read",
  ]);

  // ═══════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  const [activeTab, setActiveTab] = useState("overview");

  // Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState([]);
  const [stockBalances, setStockBalances] = useState([]);

  // UI
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);

  // Editing / Selected
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  // ═══════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchPromises = [];

      if (canViewProducts) fetchPromises.push(fetchProducts());
      if (canViewCategories) fetchPromises.push(fetchCategories());
      if (canViewWarehouses) fetchPromises.push(fetchWarehouses());
      if (canViewUnits) fetchPromises.push(fetchUnitsOfMeasure());
      if (canViewReports || canManageStock)
        fetchPromises.push(fetchStockBalance());

      await Promise.all(fetchPromises);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!canViewProducts) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/Products`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      setProducts((await res.json()) || []);
    } catch {
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    if (!canViewCategories) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/Category`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      setCategories((await res.json()) || []);
    } catch {
      setCategories([]);
    }
  };

  const fetchWarehouses = async () => {
    if (!canViewWarehouses) return;
    try {
      const companyId = user?.companyId;
      const url = companyId
        ? `${API_BASE_URL}/api/Warehouses?companyId=${companyId}`
        : `${API_BASE_URL}/api/Warehouses`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      setWarehouses((await res.json()) || []);
    } catch {
      setWarehouses([]);
    }
  };

  const fetchUnitsOfMeasure = async () => {
    if (!canViewUnits) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      setUnitsOfMeasure((await res.json()) || []);
    } catch {
      setUnitsOfMeasure([]);
    }
  };

  const fetchStockBalance = async () => {
    if (!canViewReports && !canManageStock) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/InventoryReports/stock-balance`,
        {
          headers: getAuthHeaders(),
        },
      );
      if (!res.ok) throw new Error();
      setStockBalances((await res.json()) || []);
    } catch {
      setStockBalances([]);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════

  const totalProducts = canViewProducts ? products.length : 0;
  const totalValue =
    canViewProducts && (canViewReports || canManageStock)
      ? products.reduce(
          (sum, p) =>
            sum + getProductStock(stockBalances, p.id) * (p.defaultPrice || 0),
          0,
        )
      : 0;

  const lowStockItems =
    canViewProducts && (canViewReports || canManageStock)
      ? products.filter((p) => {
          const stock = getProductStock(stockBalances, p.id);
          const threshold = p.minQuantity || 5;
          return stock > 0 && stock <= threshold;
        }).length
      : 0;

  const outOfStock =
    canViewProducts && (canViewReports || canManageStock)
      ? products.filter((p) => getProductStock(stockBalances, p.id) === 0)
          .length
      : 0;

  const categoryData =
    canViewCategories && canViewProducts && (canViewReports || canManageStock)
      ? categories
          .map((cat) => {
            const catProducts = products.filter(
              (p) => p.categoryId === cat.id || p.categoryName === cat.name,
            );
            const qty = catProducts.reduce(
              (sum, p) => sum + getProductStock(stockBalances, p.id),
              0,
            );
            return { name: cat.name, value: qty };
          })
          .filter((item) => item.value > 0)
      : [];

  const stockLevelsData =
    canViewProducts && (canViewReports || canManageStock)
      ? products.slice(0, 5).map((p) => ({
          name: p.name,
          current: getProductStock(stockBalances, p.id),
          reorder: p.minQuantity || 5,
        }))
      : [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const filteredProducts = canViewProducts
    ? products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // ═══════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // ═══════════════════════════════════════════════════════════
  // PRODUCT CRUD
  // ═══════════════════════════════════════════════════════════

  const handleSaveProduct = async (data) => {
    if (!canManageProducts) {
      alert("You don't have permission to manage products");
      return;
    }

    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `${API_BASE_URL}/api/Products/${editingProduct.id}`
        : `${API_BASE_URL}/api/Products`;

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: editingProduct?.id, ...data }),
      });

      if (!res.ok) {
        console.error(await res.text());
      }

      await fetchProducts();
      setShowProductModal(false);
      setEditingProduct(null);
      showSuccess(editingProduct ? "Product updated!" : "Product added!");
    } catch (err) {
      console.error(err);
      await fetchProducts();
      setShowProductModal(false);
      setEditingProduct(null);
      showSuccess("Operation completed. Please check.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!canManageProducts) {
      alert("You don't have permission to delete products");
      return;
    }

    if (!window.confirm("Delete this product?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/Products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await fetchProducts();
      showSuccess("Product deleted.");
    } catch (err) {
      console.error(err);
      await fetchProducts();
      showSuccess("Operation completed. Please verify.");
    }
  };

  // ═══════════════════════════════════════════════════════════
  // CATEGORY CRUD
  // ═══════════════════════════════════════════════════════════

  const handleSaveCategory = async (categoryData) => {
    if (!canManageCategories) {
      alert("You don't have permission to manage categories");
      return;
    }

    try {
      let response;
      if (editingCategory) {
        response = await fetch(
          `${API_BASE_URL}/api/Category/${editingCategory.id}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(categoryData),
          },
        );
      } else {
        response = await fetch(`${API_BASE_URL}/api/Category`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(categoryData),
        });
      }

      await fetchCategories();
      setShowCategoryModal(false);
      setEditingCategory(null);
      showSuccess(
        editingCategory
          ? "Category updated successfully!"
          : "Category added successfully!",
      );
    } catch (err) {
      console.error("Error saving category:", err);
      await fetchCategories();
      setShowCategoryModal(false);
      setEditingCategory(null);
      showSuccess("Operation completed. Please verify the changes.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!canManageCategories) {
      alert("You don't have permission to delete categories");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await fetch(`${API_BASE_URL}/api/Category/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await fetchCategories();
      showSuccess("Category deleted successfully!");
    } catch (err) {
      console.error("Error deleting category:", err);
      await fetchCategories();
      showSuccess("Operation completed. Please verify the changes.");
    }
  };

  // ═══════════════════════════════════════════════════════════
  // WAREHOUSE CRUD
  // ═══════════════════════════════════════════════════════════

  const handleSaveWarehouse = async (warehouseData) => {
    if (!canManageWarehouses) {
      alert("You don't have permission to manage warehouses");
      return;
    }

    try {
      let response;
      if (editingWarehouse) {
        response = await fetch(
          `${API_BASE_URL}/api/Warehouses/${editingWarehouse.id}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(warehouseData),
          },
        );
      } else {
        response = await fetch(`${API_BASE_URL}/api/Warehouses`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...warehouseData,
          }),
        });
      }

      await fetchWarehouses();
      setShowWarehouseModal(false);
      setEditingWarehouse(null);
      showSuccess(
        editingWarehouse
          ? "Warehouse updated successfully!"
          : "Warehouse added successfully!",
      );
    } catch (err) {
      console.error("Error saving warehouse:", err);
      await fetchWarehouses();
      setShowWarehouseModal(false);
      setEditingWarehouse(null);
      showSuccess("Operation completed. Please verify the changes.");
    }
  };

  const handleDeleteWarehouse = async (id) => {
    if (!canManageWarehouses) {
      alert("You don't have permission to delete warehouses");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this warehouse?"))
      return;
    try {
      await fetch(`${API_BASE_URL}/api/Warehouses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await fetchWarehouses();
      showSuccess("Warehouse deleted successfully!");
    } catch (err) {
      console.error("Error deleting warehouse:", err);
      await fetchWarehouses();
      showSuccess("Operation completed. Please verify the changes.");
    }
  };

  // ═══════════════════════════════════════════════════════════
  // UNIT CRUD
  // ═══════════════════════════════════════════════════════════

  const handleSaveUnit = async (unitData) => {
    if (!canManageUnits) {
      alert("You don't have permission to manage units");
      return;
    }

    try {
      let response;
      if (editingUnit) {
        response = await fetch(
          `${API_BASE_URL}/api/UnitOfMeasure/${editingUnit.id}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(unitData),
          },
        );
      } else {
        response = await fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(unitData),
        });
      }

      await fetchUnitsOfMeasure();
      setShowUnitModal(false);
      setEditingUnit(null);
      showSuccess(
        editingUnit ? "Unit updated successfully!" : "Unit added successfully!",
      );
    } catch (err) {
      console.error("Error saving unit:", err);
      await fetchUnitsOfMeasure();
      setShowUnitModal(false);
      setEditingUnit(null);
      showSuccess("Operation completed. Please verify the changes.");
    }
  };

  const handleDeleteUnit = async (id) => {
    if (!canManageUnits) {
      alert("You don't have permission to delete units");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this unit?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/UnitOfMeasure/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await fetchUnitsOfMeasure();
      showSuccess("Unit deleted successfully!");
    } catch (err) {
      console.error("Error deleting unit:", err);
      await fetchUnitsOfMeasure();
      showSuccess("Operation completed. Please verify the changes.");
    }
  };

  // ═══════════════════════════════════════════════════════════
  // STOCK OPERATIONS
  // ═══════════════════════════════════════════════════════════

  const handleStockIn = async (data) => {
    if (!canManageStock) {
      alert("You don't have permission to manage stock");
      return;
    }

    try {
      const payload = {
        docDate: new Date().toISOString(),
        sourceType: "Manual Entry",
        sourceId: 0,
        notes: data.notes || "Stock in",
        lines: [
          {
            productId: data.productId,
            warehouseId: data.warehouseId,
            quantity: data.quantity,
            unitId: data.unitId,
            unitCost: data.unitCost || 0,
            notes: data.lineNotes || "",
          },
        ],
      };

      const res = await fetch(`${API_BASE_URL}/api/Inventory/in`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      await fetchStockBalance();
      setShowStockInModal(false);
      setSelectedProduct(null);
      showSuccess("Stock added!");
    } catch (err) {
      console.error(err);
      alert(`Failed: ${err.message}`);
      await fetchStockBalance();
      setShowStockInModal(false);
      setSelectedProduct(null);
    }
  };

  const handleStockOut = async (stockOutData) => {
    if (!canManageStock) {
      alert("You don't have permission to manage stock");
      return;
    }

    try {
      const payload = {
        docDate: new Date().toISOString(),
        sourceType: "Manual Entry",
        sourceId: 0,
        notes: stockOutData.notes || "Stock out operation",
        lines: [
          {
            productId: stockOutData.productId,
            warehouseId: stockOutData.warehouseId,
            quantity: stockOutData.quantity,
            unitId: stockOutData.unitId,
            notes: stockOutData.lineNotes || "",
          },
        ],
      };

      console.log("Stock out payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/Inventory/out`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Stock Out Error Response:", errorText);
        throw new Error(`API Error: ${errorText}`);
      }

      await fetchStockBalance();
      setShowStockOutModal(false);
      setSelectedProduct(null);
      showSuccess("Stock removed successfully!");
    } catch (err) {
      console.error("Error removing stock:", err);
      alert(`Failed to remove stock: ${err.message}`);
      await fetchStockBalance();
      setShowStockOutModal(false);
      setSelectedProduct(null);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER GUARDS
  // ═══════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50">
        <div className="text-center">
          <Loader className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading inventory…</p>
        </div>
      </div>
    );
  }

  if (!hasAnyInventoryAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 p-6">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the Inventory Module.
          </p>
          <div className="text-sm text-gray-500 text-left bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Required Permissions (any):</p>
            <ul className="list-disc list-inside space-y-1">
              <li>products.products.read / products.products.manage</li>
              <li>products.categories.read / products.categories.manage</li>
              <li>
                Products.unitofmeasures.Read / Products.unitofmeasures.manage
              </li>
              <li>inventory.warehouses.read / inventory.warehouses.manage</li>
              <li>inventory.stock.manage</li>
              <li>inventory.reports.read</li>
            </ul>
          </div>
          {user?.roles && (
            <p className="text-sm text-gray-500 mt-4">
              Your roles: {user.roles.join(", ")}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 p-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchAllData}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 p-6">
      <div className="flex-1 max-w-7xl mx-auto">
        {/* Success toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Inventory Module
              </h1>
              <p className="text-gray-600">Multi-warehouse stock management</p>
            </div>
          </div>
          {(canManageCategories || canManageWarehouses || canManageUnits) && (
            <button
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-orange-500"
            >
              <Settings className="w-5 h-5" />
              Master Data
            </button>
          )}
        </div>

        {/* Tabs - Only show tabs user has permission for */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Overview
          </button>

          {(canViewProducts || canManageProducts) && (
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "products"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Products
            </button>
          )}

          {(canViewWarehouses || canManageWarehouses) && (
            <button
              onClick={() => setActiveTab("warehouses")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "warehouses"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Warehouses
            </button>
          )}

          {canViewProducts && (canViewReports || canManageStock) && (
            <button
              onClick={() => setActiveTab("lowStock")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "lowStock"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Low Stock
            </button>
          )}

          {(canManageCategories || canManageWarehouses || canManageUnits) && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Master Data
            </button>
          )}
        </div>

        {/* Tab contents */}
        {activeTab === "overview" && (
          <OverviewTab
            totalProducts={totalProducts}
            totalValue={totalValue}
            lowStockItems={lowStockItems}
            outOfStock={outOfStock}
            stockLevelsData={stockLevelsData}
            categoryData={categoryData}
            COLORS={COLORS}
            canViewProducts={canViewProducts}
            canViewReports={canViewReports || canManageStock}
          />
        )}

        {activeTab === "products" && canViewProducts && (
          <ProductsTab
            products={filteredProducts}
            categories={categories}
            unitsOfMeasure={unitsOfMeasure}
            stockBalances={stockBalances}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            getProductStock={(id, whId) =>
              getProductStock(stockBalances, id, whId)
            }
            getUnitSymbol={(uid, p) => getUnitSymbol(unitsOfMeasure, uid, p)}
            getUnitId={(p) => getUnitId(unitsOfMeasure, p)}
            onAddProduct={
              canManageProducts
                ? () => {
                    setEditingProduct(null);
                    setShowProductModal(true);
                  }
                : null
            }
            onEditProduct={
              canManageProducts
                ? async (p) => {
                    try {
                      const res = await fetch(
                        `${API_BASE_URL}/api/Products/${p.id}`,
                        {
                          headers: getAuthHeaders(),
                        },
                      );
                      if (res.ok) setEditingProduct(await res.json());
                      else setEditingProduct(p);
                    } catch {
                      setEditingProduct(p);
                    }
                    setShowProductModal(true);
                  }
                : null
            }
            onDeleteProduct={canManageProducts ? handleDeleteProduct : null}
            onStockIn={
              canManageStock
                ? (p) => {
                    if (!hasUnit(p)) {
                      alert("Unit of Measure required. Edit product first.");
                      return;
                    }
                    setSelectedProduct(p);
                    setShowStockInModal(true);
                  }
                : null
            }
            onStockOut={
              canManageStock
                ? (p) => {
                    if (!hasUnit(p)) {
                      alert("Unit of Measure required. Edit product first.");
                      return;
                    }
                    setSelectedProduct(p);
                    setShowStockOutModal(true);
                  }
                : null
            }
            onViewDetails={(p) => {
              setDetailProduct(p);
              setShowProductDetailModal(true);
            }}
            onRefresh={fetchAllData}
            canManage={canManageProducts}
            canManageStock={canManageStock}
          />
        )}

        {activeTab === "warehouses" && canViewWarehouses && (
          <WarehousesTab
            warehouses={warehouses}
            products={products}
            stockBalances={stockBalances}
            getProductStock={(id, whId) =>
              getProductStock(stockBalances, id, whId)
            }
            getUnitSymbol={(uid, p) => getUnitSymbol(unitsOfMeasure, uid, p)}
            canViewProducts={canViewProducts}
            canViewReports={canViewReports || canManageStock}
          />
        )}

        {activeTab === "lowStock" &&
          canViewProducts &&
          (canViewReports || canManageStock) && (
            <LowStockTab
              products={products}
              warehouses={warehouses}
              getProductStock={(id, whId) =>
                getProductStock(stockBalances, id, whId)
              }
              getUnitSymbol={(uid, p) => getUnitSymbol(unitsOfMeasure, uid, p)}
              getLowStockThreshold={(p) => p.minQuantity || 5}
            />
          )}

        {activeTab === "settings" &&
          (canManageCategories || canManageWarehouses || canManageUnits) && (
            <MasterDataTab
              categories={categories}
              warehouses={warehouses}
              unitsOfMeasure={unitsOfMeasure}
              onAddCategory={
                canManageCategories ? () => setShowCategoryModal(true) : null
              }
              onEditCategory={
                canManageCategories
                  ? (c) => {
                      setEditingCategory(c);
                      setShowCategoryModal(true);
                    }
                  : null
              }
              onDeleteCategory={
                canManageCategories ? handleDeleteCategory : null
              }
              onAddWarehouse={
                canManageWarehouses ? () => setShowWarehouseModal(true) : null
              }
              onEditWarehouse={
                canManageWarehouses
                  ? (w) => {
                      setEditingWarehouse(w);
                      setShowWarehouseModal(true);
                    }
                  : null
              }
              onDeleteWarehouse={
                canManageWarehouses ? handleDeleteWarehouse : null
              }
              onAddUnit={canManageUnits ? () => setShowUnitModal(true) : null}
              onEditUnit={
                canManageUnits
                  ? (u) => {
                      setEditingUnit(u);
                      setShowUnitModal(true);
                    }
                  : null
              }
              onDeleteUnit={canManageUnits ? handleDeleteUnit : null}
              canManageCategories={canManageCategories}
              canManageWarehouses={canManageWarehouses}
              canManageUnits={canManageUnits}
            />
          )}

        {/* ═══════════════════════════════════════════════════════════
            MODALS - Only render if user has appropriate permissions
            ═══════════════════════════════════════════════════════════ */}

        {showProductModal && canManageProducts && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            unitsOfMeasure={unitsOfMeasure}
            onSave={handleSaveProduct}
            onClose={() => {
              setShowProductModal(false);
              setEditingProduct(null);
            }}
            onAddCategory={
              canManageCategories ? () => setShowCategoryModal(true) : null
            }
            onAddUnit={canManageUnits ? () => setShowUnitModal(true) : null}
          />
        )}

        {showCategoryModal && canManageCategories && (
          <CategoryModal
            category={editingCategory}
            onSave={handleSaveCategory}
            onClose={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
          />
        )}

        {showStockInModal && selectedProduct && canManageStock && (
          <StockInModal
            product={selectedProduct}
            warehouses={warehouses.filter((w) => w.isActive)}
            getUnitSymbol={(uid, p) => getUnitSymbol(unitsOfMeasure, uid, p)}
            getUnitName={(uid, p) => getUnitName(unitsOfMeasure, uid, p)}
            getUnitId={(p) => getUnitId(unitsOfMeasure, p)}
            onSave={handleStockIn}
            onClose={() => {
              setShowStockInModal(false);
              setSelectedProduct(null);
            }}
          />
        )}

        {showStockOutModal && selectedProduct && canManageStock && (
          <StockOutModal
            product={selectedProduct}
            warehouses={warehouses.filter((w) => w.isActive)}
            stockBalances={stockBalances}
            getProductStock={(productId, warehouseId) =>
              getProductStock(stockBalances, productId, warehouseId)
            }
            getUnitSymbol={(unitId, product) =>
              getUnitSymbol(unitsOfMeasure, unitId, product)
            }
            getUnitName={(unitId, product) =>
              getUnitName(unitsOfMeasure, unitId, product)
            }
            getUnitId={(product) => getUnitId(unitsOfMeasure, product)}
            onSave={handleStockOut}
            onClose={() => {
              setShowStockOutModal(false);
              setSelectedProduct(null);
            }}
          />
        )}

        {showWarehouseModal && canManageWarehouses && (
          <WarehouseModal
            warehouse={editingWarehouse}
            onSave={handleSaveWarehouse}
            onClose={() => {
              setShowWarehouseModal(false);
              setEditingWarehouse(null);
            }}
          />
        )}

        {showUnitModal && canManageUnits && (
          <UnitModal
            unit={editingUnit}
            onSave={handleSaveUnit}
            onClose={() => {
              setShowUnitModal(false);
              setEditingUnit(null);
            }}
          />
        )}

        {showProductDetailModal && detailProduct && (
          <ProductDetailModal
            product={detailProduct}
            warehouses={warehouses}
            categories={categories}
            unitsOfMeasure={unitsOfMeasure}
            stockBalances={stockBalances}
            getProductStock={(productId, warehouseId) =>
              getProductStock(stockBalances, productId, warehouseId)
            }
            getUnitSymbol={(unitId, product) =>
              getUnitSymbol(unitsOfMeasure, unitId, product)
            }
            onClose={() => {
              setShowProductDetailModal(false);
              setDetailProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
