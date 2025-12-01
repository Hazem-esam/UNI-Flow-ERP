export default function LeadModal({ lead, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">
          {lead ? "Edit Lead" : "Add Lead"}
        </h2>
        {/* form logic */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
