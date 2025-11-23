import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
export default function ModuleSample() {
  const { moduleName } = useParams();

  const modulesInfo = [
    {
      name: "dashboard",
      title: "Dashboard",
      description:
        "The Dashboard provides a quick overview of key business metrics, performance indicators, and summary reports across all departments. It serves as your central command center for the UNI Flow ERP system.",
    },
    {
      name: "sales",
      title: "Sales Module",
      description:
        "The Sales module helps track customer orders, quotations, invoices, and revenue. Manage your entire sales pipeline efficiently and analyze sales performance in real time.",
    },
    {
      name: "inventory",
      title: "Inventory Module",
      description:
        "The Inventory module allows you to monitor stock levels, track incoming and outgoing goods, manage suppliers, and prevent stockouts. Stay updated on warehouse performance and inventory valuation.",
    },
    {
      name: "hr",
      title: "Human Resources (HR)",
      description:
        "The HR module manages employee data, payroll, attendance, performance reviews, and recruitment processes. Empower your HR team with automation and insightful workforce analytics.",
    },
    {
      name: "expenses",
      title: "Expenses Module",
      description:
        "The Expenses module helps you record, categorize, and analyze business spending. Maintain financial control by tracking reimbursements, vendor payments, and expense trends.",
    },
    {
      name: "crm",
      title: "CRM Module",
      description:
        "The Customer Relationship Management (CRM) module helps manage leads, track opportunities, and maintain strong relationships with customers. Improve client satisfaction and retention through data-driven insights.",
    },
    {
      name: "contacts",
      title: "Contacts Module",
      description:
        "The Contacts module centralizes all your business relationships —clients, vendors, employees, and partners — in one place for quick access and collaboration.",
    },
  ];

  // Find the matching module
  const module = modulesInfo.find((mod) => mod.name === moduleName);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        {module ? (
          <>
            <h1 className="text-3xl font-bold text-blue-700 mb-4">
              {module.title}
            </h1>
            <p className="text-gray-700 max-w-2xl">{module.description}</p>
          </>
        ) : (
          <p className="text-gray-600 text-lg">
            Module not found. Please check the module name.
          </p>
        )}
      </div>
    </>
  );
}
