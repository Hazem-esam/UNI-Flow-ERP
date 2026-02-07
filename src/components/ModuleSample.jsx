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
  Zap,
  Clock,
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

const moduleBgColors = {
  dashboard: "from-blue-50 to-blue-100/50",
  sales: "from-green-50 to-emerald-100/50",
  inventory: "from-orange-50 to-orange-100/50",
  hr: "from-purple-50 to-purple-100/50",
  expenses: "from-red-50 to-red-100/50",
  crm: "from-pink-50 to-pink-100/50",
  contacts: "from-indigo-50 to-indigo-100/50",
};

export default function ModuleSample() {
  const { moduleName } = useParams();

  const modulesInfo = [
    {
      name: "dashboard",
      title: "Dashboard",
      description:
        "Your central hub for monitoring business performance. Get real-time insights, track key metrics, and manage your operations all in one place.",
      features: [
        {
          name: "Real-time Business Metrics",
          description:
            "Monitor revenue, expenses, orders, and profit in real time.",
        },
        {
          name: "Performance Indicators",
          description:
            "Track KPIs like profit margin, active employees, and sales pipeline.",
        },
        {
          name: "Cross-Department Analytics",
          description:
            "See a holistic view of all departments and their activities.",
        },
        {
          name: "Executive Summaries",
          description:
            "Get quick overviews of financials, sales, and inventory status.",
        },
        {
          name: "Data Visualization",
          description:
            "Interactive charts and graphs to make insights clear at a glance.",
        },
        {
          name: "Recent Activity & Alerts",
          description:
            "Stay updated with invoices, new leads, and notifications.",
        },
        {
          name: "Inventory Tracking",
          description:
            "Monitor inventory levels and product value in real time.",
        },
      ],
      comingSoon: [
        {
          name: "Advanced Reporting",
          description:
            "Customizable reports with deep data insights across departments.",
        },
        {
          name: "Enhanced Data Visualization",
          description:
            "More interactive charts, filters, and drill-down capabilities.",
        },
        {
          name: "AI-Powered Insights",
          description:
            "Predict trends, identify opportunities, and get smart recommendations.",
        },
      ],
    },

    {
      name: "sales",
      title: "Sales Module",
      description:
        "The Sales module helps track customer orders, quotations, invoices, and revenue. Manage your entire sales pipeline efficiently and analyze sales performance in real time.",
      features: [
        {
          name: "Order Management",
          description:
            "Easily create, track, and manage customer orders from start to finish.",
        },
        {
          name: "Quotation Generation",
          description:
            "Quickly generate professional quotations for customers with accurate pricing.",
        },
        {
          name: "Invoice Tracking",
          description:
            "Monitor issued invoices, payment status, and history for better cash flow control.",
        },
        {
          name: "Sales Pipeline Visualization",
          description:
            "Get a clear view of your sales pipeline and track opportunities at every stage.",
        },
        {
          name: "Revenue Analytics",
          description:
            "Analyze revenue trends, identify top-performing products, and make data-driven decisions.",
        },
      ],
      comingSoon: [
        {
          name: "Sales Forecasting",
          description:
            "Predict future sales based on historical data and trends to plan ahead.",
        },
        {
          name: "Customer Segmentation",
          description:
            "Segment customers by behavior, value, or demographics to target marketing effectively.",
        },
        {
          name: "Automated Follow-Ups",
          description:
            "Set up automatic reminders and follow-ups to keep leads warm and increase conversion.",
        },
      ],
    },
    {
      name: "inventory",
      title: "Inventory Module",
      description:
        "The Inventory module allows you to monitor stock levels, track incoming and outgoing goods, manage suppliers, and prevent stockouts. Stay updated on warehouse performance and inventory valuation.",
      features: [
        {
          name: "Stock Level Monitoring",
          description:
            "Keep track of inventory levels in real time to avoid overstocking or stockouts.",
        },
        {
          name: "Multi-Warehouse Support",
          description:
            "Manage inventory across multiple warehouses from a single interface.",
        },

        {
          name: "Goods Tracking",
          description:
            "Track incoming and outgoing shipments to maintain accurate inventory records.",
        },
        {
          name: "Warehouse Performance",
          description:
            "Analyze warehouse efficiency and optimize stock handling processes.",
        },
        {
          name: "Inventory Valuation",
          description:
            "Evaluate the value of your inventory to make informed financial decisions.",
        },
      ],
      comingSoon: [
        {
          name: "Barcode Scanning",
          description:
            "Scan items quickly for faster check-ins, check-outs, and inventory updates.",
        },
        {
          name: "Automated Reordering",
          description:
            "Set reorder points and let the system automatically generate purchase orders.",
        },
        {
          name: "Supplier Management",
          description:
            "Manage supplier information, contacts, and performance for smoother operations.",
        },
      ],
    },
    {
      name: "hr",
      title: "Human Resources (HR)",
      description:
        "The HR module allows managers to oversee employees, departments, job positions, and leave requests efficiently. Empower your HR team with centralized management and streamlined workflows.",
      features: [
        {
          name: "Departments Management",
          description:
            "Create, update, and organize departments within the organization.",
        },
        {
          name: "Employee Management",
          description:
            "Maintain detailed records of employees, including personal info, roles, and status.",
        },
        {
          name: "Positions Management",
          description:
            "Define and manage job positions, assign employees, and track responsibilities.",
        },
        {
          name: "Leave Requests via Manager",
          description:
            "Employees can submit leave requests, and managers can review and approve them directly in the system.",
        },
      ],
      comingSoon: [
        {
          name: "Time-Off Reporting",
          description:
            "Generate reports on employee leave usage, balances, and trends for better planning.",
        },
        {
          name: "Performance Tracking",
          description:
            "Track employee performance metrics and review outcomes to support HR decisions.",
        },
        {
          name: "Self-Service Portal",
          description:
            "Allow employees to view their information, leave balances, and submit requests online.",
        },
      ],
    },
    {
      name: "expenses",
      title: "Expenses Module",
      description:
        "The Expenses module helps you record, categorize, and analyze business spending. Maintain financial control by tracking reimbursements, vendor payments, and expense trends.",
      features: [
        {
          name: "Expense Recording",
          description:
            "Easily record all business expenses to maintain accurate financial records.",
        },
        {
          name: "Category Management",
          description:
            "Organize expenses into categories for better analysis and reporting.",
        },
        {
          name: "Reimbursement Tracking",
          description:
            "Track employee reimbursements efficiently to ensure timely payments.",
        },

        {
          name: "Spending Analytics",
          description:
            "Analyze spending trends to identify cost-saving opportunities.",
        },
      ],
      comingSoon: [
        {
          name: "Receipt Scanning",
          description:
            "Scan receipts and automatically log expenses to save time and reduce errors.",
        },
        {
          name: "Budget Alerts",
          description:
            "Receive notifications when spending approaches budget limits.",
        },
        {
          name: "Expense Approval Workflows",
          description:
            "Streamline approval processes with automated workflows for expenses.",
        },
      ],
    },
    {
      name: "crm",
      title: "CRM Module",
      description:
        "The Customer Relationship Management (CRM) module helps manage leads, track opportunities, and maintain strong relationships with customers. Improve client satisfaction and retention through data-driven insights.",
      features: [
        {
          name: "Lead Management",
          description:
            "Organize and track leads efficiently to maximize conversion opportunities.",
        },
        {
          name: "Opportunity Tracking",
          description:
            "Monitor potential deals through each stage of your sales funnel.",
        },
        {
          name: "Customer Profiles",
          description:
            "Maintain detailed profiles of each customer, including history and preferences.",
        },
        {
          name: "Communication History",
          description:
            "Keep a complete record of interactions with customers for better engagement.",
        },
        {
          name: "Sales Funnel Analytics",
          description:
            "Analyze your sales pipeline to identify bottlenecks and improve performance.",
        },
      ],
      comingSoon: [
        {
          name: "Email Integration",
          description:
            "Connect email accounts directly to track conversations and follow-ups automatically.",
        },
        {
          name: "Marketing Automation",
          description:
            "Automate campaigns and workflows to nurture leads and engage customers.",
        },
        {
          name: "Customer Sentiment Analysis",
          description:
            "Gain insights into customer satisfaction using AI-driven sentiment analysis.",
        },
      ],
    },
    {
      name: "contacts",
      title: "Contacts Module",
      description:
        "The Contacts module centralizes all your business relationships—clients, vendors, employees, and partners—in one place for quick access and collaboration.",
      features: [
        {
          name: "Centralized Directory",
          description:
            "Store all business contacts in one place for easy access and management.",
        },
        {
          name: "Contact Categorization",
          description:
            "Organize contacts into categories such as clients, vendors, or partners.",
        },
        {
          name: "Quick Search",
          description:
            "Find any contact instantly using a fast and accurate search function.",
        },
        {
          name: "Contact History",
          description:
            "Track past interactions and activity with each contact for better relationship management.",
        },
      ],
      comingSoon: [
        {
          name: "Contact Sharing",
          description:
            "Share contact records securely with team members to improve collaboration.",
        },
      ],
    },
  ];

  const module = modulesInfo.find((mod) => mod.name === moduleName);
  const Icon = module ? moduleIcons[module.name] : AlertCircle;
  const colorGradient = module
    ? moduleColors[module.name]
    : "from-gray-500 to-gray-600";
  const bgGradient = module
    ? moduleBgColors[module.name]
    : "from-gray-50 to-gray-100/50";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-500  relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* <div className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br ${colorGradient} rounded-full opacity-10 blur-3xl animate-pulse`}></div> */}
        {/* <div className={`absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr ${colorGradient} rounded-full opacity-10 blur-3xl animate-pulse`} style={{animationDelay: '1s'}}></div> */}
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {module ? (
          <div className="space-y-12 animate-fadeIn">
            {/* Hero Header */}
            <div className="relative">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                {/* Icon with Glow Effect */}
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${colorGradient} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                  <div
                    className={`relative w-24 h-24 bg-gradient-to-br ${colorGradient} rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300`}
                  >
                    <Icon className="w-12 h-12 text-white" strokeWidth={2} />
                  </div>
                </div>

                {/* Title Section */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {module.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Active Module</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">{module.features.length} Features</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className={`bg-gradient-to-br ${bgGradient} backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg`}>
                <p className="text-xl text-gray-700 leading-relaxed">
                  {module.description}
                </p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Features Section - Takes 2 columns */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Available Features</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {module.features.map((feature, index) => {
                    const featureName =
                      typeof feature === "string" ? feature : feature.name;
                    const featureDesc =
                      typeof feature === "string" ? "" : feature.description;

                    return (
                      <div
                        key={index}
                        className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              {featureName}
                            </h3>
                            {featureDesc && (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {featureDesc}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats Card - Takes 1 column */}
              <div className="space-y-6">
                {/* Module Stats */}
                <div
                  className={`bg-gradient-to-br ${colorGradient} rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  
                  <div className="relative">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Module Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <span className="text-white/90 font-medium">Status</span>
                        <span className="font-bold">Active</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <span className="text-white/90 font-medium">Features</span>
                        <span className="font-bold text-2xl">
                          {module.features.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <span className="text-white/90 font-medium">In Pipeline</span>
                        <span className="font-bold text-2xl">
                          {module.comingSoon.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Pro Tip</h4>
                      <p className="text-sm text-gray-600">
                        Explore upcoming features to see what's next for this module!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {module.comingSoon.map((feature, index) => {
                  const featureName =
                    typeof feature === "string" ? feature : feature.name;
                  const featureDesc =
                    typeof feature === "string" ? "" : feature.description;

                  return (
                    <div
                      key={index}
                      className="group relative bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-6 border border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      {/* Animated corner accent */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-transparent rounded-bl-full transform group-hover:scale-150 transition-transform duration-500"></div>
                      
                      <div className="relative flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                            <ArrowRight className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                              {featureName}
                            </h3>
                            {featureDesc && (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {featureDesc}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Enhanced Not Found State */
          <div className="text-center py-32 animate-fadeIn">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <AlertCircle className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Module Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-md mx-auto">
              The module "<span className="font-semibold text-gray-900">{moduleName}</span>" doesn't exist or isn't available yet.
            </p>
            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>
        )}
      </div>

    
    </div>
  );
}