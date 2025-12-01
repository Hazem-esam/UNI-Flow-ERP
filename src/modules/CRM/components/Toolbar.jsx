export default function Toolbar({ searchQuery, setSearchQuery, openModal }) {
  return (
    <div className="flex justify-between mt-6">
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search leads..."
        className="p-2 border rounded"
      />
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add Lead
      </button>
    </div>
  );
}
