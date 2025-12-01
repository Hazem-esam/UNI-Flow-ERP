import { TrendingUp, Target, Briefcase, Activity } from "lucide-react";

export default function QuickStats({ salesOrders, expenses, leads }) {
  const totalRevenue = salesOrders.reduce((s, o) => s + o.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue
    ? ((netProfit / totalRevenue) * 100).toFixed(1)
    : 0;

  const totalLeads = leads.length;
  const pipelineValue = leads.reduce((s, l) => s + l.value, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
          <div>
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className="text-2xl font-bold text-green-600">
              ${netProfit.toLocaleString()}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-600" />
        </div>

        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
          <div>
            <p className="text-sm text-gray-600">Profit Margin</p>
            <p className="text-2xl font-bold text-blue-600">{profitMargin}%</p>
          </div>
          <Target className="w-8 h-8 text-blue-600" />
        </div>

        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
          <div>
            <p className="text-sm text-gray-600">Pipeline Value</p>
            <p className="text-2xl font-bold text-purple-600">
              ${(pipelineValue / 1000).toFixed(0)}K
            </p>
          </div>
          <Briefcase className="w-8 h-8 text-purple-600" />
        </div>

        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
          <div>
            <p className="text-sm text-gray-600">Total Leads</p>
            <p className="text-2xl font-bold text-orange-600">{totalLeads}</p>
          </div>
          <Activity className="w-8 h-8 text-orange-600" />
        </div>
      </div>
    </div>
  );
}
