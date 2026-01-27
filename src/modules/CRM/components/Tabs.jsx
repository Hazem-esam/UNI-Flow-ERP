export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md">
      {["overview", "leads", "customers", "pipeline"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === tab
              ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}
