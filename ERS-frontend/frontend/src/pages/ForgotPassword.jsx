import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import "../styles/register.css";

const ForgotPassword = ({ role = "user" }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use role to choose correct route
      await axios.post(`/auth/${role}/forgot-password`, { email });
      toast.success("📧 Password reset link sent to your email!");
      setEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error(err?.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
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
            <div className="signup-icon">🔑</div>
            <h2>Forgot Password?</h2>
            <p>Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="signup-input"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`signup-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="login-link"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
