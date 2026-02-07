import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import CompanyUsers from "../components/Companyusers";
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
  X,
  Save,
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

export default function Profile() {
  const navigate = useNavigate();
  const { user, hasAnyPermission } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("profile");
  const [companyData, setCompanyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  const canAccessCompanyUsers = hasAnyPermission([
    "core.users.read",
    "core.users.create",
    "core.users.update",
    "core.users.delete",
  ]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    // If user doesn't have access to company users and that tab is active, switch to profile
    if (activeTab === "companyUsers" && !canAccessCompanyUsers) {
      setActiveTab("profile");
    }
  }, [activeTab, canAccessCompanyUsers]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch current user's profile data using the company-users endpoint
      const userResponse = await fetch(`${API_BASE_URL}/api/company-users`, {
        headers: getAuthHeaders(),
      });

      if (userResponse.ok) {
        const allUsers = await userResponse.json();
        // Find the current user in the list
        const currentUser = allUsers.find((u) => u.id === user.userId);
        
        if (currentUser) {
          setUserData(currentUser);
          // Update profile form data with fetched data
          setProfileFormData({
            fullName: currentUser.fullName || "",
            phoneNumber: currentUser.phoneNumber || "",
            email: currentUser.email || "",
          });
        } else {
          // Fallback to data from context if user not found
          setProfileFormData({
            fullName: user?.fullName || "",
            phoneNumber: user?.phoneNumber || "",
            email: user?.email || "",
          });
        }
      } else {
        // Fallback to data from context if fetch fails
        setProfileFormData({
          fullName: user?.fullName || "",
          phoneNumber: user?.phoneNumber || "",
          email: user?.email || "",
        });
      }

      // Fetch company data
      const companyResponse = await fetch(`${API_BASE_URL}/api/companies/me`, {
        headers: getAuthHeaders(),
      });

      if (companyResponse.ok) {
        const company = await companyResponse.json();
        setCompanyData(company);
      }

      // Fetch company modules
      const modulesResponse = await fetch(
        `${API_BASE_URL}/api/company-modules`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        const enabledModules = modulesData.filter((m) => m.isEnabled);
        setModules(enabledModules);
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company-users/${user.userId}/profile`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(profileFormData),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update profile");
      }

      // Update local storage with new data
      const updatedUser = {
        ...user,
        fullName: profileFormData.fullName,
        phoneNumber: profileFormData.phoneNumber,
        email: profileFormData.email,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update user data state
      if (userData) {
        setUserData({
          ...userData,
          fullName: profileFormData.fullName,
          phoneNumber: profileFormData.phoneNumber,
          email: profileFormData.email,
        });
      }

      alert("Profile updated successfully!");
      setShowEditProfileModal(false);
      
      // Refresh profile data to ensure consistency
      await fetchProfileData();
    } catch (error) {
      alert(error.message || "Failed to update profile");
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleEditCompany = () => {
    navigate("/company/edit");
  };

  // Use userData if available, otherwise fall back to user context
  const displayUser = userData || user;
  const email = displayUser?.email || "Not provided";
  const fullName = displayUser?.fullName || "User";
  const phoneNumber = displayUser?.phoneNumber || "Not provided";
  const companyName = companyData?.name || user?.companyName || "Your Company";
  const isManager =
    displayUser?.roles?.includes("CompanyOwner") ||
    displayUser?.roles?.includes("Manager") ||
    displayUser?.roles?.includes("Owner");

  const totalCost = modules.reduce((sum, mod) => {
    const price =
      modulePrices[mod.moduleKey] || modulePrices[mod.moduleName] || 0;
    return sum + price;
  }, 0);

  const joinDate = companyData?.createdAt
    ? new Date(companyData.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Profile
          </h2>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your profile and company settings
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  My Profile
                </div>
              </button>

              {canAccessCompanyUsers && (
                <button
                  onClick={() => setActiveTab("companyUsers")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "companyUsers"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Company Users
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Card */}
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
                    {fullName}
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
                          <p className="text-xs text-gray-500 font-medium">
                            Company
                          </p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {companyData.name}
                          </p>
                          {companyData.commercialName &&
                            companyData.commercialName !== companyData.name && (
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
                            <p className="text-xs text-gray-500 font-medium">
                              Address
                            </p>
                            <p className="text-sm text-gray-900">
                              {companyData.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Member Since
                      </p>
                      <p className="text-sm text-gray-900">{joinDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <UserCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        User ID
                      </p>
                      <p className="text-sm text-gray-900 font-mono">
                        {user?.userId?.substring(0, 8)}...
                      </p>
                    </div>
                  </div>

                  {companyData && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Company ID
                        </p>
                        <p className="text-sm text-gray-900 font-mono">
                          {companyData.id}
                        </p>
                      </div>
                    </div>
                  )}

                  {displayUser?.roles && displayUser.roles.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-2">
                          Roles
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {displayUser.roles.map((role, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>

                {isManager && (
                  <button
                    onClick={handleEditCompany}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4" />
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
                        <div
                          className={`w-2 h-2 rounded-full ${companyData.isActive ? "bg-green-400" : "bg-red-400"}`}
                        ></div>
                        <p className="text-lg font-semibold">
                          {companyData.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Modules */}
            <div className="lg:col-span-2 space-y-6">
              {/* Modules Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Subscribed Modules
                    </h2>
                    <p className="text-gray-600">
                      Your active ERP modules and features
                    </p>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Modules Enabled
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start by enabling modules to power your business
                    </p>
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
                        const Icon =
                          moduleIcons[mod.moduleKey] ||
                          moduleIcons[mod.moduleName] ||
                          Package;
                        const colorGradient =
                          moduleColors[mod.moduleKey] ||
                          moduleColors[mod.moduleName] ||
                          "from-gray-500 to-gray-600";
                        const price =
                          modulePrices[mod.moduleKey] ||
                          modulePrices[mod.moduleName] ||
                          0;

                        return (
                          <div
                            key={index}
                            className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className={`w-12 h-12 bg-gradient-to-br ${colorGradient} rounded-lg flex items-center justify-center`}
                              >
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {mod.moduleName}
                            </h3>

                            {price > 0 && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-xl font-bold">
                                  {price}
                                </span>
                                <span className="text-sm text-gray-500">
                                  /month
                                </span>
                              </div>
                            )}

                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                Active
                              </span>
                              {mod.enabledAt && (
                                <span className="text-xs text-gray-500">
                                  Since{" "}
                                  {new Date(mod.enabledAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {mod.expiresAt && (
                              <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                Expires:{" "}
                                {new Date(mod.expiresAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Usage Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4">
                        Subscription Details
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">
                            {modules.length}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Active Modules
                          </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            ${totalCost}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Monthly Total
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            ${totalCost * 12}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Yearly Total
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "companyUsers" && canAccessCompanyUsers && (
          <CompanyUsers />
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setShowEditProfileModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Edit Profile
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowEditProfileModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profileFormData.fullName}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      fullName: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profileFormData.email}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      email: e.target.value,
                    })
                  }
                  placeholder="user@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={profileFormData.phoneNumber}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="+1234567890"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                  onClick={() => setShowEditProfileModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}