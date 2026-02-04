import { useState, useEffect } from "react";
import { dashboardService } from "./services/Dashboardservice";
import Header from "./components/Header";
import KPICards from "./components/KpiCards";
import FinancialOverview from "./components/FinancialOverview";
import QuickStats from "./components/QuickStats";
import SalesStatusChart from "./components/StatusCard";
import DepartmentChart from "./components/DepartmentCard";
import RecentActivity from "./components/RecentActivity";
import Alerts from "./components/Alerts";

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [salesInvoices, setSalesInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoice, setInvoice] = useState([]);
  const [leads, setLeads] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await dashboardService.getDashboardData();

        setSalesInvoices(data.salesInvoices || []);
        setProducts(data.products || []);
        setStock(data.stock || []);
        setEmployees(data.employees || []);
        setExpenses(data.expenses || []);
        setLeads(data.leads || []);
        setDepartments(data.departments || []);
        setCustomers(data.customers || []);
        setInvoice(data.invoice || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md">
          <div className="text-red-600 text-center mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Header timeframe={timeframe} setTimeframe={setTimeframe} />

          <KPICards
            salesInvoices={salesInvoices}
            expenses={expenses}
            employees={employees}
            products={products}
            stock={stock}
            invoice={invoice}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <FinancialOverview
              salesInvoices={salesInvoices}
              expenses={expenses}
            />
            <QuickStats
              expenses={expenses}
              salesInvoices={salesInvoices}
              leads={leads}
              invoice={invoice}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SalesStatusChart salesInvoices={salesInvoices} invoice={invoice} />
            <DepartmentChart departments={departments} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity
              salesInvoices={salesInvoices}
              expenses={expenses}
              leads={leads}
            />
            <Alerts
              products={products}
              salesInvoices={salesInvoices}
              leads={leads}
              stock={stock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
