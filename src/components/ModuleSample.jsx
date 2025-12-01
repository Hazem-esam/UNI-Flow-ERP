import { useParams } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Users,
  Receipt,
  MessageSquare,
  BookUser,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText,
  Settings,
  AlertCircle,
} from "lucide-react";

const moduleIcons = {
  dashboard: LayoutDashboard,
  sales: TrendingUp,
  inventory: Package,
  hr: Users,
  expenses: Receipt,
  crm: MessageSquare,
  contacts: BookUser,
};

const moduleColors = {
  dashboard: "from-blue-500 to-blue-600",
  sales: "from-green-500 to-emerald-600",
  inventory: "from-orange-500 to-orange-600",
  hr: "from-purple-500 to-purple-600",
  expenses: "from-red-500 to-red-600",
  crm: "from-pink-500 to-pink-600",
  contacts: "from-indigo-500 to-indigo-600",
};

export default function ModuleSample() {
  const { moduleName } = useParams();

  const modulesInfo = [
    {
      name: "dashboard",
      title: "Dashboard",
      description:
        "The Dashboard provides a quick overview of key business metrics, performance indicators, and summary reports across all departments. It serves as your central command center for the UNI Flow ERP system.",
      features: [
        "Real-time business metrics",
        "Customizable widgets",
        "Performance indicators",
        "Cross-department analytics",
        "Executive summaries",
      ],
      comingSoon: [
        "Advanced reporting",
        "Data visualization tools",
        "AI-powered insights",
      ],
    },
    {
      name: "sales",
      title: "Sales Module",
      description:
        "The Sales module helps track customer orders, quotations, invoices, and revenue. Manage your entire sales pipeline efficiently and analyze sales performance in real time.",
      features: [
        "Order management",
        "Quotation generation",
        "Invoice tracking",
        "Sales pipeline visualization",
        "Revenue analytics",
      ],
      comingSoon: [
        "Sales forecasting",
        "Customer segmentation",
        "Automated follow-ups",
      ],
    },
    {
      name: "inventory",
      title: "Inventory Module",
      description:
        "The Inventory module allows you to monitor stock levels, track incoming and outgoing goods, manage suppliers, and prevent stockouts. Stay updated on warehouse performance and inventory valuation.",
      features: [
        "Stock level monitoring",
        "Supplier management",
        "Goods tracking",
        "Warehouse performance",
        "Inventory valuation",
      ],
      comingSoon: [
        "Barcode scanning",
        "Automated reordering",
        "Multi-warehouse support",
      ],
    },
    {
      name: "hr",
      title: "Human Resources (HR)",
      description:
        "The HR module manages employee data, payroll, attendance, performance reviews, and recruitment processes. Empower your HR team with automation and insightful workforce analytics.",
      features: [
        "Employee database",
        "Payroll management",
        "Attendance tracking",
        "Performance reviews",
        "Recruitment tools",
      ],
      comingSoon: [
        "Benefits administration",
        "Time-off management",
        "Employee self-service portal",
      ],
    },
    {
      name: "expenses",
      title: "Expenses Module",
      description:
        "The Expenses module helps you record, categorize, and analyze business spending. Maintain financial control by tracking reimbursements, vendor payments, and expense trends.",
      features: [
        "Expense recording",
        "Category management",
        "Reimbursement tracking",
        "Vendor payment logs",
        "Spending analytics",
      ],
      comingSoon: [
        "Receipt scanning",
        "Budget alerts",
        "Expense approval workflows",
      ],
    },
    {
      name: "crm",
      title: "CRM Module",
      description:
        "The Customer Relationship Management (CRM) module helps manage leads, track opportunities, and maintain strong relationships with customers. Improve client satisfaction and retention through data-driven insights.",
      features: [
        "Lead management",
        "Opportunity tracking",
        "Customer profiles",
        "Communication history",
        "Sales funnel analytics",
      ],
      comingSoon: [
        "Email integration",
        "Marketing automation",
        "Customer sentiment analysis",
      ],
    },
    {
      name: "contacts",
      title: "Contacts Module",
      description:
        "The Contacts module centralizes all your business relationships—clients, vendors, employees, and partners—in one place for quick access and collaboration.",
      features: [
        "Centralized directory",
        "Contact categorization",
        "Quick search",
        "Contact history",
        "Export capabilities",
      ],
      comingSoon: [
        "Contact sharing",
        "Duplicate detection",
        "Advanced filtering",
      ],
    },
  ];

  const module = modulesInfo.find((mod) => mod.name === moduleName);
  const Icon = module ? moduleIcons[module.name] : AlertCircle;
  const colorGradient = module
    ? moduleColors[module.name]
    : "from-gray-500 to-gray-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {module ? (
          <>
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${colorGradient} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {module.title}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Active Module</span>
                  </div>
                </div>
              </div>
              <p className="text-xl text-gray-700 max-w-3xl leading-relaxed">
                {module.description}
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Features Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Key Features
                  </h2>
                </div>
                <ul className="space-y-3">
                  {module.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                {/* Stats Card */}
                <div
                  className={`bg-gradient-to-br ${colorGradient} rounded-2xl shadow-lg p-6 text-white`}
                >
                  <h3 className="text-lg font-bold mb-4">Module Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Status</span>
                      <span className="font-semibold">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Features</span>
                      <span className="font-semibold">
                        {module.features.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Coming Soon</span>
                      <span className="font-semibold">
                        {module.comingSoon.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Section */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Coming Soon
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                These features are currently in development and will be
                available soon:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {module.comingSoon.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-purple-200"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Not Found State */
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Module Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The module "{moduleName}" doesn't exist or isn't available yet.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
