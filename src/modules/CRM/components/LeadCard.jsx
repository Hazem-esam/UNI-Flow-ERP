export default function LeadCard({ lead, onEdit, onDelete }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-bold text-xl">{lead.name}</h3>
      <p>{lead.email}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={onEdit} className="text-blue-600">
          Edit
        </button>
        <button onClick={onDelete} className="text-red-600">
          Delete
        </button>
      </div>
    </div>
  );
}
