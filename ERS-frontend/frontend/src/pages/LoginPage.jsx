import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import "../styles/register.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/events"; // redirect after login

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    const path = location.pathname;

    // ✅ Only redirect if logged in and NOT on /login or /signup
    if (token && path !== "/login" && path !== "/signup") {
      navigate("/events", { replace: true });
    }

    // Load remembered email
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail, remember: true }));
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
      const res = await axios.post("/auth/user/login", {
        email: form.email,
        password: form.password,
      });

      if (!res.data.token) {
        toast.error("Login failed: token missing");
        return;
      }

      // ✅ Save token in cookie
      Cookies.set("token", res.data.token, {
        expires: form.remember ? 7 : undefined,
      });

      // ✅ Remember email if checkbox checked
      if (form.remember) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("🎉 Login successful!");
      navigate(redirectTo, { replace: true }); // redirect back to page user wanted
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="signup-container">
        <div className="signup-background">
          <div className="signup-overlay"></div>
        </div>

        <div className="signup-card">
          <div className="signup-header">
            <div className="signup-icon">🔐</div>
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
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

          <div className="signup-footer">
            <p>
              Don’t have an account?
              <button
                onClick={() => navigate("/signup")}
                className="login-link"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
