import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import "../styles/register.css";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/admin/dashboard";

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // If already logged in as admin/superadmin, redirect
    const token = Cookies.get("token");
    const role = Cookies.get("role");
    const path = location.pathname;

    if (token && (role === "ADMIN" || role === "SUPER_ADMIN") && path !== "/admin/login") {
      if (role === "SUPER_ADMIN") navigate("/superadmin/dashboard", { replace: true });
      else navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate, location.pathname]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/auth/admin/login", {
        email: form.email,
        password: form.password,
      });

      if (!res.data.token || !res.data.user?.role) {
        toast.error("Login failed: invalid response");
        return;
      }

      // ✅ Store token and role
      Cookies.set("token", res.data.token, { expires: form.remember ? 7 : undefined });
      Cookies.set("role", res.data.user.role);
      Cookies.set("name", res.data.user.name || "");

      toast.success("🎉 Login successful!");

      // ✅ Redirect based on role
      if (res.data.user.role === "SUPER_ADMIN") {
        navigate("/superadmin/dashboard", { replace: true });
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar showUser={false} />

      <div className="signup-container">
        <div className="signup-background">
          <div className="signup-overlay"></div>
        </div>

        <div className="signup-card">
          <div className="signup-header">
            <div className="signup-icon">🛡️</div>
            <h2>Admin Login</h2>
            <p>Sign in to manage events</p>
          </div>

          <form onSubmit={submit} className="signup-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handle}
                required
                className="signup-input"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper" style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  required
                  className="signup-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.2rem"
                  }}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handle}
                />
                <span className="checkmark"></span>
                Remember me
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="forgot-password-link"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={`signup-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
