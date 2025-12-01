// src/modules/InventoryModule.jsx
import { useState, useEffect } from "react";

import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Box,
  X,
  RefreshCw,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function InventoryModule() {
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Load products from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem("inventory_products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      const sampleProducts = [
        { id: 1, name: "Laptop Dell XPS", sku: "LAP-001", category: "Electronics", quantity: 45, reorderLevel: 10, price: 1200, supplier: "Tech Distributors" },
        { id: 2, name: "Office Chair", sku: "FUR-002", category: "Furniture", quantity: 8, reorderLevel: 15, price: 250, supplier: "Office Plus" },
        { id: 3, name: "Wireless Mouse", sku: "ACC-003", category: "Accessories", quantity: 120, reorderLevel: 30, price: 25, supplier: "Tech Distributors" },
        { id: 4, name: "Monitor 27in", sku: "ELC-004", category: "Electronics", quantity: 5, reorderLevel: 12, price: 350, supplier: "Screen World" },
        { id: 5, name: "Desk Lamp", sku: "FUR-005", category: "Furniture", quantity: 32, reorderLevel: 20, price: 45, supplier: "Office Plus" },
      ];
      setProducts(sampleProducts);
      localStorage.setItem("inventory_products", JSON.stringify(sampleProducts));
    }
  }, []);

  // Save products
  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem("inventory_products", JSON.stringify(newProducts));
  };

  // Calculate stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const lowStockItems = products.filter(p => p.quantity <= p.reorderLevel).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;

  // Category distribution
  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += product.quantity;
    } else {
      acc.push({ name: product.category, value: product.quantity });
    }
    return acc;
  }, []);

  // Stock levels chart
  const stockLevelsData = products.slice(0, 5).map(p => ({
    name: p.name,
    current: p.quantity,
    reorder: p.reorderLevel,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CRUD operations
  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      const updatedProducts = products.map(p =>
        p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p
      );
      saveProducts(updatedProducts);
    } else {
      const newProduct = {
        ...productData,
        id: Math.max(...products.map(p => p.id), 0) + 1,
      };
      saveProducts([...products, newProduct]);
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAdjustStock = (id, adjustment) => {
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, quantity: Math.max(0, p.quantity + adjustment) } : p
    );
    saveProducts(updatedProducts);
  };

  return (
    <>
      <div className="flex">
        <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Inventory Module</h1>
                  <p className="text-gray-600">Manage stock levels and track products</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md">
              {["overview", "products", "lowStock"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab === "lowStock" ? "Low Stock" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <Box className="w-10 h-10 text-blue-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <TrendingUp className="w-10 h-10 text-green-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">Total Value</p>
                    <p className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
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

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Stock Levels</h3>
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
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="space-y-6">
                {/* Toolbar */}
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
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition-colors">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setShowProductModal(true);
                      }}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">SKU</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Quantity</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Supplier</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.sku}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAdjustStock(product.id, -1)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  -
                                </button>
                                <span className="text-sm font-semibold text-gray-900 min-w-[40px] text-center">
                                  {product.quantity}
                                </span>
                                <button
                                  onClick={() => handleAdjustStock(product.id, 1)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">${product.price}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{product.supplier}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                product.quantity === 0 ? "bg-red-100 text-red-700" :
                                product.quantity <= product.reorderLevel ? "bg-yellow-100 text-yellow-700" :
                                "bg-green-100 text-green-700"
                              }`}>
                                {product.quantity === 0 ? "Out of Stock" :
                                 product.quantity <= product.reorderLevel ? "Low Stock" : "In Stock"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowProductModal(true);
                                  }}
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Low Stock Tab */}
            {activeTab === "lowStock" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Low Stock Alert</h3>
                  </div>
                  <div className="space-y-4">
                    {products.filter(p => p.quantity <= p.reorderLevel).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <h4 className="font-bold text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Current: {product.quantity} | Reorder Level: {product.reorderLevel}
                          </p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                          <RefreshCw className="w-4 h-4" />
                          Reorder
                        </button>
                      </div>
                    ))}
                    {products.filter(p => p.quantity <= p.reorderLevel).length === 0 && (
                      <p className="text-center text-gray-500 py-8">No low stock items</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Modal */}
          {showProductModal && (
            <ProductModal
              product={editingProduct}
              onSave={handleSaveProduct}
              onClose={() => {
                setShowProductModal(false);
                setEditingProduct(null);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

// Product Modal Component
function ProductModal({ product, onSave, onClose }) {
  const [formData, setFormData] = useState(
    product || {
      name: "",
      sku: "",
      category: "",
      quantity: "",
      reorderLevel: "",
      price: "",
      supplier: "",
    }
  );

  const handleSubmit = () => {
    onSave({
      ...formData,
      quantity: parseInt(formData.quantity),
      reorderLevel: parseInt(formData.reorderLevel),
      price: parseFloat(formData.price),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {product ? "Edit Product" : "Add Product"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reorder Level</label>
            <input
              type="number"
              required
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
            <input
              type="text"
              required
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700"
          >
            {product ? "Update" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}