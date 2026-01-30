export default function StatsCard({ icon: Icon, label, value, color }) {
  const colors = {
    green: "text-green-600",
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <Icon className={`w-10 h-10 ${colors[color]} mb-4`} />
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
