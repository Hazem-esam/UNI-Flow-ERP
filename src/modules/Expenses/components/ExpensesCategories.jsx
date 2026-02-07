import { useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ExpensesCategories({
  expenses,
  categories,
  fetchCategories,
  canManageCategories,
}) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Calculate totals per category
  const categoryTotals = expenses.reduce((acc, e) => {
    if (!acc[e.category]) {
      acc[e.category] = { amount: 0, count: 0 };
    }
    acc[e.category].amount += e.amount;
    acc[e.category].count += 1;
    return acc;
  }, {});

  const chartData = Object.keys(categoryTotals).map((cat) => ({
    category: cat,
    amount: categoryTotals[cat].amount,
    count: categoryTotals[cat].count,
  }));

  return (
    <>
      {/* Category Management Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Manage Categories
          </h2>
          {canManageCategories && (
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryModal(true);
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:from-red-600 hover:to-red-700 shadow-md transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600 mb-4">
              No categories available. Create your first expense category.
            </p>
            {canManageCategories && (
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryModal(true);
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const stats = categoryTotals[category.name] || {
                amount: 0,
                count: 0,
              };
              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  stats={stats}
                  onEdit={() => {
                    setEditingCategory(category);
                    setShowCategoryModal(true);
                  }}
                  onDelete={() =>
                    handleDeleteCategory(category.id, fetchCategories)
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Category Breakdown Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Category Spending Breakdown
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="category"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "amount")
                      return [`$${value.toLocaleString()}`, "Amount"];
                    return [value, "Count"];
                  }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="amount" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onSave={(data) =>
            handleSaveCategory(
              data,
              editingCategory,
              fetchCategories,
              setShowCategoryModal,
              setEditingCategory,
            )
          }
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
        />
      )}
    </>
  );
}

// Category Card Component
function CategoryCard({ category, stats, onEdit, onDelete }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl shadow hover:shadow-lg transition-all border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Total Spent
          </p>
          <p className="text-xl font-bold text-red-600 mt-1">
            $
            {stats.amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Transactions
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">{stats.count}</p>
        </div>
      </div>
    </div>
  );
}

// Category Modal Component
function CategoryModal({ category, onSave, onClose }) {
  const [form, setForm] = useState(
    category || {
      name: "",
      description: "",
    },
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.name.trim()) {
      alert("Please enter a category name.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl relative">
        <button className="absolute top-4 right-4" onClick={onClose}>
          <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </button>

        <h2 className="text-2xl font-semibold mb-6">
          {category ? "Edit Category" : "Add Category"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Office Supplies, Travel, Marketing"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description for this category"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              maxLength={500}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold shadow-md transition-all"
          >
            {category ? "Update Category" : "Create Category"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Handle save category
async function handleSaveCategory(
  categoryData,
  editingCategory,
  fetchCategories,
  setShowCategoryModal,
  setEditingCategory,
) {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You are not authenticated. Please log in again.");
      return;
    }

    const isEditing = !!editingCategory;
    const url = isEditing
      ? `${API_BASE_URL}/api/expense-categories/${editingCategory.id}`
      : `${API_BASE_URL}/api/expense-categories`;
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");

      // Handle specific error cases
      if (response.status === 400 || response.status === 409) {
        alert(
          `Unable to ${isEditing ? "update" : "create"} category: A category with this name may already exist. Please use a different name.`,
        );
      } else if (response.status === 401) {
        alert("Your session has expired. Please log in again.");
      } else if (response.status === 404 && isEditing) {
        alert("Category not found. It may have been deleted.");
      } else {
        alert(
          `Failed to ${isEditing ? "update" : "create"} category: ${errorText || "Unknown error occurred"}`,
        );
      }
      return;
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
    await fetchCategories();
  } catch (err) {
    console.error("Error saving category:", err);

    // More user-friendly error message
    if (err.message.includes("duplicate") || err.message.includes("exists")) {
      alert(
        "This category name already exists. Please choose a different name.",
      );
    } else if (
      err.message.includes("network") ||
      err.message.includes("fetch")
    ) {
      alert(
        "Network error: Unable to save category. Please check your connection and try again.",
      );
    } else {
      alert(`Error saving category: ${err.message}`);
    }
  }
}

// Handle delete category
async function handleDeleteCategory(id, fetchCategories) {
  if (
    !window.confirm(
      "Are you sure you want to delete this category? This may affect existing expenses.",
    )
  ) {
    return;
  }

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You are not authenticated. Please log in again.");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/expense-categories/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      },
    );

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text().catch(() => "");

      // Handle specific error cases
      if (response.status === 400) {
        alert(
          "Cannot delete this category: It may be in use by existing expenses. Please reassign those expenses first.",
        );
      } else if (response.status === 401) {
        alert("Your session has expired. Please log in again.");
      } else if (response.status === 404) {
        alert("Category not found. It may have already been deleted.");
      } else if (response.status === 409) {
        alert(
          "Cannot delete this category: It is currently in use by one or more expenses.",
        );
      } else {
        alert(
          `Failed to delete category: ${errorText || "Unknown error occurred"}`,
        );
      }
      return;
    }

    await fetchCategories();
  } catch (err) {
    console.error("Error deleting category:", err);

    // More user-friendly error message
    if (err.message.includes("in use") || err.message.includes("constraint")) {
      alert(
        "Cannot delete this category: It is currently in use by existing expenses.",
      );
    } else if (
      err.message.includes("network") ||
      err.message.includes("fetch")
    ) {
      alert(
        "Network error: Unable to delete category. Please check your connection and try again.",
      );
    } else {
      alert(`Error deleting category: ${err.message}`);
    }
  }
}
