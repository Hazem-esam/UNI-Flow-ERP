export default function StatsCards({ leads }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-white p-4 rounded-xl shadow">
        Total Leads: {leads.length}
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        Qualified: {leads.filter((l) => l.stage === "qualified").length}
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        Converted: {leads.filter((l) => l.stage === "converted").length}
      </div>
    </div>
  );
}
