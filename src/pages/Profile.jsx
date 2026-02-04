import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  DollarSign,
  Edit3,
  Settings,
  CreditCard,
  Package,
  TrendingUp,
  Users,
  Receipt,
  MessageSquare,
  UserCircle,
  BookUser,
  Shield,
  Crown,
  CheckCircle2,
  Loader,
  AlertTriangle,
  UserPlus,
  X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5225";

const moduleIcons = {
  SALES: TrendingUp,
  Sales: TrendingUp,
  HR: Users,
  EXPENSES: Receipt,
  Expenses: Receipt,
  CRM: MessageSquare,
  INVENTORY: Package,
  Inventory: Package,
  USERS: UserCircle,
  Users: UserCircle,
  CONTACTS: BookUser,
  Contacts: BookUser,
};

const moduleColors = {
  SALES: "from-green-500 to-emerald-600",
  Sales: "from-green-500 to-emerald-600",
  HR: "from-purple-500 to-purple-600",
  EXPENSES: "from-red-500 to-red-600",
  Expenses: "from-red-500 to-red-600",
  CRM: "from-pink-500 to-pink-600",
  INVENTORY: "from-orange-500 to-orange-600",
  Inventory: "from-orange-500 to-orange-600",
  USERS: "from-blue-500 to-blue-600",
  Users: "from-blue-500 to-blue-600",
  CONTACTS: "from-indigo-500 to-indigo-600",
  Contacts: "from-indigo-500 to-indigo-600",
};

const modulePrices = {
  SALES: 50,
  Sales: 50,
  INVENTORY: 45,
  Inventory: 45,
  HR: 40,
  EXPENSES: 35,
  Expenses: 35,
  CRM: 55,
  USERS: 30,
  Users: 30,
  CONTACTS: 30,
  Contacts: 30,
};

