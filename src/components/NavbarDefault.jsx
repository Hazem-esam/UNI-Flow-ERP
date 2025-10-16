import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NavbarDefault() {
  const [logged, setLogged] = useState(localStorage.getItem("loggedIn") === "true");
  const [companyName, setCompanyName] = useState(localStorage.getItem("companyName") || " ");
  const navigate = useNavigate();

  // Update login state if localStorage changes (e.g., after login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setLogged(localStorage.getItem("loggedIn") === "true");
      setCompanyName(localStorage.getItem("companyName") || "");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("companyName");
    setLogged(false);
    setCompanyName("");
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center bg-blue-600 text-white p-4">
      <NavLink to="/">
        <h1 className="text-lg font-bold">UNI Flow ERP</h1>
      </NavLink>

      <div className="flex space-x-6 items-center">
        {!logged ? (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "underline font-semibold" : "hover:underline"
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                isActive ? "underline font-semibold" : "hover:underline"
              }
            >
              Signup
            </NavLink>
          </>
        ) : (
          <>
            <span className="font-medium">{companyName}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
