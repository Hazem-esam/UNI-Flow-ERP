import StatsCard from "../components/StatsCard";
import {
  ResponsiveContainer,
  Bar,
  Line ,
  BarChart,
  LineChart ,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  DollarSign,
  FileText,
  Users,
  Clock,
  Warehouse as WarehouseIcon,
} from "lucide-react";
export default function OverviewTab({
  totalRevenue,
  totalCustomers,
  postedInvoices,
  draftInvoices,
  invoices,
}) {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      sales: 0,
      count: 0,
    };
  });

  invoices.forEach((inv) => {
    if (inv.invoiceDate) {
      const month = new Date(inv.invoiceDate).toLocaleDateString("en-US", {
        month: "short",
      });
      const item = last6Months.find((m) => m.month === month);
      if (item) {
        item.sales += inv.grandTotal || 0;
        item.count += 1;
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          color="green"
        />
        <StatsCard
          icon={FileText}
          label="Posted Invoices"
          value={postedInvoices}
          color="blue"
        />
        <StatsCard
          icon={Clock}
          label="Draft Invoices"
          value={draftInvoices}
          color="yellow"
        />
        <StatsCard
          icon={Users}
          label="Total Customers"
          value={totalCustomers}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Invoice Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Invoices" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}