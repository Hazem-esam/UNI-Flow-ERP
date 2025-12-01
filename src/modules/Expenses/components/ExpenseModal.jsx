import { X } from "lucide-react";
import { useState } from "react";

export default function ExpenseModal({ expense, onSave, onClose }) {
  const [form, setForm] = useState(
    expense || {
      description: "",
      vendor: "",
      category: "",
      date: "",
      amount: "",
      status: "paid",
      paymentMethod: "",
    }
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.description || !form.amount || !form.date) {
      alert("Please fill required fields.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl relative">
        <button className="absolute top-4 right-4" onClick={onClose}>
          <X className="w-6 h-6 text-gray-600" />
        </button>

        <h2 className="text-2xl font-semibold mb-4">
          {expense ? "Edit Expense" : "Add Expense"}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="input"
          />

          <input
            name="vendor"
            value={form.vendor}
            onChange={handleChange}
            placeholder="Vendor"
            className="input"
          />

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            className="input"
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="input"
          />

          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="input"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input"
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>

          <input
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            placeholder="Payment Method"
            className="input"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-red-600 text-white py-2 rounded-xl hover:bg-red-700"
        >
          Save Expense
        </button>
      </div>
    </div>
  );
}
