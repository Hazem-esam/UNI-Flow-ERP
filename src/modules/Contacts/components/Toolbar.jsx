import { Search, Plus } from "lucide-react";

export default function Toolbar({ searchQuery, setSearchQuery, openModal,canManageContacts }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md flex flex-wrap gap-4 items-center justify-between mb-6">
      <div className="flex gap-3 flex-1 min-w-[300px]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex gap-3">
      {canManageContacts&& <button
          onClick={openModal}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>}
      </div>
    </div>
  );
}
