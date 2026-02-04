import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";
import AuthContextProvider from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext ";
function App() {
  return (
    <>
      <AuthContextProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </AuthContextProvider>
    </>
  );
}

export default App;
