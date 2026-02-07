import { useState, useEffect, useContext } from "react";
import { Receipt } from "lucide-react";
import { AuthContext } from "../../context/AuthContext.jsx";
import PermissionGuard from "../../components/Permissionguard.jsx";

import ExpensesOverview from "./components/ExpensesOverview";
import ExpensesTable from "./components/ExpensesTable";
import ExpensesCategories from "./components/ExpensesCategories";
import ExpenseModal from "./components/ExpenseModal";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function ExpensesContent() {
  const { isAuthenticated, hasPermission, hasAnyPermission, user } =
    useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("overview");
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [stats, setStats] = useState(null);

  // Permission checks using actual user permissions
  const canReadExpenses =
    user?.permissions?.some(
      (p) => p === "expenses.items.read" || p === "expenses.items.manage",
    ) || false;
  const canManageExpenses =
    user?.permissions?.includes("expenses.items.manage") || false;
  const canReadCategories =
    user?.permissions?.some(
      (p) =>
        p === "expenses.categories.read" || p === "expenses.categories.manage",
    ) || false;
  const canManageCategories =
    user?.permissions?.includes("expenses.categories.manage") || false;

  // Fetch categories
  const fetchCategories = async () => {
    if (!canReadCategories) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/api/expense-categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    if (!canReadExpenses) {
      setLoading(false);
      setError("You don't have permission to view expenses.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch expenses: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to UI format
      const transformedExpenses = data.items.map((expense) => ({
        id: expense.id,
        description: expense.description,
        vendor: expense.vendor || "",
        category: expense.categoryName,
        categoryId: expense.categoryId,
        amount: expense.amount,
        date: new Date(expense.expenseDate).toISOString().split("T")[0],
        expenseDate: expense.expenseDate,
        status: expense.status.toLowerCase(),
        paymentMethod: expense.paymentMethod,
        notes: expense.notes || "",
        referenceNumber: expense.referenceNumber || "",
      }));

      setExpenses(transformedExpenses);
      setError(null);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to load expenses: " + err.message);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!canReadExpenses) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/expenses/stats/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchExpenses(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [isAuthenticated]);

  // Handle save expense (create or update)
  const handleSaveExpense = async (expenseData) => {
    if (!canManageExpenses) {
      alert("You don't have permission to manage expenses.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You are not authenticated. Please log in again.");
        return;
      }

      const isEditing = !!editingExpense;

      // Prepare API data
      const apiData = {
        description: expenseData.description,
        vendor: expenseData.vendor || "",
        categoryId: parseInt(expenseData.categoryId),
        amount: parseFloat(expenseData.amount),
        expenseDate: new Date(expenseData.date).toISOString(),
        status:
          expenseData.status.charAt(0).toUpperCase() +
          expenseData.status.slice(1),
        paymentMethod: expenseData.paymentMethod,
        notes: expenseData.notes || "",
        referenceNumber: expenseData.referenceNumber || "",
      };

      const url = isEditing
        ? `${API_BASE_URL}/api/expenses/${editingExpense.id}`
        : `${API_BASE_URL}/api/expenses`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          errorText || `Failed to ${isEditing ? "update" : "create"} expense`,
        );
      }

      // Close modal first
      setShowExpenseModal(false);
      setEditingExpense(null);

      // Refetch data
      await Promise.all([fetchExpenses(), fetchStats()]);
    } catch (err) {
      console.error("Error saving expense:", err);
      alert("Error saving expense: " + err.message);
    }
  };

  // Handle delete expense
  const handleDeleteExpense = async (id) => {
    if (!canManageExpenses) {
      alert("You don't have permission to delete expenses.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You are not authenticated. Please log in again.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      if (!response.ok && response.status !== 204) {
        const errorText = await response
          .text()
          .catch(() => "Failed to delete expense");
        throw new Error(errorText);
      }

      // Refetch data
      await Promise.all([fetchExpenses(), fetchStats()]);
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Error deleting expense: " + err.message);
    }
  };

  // Filter expenses based on search
  const filteredExpenses = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchExpenses();
            }}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Expenses Module
                </h1>
                <p className="text-gray-600">
                  Track and manage business expenses
                </p>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md">
            {["overview", "expenses", "categories"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <ExpensesOverview
              expenses={expenses}
              stats={stats}
            />
          )}

          {/* EXPENSES TABLE */}
          {activeTab === "expenses" && (
            <ExpensesTable
              expenses={filteredExpenses}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setShowExpenseModal={() => {
                if (!canManageExpenses) {
                  alert("You don't have permission to create expenses.");
                  return;
                }
                setShowExpenseModal(true);
              }}
              setEditingExpense={(expense) => {
                if (!canManageExpenses) {
                  alert("You don't have permission to edit expenses.");
                  return;
                }
                setEditingExpense(expense);
                setShowExpenseModal(true);
              }}
              handleDeleteExpense={handleDeleteExpense}
              canManageExpenses={canManageExpenses}
            />
          )}

          {/* CATEGORIES */}
          {activeTab === "categories" && (
            <>
              {canReadCategories ? (
                <ExpensesCategories
                  expenses={expenses}
                  categories={categories}
                  fetchCategories={fetchCategories}
                  canManageCategories={canManageCategories}
                />
              ) : (
                <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Access Denied
                  </h3>
                  <p className="text-gray-600">
                    You don't have permission to view expense categories.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL */}
        {showExpenseModal && (
          <ExpenseModal
            expense={editingExpense}
            categories={categories}
            onSave={handleSaveExpense}
            onClose={() => {
              setEditingExpense(null);
              setShowExpenseModal(false);
            }}
            fetchCategories={fetchCategories}
          />
        )}
      </div>
    </div>
  );
}

// Wrap with Permission Guard
export default function Expenses() {
  const { user } = useContext(AuthContext);

  // Check if user has any expenses permissions
  const hasExpensesPermission = user?.permissions?.some((p) =>
    p.startsWith("expenses."),
  );

  if (!hasExpensesPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 p-6">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
          <Receipt className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the Expenses module.
          </p>
          <p className="text-sm text-gray-500">
            Required: Any expenses.* permission
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your roles: {user?.roles?.join(", ") || "None"}
          </p>
        </div>
      </div>
    );
  }

  return <ExpensesContent />;
}