const availableRoles = [
  { value: "CompanyOwner", label: "Company Owner", description: "Full system access" },
  { value: "HRHead", label: "HR Head", description: "HR management access" },
  { value: "HRManager", label: "HR Manager", description: "Employee management" },
  { value: "Employee", label: "Employee", description: "Basic employee access" },
  { value: "Accountant", label: "Accountant", description: "Financial access" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [companyData, setCompanyData] = useState(null);
  const [modules, setModules] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    roles: [],
  });
  const [rolesFormData, setRolesFormData] = useState([]);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch company data
      const companyResponse = await fetch(`${API_BASE_URL}/api/companies/me`, {
        headers: getAuthHeaders(),
      });
      
      if (companyResponse.ok) {
        const company = await companyResponse.json();
        setCompanyData(company);
      }

      // Fetch company modules
      const modulesResponse = await fetch(`${API_BASE_URL}/api/company-modules`, {
        headers: getAuthHeaders(),
      });
      
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        const enabledModules = modulesData.filter(m => m.isEnabled);
        setModules(enabledModules);
      }

      // Fetch company users (only for managers)
      if (user?.roles?.includes("CompanyOwner") || user?.roles?.includes("Manager")) {
        const usersResponse = await fetch(`${API_BASE_URL}/api/company-users`, {
          headers: getAuthHeaders(),
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setCompanyUsers(usersData || []);
        }
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/company-users`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(userFormData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create user");
      }

      alert("User created successfully!");
      setShowUserModal(false);
      resetUserForm();
      fetchProfileData();
    } catch (error) {
      alert(error.message || "Failed to create user");
    }
  };

  const handleOpenRolesModal = (selectedUser) => {
    setSelectedUser(selectedUser);
    setRolesFormData(selectedUser.roles || []);
    setShowRolesModal(true);
  };

  const handleUpdateRoles = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company-users/${selectedUser.id}/roles`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ roles: rolesFormData }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update roles");
      }

      alert("Roles updated successfully!");
      setShowRolesModal(false);
      setSelectedUser(null);
      fetchProfileData();
    } catch (error) {
      alert(error.message || "Failed to update roles");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      return;
    }
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company-users/${userId}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      alert("User status updated successfully!");
      fetchProfileData();
    } catch (error) {
      alert(error.message || "Failed to update status");
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      email: "",
      password: "",
      fullName: "",
      roles: [],
    });
  };

  const toggleRole = (role) => {
    setUserFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const toggleRoleInUpdate = (role) => {
    setRolesFormData(prev => 
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const getRoleColor = (role) => {
    const colors = {
      CompanyOwner: "bg-purple-100 text-purple-800",
      HRHead: "bg-blue-100 text-blue-800",
      HRManager: "bg-green-100 text-green-800",
      Employee: "bg-gray-100 text-gray-800",
      Accountant: "bg-yellow-100 text-yellow-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getInitials = (fullName) => {
    if (!fullName) return "?";
    const names = fullName.split(" ");
    return names.length > 1 
      ? names[0][0] + names[names.length - 1][0]
      : names[0][0];
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleEditCompany = () => {
    navigate("/company/edit");
  };

  const email = user?.email || "Not provided";
  const companyName = companyData?.name || user?.companyName || "Your Company";
  const fullName = user?.fullName || "User";
  const phoneNumber = user?.phoneNumber || "Not provided";
  const isManager = user?.roles?.includes("CompanyOwner") || user?.roles?.includes("Manager");
  
  const totalCost = modules.reduce((sum, mod) => {
    const price = modulePrices[mod.moduleKey] || modulePrices[mod.moduleName] || 0;
    return sum + price;
  }, 0);
  
  const joinDate = companyData?.createdAt 
    ? new Date(companyData.createdAt).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : "January 2025";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <div className="text-center">
          <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProfileData}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account and subscriptions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company/User Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {isManager ? (
                    <Crown className="w-12 h-12 text-white" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {isManager ? companyName : fullName}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  <Shield className="w-4 h-4" />
                  {isManager ? "Company Owner" : "User"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-900 break-all">{email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <p className="text-sm text-gray-900">{phoneNumber}</p>
                  </div>
                </div>

                {isManager && companyData && (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Company</p>
                        <p className="text-sm text-gray-900 font-semibold">{companyData.name}</p>
                        {companyData.commercialName && companyData.commercialName !== companyData.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            ({companyData.commercialName})
                          </p>
                        )}
                      </div>
                    </div>

                    {companyData.address && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Address</p>
                          <p className="text-sm text-gray-900">{companyData.address}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Member Since</p>
                    <p className="text-sm text-gray-900">{joinDate}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <UserCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">User ID</p>
                    <p className="text-sm text-gray-900 font-mono">{user?.userId?.substring(0, 8)}...</p>
                  </div>
                </div>

                {companyData && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Company ID</p>
                      <p className="text-sm text-gray-900 font-mono">{companyData.id}</p>
                    </div>
                  </div>
                )}
              </div>

              {isManager && (
                <button
                  onClick={handleEditCompany}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Company Info
                </button>
              )}
            </div>

            {/* Subscription Summary */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Subscription</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-blue-100 text-sm">Active Modules</p>
                  <p className="text-3xl font-bold">{modules.length}</p>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-blue-100 text-sm">Monthly Cost</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-6 h-6" />
                    <p className="text-3xl font-bold">{totalCost}</p>
                    <span className="text-lg text-blue-100">/mo</span>
                  </div>
                </div>
                {companyData?.isActive !== undefined && (
                  <div className="pt-3 border-t border-white/20">
                    <p className="text-blue-100 text-sm">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${companyData.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <p className="text-lg font-semibold">
                        {companyData.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Modules & Users */}
          <div className="lg:col-span-2 space-y-6">
            {/* Modules Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Subscribed Modules
                  </h2>
                  <p className="text-gray-600">Your active ERP modules and features</p>
                </div>
                <button
                  onClick={() => handleNavigate("/dashboard")}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Settings className="w-4 h-4" />
                  Manage
                </button>
              </div>

              {modules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Modules Enabled</h3>
                  <p className="text-gray-600 mb-6">Start by enabling modules to power your business</p>
                  <button
                    onClick={() => handleNavigate("/dashboard")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Browse Modules
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {modules.map((mod, index) => {
                      const Icon = moduleIcons[mod.moduleKey] || moduleIcons[mod.moduleName] || Package;
                      const colorGradient = moduleColors[mod.moduleKey] || moduleColors[mod.moduleName] || "from-gray-500 to-gray-600";
                      const price = modulePrices[mod.moduleKey] || modulePrices[mod.moduleName] || 0;

                      return (
                        <div
                          key={index}
                          className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-12 h-12 bg-gradient-to-br ${colorGradient} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 mb-1">{mod.moduleName}</h3>

                          {price > 0 && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-xl font-bold">{price}</span>
                              <span className="text-sm text-gray-500">/month</span>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              Active
                            </span>
                            {mod.enabledAt && (
                              <span className="text-xs text-gray-500">
                                Since {new Date(mod.enabledAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {mod.expiresAt && (
                            <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                              Expires: {new Date(mod.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Usage Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Subscription Details</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
                        <p className="text-xs text-gray-600 mt-1">Active Modules</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">${totalCost}</p>
                        <p className="text-xs text-gray-600 mt-1">Monthly Total</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">${totalCost * 12}</p>
                        <p className="text-xs text-gray-600 mt-1">Yearly Total</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Company Users Section - Only visible for managers */}
            {isManager && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Company Users</h2>
                    <p className="text-gray-600">Manage system users and permissions - {companyUsers.length} total users</p>
                  </div>
                  <button
                    onClick={() => { resetUserForm(); setShowUserModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </button>
                </div>

                {companyUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Yet</h3>
                    <p className="text-gray-600 mb-6">Add users to collaborate within your company</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyUsers.map(companyUser => (
                      <div key={companyUser.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                            {getInitials(companyUser.fullName)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{companyUser.fullName}</h3>
                            <p className="text-sm text-gray-600 truncate">{companyUser.email}</p>
                            <div className="flex gap-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                companyUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {companyUser.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {companyUser.isLockedOut && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  🔒 Locked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2 font-medium">ASSIGNED ROLES</p>
                          <div className="flex flex-wrap gap-2">
                            {companyUser.roles && companyUser.roles.length > 0 ? (
                              companyUser.roles.map((role, idx) => (
                                <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                                  {availableRoles.find(r => r.value === role)?.label || role}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400 italic">No roles assigned</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                          <button
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            onClick={() => handleOpenRolesModal(companyUser)}
                          >
                            🔐 Manage Roles
                          </button>
                          <button
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              companyUser.isActive
                                ? 'bg-red-50 hover:bg-red-100 text-red-600'
                                : 'bg-green-50 hover:bg-green-100 text-green-600'
                            }`}
                            onClick={() => handleToggleStatus(companyUser.id, companyUser.isActive)}
                          >
                            {companyUser.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowUserModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Company User</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowUserModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({...userFormData, fullName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  placeholder="user@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles *</label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableRoles.map(role => (
                    <label 
                      key={role.value} 
                      className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={userFormData.roles.includes(role.value)}
                        onChange={() => toggleRole(role.value)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{role.label}</div>
                        <div className="text-xs text-gray-500">{role.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {userFormData.roles.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">Please select at least one role</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                  onClick={() => setShowUserModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={userFormData.roles.length === 0}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Roles Modal */}
      {showRolesModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowRolesModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Manage User Roles</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedUser.fullName}</p>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowRolesModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateRoles} className="p-6">
              <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-6">
                {availableRoles.map(role => (
                  <label 
                    key={role.value} 
                    className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={rolesFormData.includes(role.value)}
                      onChange={() => toggleRoleInUpdate(role.value)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{role.label}</div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              {rolesFormData.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">⚠️ Warning: User must have at least one role</p>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                  onClick={() => setShowRolesModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={rolesFormData.length === 0}
                >
                  Update Roles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}