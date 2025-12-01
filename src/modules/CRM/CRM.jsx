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
    <>
      <div className="flex">
        <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-slate-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    CRM Module
                  </h1>
                  <p className="text-gray-600">
                    Manage leads, customers, and sales pipeline
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md">
              {["overview", "leads", "customers", "pipeline"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <TrendingUp className="w-10 h-10 text-blue-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">Total Leads</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalLeads}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <DollarSign className="w-10 h-10 text-green-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">Pipeline Value</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${(totalLeadValue / 1000).toFixed(0)}K
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <User className="w-10 h-10 text-purple-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">Customers</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {customers.length}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <CheckCircle className="w-10 h-10 text-pink-600 mb-4" />
                    <p className="text-sm text-gray-600 mb-1">
                      Conversion Rate
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {conversionRate}%
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Pipeline Stages
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={pipelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stage" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#ec4899" name="Leads" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Lead Sources
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sourceData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Leads Tab */}
            {activeTab === "leads" && (
              <div className="space-y-6">
                {/* Toolbar */}
                <div className="bg-white rounded-xl p-4 shadow-md flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-3 flex-1 min-w-[300px]">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-pink-500 transition-colors">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-pink-500 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() => {
                        setEditingLead(null);
                        setShowLeadModal(true);
                      }}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Add Lead
                    </button>
                  </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Company
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Value
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Stage
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Source
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredLeads.map((lead) => (
                          <tr
                            key={lead.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {lead.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {lead.lastContact}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {lead.contact}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {lead.email}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ${lead.value.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(
                                  lead.stage
                                )}`}
                              >
                                {lead.stage}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {lead.source}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleConvertToCustomer(lead)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Convert to Customer"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingLead(lead);
                                    setShowLeadModal(true);
                                  }}
                                  className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === "customers" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            customer.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-pink-600 font-medium mb-4">
                        {customer.contact}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">
                            ${customer.lifetimeValue.toLocaleString()} LTV
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Last: {customer.lastPurchase}</span>
                        </div>
                      </div>

                      <button className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-md font-medium">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pipeline Tab */}
            {activeTab === "pipeline" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {pipelineData.map((stage, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {stage.stage}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Leads</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stage.count}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Value</p>
                          <p className="text-xl font-bold text-pink-600">
                            ${(stage.value / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Pipeline Visualization
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={pipelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#ec4899"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#3b82f6"
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="count"
                        fill="#ec4899"
                        name="Number of Leads"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="value"
                        fill="#3b82f6"
                        name="Value ($)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Lead Modal */}
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
    </>
  );
}

// Lead Modal Component
function LeadModal({ lead, onSave, onClose }) {
  const [formData, setFormData] = useState(
    lead || {
      name: "",
      contact: "",
      email: "",
      phone: "",
      value: "",
      stage: "new",
      source: "",
      lastContact: new Date().toISOString().split("T")[0],
    }
  );

  const handleSubmit = () => {
    onSave({
      ...formData,
      value: parseFloat(formData.value),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {lead ? "Edit Lead" : "Add Lead"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Person
            </label>
            <input
              type="text"
              required
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deal Value ($)
            </label>
            <input
              type="number"
              required
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stage
            </label>
            <select
              value={formData.stage}
              onChange={(e) =>
                setFormData({ ...formData, stage: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Source
            </label>
            <select
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Select Source</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Cold Call">Cold Call</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Email Campaign">Email Campaign</option>
              <option value="Event">Event</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Last Contact
            </label>
            <input
              type="date"
              required
              value={formData.lastContact}
              onChange={(e) =>
                setFormData({ ...formData, lastContact: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700"
          >
            {lead ? "Update" : "Add Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}
