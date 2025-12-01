import { useState, useEffect } from "react";
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  ShoppingCart,
  FileText,
  Calendar,
  X,
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

export default function SalesModule() {
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Load orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem("sales_orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Sample data
      const sampleOrders = [
        {
          id: 1,
          customer: "Acme Corp",
          amount: 5500,
          status: "completed",
          date: "2025-01-15",
          items: 12,
        },
        {
          id: 2,
          customer: "Tech Solutions",
          amount: 3200,
          status: "pending",
          date: "2025-01-18",
          items: 8,
        },
        {
          id: 3,
          customer: "Global Industries",
          amount: 8900,
          status: "completed",
          date: "2025-01-20",
          items: 20,
        },
        {
          id: 4,
          customer: "Startup Inc",
          amount: 1500,
          status: "cancelled",
          date: "2025-01-22",
          items: 5,
        },
      ];
      setOrders(sampleOrders);
      localStorage.setItem("sales_orders", JSON.stringify(sampleOrders));
    }
  }, []);

  // Save orders to localStorage
  const saveOrders = (newOrders) => {
    setOrders(newOrders);
    localStorage.setItem("sales_orders", JSON.stringify(newOrders));
  };

  // Chart data
  const salesData = [
    { month: "Jan", sales: 4000, orders: 24 },
    { month: "Feb", sales: 3000, orders: 18 },
    { month: "Mar", sales: 5000, orders: 32 },
    { month: "Apr", sales: 4500, orders: 28 },
    { month: "May", sales: 6000, orders: 38 },
    { month: "Jun", sales: 5500, orders: 35 },
  ];

  const statusData = [
    { name: "Completed", value: 45 },
    { name: "Pending", value: 30 },
    { name: "Cancelled", value: 10 },
  ];

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Filter orders
  const filteredOrders = orders.filter((order) =>
    order.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add/Edit order
  const handleSaveOrder = (orderData) => {
    if (editingOrder) {
      const updatedOrders = orders.map((o) =>
        o.id === editingOrder.id ? { ...orderData, id: editingOrder.id } : o
      );
      saveOrders(updatedOrders);
    } else {
      const newOrder = {
        ...orderData,
        id: Math.max(...orders.map((o) => o.id), 0) + 1,
      };
      saveOrders([...orders, newOrder]);
    }
    setShowOrderModal(false);
    setEditingOrder(null);
  };

  // Delete order
  const handleDeleteOrder = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      saveOrders(orders.filter((o) => o.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Sales Module</h1>
              <p className="text-gray-600">
                Manage orders, invoices, and track revenue
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md">
          {["overview", "orders", "invoices"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-10 h-10 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingCart className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-10 h-10 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {completedOrders}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-10 h-10 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${avgOrderValue.toFixed(0)}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Sales Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
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
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Order Volume
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-xl p-4 shadow-md flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-3 flex-1 min-w-[300px]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => {
                    setEditingOrder(null);
                    setShowOrderModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  New Order
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Amount
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
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${order.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
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
        )}

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Invoice Generator
            </h3>
            <p className="text-gray-600 mb-6">
              Coming soon - Create and manage invoices
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold">
              Generate Invoice
            </button>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <OrderModal
          order={editingOrder}
          onSave={handleSaveOrder}
          onClose={() => {
            setShowOrderModal(false);
            setEditingOrder(null);
          }}
        />
      )}
    </div>
  );
}

// Order Modal Component
function OrderModal({ order, onSave, onClose }) {
  const [formData, setFormData] = useState(
    order || {
      customer: "",
      amount: "",
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      items: "",
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      items: parseInt(formData.items),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {order ? "Edit Order" : "New Order"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer Name
            </label>
            <input
              type="text"
              required
              value={formData.customer}
              onChange={(e) =>
                setFormData({ ...formData, customer: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Items
            </label>
            <input
              type="number"
              required
              value={formData.items}
              onChange={(e) =>
                setFormData({ ...formData, items: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
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
              {order ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
