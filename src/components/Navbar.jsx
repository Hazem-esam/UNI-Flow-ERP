import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const companyName = localStorage.getItem("companyName") || "";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center bg-blue-600 text-white p-4">
      <NavLink to="/">
        <h1 className="text-lg font-bold">UNI Flow ERP</h1>
      </NavLink>

      <div className="flex space-x-6 items-center">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "underline font-semibold" : "hover:underline"
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "underline font-semibold" : "hover:underline"
          }
        >
          Profile
        </NavLink>
        <span className="font-medium">{companyName}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
