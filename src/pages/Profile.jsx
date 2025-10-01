import { useNavigate } from "react-router-dom";

export default function Profile() {
  const companyName = localStorage.getItem("companyName") || "Your Company";
  const selectedModules = JSON.parse(localStorage.getItem("modules")) || [];
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* Company Card */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{companyName}</h1>
        <p className="text-gray-600">Company Profile & Subscriptions</p>
      </div>

      {/* Subscribed Modules */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Subscribed Modules
        </h2>

        {selectedModules.length === 0 ? (
          <p className="text-gray-500 italic">No modules selected yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {selectedModules.map((mod, index) => (
              <li
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-700">{mod.name}</h3>
                {mod.price && (
                  <p className="text-sm text-gray-500">${mod.price}/mo</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Edit Subscriptions
        </button>
      </div>
    </div>
  );
}
