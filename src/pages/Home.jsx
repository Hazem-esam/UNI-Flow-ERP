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
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();
  const [hoveredModule, setHoveredModule] = useState(null);

  const modules = [
    {
      name: "dashboard",
      title: "Dashboard",
      description:
        "Real-time analytics and business intelligence at your fingertips.",
      icon: LayoutDashboard,
      color: "from-blue-500 to-blue-600",
      stats: "360° View",
    },
    {
      name: "hr",
      title: "Human Resources",
      description:
        "Streamline employee management, attendance, and payroll operations.",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      stats: "People First",
    },
    {
      name: "sales",
      title: "Sales",
      description:
        "Close deals faster with automated quotations and invoicing.",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      stats: "Revenue Growth",
    },
    {
      name: "inventory",
      title: "Inventory",
      description:
        "Never run out of stock with intelligent inventory tracking.",
      icon: Package,
      color: "from-orange-500 to-orange-600",
      stats: "Stock Control",
    },
    {
      name: "crm",
      title: "CRM",
      description:
        "Build lasting relationships and convert more leads to customers.",
      icon: MessageSquare,
      color: "from-pink-500 to-pink-600",
      stats: "Customer Success",
    },
    {
      name: "expenses",
      title: "Expenses",
      description: "Track every dollar and optimize your business spending.",
      icon: Receipt,
      color: "from-red-500 to-red-600",
      stats: "Cost Optimize",
    },
    {
      name: "contacts",
      title: "Contacts",
      description: "Centralize all business relationships in one powerful hub.",
      icon: BookUser,
      color: "from-indigo-500 to-indigo-600",
      stats: "Network Hub",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed and efficiency",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security",
    },
    {
      icon: BarChart3,
      title: "Data-Driven",
      description: "Make informed decisions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            All-in-One Business Solution
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 mb-6 leading-tight">
            Welcome to
            <br />
            UNI Flow ERP
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your business operations with our integrated enterprise
            resource planning platform
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate("/signup")}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200"
            >
              Sign In
            </button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200"
              >
                <feature.icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {feature.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Powerful Modules for Every Need
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our comprehensive suite of business management tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.name}
                onMouseEnter={() => setHoveredModule(mod.name)}
                onMouseLeave={() => setHoveredModule(null)}
                onClick={() => navigate(`/modules-samples/${mod.name}`)}
                className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-transparent overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${mod.color} group-hover:bg-white/20 transition-colors duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-gray-100 group-hover:bg-white/30 text-gray-700 group-hover:text-white rounded-full transition-colors duration-300">
                      {mod.stats}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">
                    {mod.title}
                  </h3>

                  <p className="text-gray-600 group-hover:text-white/90 text-sm mb-4 transition-colors duration-300">
                    {mod.description}
                  </p>

                  <div className="flex items-center text-blue-600 group-hover:text-white font-semibold text-sm transition-colors duration-300">
                    Explore Module
                    <ArrowRight
                      className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                        hoveredModule === mod.name ? "translate-x-2" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">Join UNI Flow ERP Now</p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-6 h-6" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-6 h-6" />
              <span>Free 30-day trial</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-6 h-6" />
              <span>Cancel anytime</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/signup")}
            className="group px-10 py-5 bg-white text-blue-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            Register Your Company Now
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2025 UNI Flow ERP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
