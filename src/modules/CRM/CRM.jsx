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
  Lock,
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
} from "../CRM/services/Crmservice";

function CRMContent() {
  const { user, hasPermission, hasAnyPermission } = useContext(AuthContext);

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

  // ═══════════════════════════════════════════════════════════
  // PERMISSION CHECKS - Using CRM-specific permissions
  // ═══════════════════════════════════════════════════════════

  // Lead Permissions (crm.leads.*)
  const canViewLeads = hasAnyPermission([
    "crm.leads.read",
    "crm.leads.access",
    "crm.leads.manage",
  ]);
  const canAccessLeads = hasAnyPermission([
    "crm.leads.access",
    "crm.leads.manage",
  ]);
  const canManageLeads = hasPermission("crm.leads.manage");

  // Customer Permissions (crm.Customers.*)
  const canViewCustomers = hasAnyPermission([
    "crm.Customers.read",
    "crm.Customers.access",
    "crm.Customers.manage",
  ]);
  const canAccessCustomers = hasAnyPermission([
    "crm.Customers.access",
    "crm.Customers.manage",
  ]);
  const canManageCustomers = hasPermission("crm.Customers.manage");

  // Check if user has ANY CRM access
  const hasAnyCRMAccess = hasAnyPermission([
    "crm.leads.read",
    "crm.leads.access",
    "crm.leads.manage",
    "crm.Customers.read",
    "crm.Customers.access",
    "crm.Customers.manage",
  ]);

  // ═══════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchPromises = [];

      if (canViewLeads) fetchPromises.push(loadLeads());
      if (canViewCustomers) fetchPromises.push(loadCustomers());
      if (canViewLeads || canViewCustomers) fetchPromises.push(loadPipeline());

      await Promise.all(fetchPromises);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    if (!canViewLeads) {
      console.log("User doesn't have permission to read leads");
      return;
    }

    try {
      const apiLeads = await leadsApi.getAll();

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

  const loadCustomers = async () => {
    if (!canViewCustomers) {
      console.log("User doesn't have permission to read customers");
      return;
    }

    try {
      const apiCustomers = await customersApi.getAll(true);

      const transformedCustomers = apiCustomers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        contact: customer.name,
        email: customer.email,
        phone: customer.phone,
        lifetimeValue: customer.creditLimit || 0,
        lastPurchase: new Date().toISOString().split("T")[0],
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

  const loadPipeline = async () => {
    try {
      const apiDeals = await pipelineApi.getAll();
      setPipelineDeals(apiDeals);
    } catch (err) {
      console.error("Error loading pipeline:", err);
      throw err;
    }
  };

  // ═══════════════════════════════════════════════════════════
  // CALCULATIONS
  // ═══════════════════════════════════════════════════════════

  const totalLeads = canViewLeads ? leads.length : 0;
  const totalLeadValue = canViewLeads
    ? leads.reduce((sum, lead) => sum + lead.value, 0)
    : 0;
  const conversionRate =
    canViewLeads && canViewCustomers
      ? ((customers.length / (customers.length + leads.length)) * 100).toFixed(
          1,
        )
      : 0;

  const pipelineData = canViewLeads
    ? [
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
      ]
    : [];

  const sourceData = canViewLeads
    ? leads.reduce((acc, lead) => {
        const existing = acc.find((item) => item.name === lead.source);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: lead.source, value: 1 });
        }
        return acc;
      }, [])
    : [];

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  const filteredLeads = canViewLeads
    ? leads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.contact.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // ═══════════════════════════════════════════════════════════
  // LEAD CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════

  const handleSaveLead = async (leadData) => {
    if (!canManageLeads && !canAccessLeads) {
      alert("You don't have permission to save leads");
      return;
    }

    try {
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
        assignedToId: null,
      };

      if (editingLead) {
        await leadsApi.update(editingLead.id, apiLeadData);
      } else {
        await leadsApi.create(apiLeadData);
      }

      await loadLeads();
      setShowLeadModal(false);
      setEditingLead(null);
    } catch (err) {
      console.error("Error saving lead:", err);

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
    if (!canManageLeads) {
      alert("You don't have permission to delete leads");
      return;
    }

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
    if (!canManageLeads) {
      alert("You don't have permission to convert leads");
      return;
    }

    if (!canManageCustomers && !canAccessCustomers) {
      alert("You don't have permission to create customers");
      return;
    }

    try {
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

      const conversionData = {
        customerId: newCustomer.id || 0,
        createDeal: true,
        dealName: `Deal - ${lead.name}`,
        dealAmount: lead.value,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        dealStage: DealStage.PROPOSAL,
        ownerId: null,
      };

      await leadsApi.convert(lead.id, conversionData);

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

  // ═══════════════════════════════════════════════════════════
  // CUSTOMER CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════

  const handleSaveCustomer = async (customerData) => {
    if (!canManageCustomers && !canAccessCustomers) {
      alert("You don't have permission to save customers");
      return;
    }

    try {
      let response;
      if (editingCustomer) {
        const updateData = {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          taxNumber: customerData.taxNumber,
          creditLimit: customerData.creditLimit,
          isActive: customerData.isActive,
        };
        response = await customersApi.update(editingCustomer.id, updateData);
      } else {
        response = await customersApi.create(customerData);
      }
      if (response?.success !== false) {
        await loadCustomers();
        setShowCustomerModal(false);
        setEditingCustomer(null);
      }
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
    if (!canManageCustomers) {
      alert("You don't have permission to delete customers");
      return;
    }

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

  // ═══════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════
  // RENDER GUARDS
  // ═══════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="flex">
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Header />

          {/* Tabs - Only show tabs user has permission for */}
          <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-md overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Overview
            </button>

            {canViewLeads && (
              <button
                onClick={() => setActiveTab("leads")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === "leads"
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Leads
              </button>
            )}

            {canViewCustomers && (
              <button
                onClick={() => setActiveTab("customers")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === "customers"
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Customers
              </button>
            )}

            {(canViewLeads || canViewCustomers) && (
              <button
                onClick={() => setActiveTab("pipeline")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  activeTab === "pipeline"
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Pipeline
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <Overview
              totalLeads={totalLeads}
              totalLeadValue={totalLeadValue}
              customers={canViewCustomers ? customers : []}
              conversionRate={conversionRate}
              pipelineData={pipelineData}
              sourceData={sourceData}
              COLORS={COLORS}
              canViewLeads={canViewLeads}
              canViewCustomers={canViewCustomers}
            />
          )}

          {activeTab === "leads" && canViewLeads && (
            <Leads
              leads={leads}
              filteredLeads={filteredLeads}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setEditingLead={
                canManageLeads || canAccessLeads
                  ? setEditingLead
                  : () => alert("You don't have permission to edit leads")
              }
              setShowLeadModal={
                canManageLeads || canAccessLeads
                  ? setShowLeadModal
                  : () => alert("You don't have permission to create leads")
              }
              handleDeleteLead={canManageLeads ? handleDeleteLead : null}
              handleConvertToCustomer={
                canManageLeads ? handleConvertToCustomer : null
              }
              getStageColor={getStageColor}
              canManage={canManageLeads}
              canAccess={canAccessLeads}
            />
          )}

          {activeTab === "customers" && (
            <>
              {canViewCustomers ? (
                <Customers
                  customers={customers}
                  onAdd={
                    canManageCustomers || canAccessCustomers
                      ? () => {
                          setEditingCustomer(null);
                          setShowCustomerModal(true);
                        }
                      : null
                  }
                  onEdit={
                    canManageCustomers || canAccessCustomers
                      ? (customer) => {
                          setEditingCustomer(customer); // ✅ This will now receive properly formatted data from Customers.jsx

                          setShowCustomerModal(true);
                        }
                      : null
                  }
                  onDelete={canManageCustomers ? handleDeleteCustomer : null}
                  canManage={canManageCustomers}
                  canAccess={canAccessCustomers}
                />
              ) : (
                <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                  <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Access Denied
                  </h3>
                  <p className="text-gray-600">
                    You don't have permission to view customers.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Required: crm.Customers.read, crm.Customers.access, or
                    crm.Customers.manage
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "pipeline" && (canViewLeads || canViewCustomers) && (
            <Pipeline
              pipelineDeals={pipelineDeals}
              pipelineData={pipelineData}
              loadPipeline={loadPipeline}
              canManage={canManageCustomers}
              canAccess={canAccessCustomers}
            />
          )}
        </div>

        {/* Modals */}
        {showLeadModal && (canManageLeads || canAccessLeads) && (
          <LeadModal
            lead={editingLead}
            onSave={handleSaveLead}
            onClose={() => {
              setShowLeadModal(false);
              setEditingLead(null);
            }}
          />
        )}

        {showCustomerModal && (canManageCustomers || canAccessCustomers) && (
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

// ═══════════════════════════════════════════════════════════
// MAIN EXPORT WITH ACCESS GUARD
// ═══════════════════════════════════════════════════════════

export default function CRM() {
  const { user, hasAnyPermission } = useContext(AuthContext);

  // Check if user has any CRM permissions
  const hasAnyCRMAccess = hasAnyPermission([
    "crm.leads.read",
    "crm.leads.access",
    "crm.leads.manage",
    "crm.Customers.read",
    "crm.Customers.access",
    "crm.Customers.manage",
  ]);

  if (!hasAnyCRMAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-slate-50 p-6">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the CRM module.
          </p>
          <div className="text-sm text-gray-500 text-left bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Required Permissions (any):</p>
            <ul className="list-disc list-inside space-y-1">
              <li>crm.leads.read</li>
              <li>crm.leads.access</li>
              <li>crm.leads.manage</li>
              <li>crm.Customers.read</li>
              <li>crm.Customers.access</li>
              <li>crm.Customers.manage</li>
            </ul>
          </div>
          {user?.roles && (
            <p className="text-sm text-gray-500 mt-4">
              Your roles: {user.roles.join(", ")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <CRMContent />;
}
