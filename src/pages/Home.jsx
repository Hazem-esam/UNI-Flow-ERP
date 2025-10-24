import React from "react";
import { useNavigate } from "react-router-dom";
import NavbarDefault from "../components/NavbarDefault";
import SignupCompany from "./auth/SignupCompany";
export default function Home() {
  const navigate = useNavigate();

  const modules = [
    {
      name: "dashboard",
      title: "Dashboard",
      description: "View key metrics and business insights.",
    },
    {
      name: "hr",
      title: "Human Resources (HR)",
      description: "Manage employees, attendance, and payroll.",
    },
    {
      name: "sales",
      title: "Sales",
      description: "Track sales, quotations, and invoices.",
    },
    {
      name: "inventory",
      title: "Inventory",
      description: "Monitor stock levels and supplier info.",
    },
    {
      name: "crm",
      title: "CRM",
      description: "Manage leads, customers, and opportunities.",
    },
    {
      name: "expenses",
      title: "Expenses",
      description: "Track and analyze business expenses.",
    },
    {
      name: "contacts",
      title: "Contacts",
      description: "Centralize all your business relationships.",
    },
  ];

  return (
    <>
      <NavbarDefault />
      <div className="min-h-screen bg-gray-50 p-10">
        <h1 className="text-3xl font-bold text-center mb-10 text-blue-700">
          Welcome to UNI Flow ERP
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-transform hover:-translate-y-1 border border-gray-200 cursor-pointer"
              onClick={() => navigate(`/modules/${mod.name}`)}
            >
              <h2 className="text-xl font-semibold mb-3 text-blue-600">
                {mod.title}
              </h2>
              <p className="text-gray-700 text-sm">{mod.description}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/modules/${mod.name}`);
                }}
                className="mt-5 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go to Module →
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              navigate("/signupcompany");
            }}
            className="cursor-pointer items-center justify-center text-xl font-extrabold m-5 border-2 rounded-3xl p-5 text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Register Your Company to Join Our Platform
          </button>
        </div>
      </div>
    </>
  );
}
