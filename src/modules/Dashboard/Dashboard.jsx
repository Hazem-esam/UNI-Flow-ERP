import { useState, useEffect, useContext } from "react";
import { dashboardService } from "./services/Dashboardservice";
import Header from "./components/Header";
import KPICards from "./components/KpiCards";
import FinancialOverview from "./components/FinancialOverview";
import QuickStats from "./components/QuickStats";
import SalesStatusChart from "./components/StatusCard";
import DepartmentChart from "./components/DepartmentCard";
import RecentActivity from "./components/RecentActivity";
import Alerts from "./components/Alerts";
import { AuthContext } from "../../context/AuthContext";
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
  const { user, isAuthenticated } = useContext(AuthContext);

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

 
  if (!isAuthenticated || !user?.roles.includes("Owner")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
           Only Company Owner Role  has permission to view this page.
          </p>
          <a href="/" className="text-blue-600 hover:underline font-semibold">
            Go to Home
          </a>
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
