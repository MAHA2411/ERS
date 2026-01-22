import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/SuperAdminDashboard.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Modal Component
const Modal = ({ show, onClose, children }) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {children}
        <button className="modal-close" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    assignedAdmin: ""
  });

  // ✅ Fetch dashboard & admins
  useEffect(() => {
    fetchDashboard();
    fetchAdmins();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/superadmin/events-with-participants"); // Fixed endpoint
      const eventsData = res.data.events || [];

      setEvents(
        eventsData.map((e) => ({
          _id: e._id,
          title: e.title,
          date: e.date,
          location: e.location,
          assignedAdmin: e.assignedAdmin || null,
          participantCount: e.participantCount || 0,
          participants: e.participants || [],
        }))
      );

      // Optional stats
      setStats({
        totalEvents: eventsData.length,
        totalRegistrations: eventsData.reduce((sum, e) => sum + e.participantCount, 0),
        totalAdmins: admins.filter(a => a.role === "ADMIN").length,
        totalSubAdmins: admins.filter(a => a.role === "SUB_ADMIN").length,
        revenue: 0 // update if you have revenue field
      });

    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("/superadmin/admins");
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error("Admins load failed", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setForm({
        title: event.title,
        description: event.description || "",
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location || "",
        assignedAdmin: event.assignedAdmin?._id || ""
      });
    } else {
      setEditingEvent(null);
      setForm({ title: "", description: "", date: "", location: "", assignedAdmin: "" });
    }
    setShowEventModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await axios.put(`/superadmin/event/${editingEvent._id}`, form);
      } else {
        await axios.post("/superadmin/event", form);
      }
      setShowEventModal(false);
      fetchDashboard();
    } catch (err) {
      console.error("Event save failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this event?")) return;
    try {
      await axios.delete(`/superadmin/event/${id}`);
      fetchDashboard();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <h1>Super Admin Dashboard</h1>

      {/* STAT CARDS */}
      <div className="cards">
        <div className="card card-blue">
          <h3>Total Events</h3>
          <p>{stats.totalEvents}</p>
        </div>
        <div className="card card-green">
          <h3>Participants</h3>
          <p>{stats.totalRegistrations}</p>
        </div>
        <div className="card card-purple">
          <h3>Admins</h3>
          <p>{stats.totalAdmins + stats.totalSubAdmins}</p>
        </div>
        <div className="card card-orange">
          <h3>Revenue</h3>
          <p>₹ {stats.revenue}</p>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-box">
        <h2>Participants per Event</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={events}>
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="participantCount" fill="#4e73df" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* EVENTS TABLE */}
      <div className="table-box">
        <div className="table-header">
          <h2>Events</h2>
          <button className="btn btn-primary" onClick={() => openModal()}>+ Create Event</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan="5">No events found</td></tr>
            ) : (
              events.map((e) => (
                <tr key={e._id}>
                  <td>{e.title}</td>
                  <td>{new Date(e.date).toLocaleString()}</td>
                  <td>{e.location}</td>
                  <td>{e.assignedAdmin?.name || "Unassigned"}</td>
                  <td>
                    <button className="btn btn-edit" onClick={() => openModal(e)}>Edit</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(e._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EVENT MODAL */}
      <Modal show={showEventModal} onClose={() => setShowEventModal(false)}>
        <h2>{editingEvent ? "Edit Event" : "Create Event"}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}></textarea>

          <label>Date & Time</label>
          <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />

          <label>Venue</label>
          <input type="text" name="location" value={form.location} onChange={handleChange} />

          <label>Assign Admin</label>
          <select name="assignedAdmin" value={form.assignedAdmin} onChange={handleChange} required>
            <option value="">Select Admin</option>
            {admins.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary">{editingEvent ? "Update" : "Create"}</button>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
