import { Link } from "react-router-dom";

export default function Sidebar() {
  const subscribedModules = JSON.parse(localStorage.getItem("modules")) || [];

  if (subscribedModules.length === 0) {
    return (
      <aside className="w-64 bg-gray-100 p-4">
        <p className="text-gray-500">No modules subscribed yet.</p>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-100 p-4">
      <h2 className="font-bold text-gray-700 mb-4">Modules</h2>
      <ul className="space-y-2">
        {subscribedModules.map((mod, index) => {
          // Handle both cases: if mod is object OR string
          const moduleName = typeof mod === "string" ? mod : mod?.name;

          if (!moduleName) return null; // Skip invalid entries

          return (
            <li key={index}>
              <Link
                to={`/modules/${moduleName.toLowerCase()}`}
                className="block px-3 py-2 rounded hover:bg-blue-200"
              >
                {moduleName}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
