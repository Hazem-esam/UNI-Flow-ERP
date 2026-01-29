import { useState, useEffect, useContext } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Box,
  X,
  RefreshCw,
  Loader,
  Warehouse,
  Tags,
  Ruler,
  Settings,
  CheckCircle,
  Eye,
  ArrowUpCircle,
  ArrowDownCircle,
  MapPin,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AuthContext } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5225";

export default function InventoryModule() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState([]);
  const [stockBalances, setStockBalances] = useState([]);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);

  // Editing states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Helper function to check if product has unit assigned
  const hasUnit = (product) => {
    return !!(product.unitOfMeasureId || product.unitOfMeasureName);
  };

  // Helper function to get unit symbol
  const getUnitSymbol = (unitId, product = null) => {
    // If product has unitOfMeasureName directly, try to find matching unit
    if (product?.unitOfMeasureName) {
      const unit = unitsOfMeasure.find(
        (u) => u.name === product.unitOfMeasureName,
      );
      return unit?.symbol || "units";
    }

    const unit = unitsOfMeasure.find((u) => u.id === unitId);
    return unit?.symbol || "units";
  };

  // Helper function to get unit name
  const getUnitName = (unitId, product = null) => {
    // If product has unitOfMeasureName directly, use it
    if (product?.unitOfMeasureName) {
      return product.unitOfMeasureName;
    }

    const unit = unitsOfMeasure.find((u) => u.id === unitId);
    return unit?.name || "Unit";
  };

  // Helper function to get unit ID from product
  const getUnitId = (product) => {
    if (product.unitOfMeasureId) {
      return product.unitOfMeasureId;
    }
    // Try to find unit ID from name
    if (product.unitOfMeasureName) {
      const unit = unitsOfMeasure.find(
        (u) => u.name === product.unitOfMeasureName,
      );
      return unit?.id || null;
    }
    return null;
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchWarehouses(),
        fetchUnitsOfMeasure(),
        fetchStockBalance(),
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load inventory data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Products`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      console.log("Products fetched:", data);
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Category`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      console.log("Categories fetched:", data);
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const companyId = user?.companyId;
      const url = companyId
        ? `${API_BASE_URL}/api/Warehouses?companyId=${companyId}`
        : `${API_BASE_URL}/api/Warehouses`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch warehouses");
      const data = await response.json();
      console.log("Warehouses fetched:", data);
      setWarehouses(data || []);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setWarehouses([]);
    }
  };

  const fetchUnitsOfMeasure = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/UnitOfMeasure`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch units");
      const data = await response.json();
      console.log("Units fetched:", data);
      setUnitsOfMeasure(data || []);
    } catch (err) {
      console.error("Error fetching units:", err);
      setUnitsOfMeasure([]);
    }
  };

  const fetchStockBalance = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/InventoryReports/stock-balance`,
        { headers: getAuthHeaders() },
      );
      if (!response.ok) throw new Error("Failed to fetch stock balance");
      const data = await response.json();
      console.log("Stock balance fetched:", data);
      setStockBalances(data || []);
    } catch (err) {
      console.error("Error fetching stock balance:", err);
      setStockBalances([]);
    }
  };

  // Get stock for a specific product and warehouse
  const getProductStock = (productId, warehouseId = null) => {
    if (warehouseId) {
      const balance = stockBalances.find(
        (b) => b.productId === productId && b.warehouseId === warehouseId,
      );
      return (
        balance?.quantityOnHand ||
        balance?.quantity ||
        balance?.currentQuantity ||
        0
      );
    }
    // Total across all warehouses
    return stockBalances
      .filter((b) => b.productId === productId)
      .reduce(
        (sum, b) =>
          sum + (b.quantityOnHand || b.quantity || b.currentQuantity || 0),
        0,
      );
  };

  // Calculate statistics
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, p) => sum + getProductStock(p.id) * (p.defaultPrice || 0),
    0,
  );
  const getLowStockThreshold = (product) => {
    return product.minQuantity || 5;
  };

  // Update the lowStockItems calculation
  const lowStockItems = products.filter((p) => {
    const stock = getProductStock(p.id);
    const threshold = getLowStockThreshold(p);
    return stock > 0 && stock <= threshold;
  }).length;
  const outOfStock = products.filter((p) => getProductStock(p.id) === 0).length;

  // Category distribution
  const categoryData = categories
    .map((cat) => {
      const categoryProducts = products.filter((p) => p.categoryId === cat.id|| p.categoryName === cat.name);
      const totalQty = categoryProducts.reduce(
        (sum, p) => sum + getProductStock(p.id),
        0,
      );
      return { name: cat.name, value: totalQty };
    })
    .filter((item) => item.value > 0);

  // Stock levels chart
  const stockLevelsData = products.slice(0, 5).map((p) => ({
    name: p.name,
    current: getProductStock(p.id),
    reorder: getLowStockThreshold,
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode &&
        product.barcode.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Count products without units
  const productsWithoutUnits = products.filter(
    (p) => !p.unitOfMeasureId,
  ).length;

  // CRUD Handlers
  const handleSaveProduct = async (productData) => {
    try {
      let response;
      if (editingProduct) {
        response = await fetch(
          `${API_BASE_URL}/api/Products/${editingProduct.id}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ id: editingProduct.id, ...productData }),
          },
        );
      } else {
        // Backend should automatically set companyId from JWT token
        const payload = {
          ...productData,
        };

        console.log(
          "Creating product with payload:",
          JSON.stringify(payload, null, 2),
        );

        response = await fetch(`${API_BASE_URL}/api/Products`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
      }

      await fetchProducts();
      await fetchCategories();
      setShowProductModal(false);
      setEditingProduct(null);
      showSuccess(
        editingProduct
          ? "Product updated successfully!"
          : "Product added successfully!",
      );
    } catch (err) {
      console.error("Error saving product:", err);
      await fetchProducts();
      setShowProductModal(false);
      setEditingProduct(null);
      showSuccess("Operation completed. Please verify the changes.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await fetch(`${API_BASE_URL}/api/Products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await fetchProducts();
      showSuccess("Product deleted successfully!");
    } catch (err) {
      console.error("Error deleting product:", err);
      await fetchProducts();
      showSuccess("Operation completed. Please verify the changes.");
    }
  };

  const handleSaveCategory = async (categoryData) => {
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

  const handleSaveWarehouse = async (warehouseData) => {
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

  const handleSaveUnit = async (unitData) => {
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

  const handleStockIn = async (stockInData) => {
    try {
      const payload = {
        docDate: new Date().toISOString(),
        sourceType: "Manual Entry",
        sourceId: 0,
        notes: stockInData.notes || "Stock in operation",
        lines: [
          {
            productId: stockInData.productId,
            warehouseId: stockInData.warehouseId,
            quantity: stockInData.quantity,
            unitId: stockInData.unitId,
            unitCost: stockInData.unitCost || 0,
            notes: stockInData.lineNotes || "",
          },
        ],
      };

      console.log("Stock in payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/Inventory/in`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Stock In Error Response:", errorText);
        throw new Error(`API Error: ${errorText}`);
      }

      await fetchStockBalance();
      setShowStockInModal(false);
      setSelectedProduct(null);
      showSuccess("Stock added successfully!");
    } catch (err) {
      console.error("Error adding stock:", err);
      alert(`Failed to add stock: ${err.message}`);
      await fetchStockBalance();
      setShowStockInModal(false);
      setSelectedProduct(null);
    }
  };

  const handleStockOut = async (stockOutData) => {
    try {
      const payload = {
        branchId: 0, // Required by API, using 0 as per Swagger example
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50">
        <div className="text-center">
          <Loader className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading inventory data...</p>
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

  return (
    <div className="flex">
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Inventory Module
                  </h1>
                  <p className="text-gray-600">
                    Multi-warehouse stock management
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("settings")}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-orange-500 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Master Data
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md overflow-x-auto">
            {["overview", "products", "warehouses", "lowStock", "settings"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab === "lowStock"
                    ? "Low Stock"
                    : tab === "settings"
                      ? "Master Data"
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ),
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <OverviewTab
              totalProducts={totalProducts}
              totalValue={totalValue}
              lowStockItems={lowStockItems}
              outOfStock={outOfStock}
              stockLevelsData={stockLevelsData}
              categoryData={categoryData}
              COLORS={COLORS}
            />
          )}

          {activeTab === "products" && (
            <ProductsTab
              products={filteredProducts}
              categories={categories}
              unitsOfMeasure={unitsOfMeasure}
              getProductStock={getProductStock}
              getUnitSymbol={getUnitSymbol}
              getUnitId={getUnitId}
              lowStockThreshold={getLowStockThreshold}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAddProduct={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
              onEditProduct={async (product) => {
                // Fetch full product details to get barcode and other fields
                try {
                  const response = await fetch(
                    `${API_BASE_URL}/api/Products/${product.id}`,
                    {
                      headers: getAuthHeaders(),
                    },
                  );
                  if (response.ok) {
                    const fullProduct = await response.json();
                    console.log("Full product data for editing:", fullProduct);
                    setEditingProduct(fullProduct);
                  } else {
                    // Fallback to list data if fetch fails
                    setEditingProduct(product);
                  }
                } catch (err) {
                  console.error("Error fetching product details:", err);
                  // Fallback to list data
                  setEditingProduct(product);
                }
                setShowProductModal(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onStockIn={(product) => {
                if (!product.unitOfMeasureId && !product.unitOfMeasureName) {
                  alert(
                    "⚠️ Unit of Measure Required\n\nThis product doesn't have a unit of measure assigned. Please edit the product and assign a unit before performing stock operations.",
                  );
                  return;
                }
                setSelectedProduct(product);
                setShowStockInModal(true);
              }}
              onStockOut={(product) => {
                if (!product.unitOfMeasureId && !product.unitOfMeasureName) {
                  alert(
                    "⚠️ Unit of Measure Required\n\nThis product doesn't have a unit of measure assigned. Please edit the product and assign a unit before performing stock operations.",
                  );
                  return;
                }
                setSelectedProduct(product);
                setShowStockOutModal(true);
              }}
              onViewDetails={(product) => {
                setDetailProduct(product);
                setShowProductDetailModal(true);
              }}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === "warehouses" && (
            <WarehousesTab
              warehouses={warehouses}
              products={products}
              stockBalances={stockBalances}
              getProductStock={getProductStock}
              getUnitSymbol={getUnitSymbol}
            />
          )}

          {activeTab === "lowStock" && (
            <LowStockTab
              products={products}
              warehouses={warehouses}
              getProductStock={getProductStock}
              getUnitSymbol={getUnitSymbol}
              getLowStockThreshold={getLowStockThreshold}
            />
          )}

          {activeTab === "settings" && (
            <MasterDataTab
              categories={categories}
              warehouses={warehouses}
              unitsOfMeasure={unitsOfMeasure}
              onAddCategory={() => {
                setEditingCategory(null);
                setShowCategoryModal(true);
              }}
              onEditCategory={(cat) => {
                setEditingCategory(cat);
                setShowCategoryModal(true);
              }}
              onDeleteCategory={handleDeleteCategory}
              onAddWarehouse={() => {
                setEditingWarehouse(null);
                setShowWarehouseModal(true);
              }}
              onEditWarehouse={(wh) => {
                setEditingWarehouse(wh);
                setShowWarehouseModal(true);
              }}
              onDeleteWarehouse={handleDeleteWarehouse}
              onAddUnit={() => {
                setEditingUnit(null);
                setShowUnitModal(true);
              }}
              onEditUnit={(unit) => {
                setEditingUnit(unit);
                setShowUnitModal(true);
              }}
              onDeleteUnit={handleDeleteUnit}
            />
          )}
        </div>

        {/* Modals */}
        {showProductModal && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            unitsOfMeasure={unitsOfMeasure}
            onSave={handleSaveProduct}
            onClose={() => {
              setShowProductModal(false);
              setEditingProduct(null);
            }}
            onAddCategory={() => setShowCategoryModal(true)}
            onAddUnit={() => setShowUnitModal(true)}
          />
        )}

        {showCategoryModal && (
          <CategoryModal
            category={editingCategory}
            onSave={handleSaveCategory}
            onClose={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }}
          />
        )}

        {showWarehouseModal && (
          <WarehouseModal
            warehouse={editingWarehouse}
            onSave={handleSaveWarehouse}
            onClose={() => {
              setShowWarehouseModal(false);
              setEditingWarehouse(null);
            }}
          />
        )}

        {showUnitModal && (
          <UnitModal
            unit={editingUnit}
            onSave={handleSaveUnit}
            onClose={() => {
              setShowUnitModal(false);
              setEditingUnit(null);
            }}
          />
        )}

        {showStockInModal && selectedProduct && (
          <StockInModal
            product={selectedProduct}
            warehouses={warehouses.filter((w) => w.isActive)}
            getUnitSymbol={getUnitSymbol}
            getUnitName={getUnitName}
            getUnitId={getUnitId}
            onSave={handleStockIn}
            onClose={() => {
              setShowStockInModal(false);
              setSelectedProduct(null);
            }}
          />
        )}

        {showStockOutModal && selectedProduct && (
          <StockOutModal
            product={selectedProduct}
            warehouses={warehouses.filter((w) => w.isActive)}
            stockBalances={stockBalances}
            getProductStock={getProductStock}
            getUnitSymbol={getUnitSymbol}
            getUnitName={getUnitName}
            getUnitId={getUnitId}
            onSave={handleStockOut}
            onClose={() => {
              setShowStockOutModal(false);
              setSelectedProduct(null);
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
            getProductStock={getProductStock}
            getUnitSymbol={getUnitSymbol}
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

// Overview Tab - same as before
function OverviewTab({
  totalProducts,
  totalValue,
  lowStockItems,
  outOfStock,
  stockLevelsData,
  categoryData,
  COLORS,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <Box className="w-10 h-10 text-blue-600 mb-4" />
          <p className="text-sm text-gray-600 mb-1">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <TrendingUp className="w-10 h-10 text-green-600 mb-4" />
          <p className="text-sm text-gray-600 mb-1">Total Value</p>
          <p className="text-3xl font-bold text-gray-900">
            ${totalValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <AlertTriangle className="w-10 h-10 text-yellow-600 mb-4" />
          <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
          <p className="text-3xl font-bold text-gray-900">{lowStockItems}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <TrendingDown className="w-10 h-10 text-red-600 mb-4" />
          <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
          <p className="text-3xl font-bold text-gray-900">{outOfStock}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Stock Levels</h3>
          {stockLevelsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockLevelsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#3b82f6" name="Current Stock" />
                <Bar dataKey="reorder" fill="#ef4444" name="Reorder Level" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">
              No stock data available
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Category Distribution
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">
              No category data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Products Tab - WITH UNIT OF MEASURE COLUMN
function ProductsTab({
  products,
  categories,
  unitsOfMeasure,
  getProductStock,
  getUnitSymbol,
  lowStockThreshold,
  searchQuery,
  setSearchQuery,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onStockIn,
  onStockOut,
  onViewDetails,
  onRefresh,
}) {
  const productsWithoutUnits = products.filter(
    (p) => !p.unitOfMeasureId && !p.unitOfMeasureName,
  );

  return (
    <div className="space-y-6">
      {/* Warning Banner for Products without Units */}
      {productsWithoutUnits.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900">
                {productsWithoutUnits.length}{" "}
                {productsWithoutUnits.length === 1
                  ? "product needs"
                  : "products need"}{" "}
                a unit of measure
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Stock operations (Add/Remove) are disabled for products without
                a unit of measure. Click the Edit button to assign a unit.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {productsWithoutUnits.slice(0, 3).map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs"
                  >
                    {p.name}
                  </span>
                ))}
                {productsWithoutUnits.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                    +{productsWithoutUnits.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-md flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Barcode
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Product Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Unit
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Total Stock
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Min Stock
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stock = getProductStock(product.id);
                  const category = categories.find(
                    (c) => c.id === product.categoryId,
                  );
                  const unit = unitsOfMeasure.find(
                    (u) => u.id === product.unitOfMeasureId,
                  );

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {product.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.categoryName || category?.name || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {product.unitOfMeasureId ||
                        product.unitOfMeasureName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                            <Ruler className="w-3 h-3" />
                            {product.unitOfMeasureName || unit?.name || "N/A"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            Not Set
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {stock}{" "}
                          {getUnitSymbol(product.unitOfMeasureId, product)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {product.minQuantity || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${product.defaultPrice || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              stock === 0
                                ? "bg-red-100 text-red-700"
                                : stock <= lowStockThreshold
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {stock === 0
                              ? "Out of Stock"
                              : stock <= lowStockThreshold
                                ? "Low Stock"
                                : "In Stock"}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              product.isActive
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewDetails(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onStockIn(product)}
                            disabled={
                              !product.unitOfMeasureId &&
                              !product.unitOfMeasureName
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              product.unitOfMeasureId ||
                              product.unitOfMeasureName
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                            title={
                              product.unitOfMeasureId ||
                              product.unitOfMeasureName
                                ? "Add Stock"
                                : "Unit of measure required"
                            }
                          >
                            <ArrowUpCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onStockOut(product)}
                            disabled={
                              !product.unitOfMeasureId &&
                              !product.unitOfMeasureName
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              product.unitOfMeasureId ||
                              product.unitOfMeasureName
                                ? "text-purple-600 hover:bg-purple-50"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                            title={
                              product.unitOfMeasureId ||
                              product.unitOfMeasureName
                                ? "Remove Stock"
                                : "Unit of measure required"
                            }
                          >
                            <ArrowDownCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
    </div>
  );
}

// Warehouses Tab - WITH UNIT SYMBOLS
function WarehousesTab({
  warehouses,
  products,
  stockBalances,
  getProductStock,
  getUnitSymbol,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => {
          const warehouseProducts = products.filter(
            (p) => getProductStock(p.id, warehouse.id) > 0,
          );
          const totalItems = warehouseProducts.reduce(
            (sum, p) => sum + getProductStock(p.id, warehouse.id),
            0,
          );
          const totalValue = warehouseProducts.reduce(
            (sum, p) =>
              sum + getProductStock(p.id, warehouse.id) * (p.defaultPrice || 0),
            0,
          );

          return (
            <div
              key={warehouse.id}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Warehouse className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {warehouse.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Code: {warehouse.code}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    warehouse.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {warehouse.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{warehouse.address || "No address"}</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Products</p>
                      <p className="text-lg font-bold text-gray-900">
                        {warehouseProducts.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Units</p>
                      <p className="text-lg font-bold text-gray-900">
                        {totalItems}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-600">Stock Value</p>
                    <p className="text-xl font-bold text-green-600">
                      ${totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>

                {warehouseProducts.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Top Products
                    </p>
                    <div className="space-y-1">
                      {warehouseProducts.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">{p.name}</span>
                          <span className="font-semibold text-gray-900">
                            {getProductStock(p.id, warehouse.id)}{" "}
                            {getUnitSymbol(p.unitOfMeasureId, p)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {warehouses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No warehouses found. Go to Master Data to add warehouses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Low Stock Tab - WITH UNIT SYMBOLS
function LowStockTab({
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

// Master Data Tab - same as before
function MasterDataTab({
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

// ============ MODAL COMPONENTS ============

// Product Modal - WITH minQuantity field
function ProductModal({
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
// Category Modal
function CategoryModal({ category, onSave, onClose }) {
  const [formData, setFormData] = useState(
    category
      ? {
          name: category.name || "",
          description: category.description || "",
        }
      : {
          name: "",
          description: "",
        },
  );

  const handleSubmit = () => {
    if (!formData.name) {
      alert("Category name is required");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {category ? "Edit Category" : "Add Category"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {category ? "Update" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Warehouse Modal
function WarehouseModal({ warehouse, onSave, onClose }) {
  const [formData, setFormData] = useState(
    warehouse
      ? {
          code: warehouse.code || "",
          name: warehouse.name || "",
          address: warehouse.address || "",
          isActive: warehouse.isActive !== false,
        }
      : {
          code: "",
          name: "",
          address: "",
          isActive: true,
        },
  );

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      alert("Warehouse code and name are required");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {warehouse ? "Edit Warehouse" : "Add Warehouse"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Warehouse Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Warehouse Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-semibold text-gray-700"
            >
              Active
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
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
          >
            {warehouse ? "Update" : "Add Warehouse"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Unit Modal
function UnitModal({ unit, onSave, onClose }) {
  const [formData, setFormData] = useState(
    unit
      ? {
          name: unit.name || "",
          symbol: unit.symbol || "",
        }
      : {
          name: "",
          symbol: "",
        },
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.symbol) {
      alert("Unit name and symbol are required");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {unit ? "Edit Unit of Measure" : "Add Unit of Measure"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unit Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Kilogram, Piece, Box"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Symbol *
            </label>
            <input
              type="text"
              required
              value={formData.symbol}
              onChange={(e) =>
                setFormData({ ...formData, symbol: e.target.value })
              }
              placeholder="e.g., kg, pcs, box"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
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
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            {unit ? "Update" : "Add Unit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Stock In Modal - WITH UNIT DISPLAY
function StockInModal({
  product,
  warehouses,
  getUnitSymbol,
  getUnitName,
  getUnitId,
  onSave,
  onClose,
}) {
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState(product.defaultPrice || "");
  const [notes, setNotes] = useState("");

  const unitSymbol = getUnitSymbol(product.unitOfMeasureId, product);
  const unitName = getUnitName(product.unitOfMeasureId, product);
  const unitId = getUnitId(product);

  const handleSubmit = () => {
    if (!selectedWarehouse) {
      alert("Please select a warehouse");
      return;
    }
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (!unitId) {
      alert("Product must have a unit of measure assigned");
      console.error("Unit ID missing:", {
        productId: product.id,
        unitOfMeasureId: product.unitOfMeasureId,
        unitOfMeasureName: product.unitOfMeasureName,
        derivedUnitId: unitId,
      });
      return;
    }

    console.log(
      "Submitting stock in with unit ID:",
      unitId,
      "for product:",
      product.name,
    );

    onSave({
      productId: product.id,
      warehouseId: parseInt(selectedWarehouse),
      quantity: parseInt(quantity),
      unitId: unitId,
      unitCost: parseFloat(unitCost) || 0,
      notes: notes,
      lineNotes: `Added ${quantity} ${unitSymbol}`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Add Stock</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900">{product.name}</h4>
          <p className="text-sm text-gray-600">Barcode: {product.code}</p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
            <Ruler className="w-3 h-3" />
            Unit: {unitName} ({unitSymbol})
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Warehouse *
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity to Add ({unitSymbol}) *
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder={`Enter quantity in ${unitSymbol}`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unit Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter cost per unit"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Optional notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {quantity && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-green-700">
                $
                {(
                  (parseFloat(quantity) || 0) * (parseFloat(unitCost) || 0)
                ).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {quantity} {unitSymbol} × ${parseFloat(unitCost) || 0} per{" "}
                {unitSymbol}
              </p>
            </div>
          )}
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
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Add Stock
          </button>
        </div>
      </div>
    </div>
  );
}

// Stock Out Modal - WITH UNIT DISPLAY
function StockOutModal({
  product,
  warehouses,
  stockBalances,
  getProductStock,
  getUnitSymbol,
  getUnitName,
  getUnitId,
  onSave,
  onClose,
}) {
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const currentStock = selectedWarehouse
    ? getProductStock(product.id, parseInt(selectedWarehouse))
    : 0;
  const unitSymbol = getUnitSymbol(product.unitOfMeasureId, product);
  const unitName = getUnitName(product.unitOfMeasureId, product);
  const unitId = getUnitId(product);

  const handleSubmit = () => {
    if (!selectedWarehouse) {
      alert("Please select a warehouse");
      return;
    }
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }
    if (parseInt(quantity) > currentStock) {
      alert(
        `Cannot remove ${quantity} ${unitSymbol}. Only ${currentStock} ${unitSymbol} available in this warehouse.`,
      );
      return;
    }
    if (!unitId) {
      alert("Product must have a unit of measure assigned");
      return;
    }

    onSave({
      productId: product.id,
      warehouseId: parseInt(selectedWarehouse),
      quantity: parseInt(quantity),
      unitId: unitId,
      notes: notes,
      lineNotes: `Removed ${quantity} ${unitSymbol}`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Remove Stock</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900">{product.name}</h4>
          <p className="text-sm text-gray-600">Barcode: {product.code}</p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
            <Ruler className="w-3 h-3" />
            Unit: {unitName} ({unitSymbol})
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Warehouse *
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((wh) => {
                const stock = getProductStock(product.id, wh.id);
                return (
                  <option key={wh.id} value={wh.id} disabled={stock === 0}>
                    {wh.name} ({stock} {unitSymbol} available)
                  </option>
                );
              })}
            </select>
          </div>

          {selectedWarehouse && (
            <>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Available Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentStock} {unitSymbol}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Remove ({unitSymbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder={`Max: ${currentStock} ${unitSymbol}`}
                />
              </div>

              {quantity && (
                <div
                  className={`p-3 rounded-lg ${parseInt(quantity) > currentStock ? "bg-red-50" : "bg-purple-50"}`}
                >
                  <p className="text-sm text-gray-600">Remaining Stock</p>
                  <p
                    className={`text-lg font-bold ${parseInt(quantity) > currentStock ? "text-red-700" : "text-purple-700"}`}
                  >
                    {currentStock - parseInt(quantity)} {unitSymbol}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Reason for stock removal..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
          )}
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
            disabled={!selectedWarehouse || !quantity}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove Stock
          </button>
        </div>
      </div>
    </div>
  );
}

// Product Detail Modal - WITH UNIT DISPLAY
function ProductDetailModal({
  product,
  warehouses,
  categories,
  unitsOfMeasure,
  stockBalances,
  getProductStock,
  getUnitSymbol,
  onClose,
}) {
  const category =
    categories.find((c) => c.id === product.categoryId) ||
    (product.categoryName ? { name: product.categoryName } : null);
  const unit =
    unitsOfMeasure.find((u) => u.id === product.unitOfMeasureId) ||
    unitsOfMeasure.find((u) => u.name === product.unitOfMeasureName);
  const totalStock = getProductStock(product.id);
  const unitSymbol = getUnitSymbol(product.unitOfMeasureId, product);

  const warehouseStocks = warehouses
    .map((wh) => ({
      warehouse: wh,
      stock: getProductStock(product.id, wh.id),
    }))
    .filter((ws) => ws.stock > 0);

  const totalValue = totalStock * (product.defaultPrice || 0);

  // Debug logging
  console.log("ProductDetailModal Debug:", {
    productId: product.id,
    productName: product.name,
    barcode: product.barcode,
    barcodeType: typeof product.barcode,
    barcodeLength: product.barcode?.length,
    totalStock,
    warehouseStocks,
    stockBalances: stockBalances.filter((b) => b.productId === product.id),
    allStockBalances: stockBalances,
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Product Details
              </h3>
              <p className="text-sm text-gray-600">
                Complete product information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="col-span-2 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-1">
                  {product.name}
                </h4>
                <p className="text-gray-600">Barcode: {product.code}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  product.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Category</p>
            <p className="text-lg font-semibold text-gray-900">
              {category?.name || "N/A"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Unit of Measure</p>
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-600" />
              <p className="text-lg font-semibold text-gray-900">
                {unit?.name || "N/A"} ({unit?.symbol || "-"})
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Default Price</p>
            <p className="text-lg font-semibold text-green-600">
              ${product.defaultPrice || 0} per {unitSymbol}
            </p>
          </div>

          {product.description && product.description.trim() !== "" && (
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-gray-900">{product.description}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Stock Summary
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total Stock</p>
              <p className="text-3xl font-bold text-blue-600">
                {totalStock} {unitSymbol}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-3xl font-bold text-green-600">
                ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Stock by Warehouse
          </h4>
          {warehouseStocks.length > 0 ? (
            <div className="space-y-3">
              {warehouseStocks.map((ws) => (
                <div
                  key={ws.warehouse.id}
                  className="p-4 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Warehouse className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {ws.warehouse.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ws.warehouse.address}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      {ws.stock}
                    </p>
                    <p className="text-sm text-gray-600">{unitSymbol}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No stock in any warehouse</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
