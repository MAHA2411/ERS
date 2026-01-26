import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/SuperAdminDashboard.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Modal = ({ show, onClose, children }) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {children}
        <button className="modal-close" onClick={onClose}>X</button>
      </div>
    </div>
  );
};

const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState("events");

  const [eventForm, setEventForm] = useState({
    title: "", description: "", date: "", location: "", assignedAdmin: "",
    category: "TECH", isTeamEvent: false, minTeamSize: 2, maxTeamSize: 5, capacity: 100, fee: 0
  });

  const [adminForm, setAdminForm] = useState({
    name: "", email: "", password: "", roleName: "ADMIN", category: "ALL"
  });

  useEffect(() => {
    fetchDashboard();
    fetchAdmins();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/superadmin/events-with-participants");
      const eventsData = res.data.events || [];

      setEvents(eventsData.map((e) => ({
        _id: e._id,
        title: e.title,
        description: e.description,
        date: e.date,
        location: e.location,
        category: e.category,
        isTeamEvent: e.isTeamEvent,
        minTeamSize: e.minTeamSize,
        maxTeamSize: e.maxTeamSize,
        assignedAdmin: e.assignedAdmin || null,
        participantCount: e.participantCount || 0,
        participants: e.participants || [],
      })));

      const analyticsRes = await axios.get("/superadmin/analytics");
      setStats(analyticsRes.data.analytics);
    } catch (err) {
      console.error("Dashboard load failed", err);
      setStats({
        totalEvents: events.length,
        totalRegistrations: events.reduce((sum, e) => sum + (e.participantCount || 0), 0),
        totalAdmins: 0,
        totalSubAdmins: 0,
        revenue: 0
      });
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

  const openEventModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description || "",
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location || "",
        assignedAdmin: event.assignedAdmin?._id || "",
        category: event.category || "TECH",
        isTeamEvent: event.isTeamEvent || false,
        minTeamSize: event.minTeamSize || 2,
        maxTeamSize: event.maxTeamSize || 5,
        capacity: event.capacity || 100,
        fee: event.fee || 0
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: "", description: "", date: "", location: "", assignedAdmin: "",
        category: "TECH", isTeamEvent: false, minTeamSize: 2, maxTeamSize: 5, capacity: 100, fee: 0
      });
    }
    setShowEventModal(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await axios.put(`/superadmin/event/${editingEvent._id}`, eventForm);
      } else {
        await axios.post("/superadmin/event", eventForm);
      }
      setShowEventModal(false);
      fetchDashboard();
    } catch (err) {
      console.error("Event save failed", err);
      alert(err.response?.data?.message || "Failed to save event");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure to delete this event?")) return;
    try {
      await axios.delete(`/superadmin/event/${id}`);
      fetchDashboard();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const openAdminModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setAdminForm({
        name: admin.name,
        email: admin.email,
        password: "",
        roleName: admin.role?.name || "ADMIN",
        category: admin.category || "ALL"
      });
    } else {
      setEditingAdmin(null);
      setAdminForm({ name: "", email: "", password: "", roleName: "ADMIN", category: "ALL" });
    }
    setShowAdminModal(true);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await axios.put(`/superadmin/admin/${editingAdmin._id}`, adminForm);
      } else {
        await axios.post("/superadmin/admin", adminForm);
      }
      setShowAdminModal(false);
      fetchAdmins();
    } catch (err) {
      console.error("Admin save failed", err);
      alert(err.response?.data?.message || "Failed to save admin");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure to delete this admin?")) return;
    try {
      await axios.delete(`/superadmin/admin/${id}`);
      fetchAdmins();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const viewParticipants = async (eventId) => {
    try {
      const res = await axios.get(`/superadmin/events/${eventId}/participants`);
      setParticipants(res.data.registrations || []);
      setSelectedEvent(events.find(e => e._id === eventId));
    } catch (err) {
      console.error("Failed to fetch participants", err);
    }
  };

  const downloadCSV = (eventId) => {
    window.open(`${axios.defaults.baseURL}/superadmin/events/${eventId}/download/csv`, '_blank');
  };

  const downloadPDF = (eventId) => {
    window.open(`${axios.defaults.baseURL}/superadmin/events/${eventId}/download/pdf`, '_blank');
  };

  const categoryData = [
    { name: 'Tech', value: stats?.techEvents || 0 },
    { name: 'Non-Tech', value: stats?.nonTechEvents || 0 }
  ];

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <h1>Super Admin Dashboard</h1>

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
          <p>{stats.totalAdmins}</p>
        </div>
        <div className="card card-teal">
          <h3>Sub-Admins</h3>
          <p>{stats.totalSubAdmins}</p>
        </div>
        <div className="card card-orange">
          <h3>Revenue</h3>
          <p>Rs. {stats.revenue}</p>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h2>Participants per Event</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={events.slice(0, 10)}>
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="participantCount" fill="#4e73df" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-box">
          <h2>Events by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tabs">
        <button className={activeTab === "events" ? "active" : ""} onClick={() => setActiveTab("events")}>Events</button>
        <button className={activeTab === "admins" ? "active" : ""} onClick={() => setActiveTab("admins")}>Admins</button>
      </div>

      {activeTab === "events" && (
        <div className="table-box">
          <div className="table-header">
            <h2>Events</h2>
            <button className="btn btn-primary" onClick={() => openEventModal()}>+ Create Event</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Category</th>
                <th>Team</th>
                <th>Admin</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan="7">No events found</td></tr>
              ) : (
                events.map((e) => (
                  <tr key={e._id}>
                    <td>{e.title}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>{e.category}</td>
                    <td>{e.isTeamEvent ? "Yes" : "No"}</td>
                    <td>{e.assignedAdmin?.name || "Unassigned"}</td>
                    <td>{e.participantCount}</td>
                    <td>
                      <button className="btn btn-view" onClick={() => viewParticipants(e._id)}>View</button>
                      <button className="btn btn-edit" onClick={() => openEventModal(e)}>Edit</button>
                      <button className="btn btn-delete" onClick={() => handleDeleteEvent(e._id)}>Delete</button>
                      <button className="btn btn-download" onClick={() => downloadCSV(e._id)}>CSV</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "admins" && (
        <div className="table-box">
          <div className="table-header">
            <h2>Admins & Sub-Admins</h2>
            <button className="btn btn-primary" onClick={() => openAdminModal()}>+ Add Admin</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr><td colSpan="5">No admins found</td></tr>
              ) : (
                admins.map((a) => (
                  <tr key={a._id}>
                    <td>{a.name}</td>
                    <td>{a.email}</td>
                    <td>{a.role?.name || "N/A"}</td>
                    <td>{a.category || "ALL"}</td>
                    <td>
                      <button className="btn btn-edit" onClick={() => openAdminModal(a)}>Edit</button>
                      <button className="btn btn-delete" onClick={() => handleDeleteAdmin(a._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedEvent && (
        <div className="table-box">
          <div className="table-header">
            <h2>Participants - {selectedEvent.title}</h2>
            <div>
              <button className="btn btn-download" onClick={() => downloadPDF(selectedEvent._id)}>PDF</button>
              <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>College</th>
                <th>Team</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr><td colSpan="7">No participants yet</td></tr>
              ) : (
                participants.map((p) => (
                  <tr key={p._id}>
                    <td>{p.ticketId}</td>
                    <td>{p.participant?.name}</td>
                    <td>{p.participant?.email}</td>
                    <td>{p.participant?.phone || '-'}</td>
                    <td>{p.participant?.college || '-'}</td>
                    <td>{p.isTeamRegistration ? (p.teamName || 'Team') : '-'}</td>
                    <td>{p.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={showEventModal} onClose={() => setShowEventModal(false)}>
        <h2>{editingEvent ? "Edit Event" : "Create Event"}</h2>
        <form onSubmit={handleEventSubmit} className="modal-form">
          <label>Title</label>
          <input type="text" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} required />

          <label>Description</label>
          <textarea value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})}></textarea>

          <label>Date & Time</label>
          <input type="datetime-local" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} required />

          <label>Venue</label>
          <input type="text" value={eventForm.location} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} />

          <label>Category</label>
          <select value={eventForm.category} onChange={(e) => setEventForm({...eventForm, category: e.target.value})}>
            <option value="TECH">Tech</option>
            <option value="NON_TECH">Non-Tech</option>
          </select>

          <label>Assign Admin</label>
          <select value={eventForm.assignedAdmin} onChange={(e) => setEventForm({...eventForm, assignedAdmin: e.target.value})}>
            <option value="">Select Admin</option>
            {admins.filter(a => a.role?.name === "ADMIN").map((a) => (
              <option key={a._id} value={a._id}>{a.name} ({a.category})</option>
            ))}
          </select>

          <label>
            <input type="checkbox" checked={eventForm.isTeamEvent} onChange={(e) => setEventForm({...eventForm, isTeamEvent: e.target.checked})} />
            Team Event
          </label>

          {eventForm.isTeamEvent && (
            <>
              <label>Min Team Size</label>
              <input type="number" value={eventForm.minTeamSize} onChange={(e) => setEventForm({...eventForm, minTeamSize: parseInt(e.target.value)})} min="2" />
              <label>Max Team Size</label>
              <input type="number" value={eventForm.maxTeamSize} onChange={(e) => setEventForm({...eventForm, maxTeamSize: parseInt(e.target.value)})} min="2" />
            </>
          )}

          <label>Capacity</label>
          <input type="number" value={eventForm.capacity} onChange={(e) => setEventForm({...eventForm, capacity: parseInt(e.target.value)})} />

          <label>Fee</label>
          <input type="number" value={eventForm.fee} onChange={(e) => setEventForm({...eventForm, fee: parseFloat(e.target.value)})} />

          <button type="submit" className="btn btn-primary">{editingEvent ? "Update" : "Create"}</button>
        </form>
      </Modal>

      <Modal show={showAdminModal} onClose={() => setShowAdminModal(false)}>
        <h2>{editingAdmin ? "Edit Admin" : "Add Admin"}</h2>
        <form onSubmit={handleAdminSubmit} className="modal-form">
          <label>Name</label>
          <input type="text" value={adminForm.name} onChange={(e) => setAdminForm({...adminForm, name: e.target.value})} required />

          <label>Email</label>
          <input type="email" value={adminForm.email} onChange={(e) => setAdminForm({...adminForm, email: e.target.value})} required />

          {!editingAdmin && (
            <>
              <label>Password</label>
              <input type="password" value={adminForm.password} onChange={(e) => setAdminForm({...adminForm, password: e.target.value})} required />
            </>
          )}

          <label>Role</label>
          <select value={adminForm.roleName} onChange={(e) => setAdminForm({...adminForm, roleName: e.target.value})}>
            <option value="ADMIN">Admin</option>
            <option value="SUB_ADMIN">Sub-Admin</option>
          </select>

          <label>Category</label>
          <select value={adminForm.category} onChange={(e) => setAdminForm({...adminForm, category: e.target.value})}>
            <option value="ALL">All</option>
            <option value="TECH">Tech</option>
            <option value="NON_TECH">Non-Tech</option>
          </select>

          <button type="submit" className="btn btn-primary">{editingAdmin ? "Update" : "Create"}</button>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
