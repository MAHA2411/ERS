import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/superadmin/dashboard";

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");
    if (token && role === "SUPER_ADMIN") navigate("/superadmin/dashboard", { replace: true });
    if (token && role === "ADMIN") navigate("/admin/dashboard", { replace: true });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/auth/admin/login", {
        email: form.email,
        password: form.password,
      });

      Cookies.set("token", res.data.token, { expires: form.remember ? 7 : undefined });
      Cookies.set("role", res.data.user.role);
      Cookies.set("name", res.data.user.name);

      toast.success("Login successful!");

      if (res.data.user.role === "SUPER_ADMIN") navigate("/superadmin/dashboard");
      else navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" value={form.email} onChange={handleChange} required />
      <input type="password" name="password" value={form.password} onChange={handleChange} required />
      <button type="submit">{loading ? "Signing In..." : "Sign In"}</button>
    </form>
  );
};

export default AdminLoginPage;
