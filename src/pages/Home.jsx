import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Package,
  MessageSquare,
  Receipt,
  BookUser,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Clock,
  TrendingUp as Growth,
  Sparkles,
  Building2,
  Award,
  Target,
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();
  const [hoveredModule, setHoveredModule] = useState(null);
  const [hoveredBenefit, setHoveredBenefit] = useState(null);

  const modules = [
    {
      name: "dashboard",
      title: "Dashboard & Analytics",
      description:
        "Real-time insights with customizable dashboards, KPI tracking, and predictive analytics for data-driven decisions.",
      icon: LayoutDashboard,
      color: "from-blue-500 to-indigo-600",
      badge: "Live Insights",
      features: ["Real-time KPIs", "Custom Reports"],
    },
    {
      name: "hr",
      title: "Human Resources",
      description:
        "Complete HR suite for employee lifecycle management, payroll automation, attendance tracking, and performance reviews.",
      icon: Users,
      color: "from-purple-500 to-violet-600",
      badge: "People First",
      features: ["Payroll", "Attendance", "Performance"],
    },
    {
      name: "sales",
      title: "Sales & Invoicing",
      description:
        "Accelerate revenue with smart quotations, automated invoicing, payment tracking, and comprehensive sales analytics.",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      badge: "Revenue+",
      features: ["Smart Quotes", "Auto-Invoice", "Analytics"],
    },
    {
      name: "inventory",
      title: "Inventory Management",
      description:
        "Never run out of stock with intelligent forecasting, multi-warehouse tracking, and automated reorder points.",
      icon: Package,
      color: "from-orange-500 to-amber-600",
      badge: "Stock Control",
      features: ["Multi-Warehouse", "Auto-Reorder", "Forecasting"],
    },
    {
      name: "crm",
      title: "Customer Relationship",
      description:
        "Build lasting relationships with 360° customer views, sales pipeline management, and automated follow-ups.",
      icon: MessageSquare,
      color: "from-pink-500 to-rose-600",
      badge: "Growth",
      features: ["360° View", "Pipeline", "Automation"],
    },
    {
      name: "expenses",
      title: "Expense Management",
      description:
        "Complete visibility into spending with automated expense tracking, approval workflows, and budget management.",
      icon: Receipt,
      color: "from-red-500 to-rose-600",
      badge: "Cost Control",
      features: ["Auto-Track", "Approvals", "Budgets"],
    },
    {
      name: "contacts",
      title: "Unified Contacts",
      description:
        "Centralize all business relationships with smart contact management, interaction history, and segmentation.",
      icon: BookUser,
      color: "from-indigo-500 to-purple-600",
      badge: "Network Hub",
      features: ["Smart Search", "History", "Segments"],
    },
  ];

  const valueProps = [
  {
    icon: Zap,
    title: "High Performance",
    description: "Optimized for fast, real-time operations",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description: "End-to-end encryption and access control",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Decisions",
    description: "Actionable insights from real-time analytics",
  },
  {
    icon: Globe,
    title: "Global Business Ready",
    description: "Multi-currency and multi-location support",
  },
];


  const benefits = [
    {
      icon: Clock,
      title: "Save 20+ Hours Weekly",
      description:
        "Automate repetitive tasks and eliminate manual data entry. Focus on growing your business, not managing spreadsheets.",
      stat: "20hrs",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Growth,
      title: "Scale Without Limits",
      description:
        "From 5 to 500 employees, our infrastructure grows with you. No migration headaches, just seamless expansion.",
      stat: "10x",
      color: "from-purple-500 to-violet-600",
    },
    {
      icon: Target,
      title: "One Source of Truth",
      description:
        "Stop juggling multiple tools. All your business data in one integrated platform with real-time synchronization.",
      stat: "100%",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Award,
      title: "Enterprise-Grade Reliability",
      description:
        "99.9% uptime SLA, automated backups, and 24/7 monitoring. Your business never stops, and neither do we.",
      stat: "99.9%",
      color: "from-orange-500 to-amber-600",
    },
  ];


  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-20 pb-32">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-blue-100">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                All-in-One Business Platform
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-gray-900">Transform Your Business with</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                UNI Flow ERP
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              The intelligent ERP platform that unifies your operations, automates workflows, and scales with your growth—all from one powerful dashboard.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => navigate("/signup")}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300"
              >
                Sign In
              </button>
            </div>

            {/* Value Props Pills */}
            <div className="flex flex-wrap justify-center gap-4">
              {valueProps.map((prop, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300"
                >
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                    <prop.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900">{prop.title}</div>
                    <div className="text-xs text-gray-600">{prop.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* Modules Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              Comprehensive Suite
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful modules that work together seamlessly to manage your entire business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((mod) => {
              const Icon = mod.icon;
              const isHovered = hoveredModule === mod.name;
              
              return (
                <div
                  key={mod.name}
                  onMouseEnter={() => setHoveredModule(mod.name)}
                  onMouseLeave={() => setHoveredModule(null)}
                  onClick={() => navigate(`/modules-samples/${mod.name}`)}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-transparent overflow-hidden transform hover:-translate-y-2"
                >
                  {/* Gradient Background on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-100 transition-all duration-500`}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={`p-4 rounded-2xl bg-gradient-to-br ${mod.color} group-hover:bg-white/20 transition-all duration-300 shadow-lg`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 group-hover:bg-white/30 text-blue-700 group-hover:text-white rounded-full transition-all duration-300">
                        {mod.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-3 transition-colors duration-300">
                      {mod.title}
                    </h3>

                    <p className="text-gray-600 group-hover:text-white/90 mb-6 leading-relaxed transition-colors duration-300">
                      {mod.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {mod.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 bg-gray-100 group-hover:bg-white/20 text-gray-700 group-hover:text-white rounded-full transition-all duration-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center text-blue-600 group-hover:text-white font-semibold transition-colors duration-300">
                      <span>Explore Module</span>
                      <ArrowRight
                        className={`w-5 h-5 ml-2 transition-all duration-300 ${
                          isHovered ? "translate-x-2" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              Why Choose UNI Flow
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Built for Modern Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience measurable improvements in efficiency, cost savings, and business growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredBenefit(index)}
                  onMouseLeave={() => setHoveredBenefit(null)}
                  className="group relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
                >
                  {/* Gradient Accent */}
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${benefit.color}`}></div>

                  <div className="flex items-start gap-6">
                    {/* Icon & Stat */}
                    <div className="flex-shrink-0">
                      <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${benefit.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="mt-4 text-center">
                        <div className={`text-3xl font-bold bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`}>
                          {benefit.stat}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
        
        {/* Animated Circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
            Join 10,000+ Companies
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Start your free trial today. No credit card required. Cancel anytime.
          </p>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Free 30-day trial</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Cancel anytime</span>
            </div>
          </div>

          {/* Main CTA */}
          <button
            onClick={() => navigate("/signup")}
            className="group relative px-12 py-6 bg-white text-blue-600 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 overflow-hidden"
          >
            <Building2 className="w-6 h-6" />
            <span>Register Your Company Now</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>

          <p className="mt-6 text-blue-100 text-sm">
            Setup in 5 minutes • Full access to all modules • 24/7 support included
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2 text-white font-bold text-xl mb-2">
                <Building2 className="w-6 h-6" />
                UNI Flow ERP
              </div>
              <p className="text-sm">© 2025 UNI Flow ERP. All rights reserved.</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Enterprise-Grade Security & Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}