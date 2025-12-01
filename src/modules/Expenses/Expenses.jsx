import { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import ExpensesOverview from "./components/ExpensesOverview";
import ExpensesTable from "./components/ExpensesTable";
import ExpensesCategories from "./components/ExpensesCategories";
import ExpenseModal from "./components/ExpenseModal";

export default function Expenses() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("expenses");
    if (saved) {
      setExpenses(JSON.parse(saved));
    } else {
      const sample = [
        {
          id: 1,
          description: "Office Rent",
          amount: 5000,
          category: "Rent",
          date: "2025-01-01",
          vendor: "Property Management Inc",
          status: "paid",
          paymentMethod: "Bank Transfer",
        },
        {
          id: 2,
          description: "Software Licenses",
          amount: 1200,
          category: "Software",
          date: "2025-01-05",
          vendor: "Tech Solutions",
          status: "paid",
          paymentMethod: "Credit Card",
        },
        {
          id: 3,
          description: "Marketing Campaign",
          amount: 3500,
          category: "Marketing",
          date: "2025-01-10",
          vendor: "Ad Agency",
          status: "pending",
          paymentMethod: "Credit Card",
        },
        {
          id: 4,
          description: "Office Supplies",
          amount: 450,
          category: "Supplies",
          date: "2025-01-12",
          vendor: "Office Depot",
          status: "paid",
          paymentMethod: "Debit Card",
        },
        {
          id: 5,
          description: "Team Lunch",
          amount: 280,
          category: "Meals",
          date: "2025-01-15",
          vendor: "Restaurant",
          status: "paid",
          paymentMethod: "Cash",
        },
        {
          id: 6,
          description: "Internet Service",
          amount: 150,
          category: "Utilities",
          date: "2025-01-20",
          vendor: "ISP Provider",
          status: "paid",
          paymentMethod: "Auto-pay",
        },
        {
          id: 7,
          description: "Business Travel",
          amount: 1800,
          category: "Travel",
          date: "2025-01-22",
          vendor: "Airlines",
          status: "pending",
          paymentMethod: "Credit Card",
        },
      ];
      setExpenses(sample);
      localStorage.setItem("expenses", JSON.stringify(sample));
    }
  }, []);

  const saveExpenses = (newList) => {
    setExpenses(newList);
    localStorage.setItem("expenses", JSON.stringify(newList));
  };

  const handleSaveExpense = (expenseData) => {
    if (editingExpense) {
      const updated = expenses.map((e) =>
        e.id === editingExpense.id ? { ...expenseData, id: e.id } : e
      );
      saveExpenses(updated);
    } else {
      const newExpense = {
        ...expenseData,
        id: Math.max(...expenses.map((e) => e.id), 0) + 1,
      };
      saveExpenses([...expenses, newExpense]);
    }
    setEditingExpense(null);
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("Delete this expense?")) {
      saveExpenses(expenses.filter((e) => e.id !== id));
    }
  };

  const filteredExpenses = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
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
              <ExpensesOverview expenses={expenses} />
            )}

            {/* EXPENSES TABLE */}
            {activeTab === "expenses" && (
              <ExpensesTable
                expenses={filteredExpenses}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setShowExpenseModal={setShowExpenseModal}
                setEditingExpense={setEditingExpense}
                handleDeleteExpense={handleDeleteExpense}
              />
            )}

            {/* CATEGORIES */}
            {activeTab === "categories" && (
              <ExpensesCategories expenses={expenses} />
            )}
          </div>

          {/* MODAL */}
          {showExpenseModal && (
            <ExpenseModal
              expense={editingExpense}
              onSave={handleSaveExpense}
              onClose={() => {
                setEditingExpense(null);
                setShowExpenseModal(false);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
