import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();
function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("loggedIn") === "true"
  );
  // Load user from localStorage (Signup or Login)
  useEffect(() => {
    if (isAuthenticated) {
      const storedUser = {
        email: localStorage.getItem("email"),
        name: localStorage.getItem("User Name"),
        companyName: localStorage.getItem("companyName"),
        role: localStorage.getItem("Type Of User"), // manager/user
        phoneNumber: localStorage.getItem("Phone Number"),
        image: localStorage.getItem("Image"),
      };
      setUser(storedUser);
    }
  }, [isAuthenticated]);

  // --------------------------
  // LOGIN FUNCTION
  // --------------------------
  const login = (email, password) => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) return false;
    if (savedUser.email !== email || savedUser.password !== password) {
      return false;
    }

    // Success
    localStorage.setItem("loggedIn", "true");
    setIsAuthenticated(true);
    setUser(savedUser);
    return true;
  };

  // --------------------------
  // SIGNUP FUNCTION
  // --------------------------
  const signup = (userData) => {
    // Save in localStorage (your current logic)
    Object.entries(userData).forEach(([key, value]) =>
      localStorage.setItem(key, value)
    );

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("user", JSON.stringify(userData));

    setIsAuthenticated(true);
    setUser(userData);
  };

  // --------------------------
  // LOGOUT FUNCTION
  // --------------------------
  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
