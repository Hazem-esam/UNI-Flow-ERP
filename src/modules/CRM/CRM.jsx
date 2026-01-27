import { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Header from "./components/Header";
import Tabs from "./components/Tabs";
import Overview from "./components/Overview";
import Leads from "./components/Leads";
import Customers from "./components/Customers";
import Pipeline from "./components/Pipeline";
import LeadModal from "./components/LeadModal";

export default function CRM() {
  const [activeTab, setActiveTab] = useState("overview");
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // Load data from localStorage
  useEffect(() => {
    const savedLeads = localStorage.getItem("crm_leads");
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    } else {
      const sampleLeads = [
        {
          id: 1,
          name: "Tech Startup Inc",
          contact: "John Smith",
          email: "john@techstartup.com",
          phone: "555-1001",
          value: 50000,
          stage: "proposal",
          source: "Website",
          lastContact: "2025-01-20",
        },
        {
          id: 2,
          name: "Global Corp",
          contact: "Sarah Johnson",
          email: "sarah@globalcorp.com",
          phone: "555-1002",
          value: 120000,
          stage: "negotiation",
          source: "Referral",
          lastContact: "2025-01-22",
        },
        {
          id: 3,
          name: "Small Business LLC",
          contact: "Mike Davis",
          email: "mike@smallbiz.com",
          phone: "555-1003",
          value: 25000,
          stage: "qualified",
          source: "Cold Call",
          lastContact: "2025-01-18",
        },
        {
          id: 4,
          name: "Enterprise Solutions",
          contact: "Emily Brown",
          email: "emily@enterprise.com",
          phone: "555-1004",
          value: 200000,
          stage: "proposal",
          source: "LinkedIn",
          lastContact: "2025-01-23",
        },
        {
          id: 5,
          name: "Retail Chain",
          contact: "David Wilson",
          email: "david@retail.com",
          phone: "555-1005",
          value: 75000,
          stage: "new",
          source: "Email Campaign",
          lastContact: "2025-01-24",
        },
      ];
      setLeads(sampleLeads);
      localStorage.setItem("crm_leads", JSON.stringify(sampleLeads));
    }

    const savedCustomers = localStorage.getItem("crm_customers");
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      const sampleCustomers = [
        {
          id: 1,
          name: "Acme Corporation",
          contact: "Jane Doe",
          email: "jane@acme.com",
          phone: "555-2001",
          lifetimeValue: 450000,
          lastPurchase: "2025-01-15",
          status: "active",
        },
        {
          id: 2,
          name: "Beta Industries",
          contact: "Tom Anderson",
          email: "tom@beta.com",
          phone: "555-2002",
          lifetimeValue: 280000,
          lastPurchase: "2025-01-10",
          status: "active",
        },
        {
          id: 3,
          name: "Gamma Services",
          contact: "Lisa Martinez",
          email: "lisa@gamma.com",
          phone: "555-2003",
          lifetimeValue: 120000,
          lastPurchase: "2024-12-20",
          status: "inactive",
        },
      ];
      setCustomers(sampleCustomers);
      localStorage.setItem("crm_customers", JSON.stringify(sampleCustomers));
    }
  }, []);

  // Save leads
  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    localStorage.setItem("crm_leads", JSON.stringify(newLeads));
  };

  // Calculate stats
  const totalLeads = leads.length;
  const totalLeadValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const conversionRate = (
    (customers.length / (customers.length + leads.length)) *
    100
  ).toFixed(1);
  const avgDealSize = leads.length > 0 ? totalLeadValue / leads.length : 0;

  // Pipeline stages data
  const pipelineData = [
    {
      stage: "New",
      count: leads.filter((l) => l.stage === "new").length,
      value: leads
        .filter((l) => l.stage === "new")
        .reduce((s, l) => s + l.value, 0),
    },
    {
      stage: "Qualified",
      count: leads.filter((l) => l.stage === "qualified").length,
      value: leads
        .filter((l) => l.stage === "qualified")
        .reduce((s, l) => s + l.value, 0),
    },
    {
      stage: "Proposal",
      count: leads.filter((l) => l.stage === "proposal").length,
      value: leads
        .filter((l) => l.stage === "proposal")
        .reduce((s, l) => s + l.value, 0),
    },
    {
      stage: "Negotiation",
      count: leads.filter((l) => l.stage === "negotiation").length,
      value: leads
        .filter((l) => l.stage === "negotiation")
        .reduce((s, l) => s + l.value, 0),
    },
  ];

  // Lead sources
  const sourceData = leads.reduce((acc, lead) => {
    const existing = acc.find((item) => item.name === lead.source);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: lead.source, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  // Filter leads
  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // CRUD operations
  const handleSaveLead = (leadData) => {
    if (editingLead) {
      const updatedLeads = leads.map((l) =>
        l.id === editingLead.id ? { ...leadData, id: editingLead.id } : l
      );
      saveLeads(updatedLeads);
    } else {
      const newLead = {
        ...leadData,
        id: Math.max(...leads.map((l) => l.id), 0) + 1,
      };
      saveLeads([...leads, newLead]);
    }
    setShowLeadModal(false);
    setEditingLead(null);
  };

  const handleDeleteLead = (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      saveLeads(leads.filter((l) => l.id !== id));
    }
  };

  const handleConvertToCustomer = (lead) => {
    const newCustomer = {
      id: Math.max(...customers.map((c) => c.id), 0) + 1,
      name: lead.name,
      contact: lead.contact,
      email: lead.email,
      phone: lead.phone,
      lifetimeValue: lead.value,
      lastPurchase: new Date().toISOString().split("T")[0],
      status: "active",
    };
    const newCustomers = [...customers, newCustomer];
    setCustomers(newCustomers);
    localStorage.setItem("crm_customers", JSON.stringify(newCustomers));
    saveLeads(leads.filter((l) => l.id !== lead.id));
    alert(`${lead.name} converted to customer successfully!`);
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "qualified":
        return "bg-purple-100 text-purple-700";
      case "proposal":
        return "bg-yellow-100 text-yellow-700";
      case "negotiation":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex">
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Header />

          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === "overview" && (
            <Overview
              totalLeads={totalLeads}
              totalLeadValue={totalLeadValue}
              customers={customers}
              conversionRate={conversionRate}
              pipelineData={pipelineData}
              sourceData={sourceData}
              COLORS={COLORS}
            />
          )}

          {activeTab === "leads" && (
            <Leads
              leads={leads}
              filteredLeads={filteredLeads}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setEditingLead={setEditingLead}
              setShowLeadModal={setShowLeadModal}
              handleDeleteLead={handleDeleteLead}
              handleConvertToCustomer={handleConvertToCustomer}
              getStageColor={getStageColor}
            />
          )}

          {activeTab === "customers" && <Customers customers={customers} />}

          {activeTab === "pipeline" && (
            <Pipeline pipelineData={pipelineData} />
          )}
        </div>

        {showLeadModal && (
          <LeadModal
            lead={editingLead}
            onSave={handleSaveLead}
            onClose={() => {
              setShowLeadModal(false);
              setEditingLead(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
