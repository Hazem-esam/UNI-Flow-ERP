import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("companyName");
  return isLoggedIn ? children : <Navigate to="/home" replace />;
}
