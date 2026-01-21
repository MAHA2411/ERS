import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const AdminRoute = ({ children }) => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  // Not logged in → admin login
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not admin/superadmin → block access
  if (role !== "Admin" && role !== "SuperAdmin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
