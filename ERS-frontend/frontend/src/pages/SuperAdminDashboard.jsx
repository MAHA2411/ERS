// SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/SuperAdminDashboard.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Modal component
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

const COLORS = ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"];

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSubAdminModal, setShowSubAdminModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState("events");

  // Event form
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    venue: "",
    fee: 0,
    category: "TECH",
    isTeamEvent: false,
    minTeamSize: 2,
    maxTeamSize: 5,
    capacity: 100,
    assignedAdmin: "",
    subAdmins: []
  });

  // SubAdmin form
  const [subAdminForm, setSubAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    category: "ALL"
  });

  useEffect(() => {
    fetchDashboard();
    fetchSubAdmins();
  }, []);

  // ----------- Fetch Data -----------
  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/superadmin/events-with-participants");
      setEvents(res.data.events || []);

      const analyticsRes = await axios.get("/superadmin/analytics");
      setStats(analyticsRes.data.analytics);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  const fetchSubAdmins = async () => {
    try {
      const res = await axios.get("/superadmin/subadmins");
      setSubAdmins(res.data.subAdmins || []);
    } catch (err) {
      console.error("SubAdmins load failed", err);
    }
  };

  // ----------- Event Modal -----------
  const openEventModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description || "",
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location || "",
        venue: event.venue || "",
        fee: event.fee || 0,
        category: event.category,
        isTeamEvent: event.isTeamEvent || false,
        minTeamSize: event.minTeamSize || 2,
        maxTeamSize: event.maxTeamSize || 5,
        capacity: event.capacity || 100,
        assignedAdmin: event.assignedAdmin?._id || "",
        subAdmins: event.subAdmins?.map(sa => sa?._id || sa) || []
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: "",
        description: "",
        date: "",
        location: "",
        venue: "",
        fee: 0,
        category: "TECH",
        isTeamEvent: false,
        minTeamSize: 2,
        maxTeamSize: 5,
        capacity: 100,
        assignedAdmin: "",
        subAdmins: []
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
      console.error(err);
      alert(err.response?.data?.message || "Failed to save event");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/superadmin/event/${id}`);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------- SubAdmin Modal -----------
  const openSubAdminModal = (admin = null) => {
    if (admin) {
      setEditingSubAdmin(admin);
      setSubAdminForm({
        name: admin.name,
        email: admin.email,
        password: "",
        category: admin.category || "ALL"
      });
    } else {
      setEditingSubAdmin(null);
      setSubAdminForm({ name: "", email: "", password: "", category: "ALL" });
    }
    setShowSubAdminModal(true);
  };

  const handleSubAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubAdmin) {
        await axios.put(`/superadmin/subadmin/${editingSubAdmin._id}`, subAdminForm);
      } else {
        await axios.post("/superadmin/subadmin", subAdminForm);
      }
      setShowSubAdminModal(false);
      fetchSubAdmins();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save SubAdmin");
    }
  };

  const handleDeleteSubAdmin = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/superadmin/subadmin/${id}`);
      fetchSubAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------- Participants -----------
  const viewParticipants = async (eventId) => {
    try {
      const res = await axios.get(`/superadmin/events/${eventId}/participants`);
      setParticipants(res.data.registrations || []);
      setSelectedEvent(events.find(e => e._id === eventId));
    } catch (err) {
      console.error(err);
    }
  };

  const downloadCSV = async (eventId) => {
    try {
      const response = await axios.get(`/superadmin/events/${eventId}/download/csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'participants.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download CSV");
    }
  };

  const downloadPDF = async (eventId) => {
    try {
      const response = await axios.get(`/superadmin/events/${eventId}/download/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'participants.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF");
    }
  };

  const categoryData = [
    { name: "Tech", value: stats?.techEvents || 0 },
    { name: "Non-Tech", value: stats?.nonTechEvents || 0 },
  ];

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <h1>Super Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="cards">
        <div className="card card-blue"><h3>Total Events</h3><p>{stats.totalEvents}</p></div>
        <div className="card card-green"><h3>Participants</h3><p>{stats.totalRegistrations}</p></div>
        <div className="card card-teal"><h3>SubAdmins</h3><p>{stats.totalSubAdmins}</p></div>
        <div className="card card-orange"><h3>Revenue</h3><p>Rs. {stats.revenue}</p></div>
      </div>

      {/* Charts */}
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

      {/* Tabs */}
      <div className="tabs">
        <button className={activeTab === "events" ? "active" : ""} onClick={() => setActiveTab("events")}>Events</button>
        <button className={activeTab === "subadmins" ? "active" : ""} onClick={() => setActiveTab("subadmins")}>SubAdmins</button>
      </div>

      {/* Events Table */}
      {activeTab === "events" && (
        <div className="table-box">
          <div className="table-header">
            <h2>Events</h2>
            <button className="btn btn-primary" onClick={() => openEventModal()}>+ Create Event</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Category</th>
                <th>Team</th>
                <th>SubAdmins</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? <tr><td colSpan="8">No events found</td></tr> :
                events.map(e => (
                  <tr key={e._id}>
                    <td>{e.title}</td>
                    <td>{new Date(e.date).toLocaleString()}</td>
                    <td>{e.category}</td>
                    <td>{e.isTeamEvent ? "Yes" : "No"}</td>
                    <td>{(e.subAdmins && Array.isArray(e.subAdmins)) ? e.subAdmins.map(sa => sa?.name || "").filter(Boolean).join(", ") : "-"}</td>
                    <td>{e.participantCount}</td>
                    <td>
                      <button className="btn btn-view" onClick={() => viewParticipants(e._id)}>View</button>
                      <button className="btn btn-edit" onClick={() => openEventModal(e)}>Edit</button>
                      <button className="btn btn-delete" onClick={() => handleDeleteEvent(e._id)}>Delete</button>
                      <button className="btn btn-download" onClick={() => downloadCSV(e._id)}>CSV</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* SubAdmins Table */}
      {activeTab === "subadmins" && (
        <div className="table-box">
          <div className="table-header">
            <h2>SubAdmins</h2>
            <button className="btn btn-primary" onClick={() => openSubAdminModal()}>+ Add SubAdmin</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subAdmins.length === 0 ? <tr><td colSpan="4">No subadmins found</td></tr> :
                subAdmins.map(a => (
                  <tr key={a._id}>
                    <td>{a.name}</td>
                    <td>{a.email}</td>
                    <td>{a.category}</td>
                    <td>
                      <button className="btn btn-edit" onClick={() => openSubAdminModal(a)}>Edit</button>
                      <button className="btn btn-delete" onClick={() => handleDeleteSubAdmin(a._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Participants Table */}
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
              {participants.length === 0 ? <tr><td colSpan="7">No participants yet</td></tr> :
                participants.map(p => (
                  <tr key={p._id}>
                    <td>{p.ticketId}</td>
                    <td>{p.participant?.name || "N/A"}</td>
                    <td>{p.participant?.email || "N/A"}</td>
                    <td>{p.participant?.phone || "-"}</td>
                    <td>{p.participant?.college || "-"}</td>
                    <td>
                      {p.isTeamRegistration ? (
                        <div>
                          <strong>{p.teamName || "Team"}</strong>
                          <ul style={{ margin: 0, paddingLeft: "15px", fontSize: "0.85em" }}>
                            {p.teamMembers?.map((m, idx) => (
                              <li key={idx}>{m.name} ({m.email})</li>
                            ))}
                          </ul>
                        </div>
                      ) : "-"}
                    </td>
                    <td>{p.status}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Event Modal */}
      <Modal show={showEventModal} onClose={() => setShowEventModal(false)}>
        <h2>{editingEvent ? "Edit Event" : "Create Event"}</h2>
        <form onSubmit={handleEventSubmit} className="modal-form">
          <label>Title</label>
          <input type="text" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />

          <label>Description</label>
          <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}></textarea>

          <label>Date & Time</label>
          <input type="datetime-local" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} required />

          <label>Location</label>
          <input type="text" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />

          <label>Venue</label>
          <input type="text" value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })} />

          <label>Fee</label>
          <input type="number" value={eventForm.fee} onChange={(e) => setEventForm({ ...eventForm, fee: parseFloat(e.target.value) })} />

          <label>Capacity</label>
          <input type="number" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) })} />

          <label>Category</label>
          <select value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}>
            <option value="TECH">Tech</option>
            <option value="NON_TECH">Non-Tech</option>
          </select>

          <label>
            <input type="checkbox" checked={eventForm.isTeamEvent} onChange={(e) => setEventForm({ ...eventForm, isTeamEvent: e.target.checked })} />
            Team Event
          </label>

          {eventForm.isTeamEvent && (
            <>
              <label>Min Team Size</label>
              <input type="number" value={eventForm.minTeamSize} onChange={(e) => setEventForm({ ...eventForm, minTeamSize: parseInt(e.target.value) })} min="2" />

              <label>Max Team Size</label>
              <input type="number" value={eventForm.maxTeamSize} onChange={(e) => setEventForm({ ...eventForm, maxTeamSize: parseInt(e.target.value) })} min="2" />
            </>
          )}

          <label>Assign SubAdmins</label>
          <select multiple value={eventForm.subAdmins} onChange={(e) => {
            const options = Array.from(e.target.selectedOptions, option => option.value);
            setEventForm({ ...eventForm, subAdmins: options });
          }}>
            {subAdmins.map(sa => (
              sa && <option key={sa._id} value={sa._id}>{sa.name || "Unnamed"} ({sa.category || "All"})</option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary">{editingEvent ? "Update" : "Create"}</button>
        </form>
      </Modal>

      {/* SubAdmin Modal */}
      <Modal show={showSubAdminModal} onClose={() => setShowSubAdminModal(false)}>
        <h2>{editingSubAdmin ? "Edit SubAdmin" : "Add SubAdmin"}</h2>
        <form onSubmit={handleSubAdminSubmit} className="modal-form">
          <label>Name</label>
          <input type="text" value={subAdminForm.name} onChange={(e) => setSubAdminForm({ ...subAdminForm, name: e.target.value })} required />

          <label>Email</label>
          <input type="email" value={subAdminForm.email} onChange={(e) => setSubAdminForm({ ...subAdminForm, email: e.target.value })} required />

          {!editingSubAdmin && (
            <>
              <label>Password</label>
              <input type="password"
                value={subAdminForm.password}
                onChange={(e) => setSubAdminForm({ ...subAdminForm, password: e.target.value })}
                required
              />
            </>
          )}

          <label>Category</label>
          <select
            value={subAdminForm.category}
            onChange={(e) => setSubAdminForm({ ...subAdminForm, category: e.target.value })}
          >
            <option value="TECH">Tech</option>
            <option value="NON_TECH">Non-Tech</option>
            <option value="ALL">All</option>
          </select>

          <button type="submit" className="btn btn-primary">
            {editingSubAdmin ? "Update" : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
