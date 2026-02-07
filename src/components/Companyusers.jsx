import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5225";

const CompanyUsers = () => {
  const { hasPermission } = useContext(AuthContext);
  
  // Define permission keys based on your API structure
  const PERMISSIONS = {
    USERS_READ: "core.users.read",
    USERS_CREATE: "core.users.create",
    USERS_UPDATE: "core.users.update",
    USERS_DELETE: "core.users.delete",
    ROLES_MANAGE: "security.roles.manage",
  };

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    roles: [],
  });
  const [rolesFormData, setRolesFormData] = useState([]);
  const [newRoleData, setNewRoleData] = useState({
    name: "",
    permissions: [],
  });
  const [editRoleData, setEditRoleData] = useState({
    name: "",
    permissions: [],
  });

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      hasPermission(PERMISSIONS.USERS_READ) && loadUsers(),
      hasPermission(PERMISSIONS.ROLES_MANAGE) && loadRoles(),
      hasPermission(PERMISSIONS.ROLES_MANAGE) && loadPermissions(),
    ]);
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company-users`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/access/roles`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data || []);
      }
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/access/permissions`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data || []);
      }
    } catch (error) {
      console.error("Error loading permissions:", error);
    }
  };

  // Open Edit User Modal - requires UPDATE permission
  const handleOpenEditUser = (user) => {
    if (!hasPermission(PERMISSIONS.USERS_UPDATE)) {
      alert("You don't have permission to edit users.");
      return;
    }
    setSelectedUser(user);
    setEditUserData({
      fullName: user.fullName || "",
      phoneNumber: user.phoneNumber || "",
      email: user.email || "",
    });
    setShowEditUserModal(true);
  };

  // Update User Profile - requires UPDATE permission
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!hasPermission(PERMISSIONS.USERS_UPDATE)) {
      alert("You don't have permission to update users.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company-users/${selectedUser.id}/profile`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(editUserData),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update user");
      }

      alert("User updated successfully!");
      setShowEditUserModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      alert(error.message || "Error updating user");
    }
  };

  // Delete User - requires DELETE permission
  const handleDeleteUser = async (userId, fullName) => {
    if (!hasPermission(PERMISSIONS.USERS_DELETE)) {
      alert("You don't have permission to delete users.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete user "${fullName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company-users/${userId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete user");
      }

      alert("User deleted successfully!");
      loadUsers();
    } catch (error) {
      alert(error.message || "Error deleting user");
      console.error(error);
    }
  };

  // Create User - requires CREATE permission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasPermission(PERMISSIONS.USERS_CREATE)) {
      alert("You don't have permission to create users.");
      return;
    }

    try {
      const createUserResponse = await fetch(
        `${API_BASE_URL}/api/company-users`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber || "",
            roles: formData.roles,
          }),
        },
      );

      if (!createUserResponse.ok) {
        const error = await createUserResponse.text();
        throw new Error(error || "Failed to create user");
      }

      alert("User created successfully!");
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      alert(error.message || "Failed to create user");
    }
  };

  // Manage User Roles Modal - requires UPDATE permission
  const handleOpenRolesModal = async (user) => {
    if (!hasPermission(PERMISSIONS.USERS_UPDATE)) {
      alert("You don't have permission to manage user roles.");
      return;
    }

    setSelectedUser(user);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/access/user-roles/${user.id}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setRolesFormData(data.roles || []);
      } else {
        setRolesFormData(user.roles || []);
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
      setRolesFormData(user.roles || []);
    }

    setShowRolesModal(true);
  };

  // Update User Roles - requires UPDATE permission
  const handleUpdateRoles = async (e) => {
    e.preventDefault();

    if (!hasPermission(PERMISSIONS.USERS_UPDATE)) {
      alert("You don't have permission to update user roles.");
      return;
    }

    try {
      const currentRolesResponse = await fetch(
        `${API_BASE_URL}/api/access/user-roles/${selectedUser.id}`,
        {
          headers: getAuthHeaders(),
        },
      );

      let currentRoles = [];
      if (currentRolesResponse.ok) {
        const data = await currentRolesResponse.json();
        currentRoles = data.roles || [];
      }

      const rolesToAdd = rolesFormData.filter(
        (role) => !currentRoles.includes(role),
      );
      const rolesToRemove = currentRoles.filter(
        (role) => !rolesFormData.includes(role),
      );

      // Add new roles
      for (const role of rolesToAdd) {
        const response = await fetch(
          `${API_BASE_URL}/api/access/user-roles/assign`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              userId: selectedUser.id,
              roleName: role,
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to assign role "${role}": ${errorText}`);
        }
      }

      // Remove old roles
      for (const role of rolesToRemove) {
        const response = await fetch(
          `${API_BASE_URL}/api/access/user-roles/remove`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              userId: selectedUser.id,
              roleName: role,
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to remove role "${role}": ${errorText}`);
        }
      }

      alert("Roles updated successfully!");
      setShowRolesModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      alert(error.message || "Failed to update roles");
    }
  };

  // Toggle User Status - requires UPDATE permission
  const handleToggleStatus = async (userId, currentStatus) => {
    if (!hasPermission(PERMISSIONS.USERS_UPDATE)) {
      alert("You don't have permission to change user status.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this user?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company-users/${userId}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ isActive: !currentStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      alert("User status updated successfully!");
      loadUsers();
    } catch (error) {
      alert(error.message || "Failed to update status");
    }
  };

  // Create Role - requires ROLES_MANAGE permission
  const handleCreateRole = async (e) => {
    e.preventDefault();

    if (!hasPermission(PERMISSIONS.ROLES_MANAGE)) {
      alert("You don't have permission to create roles.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/access/roles`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newRoleData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create role");
      }

      alert("Role created successfully!");
      setShowCreateRoleModal(false);
      resetRoleForm();
      loadRoles();
    } catch (error) {
      alert(error.message || "Failed to create role");
    }
  };

  // Delete Role - requires ROLES_MANAGE permission
  const handleDeleteRole = async (roleName) => {
    if (!hasPermission(PERMISSIONS.ROLES_MANAGE)) {
      alert("You don't have permission to delete roles.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/access/roles/${roleName}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete role");
      }

      alert("Role deleted successfully!");
      loadRoles();
    } catch (error) {
      alert(error.message || "Failed to delete role");
    }
  };

  // Edit Role - requires ROLES_MANAGE permission
  const handleEditRole = async (e) => {
    e.preventDefault();

    if (!hasPermission(PERMISSIONS.ROLES_MANAGE)) {
      alert("You don't have permission to edit roles.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/access/roles/${editRoleData.name}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            permissions: editRoleData.permissions,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update role");
      }

      alert("Role updated successfully!");
      setShowEditRoleModal(false);
      setSelectedRole(null);
      resetEditRoleForm();
      loadRoles();
    } catch (error) {
      alert(error.message || "Failed to update role");
    }
  };

  const handleOpenEditRole = (role) => {
    if (!hasPermission(PERMISSIONS.ROLES_MANAGE)) {
      alert("You don't have permission to edit roles.");
      return;
    }
    setSelectedRole(role);
    setEditRoleData({
      name: role.name,
      permissions: role.permissions || [],
    });
    setShowEditRoleModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      roles: [],
    });
  };

  const resetRoleForm = () => {
    setNewRoleData({
      name: "",
      permissions: [],
    });
  };

  const resetEditRoleForm = () => {
    setEditRoleData({
      name: "",
      permissions: [],
    });
  };

  const toggleRole = (role) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const toggleRoleInUpdate = (role) => {
    setRolesFormData((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const togglePermission = (permissionKey, isEdit = false, modulePermissions = []) => {
    const currentPermissions = isEdit ? editRoleData.permissions : newRoleData.permissions;
    const isCurrentlySelected = currentPermissions.includes(permissionKey);
    
    const permission = modulePermissions.find(p => p.key === permissionKey);
    const isManagePermission = permission?.action === 'manage';
    
    const managePermission = modulePermissions.find(p => p.action === 'manage');
    const hasManageSelected = managePermission && currentPermissions.includes(managePermission.key);
    
    if (isCurrentlySelected && !isManagePermission && hasManageSelected) {
      alert('Cannot deselect this permission while "manage" permission is active. Please deselect "manage" first.');
      return;
    }
    
    let newPermissions;
    
    if (isManagePermission) {
      if (isCurrentlySelected) {
        const moduleKeys = modulePermissions.map(p => p.key);
        newPermissions = currentPermissions.filter(p => !moduleKeys.includes(p));
      } else {
        const moduleKeys = modulePermissions.map(p => p.key);
        newPermissions = [...new Set([...currentPermissions, ...moduleKeys])];
      }
    } else {
      newPermissions = isCurrentlySelected
        ? currentPermissions.filter((p) => p !== permissionKey)
        : [...currentPermissions, permissionKey];
    }
    
    if (isEdit) {
      setEditRoleData((prev) => ({
        ...prev,
        permissions: newPermissions,
      }));
    } else {
      setNewRoleData((prev) => ({
        ...prev,
        permissions: newPermissions,
      }));
    }
  };

  const toggleAllModulePermissions = (modulePermissions, isEdit = false) => {
    const moduleKeys = modulePermissions.map((p) => p.key);
    const currentPermissions = isEdit
      ? editRoleData.permissions
      : newRoleData.permissions;
    const allSelected = moduleKeys.every((key) =>
      currentPermissions.includes(key),
    );

    if (isEdit) {
      setEditRoleData((prev) => ({
        ...prev,
        permissions: allSelected
          ? prev.permissions.filter((p) => !moduleKeys.includes(p))
          : [...new Set([...prev.permissions, ...moduleKeys])],
      }));
    } else {
      setNewRoleData((prev) => ({
        ...prev,
        permissions: allSelected
          ? prev.permissions.filter((p) => !moduleKeys.includes(p))
          : [...new Set([...prev.permissions, ...moduleKeys])],
      }));
    }
  };

  const isModuleFullySelected = (modulePermissions, isEdit = false) => {
    const moduleKeys = modulePermissions.map((p) => p.key);
    const currentPermissions = isEdit
      ? editRoleData.permissions
      : newRoleData.permissions;
    return moduleKeys.every((key) => currentPermissions.includes(key));
  };

  const getRoleColor = (role) => {
    const colors = {
      CompanyOwner: "bg-purple-100 text-purple-800",
      HRHead: "bg-blue-100 text-blue-800",
      HRManager: "bg-green-100 text-green-800",
      Employee: "bg-gray-100 text-gray-800",
      Accountant: "bg-yellow-100 text-yellow-800",
      SalesManager: "bg-indigo-100 text-indigo-800",
      InventoryManager: "bg-orange-100 text-orange-800",
      Owner: "bg-purple-100 text-purple-800",
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

  const getAllAvailableRoles = () => {
    const customRoles = roles.map((r) => ({
      value: r.name,
      label: r.name,
      description: `Custom role with ${r.permissions?.length || 0} permissions`,
      system: false,
    }));
    return [...customRoles];
  };

  // Check if user has read permission
  if (!hasPermission(PERMISSIONS.USERS_READ)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">You don't have permission to view company users.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  const availableRoles = getAllAvailableRoles();
  const canCreateUsers = hasPermission(PERMISSIONS.USERS_CREATE);
  const canUpdateUsers = hasPermission(PERMISSIONS.USERS_UPDATE);
  const canDeleteUsers = hasPermission(PERMISSIONS.USERS_DELETE);
  const canManageRoles = hasPermission(PERMISSIONS.ROLES_MANAGE);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Users</h1>
          <p className="text-gray-600 mt-1">
            Manage system users and permissions - {users.length} total users
          </p>
        </div>
        <div className="flex gap-3">
          {canManageRoles && (
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => {
                resetRoleForm();
                setShowCreateRoleModal(true);
              }}
            >
              <span className="text-xl">🔐</span>
              Create Role
            </button>
          )}
          {canCreateUsers && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <span className="text-xl">➕</span>
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Roles Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-blue-900">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        {canManageRoles && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Custom Roles</p>
                <p className="text-3xl font-bold text-green-900">
                  {roles.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔐</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Roles Section */}
      {canManageRoles && roles.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Custom Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.name}
                className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {role.name}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditRole(role)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      title="Edit role"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.name)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      title="Delete role"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {role.permissions?.length || 0} permissions assigned
                </p>
                {role.permissions && role.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {role.permissions.slice(0, 3).map((perm, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {perm.split(".").pop()}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500 text-lg">No users found</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {getInitials(user.fullName)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  {user.phoneNumber && (
                    <p className="text-xs text-gray-500 truncate">
                      📞 {user.phoneNumber}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                    {user.isLockedOut && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  ASSIGNED ROLES
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                      >
                        {availableRoles.find((r) => r.value === role)?.label ||
                          role}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 italic">
                      No roles assigned
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  {canUpdateUsers && (
                    <>
                      <button
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        onClick={() => handleOpenRolesModal(user)}
                      >
                        🔐 Roles
                      </button>
                      <button
                        className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        onClick={() => handleOpenEditUser(user)}
                      >
                        ✏️ Edit
                      </button>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {canUpdateUsers && (
                    <button
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        user.isActive
                          ? "bg-red-50 hover:bg-red-100 text-red-600"
                          : "bg-green-50 hover:bg-green-100 text-green-600"
                      }`}
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? "🔴 Deactivate" : "🟢 Activate"}
                    </button>
                  )}
                  {canDeleteUsers && (
                    <button
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      onClick={() => handleDeleteUser(user.id, user.fullName)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editUserData.fullName}
                  onChange={(e) =>
                    setEditUserData({
                      ...editUserData,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={editUserData.email}
                  onChange={(e) =>
                    setEditUserData({
                      ...editUserData,
                      email: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editUserData.phoneNumber}
                  onChange={(e) =>
                    setEditUserData({
                      ...editUserData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                  onClick={() => setShowEditUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                Add Company User
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="user@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Minimum 6 characters"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles *
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <label
                        key={role.name}
                        className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer mb-1"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData.roles.includes(role.name)}
                          onChange={() => toggleRole(role.name)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {role.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {role.permissions?.length || 0} permissions
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No roles available. Create a role first.
                    </p>
                  )}
                </div>
                {formData.roles.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Please select at least one role
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formData.roles.length === 0}
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
        <div
          className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowRolesModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Manage User Roles
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedUser.fullName}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowRolesModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRoles} className="p-6">
              <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-3 mb-6">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <label
                      key={role.name}
                      className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer mb-1"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={rolesFormData.includes(role.name)}
                        onChange={() => toggleRoleInUpdate(role.name)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {role.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {role.permissions?.length || 0} permissions
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No roles available
                  </p>
                )}
              </div>

              {rolesFormData.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Warning: User must have at least one role
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setShowRolesModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={rolesFormData.length === 0}
                >
                  Update Roles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div
          className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateRoleModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                Create Custom Role
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowCreateRoleModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newRoleData.name}
                  onChange={(e) =>
                    setNewRoleData({ ...newRoleData, name: e.target.value })
                  }
                  placeholder="e.g., Sales Representative"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions * ({newRoleData.permissions.length} selected)
                </label>
                <div className="border border-gray-200 rounded-md p-3 max-h-96 overflow-y-auto">
                  {permissions.map((module, idx) => (
                    <div key={idx} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={isModuleFullySelected(
                            module.permissions,
                            false,
                          )}
                          onChange={() =>
                            toggleAllModulePermissions(
                              module.permissions,
                              false,
                            )
                          }
                        />
                        <h4 className="text-sm font-semibold text-gray-900 uppercase">
                          {module.module} - {module.resource}
                        </h4>
                      </div>
                      <div className="space-y-1 pl-4">
                        {module.permissions.map((perm, permIdx) => {
                          const managePermission = module.permissions.find(p => p.action === 'manage');
                          const hasManageSelected = managePermission && newRoleData.permissions.includes(managePermission.key);
                          const isManagePermission = perm.action === 'manage';
                          const isDisabled = hasManageSelected && !isManagePermission && newRoleData.permissions.includes(perm.key);
                          
                          return (
                            <label
                              key={permIdx}
                              className={`flex items-start gap-3 p-2 rounded-md cursor-pointer ${
                                isDisabled ? 'bg-blue-50 cursor-not-allowed' : 'hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={newRoleData.permissions.includes(perm.key)}
                                onChange={() => togglePermission(perm.key, false, module.permissions)}
                              />
                              <div className="flex-1">
                                <div className={`text-sm font-medium ${isManagePermission ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {perm.action}
                                  {isManagePermission && ' (Auto-selects all)'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {perm.description}
                                </div>
                                {isDisabled && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    🔒 Locked by "manage" permission
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {newRoleData.permissions.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Please select at least one permission
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setShowCreateRoleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    newRoleData.permissions.length === 0 || !newRoleData.name
                  }
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && selectedRole && (
        <div
          className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowEditRoleModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Role</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRole.name}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowEditRoleModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditRole} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions * ({editRoleData.permissions.length} selected)
                </label>
                <div className="border border-gray-200 rounded-md p-3 max-h-96 overflow-y-auto">
                  {permissions.map((module, idx) => (
                    <div key={idx} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={isModuleFullySelected(
                            module.permissions,
                            true,
                          )}
                          onChange={() =>
                            toggleAllModulePermissions(module.permissions, true)
                          }
                        />
                        <h4 className="text-sm font-semibold text-gray-900 uppercase">
                          {module.module} - {module.resource}
                        </h4>
                      </div>
                      <div className="space-y-1 pl-4">
                        {module.permissions.map((perm, permIdx) => {
                          const managePermission = module.permissions.find(p => p.action === 'manage');
                          const hasManageSelected = managePermission && editRoleData.permissions.includes(managePermission.key);
                          const isManagePermission = perm.action === 'manage';
                          const isDisabled = hasManageSelected && !isManagePermission && editRoleData.permissions.includes(perm.key);
                          
                          return (
                            <label
                              key={permIdx}
                              className={`flex items-start gap-3 p-2 rounded-md cursor-pointer ${
                                isDisabled ? 'bg-blue-50 cursor-not-allowed' : 'hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                checked={editRoleData.permissions.includes(perm.key)}
                                onChange={() => togglePermission(perm.key, true, module.permissions)}
                              />
                              <div className="flex-1">
                                <div className={`text-sm font-medium ${isManagePermission ? 'text-blue-900' : 'text-gray-900'}`}>
                                  {perm.action}
                                  {isManagePermission && ' (Auto-selects all)'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {perm.description}
                                </div>
                                {isDisabled && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    🔒 Locked by "manage" permission
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {editRoleData.permissions.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Please select at least one permission
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                  onClick={() => setShowEditRoleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={editRoleData.permissions.length === 0}
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyUsers;