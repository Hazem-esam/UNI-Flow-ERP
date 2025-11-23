import { Link } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  let subscribedModules = [];

  try {
    subscribedModules = JSON.parse(localStorage.getItem("modules")) || [];
  } catch {
    subscribedModules = [];
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const hasModules = subscribedModules.length > 0;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-28 left-2 z-50 bg-[#0d0a39] text-white p-3 rounded-md shadow-lg"
      >
        {isSidebarOpen ? "✖" : "☰"}
      </button>

      {/* Sidebar */}
      <aside
        className={`relative md:static left-0 md:h-[calc(100vh-80px)] h-auto bg-gray-100 text-black p-6 flex flex-col gap-4 shadow-2xl rounded-r-2xl 
        transform transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:w-64 w-60`}
      >
        <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">
          Modules
        </h2>

        {hasModules ? (
          <ul className="space-y-2">
            {subscribedModules.map((mod, index) => {
              const moduleName = typeof mod === "string" ? mod : mod?.name;

              if (!moduleName) return null;

              return (
                <li key={index}>
                  <Link
                    to={`/modules/${moduleName.toLowerCase().trim()}`}
                    className="block px-3 py-2 rounded hover:bg-blue-200 transition"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {moduleName}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-500 font-medium mt-4">
            No modules subscribed yet.
          </p>
        )}
      </aside>
    </>
  );
}
