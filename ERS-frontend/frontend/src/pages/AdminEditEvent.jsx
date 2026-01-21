import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const AdminEditEvent = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({ title: "", date: "", description: "", location: "", capacity: "", image: "" });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm(res.data);
      } catch (err) {
        toast.error("Failed to load event details");
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("token");
      await axios.put(`/admin/events/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Event updated successfully!");
      nav("/admin/registrations");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update event");
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "500px", margin: "50px auto" }}>
        <h2>Edit Event</h2>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input type="text" name="title" value={form.title} onChange={handleChange} required />
          <input type="date" name="date" value={form.date?.substring(0, 10)} onChange={handleChange} required />
          <textarea name="description" value={form.description} onChange={handleChange} required />
          <input type="text" name="location" value={form.location} onChange={handleChange} required />
          <input type="number" name="capacity" value={form.capacity} onChange={handleChange} required />
          <input type="text" name="image" value={form.image} onChange={handleChange} />
          <button type="submit" className="btn-gradient">Update Event</button>
        </form>
      </div>
    </>
  );
};

export default AdminEditEvent;
