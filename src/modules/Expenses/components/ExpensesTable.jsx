import { Search, Plus, Edit, Trash2 } from "lucide-react";

export default function ExpensesTable({
  expenses,
  searchQuery,
  setSearchQuery,
  setShowExpenseModal,
  setEditingExpense,
  handleDeleteExpense,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg w-80">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-2 bg-transparent outline-none w-full"
          />
        </div>

        <button
          onClick={() => setShowExpenseModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-red-700"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3">Description</th>
              <th className="p-3">Vendor</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{e.description}</td>
                <td className="p-3">{e.vendor}</td>
                <td className="p-3">{e.category}</td>
                <td className="p-3 font-semibold text-red-600">${e.amount}</td>
                <td className="p-3">{e.date}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      e.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="p-3">{e.paymentMethod}</td>

                <td className="p-3 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditingExpense(e);
                      setShowExpenseModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDeleteExpense(e.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}

            {expenses.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No expenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
