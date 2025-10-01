import { useState } from "react";

const availableModules = [
  { name: "Sales", description: "Manage sales orders and invoices", price: 20 },
  {
    name: "HR",
    description: "Employee records, payroll, and attendance",
    price: 15,
  },
  {
    name: "Expenses",
    description: "Track company expenses and budgets",
    price: 10,
  },
  { name: "CRM", description: "Customer relationship management", price: 25 },
  {
    name: "Inventory",
    description: "Stock levels and warehouse management",
    price: 30,
  },
  { name: "Users", description: "Manage system users and roles", price: 10 },
  { name: "Contacts", description: "Centralized contacts directory", price: 5 },
];

function Dashboard() {
  const companyName = localStorage.getItem("companyName") || "Your Company";

  // ✅ Clean up anything invalid (null, string, etc.)
  const [selectedModules, setSelectedModules] = useState(
    (JSON.parse(localStorage.getItem("modules")) || []).filter(
      (m) => m && typeof m === "object" && m.name
    )
  );

  const handleToggle = (module) => {
    const exists = selectedModules.some((m) => m?.name === module.name);

    if (exists) {
      setSelectedModules(
        selectedModules.filter((m) => m?.name !== module.name)
      );
    } else {
      setSelectedModules([
        ...selectedModules,
        { name: module.name, price: module.price },
      ]);
    }
  };

  const handleSave = () => {
    localStorage.setItem("modules", JSON.stringify(selectedModules));
    alert("Modules saved to profile!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Welcome, {companyName}</h1>
      <p className="text-gray-600 mb-6">
        Select the modules you want to subscribe to:
      </p>

      <div className="space-y-2">
        {availableModules.map((mod) => (
          <label
            key={mod.name}
            className="flex items-center justify-between border p-3 rounded cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedModules.some((m) => m?.name === mod.name)}
                onChange={() => handleToggle(mod)}
              />
              <span className="font-medium">{mod.name}</span>
            </div>
            <span className="text-sm text-gray-500">${mod.price}/mo</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  );
}

export default Dashboard;
