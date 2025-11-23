import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/Dashboard-user/Dashboard";
import Profile from "../pages/Profile";
import AppLayout from "../components/AppLayout";
import PrivateRoute from "./PrivateRoute";
import Home from "../pages/Home";
import DynamicModulePage from "../components/DynamicModulePage";
import ModuleSample from "../components/ModuleSample";
function AppRoutes() {
  return (
    <Routes>
      {/* Default route → go to login */}
      <Route path="/" element={<Home to="/home" replace />} />
      <Route path="/modules-samples/:moduleName" element={<ModuleSample />} />
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* Private routes with AppLayout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </PrivateRoute>
        }
      />
      {/* Dynamic module pages */}
      <Route
        path="/modules/:moduleName"
        element={
          <PrivateRoute>
            <DynamicModulePage />
          </PrivateRoute>
        }
      />
      {/* Catch-all → redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
