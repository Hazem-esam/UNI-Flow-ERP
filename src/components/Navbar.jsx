import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Building2, Menu, X, LogOut, LayoutDashboard, User } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, companyName, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink 
            to="/"
            onClick={handleNavClick}
            className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors group"
          >
            <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold hidden sm:block">UNI Flow ERP</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {/* Dashboard Link */}
                <NavLink
                  to="/dashboard"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>

                {/* Profile Link */}
                <NavLink
                  to="/profile"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </NavLink>

                {/* Company Badge */}
                {companyName && (
                  <div className="mx-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <span className="text-white font-semibold text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {companyName}
                    </span>
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 ml-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <NavLink
                  to="/login"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  Login
                </NavLink>

                {/* Signup Button */}
                <NavLink
                  to="/signup"
                  onClick={handleNavClick}
                  className="px-6 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-700 border-t border-white/10">
          <div className="px-4 py-3 space-y-2">
            {isAuthenticated ? (
              <>
                {/* Company Badge Mobile */}
                {companyName && (
                  <div className="px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mb-3">
                    <span className="text-white font-semibold text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {companyName}
                    </span>
                  </div>
                )}

                <NavLink
                  to="/dashboard"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/profile"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium shadow-md"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white hover:bg-white/10"
                    }`
                  }
                >
                  Login
                </NavLink>

                <NavLink
                  to="/signup"
                  onClick={handleNavClick}
                  className="block w-full text-left px-4 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-semibold shadow-md"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}