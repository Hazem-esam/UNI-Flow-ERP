import { AuthContext } from "./../../context/AuthContext";
import { useState, useEffect, useContext } from "react";
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
import CustomerModal from "./components/CustomerModal";
import {
  leadsApi,
  customersApi,
  pipelineApi,
  mapSourceToEnum,
  mapEnumToSource,
  mapStageToEnum,
  mapEnumToStage,
  mapDealStageToEnum,
  mapEnumToDealStage,
  DealStage,
} from "./services/crmService";

export default function CRM() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pipelineDeals, setPipelineDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from API on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadLeads(), loadCustomers(), loadPipeline()]);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load leads from API
  const loadLeads = async () => {
    try {
      const apiLeads = await leadsApi.getAll();

      // Transform API data to frontend format
      const transformedLeads = apiLeads.map((lead) => ({
        id: lead.id,
        name: lead.companyName || lead.name,
        contact: lead.name,
        email: lead.email,
        phone: lead.phoneNumber,
        value: lead.dealValue,
        stage: mapEnumToStage(lead.stage),
        source: mapEnumToSource(lead.source),
        lastContact:
          lead.lastContactDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
        assignedToId: lead.assignedToId,
        convertedCustomerId: lead.convertedCustomerId,
        convertedDate: lead.convertedDate,
      }));

      setLeads(transformedLeads);
    } catch (err) {
      console.error("Error loading leads:", err);
      throw err;
    }
  };

  // Load customers from API
  const loadCustomers = async () => {
    try {
      const apiCustomers = await customersApi.getAll(true); // Only active customers

      // Transform API data to frontend format
      const transformedCustomers = apiCustomers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        contact: customer.name, // API doesn't have separate contact field
        email: customer.email,
        phone: customer.phone,
        lifetimeValue: customer.creditLimit || 0, // Using creditLimit as placeholder
        lastPurchase: new Date().toISOString().split("T")[0], // Placeholder
        status: customer.isActive ? "active" : "inactive",
        address: customer.address,
        taxNumber: customer.taxNumber,
        code: customer.code,
      }));

      setCustomers(transformedCustomers);
    } catch (err) {
      console.error("Error loading customers:", err);
      throw err;
    }
  };

  // Load pipeline from API
  const loadPipeline = async () => {
    try {
      const apiDeals = await pipelineApi.getAll();
      setPipelineDeals(apiDeals);
    } catch (err) {
      console.error("Error loading pipeline:", err);
      throw err;
    }
  };

  // Calculate stats
  const totalLeads = leads.length;
  const totalLeadValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const conversionRate = (
    (customers.length / (customers.length + leads.length)) *
    100
  ).toFixed(1);

  // Pipeline stages data for leads
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
      lead.contact.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // CRUD operations for Leads
  const handleSaveLead = async (leadData) => {
    try {
      // Transform frontend data to API format
      const apiLeadData = {
        companyId: user?.companyId || 0,
        companyName: leadData.name,
        name: leadData.contact,
        email: leadData.email,
        phoneNumber: leadData.phone,
        source: mapSourceToEnum(leadData.source),
        stage: mapStageToEnum(leadData.stage),
        dealValue: parseFloat(leadData.value),
        lastContactDate: leadData.lastContact,
        assignedToId: null, // Set to null - can be assigned later through employee management
      };

      if (editingLead) {
        // Update existing lead
        await leadsApi.update(editingLead.id, apiLeadData);
      } else {
        // Create new lead
        await leadsApi.create(apiLeadData);
      }

      // Reload leads
      await loadLeads();
      setShowLeadModal(false);
      setEditingLead(null);
    } catch (err) {
      console.error("Error saving lead:", err);
      
      // Parse error message for user-friendly display
      let errorMessage = "Failed to save lead. Please try again.";
      if (err.message) {
        try {
          const errorObj = JSON.parse(err.message);
          errorMessage = errorObj.message || errorMessage;
        } catch {
          errorMessage = err.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await leadsApi.delete(id);
        await loadLeads();
      } catch (err) {
        console.error("Error deleting lead:", err);
        
        let errorMessage = "Failed to delete lead. Please try again.";
        if (err.message) {
          try {
            const errorObj = JSON.parse(err.message);
            errorMessage = errorObj.message || errorMessage;
          } catch {
            errorMessage = err.message;
          }
        }
        
        alert(errorMessage);
      }
    }
  };

  const handleConvertToCustomer = async (lead) => {
    try {
      // First, create the customer
      const customerData = {
        code: `CUST-${Date.now()}`,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        address: lead.address || "",
        taxNumber: lead.taxNumber || "",
        creditLimit: lead.value,
      };

      const newCustomer = await customersApi.create(customerData);

      // Then convert the lead
      const conversionData = {
        customerId: newCustomer.id || 0,
        createDeal: true,
        dealName: `Deal - ${lead.name}`,
        dealAmount: lead.value,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 30 days from now
        dealStage: DealStage.PROPOSAL,
        ownerId: null, // Set to null - can be assigned later
      };

      await leadsApi.convert(lead.id, conversionData);

      // Reload data
      await Promise.all([loadLeads(), loadCustomers(), loadPipeline()]);

      alert(`${lead.name} converted to customer successfully!`);
    } catch (err) {
      console.error("Error converting lead:", err);
      
      let errorMessage = "Failed to convert lead. Please try again.";
      if (err.message) {
        try {
          const errorObj = JSON.parse(err.message);
          errorMessage = errorObj.message || errorMessage;
        } catch {
          errorMessage = err.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  // CRUD operations for Customers
  const handleSaveCustomer = async (customerData) => {
    try {
      if (editingCustomer) {
        // Update existing customer
        const updateData = {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          taxNumber: customerData.taxNumber,
          creditLimit: customerData.creditLimit,
          isActive: customerData.isActive,
        };
        await customersApi.update(editingCustomer.id, updateData);
      } else {
        // Create new customer
        await customersApi.create(customerData);
      }

      // Reload customers
      await loadCustomers();
      setShowCustomerModal(false);
      setEditingCustomer(null);
    } catch (err) {
      console.error("Error saving customer:", err);
      
      let errorMessage = "Failed to save customer. Please try again.";
      if (err.message) {
        try {
          const errorObj = JSON.parse(err.message);
          errorMessage = errorObj.message || errorMessage;
        } catch {
          errorMessage = err.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await customersApi.delete(id);
        await loadCustomers();
      } catch (err) {
        console.error("Error deleting customer:", err);
        
        let errorMessage = "Failed to delete customer. Please try again.";
        if (err.message) {
          try {
            const errorObj = JSON.parse(err.message);
            errorMessage = errorObj.message || errorMessage;
          } catch {
            errorMessage = err.message;
          }
        }
        
        alert(errorMessage);
      }
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-slate-50">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Error Loading Data
          </h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={loadAllData}
            className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

          {activeTab === "customers" && (
            <Customers 
              customers={customers}
              onAdd={() => {
                setEditingCustomer(null);
                setShowCustomerModal(true);
              }}
              onEdit={(customer) => {
                setEditingCustomer(customer);
                setShowCustomerModal(true);
              }}
              onDelete={handleDeleteCustomer}
            />
          )}

          {activeTab === "pipeline" && (
            <Pipeline 
              pipelineDeals={pipelineDeals}
              pipelineData={pipelineData}
              loadPipeline={loadPipeline}
            />
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

        {showCustomerModal && (
          <CustomerModal
            customer={editingCustomer}
            onSave={handleSaveCustomer}
            onClose={() => {
              setShowCustomerModal(false);
              setEditingCustomer(null);
            }}
          />
        )}
      </div>
    </div>
  );
}