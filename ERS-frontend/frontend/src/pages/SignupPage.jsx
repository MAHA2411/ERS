import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import "../styles/register.css";

const SignupPage = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    // Basic RFC 5322 compliant regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
    return re.test(password);
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(form.password)) {
      toast.error(
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
      );
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("/auth/user/register", form);
      toast.success("🎉 Registration successful! Please login.");
      nav("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
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
            <div className="signup-icon">🚀</div>
            <h2>Create Your Account</h2>
            <p>Join thousands of users and start your journey</p>
          </div>
          
          <form onSubmit={submit} className="signup-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handle}
                required
                className="signup-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handle}
                required
                className="signup-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handle}
                required
                className="signup-input"
              />
              <div className="password-requirements">
                <small>Password must contain: 8+ chars, uppercase, lowercase, number, special char</small>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`signup-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <div className="signup-footer">
            <p>Already have an account? 
              <button 
                onClick={() => nav("/login")} 
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

export default SignupPage;
