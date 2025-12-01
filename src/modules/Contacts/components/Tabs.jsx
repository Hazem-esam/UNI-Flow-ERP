export default function Tabs({ activeTab, setActiveTab, setSelectedType }) {
  const tabs = ["all", "favorites", "clients", "vendors", "partners", "leads"];

  return (
    <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => {
            setActiveTab(tab);
            setSelectedType(
              tab === "all" || tab === "favorites" ? "all" : tab.slice(0, -1)
            );
          }}
          className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === tab
              ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}
