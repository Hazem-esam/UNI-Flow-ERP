import { X, Plus } from "lucide-react";
import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ExpenseModal({ expense, categories, onSave, onClose, fetchCategories }) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);
  const [form, setForm] = useState(
    expense || {
      description: "",
      vendor: "",
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      status: "paid",
      paymentMethod: "Cash",
      notes: "",
      referenceNumber: "",
    }
  );

  // Update localCategories when categories prop changes
  useState(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You are not authenticated. Please log in again.");
        return;
      }

      // Check for duplicate category name locally first
      const duplicateCategory = localCategories.find(
        cat => cat.name.toLowerCase() === categoryData.name.toLowerCase()
      );
      
      if (duplicateCategory) {
        alert(`A category named "${categoryData.name}" already exists. Please choose a different name.`);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/expense-categories`, {
        method: "POST",
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
          alert(`Unable to create category: A category with this name may already exist. Please use a different name.`);
        } else if (response.status === 401) {
          alert("Your session has expired. Please log in again.");
        } else {
          alert(`Failed to create category: ${errorText || 'Unknown error occurred'}`);
        }
        return;
      }

      const newCategory = await response.json();
      
      // Close category modal first
      setShowCategoryModal(false);
      
      // Refetch categories from parent if callback is provided
      if (fetchCategories) {
        await fetchCategories();
      }
      
      // Update local categories list
      setLocalCategories(prev => [...prev, newCategory]);
      
      // Auto-select the newly created category
      setForm(prev => ({ ...prev, categoryId: newCategory.id }));
      
    } catch (err) {
      console.error("Error creating category:", err);
      
      // More user-friendly error message
      if (err.message.includes('duplicate') || err.message.includes('exists')) {
        alert("This category name already exists. Please choose a different name.");
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        alert("Network error: Unable to create category. Please check your connection and try again.");
      } else {
        alert(`Error creating category: ${err.message}`);
      }
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!form.description || !form.description.trim()) {
      alert("Please enter a description.");
      return;
    }
    if (!form.categoryId) {
      alert("Please select a category.");
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      alert("Please enter a valid amount greater than zero.");
      return;
    }
    if (!form.date) {
      alert("Please select a date.");
      return;
    }
    if (!form.paymentMethod || !form.paymentMethod.trim()) {
      alert("Please enter a payment method.");
      return;
    }

    onSave(form);
  };

  // Payment method options based on backend validation
  const paymentMethods = [
    "Cash",
    "CreditCard",
    "DebitCard",
    "BankTransfer",
    "Check",
    "MobilePayment",
    "Other"
  ];

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-4 right-4" onClick={onClose}>
          <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </button>

        <h2 className="text-2xl font-semibold mb-6">
          {expense ? "Edit Expense" : "Add Expense"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter expense description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              maxLength={500}
            />
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <input
              name="vendor"
              value={form.vendor}
              onChange={handleChange}
              placeholder="Vendor name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {localCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="w-10 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center flex-shrink-0"
                title="Add new category"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {localCategories.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No categories available. Click + to create one.
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method.replace(/([A-Z])/g, ' $1').trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Reference Number */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              name="referenceNumber"
              value={form.referenceNumber}
              onChange={handleChange}
              placeholder="Optional reference number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes or comments"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              maxLength={2000}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold shadow-md transition-all"
          >
            {expense ? "Update Expense" : "Create Expense"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <CategoryModal
          onSave={handleCreateCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
}

// Category Modal Component
function CategoryModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

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
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl relative">
        <button className="absolute top-4 right-4" onClick={onClose}>
          <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </button>

        <h2 className="text-2xl font-semibold mb-6">Add New Category</h2>

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
              autoFocus
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
            Create Category
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