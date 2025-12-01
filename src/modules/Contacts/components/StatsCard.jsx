import { BookUser, Building2, User, Star } from "lucide-react";

export default function StatsCards({ contacts }) {
  const total = contacts.length;
  const clients = contacts.filter((c) => c.type === "client").length;
  const vendors = contacts.filter((c) => c.type === "vendor").length;
  const favorites = contacts.filter((c) => c.favorite).length;

  const Card = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <Icon className={`w-10 h-10 mb-4 ${color}`} />
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card
        icon={BookUser}
        label="Total Contacts"
        value={total}
        color="text-indigo-600"
      />
      <Card
        icon={Building2}
        label="Clients"
        value={clients}
        color="text-blue-600"
      />
      <Card
        icon={User}
        label="Vendors"
        value={vendors}
        color="text-green-600"
      />
      <Card
        icon={Star}
        label="Favorites"
        value={favorites}
        color="text-yellow-600"
      />
    </div>
  );
}
