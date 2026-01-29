import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  Building2, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  User,
} from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, companyName, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50"
            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
        }`}
      >
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">
            {/* Logo - Enhanced with animation */}
            <NavLink
              to="/"
              onClick={handleNavClick}
              className={`flex items-center space-x-3 group transition-all duration-300 ${
                scrolled ? "text-gray-900" : "text-white"
              }`}
            >
              <div
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                  scrolled
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30"
                    : "bg-white/10 group-hover:bg-white/20"
                }`}
              >
                <Building2 className="w-6 h-6 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl lg:text-2xl font-bold tracking-tight">
                  UNI Flow
                </span>
                <span className="text-xs lg:text-sm font-medium opacity-90 ml-2">
                  ERP
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation - Modern Glass Style */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              {isAuthenticated ? (
                <>
                  {/* Dashboard Link - FIXED */}
                  <NavLink
                    to="/dashboard"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                        scrolled
                          ? isActive
                            ? "bg-blue-50 text-blue-700 shadow-sm"
                            : "text-gray-700 hover:bg-gray-50"
                          : isActive
                          ? "bg-white/25 text-white shadow-lg"
                          : "text-white/90 hover:bg-white/10"
                      }`
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </NavLink>

                  {/* Profile Link - FIXED */}
                  <NavLink
                    to="/profile"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                        scrolled
                          ? isActive
                            ? "bg-blue-50 text-blue-700 shadow-sm"
                            : "text-gray-700 hover:bg-gray-50"
                          : isActive
                          ? "bg-white/25 text-white shadow-lg"
                          : "text-white/90 hover:bg-white/10"
                      }`
                    }
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Profile</span>
                  </NavLink>

                  {/* Company Badge - Glass Effect */}
                  {companyName && (
                    <div
                      className={`mx-2 px-4 py-2.5 rounded-xl backdrop-blur-md transition-all duration-300 ${
                        scrolled
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 text-gray-900"
                          : "bg-white/10 border border-white/20 text-white"
                      }`}
                    >
                      <span className="font-semibold text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span className="hidden xl:inline">{companyName}</span>
                      </span>
                    </div>
                  )}

                  {/* Logout Button - Modern */}
                  <button
                    onClick={handleLogout}
                    className="group relative flex items-center space-x-2 ml-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Login Button */}
                  <NavLink
                    to="/login"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `px-6 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                        scrolled
                          ? isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                          : isActive
                          ? "bg-white/25 text-white"
                          : "text-white/90 hover:bg-white/10"
                      }`
                    }
                  >
                    Login
                  </NavLink>

                  {/* Signup Button - Gradient */}
                  <NavLink
                    to="/signup"
                    onClick={handleNavClick}
                    className={`group relative px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 ${
                      scrolled
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-white text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <span className="relative z-10">Sign Up</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden relative p-2.5 rounded-xl transition-all duration-300 ${
                scrolled
                  ? "text-gray-900 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                  }`}
                >
                  <Menu className="w-6 h-6" />
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                  }`}
                >
                  <X className="w-6 h-6" />
                </span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Modern Slide-In with Blur */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
          mobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-16 md:top-18 right-0 w-full max-w-sm h-[calc(100vh-4rem)] md:h-[calc(100vh-4.5rem)] bg-white/95 backdrop-blur-2xl shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full overflow-y-auto p-6 space-y-3">
            {isAuthenticated ? (
              <>
                {/* Company Badge Mobile */}
                {companyName && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
                    <span className="text-gray-900 font-semibold text-sm flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Company</div>
                        <div className="font-bold">{companyName}</div>
                      </div>
                    </span>
                  </div>
                )}

                {/* Dashboard Link Mobile - FIXED */}
                <NavLink
                  to="/dashboard"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `group flex items-center space-x-4 w-full px-5 py-4 rounded-2xl transition-all duration-300 font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg shadow-blue-500/10"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30"
                            : "bg-gray-100 group-hover:bg-gray-200"
                        }`}
                      >
                        <LayoutDashboard
                          className={isActive ? "w-5 h-5 text-white" : "w-5 h-5 text-gray-600"}
                        />
                      </div>
                      <span className="text-lg">Dashboard</span>
                    </>
                  )}
                </NavLink>

                {/* Profile Link Mobile - FIXED */}
                <NavLink
                  to="/profile"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `group flex items-center space-x-4 w-full px-5 py-4 rounded-2xl transition-all duration-300 font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg shadow-blue-500/10"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30"
                            : "bg-gray-100 group-hover:bg-gray-200"
                        }`}
                      >
                        <User
                          className={isActive ? "w-5 h-5 text-white" : "w-5 h-5 text-gray-600"}
                        />
                      </div>
                      <span className="text-lg">Profile</span>
                    </>
                  )}
                </NavLink>

                {/* Spacer */}
                <div className="flex-1" />

                <button
                  onClick={handleLogout}
                  className="group flex items-center space-x-4 w-full px-5 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all duration-300 font-medium shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40"
                >
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-lg">Logout</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `block w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 font-medium ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  Login
                </NavLink>

                <NavLink
                  to="/signup"
                  onClick={handleNavClick}
                  className="block w-full text-left px-5 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-2xl transition-all duration-300 font-semibold shadow-xl shadow-blue-500/30"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}