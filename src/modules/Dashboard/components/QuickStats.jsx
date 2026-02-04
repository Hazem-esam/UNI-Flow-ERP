import { TrendingUp, Target, Briefcase, Activity } from "lucide-react";

export default function QuickStats({
  salesInvoices,
  expenses,
  leads,
  invoice,
}) {
  const Revenue = invoice
    .filter((inv) => inv.paymentStatus === "Paid")
    .reduce((sum, inv) => sum + (inv.subTotal - inv.discountAmount), 0);
  // Total paid expenses
  const paidExpenses = expenses.items
    .filter((exp) => exp.status === "Paid")
    .reduce((sum, exp) => sum + exp.amount, 0);
  // Net revenue
  const netProfit = Revenue - paidExpenses;
  // Calculate total expenses
  const totalExpenses = Array.isArray(expenses?.items)
    ? expenses.items.reduce((sum, exp) => sum + (Number(exp?.amount) || 0), 0)
    : 0;
  const profitMargin = Revenue ? ((netProfit / Revenue) * 100).toFixed(2) : 0;

  const totalLeads = leads?.length || 0;
  const pipelineValue = leads?.reduce((s, l) => s + (l.dealValue || 0), 0) || 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
          <div>
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className="text-2xl font-bold text-green-600">
              $
              {netProfit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
