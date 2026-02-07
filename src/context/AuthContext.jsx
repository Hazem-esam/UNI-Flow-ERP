import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL;

function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // --------------------------
  // LOGIN FUNCTION
  // --------------------------
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Login failed");
      }

      const data = await response.json();

      // Store token and expiration
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("expiresAtUtc", data.expiresAtUtc);

      // Store complete user data including permissions and roles
      const userData = {
        userId: data.userId,
        companyId: data.companyId,
        email: data.email,
        roles: data.roles || [],
        permissions: data.permissions || [],
      };

      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, data };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // --------------------------
  // SIGNUP FUNCTION (Register Owner)
  // --------------------------
  const signup = async (fullName, email, password, company) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/register-owner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          company: {
            name: company.name,
            taxNumber: company.taxNumber,
            address: company.address,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Registration failed");
      }

      const data = await response.json();

      // Store token and expiration
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("expiresAtUtc", data.expiresAtUtc);

      // Store complete user data including permissions, roles, and company info
      const userData = {
        userId: data.userId,
        companyId: data.companyId,
        email: data.email,
        roles: data.roles || [],
        permissions: data.permissions || [],
        fullName,
        companyName: company.name,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, data };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
  };

  // --------------------------
  // LOGOUT FUNCTION
  // --------------------------
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("expiresAtUtc");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  // --------------------------
  // TOKEN EXPIRATION CHECK
  // --------------------------
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiration = () => {
      const expiresAtUtc = localStorage.getItem("expiresAtUtc");
      if (expiresAtUtc && new Date(expiresAtUtc) <= new Date()) {
        logout();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    checkTokenExpiration(); // Check immediately

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // --------------------------
  // HELPER FUNCTION: Check if user has permission
  // --------------------------
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // --------------------------
  // HELPER FUNCTION: Check if user has role
  // --------------------------
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  // --------------------------
  // HELPER FUNCTION: Check if user has any of the specified permissions
  // --------------------------
  const hasAnyPermission = (permissions) => {
    if (!user || !user.permissions) return false;
    return permissions.some((permission) =>
      user.permissions.includes(permission)
    );
  };

  // --------------------------
  // HELPER FUNCTION: Check if user has all of the specified permissions
  // --------------------------
  const hasAllPermissions = (permissions) => {
    if (!user || !user.permissions) return false;
    return permissions.every((permission) =>
      user.permissions.includes(permission)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;