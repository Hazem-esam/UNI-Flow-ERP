import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ChartsSection({ contacts }) {
  // type distribution
  const typeData = contacts.reduce((acc, contact) => {
    const existing = acc.find((i) => i.name === contact.type);
    if (existing) existing.value += 1;
    else acc.push({ name: contact.type, value: 1 });
    return acc;
  }, []);

  const locationData = contacts
    .reduce((acc, contact) => {
      const city = (contact.location || "").split(",")[0] || "Unknown";
      const existing = acc.find((i) => i.name === city);
      if (existing) existing.value += 1;
      else acc.push({ name: city, value: 1 });
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Types</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={typeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              dataKey="value"
            >
              {typeData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Top Locations</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={locationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
