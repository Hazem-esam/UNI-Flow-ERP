import { useState, useEffect } from "react";
import Header from "./components/Header";
import KPICards from "./components/KpiCards";
import FinancialOverview from "./components/FinancialOverview";
import QuickStats from "./components/QuickStats";
import SalesStatusChart from "./components/StatusCard";
import DepartmentChart from "./components/DepartmentCard";
import RecentActivity from "./components/RecentActivity";
import Alerts from "./components/Alerts";

export default function DashboardModule() {
  const [timeframe, setTimeframe] = useState("monthly");
  const [salesOrders, setSalesOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [leads, setLeads] = useState([]);

  // Load all data from localStorage
  useEffect(() => {
    setSalesOrders(JSON.parse(localStorage.getItem("sales_orders")) || []);
    setInventory(JSON.parse(localStorage.getItem("inventory_products")) || []);
    setEmployees(JSON.parse(localStorage.getItem("hr_employees")) || []);
    setExpenses(JSON.parse(localStorage.getItem("expenses")) || []);
    setLeads(JSON.parse(localStorage.getItem("crm_leads")) || []);
  }, []);

  return (
    <div className="flex">
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Header timeframe={timeframe} setTimeframe={setTimeframe} />

          <KPICards
            salesOrders={salesOrders}
            expenses={expenses}
            employees={employees}
            inventory={inventory}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <FinancialOverview salesOrders={salesOrders} expenses={expenses} />
            <QuickStats
              expenses={expenses}
              salesOrders={salesOrders}
              leads={leads}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SalesStatusChart salesOrders={salesOrders} />
            <DepartmentChart employees={employees} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity
              salesOrders={salesOrders}
              expenses={expenses}
              leads={leads}
            />
            <Alerts
              inventory={inventory}
              salesOrders={salesOrders}
              leads={leads}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
