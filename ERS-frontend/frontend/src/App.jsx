import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

/* Pages */
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import BrowseEvents from "./pages/BrowseEvents";
import RegisterEvent from "./pages/RegisterEvent";
import SuccessPage from "./pages/SuccessPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Profile from "./pages/Profile";

/* =======================
   ROUTE GUARDS
======================= */

// ✅ User-only routes
const UserProtectedRoute = ({ children }) => {
  const token = Cookies.get("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "User") return <Navigate to="/login" replace />;
    return children;
  } catch (err) {
    Cookies.remove("token");
    return <Navigate to="/login" replace />;
  }
};

// ✅ Admin-only routes (Admin or SuperAdmin)
const AdminProtectedRoute = ({ children }) => {
  const token = Cookies.get("token");
  if (!token) return <Navigate to="/admin/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role === "User") return <Navigate to="/login" replace />;
    return children;
  } catch (err) {
    Cookies.remove("token");
    return <Navigate to="/admin/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/reset-password/:role/:token"
          element={<ResetPassword />}
        />
        <Route path="/events" element={<BrowseEvents />} />

        {/* USER PROTECTED */}
        <Route
          path="/profile"
          element={
            <UserProtectedRoute>
              <Profile />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/register/:eventId"
          element={
            <UserProtectedRoute>
              <RegisterEvent />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/success/:registrationId"
          element={
            <UserProtectedRoute>
              <SuccessPage />
            </UserProtectedRoute>
          }
        />

        {/* ADMIN / SUPERADMIN */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/superadmin/dashboard"
          element={
            <AdminProtectedRoute>
              <SuperAdminDashboard />
            </AdminProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
