import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/SuperAdminDashboard.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

const AdminDashboard = () => {
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

  const [eventForm, setEventForm] = useState({
    title: "", description: "", date: "", venue: "", category: "TECH",
    isTeamEvent: false, minTeamSize: 2, maxTeamSize: 5, capacity: 100, fee: 0
  });

  const [subAdminForm, setSubAdminForm] = useState({
    name: "", email: "", password: "", assignedEvents: []
  });

  useEffect(() => {
    fetchDashboard();
    fetchSubAdmins();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/admin/dashboard");
      setStats(res.data.stats);
      setEvents(res.data.events || []);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  const fetchSubAdmins = async () => {
    try {
      const res = await axios.get("/admin/subadmins");
      setSubAdmins(res.data.subAdmins || []);
    } catch (err) {
      console.error("Failed to fetch sub-admins", err);
    }
  };

  const openEventModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description || "",
        date: new Date(event.date).toISOString().slice(0, 16),
        venue: event.venue || event.location || "",
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
        title: "", description: "", date: "", venue: "", category: "TECH",
        isTeamEvent: false, minTeamSize: 2, maxTeamSize: 5, capacity: 100, fee: 0
      });
    }
    setShowEventModal(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await axios.put(`/admin/events/${editingEvent._id}`, eventForm);
      } else {
        await axios.post("/admin/events", eventForm);
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
      await axios.delete(`/admin/events/${id}`);
      fetchDashboard();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const openSubAdminModal = (subAdmin = null) => {
    if (subAdmin) {
      setEditingSubAdmin(subAdmin);
      setSubAdminForm({
        name: subAdmin.name,
        email: subAdmin.email,
        password: "",
        assignedEvents: subAdmin.assignedEvents?.map(e => e._id) || []
      });
    } else {
      setEditingSubAdmin(null);
      setSubAdminForm({ name: "", email: "", password: "", assignedEvents: [] });
    }
    setShowSubAdminModal(true);
  };

  const handleSubAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubAdmin) {
        await axios.put(`/admin/subadmins/${editingSubAdmin._id}`, subAdminForm);
      } else {
        await axios.post("/admin/subadmins", subAdminForm);
      }
      setShowSubAdminModal(false);
      fetchSubAdmins();
    } catch (err) {
      console.error("Sub-admin save failed", err);
      alert(err.response?.data?.message || "Failed to save sub-admin");
    }
  };

  const handleDeleteSubAdmin = async (id) => {
    if (!window.confirm("Are you sure to delete this sub-admin?")) return;
    try {
      await axios.delete(`/admin/subadmins/${id}`);
      fetchSubAdmins();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const viewParticipants = async (eventId) => {
    try {
      const res = await axios.get(`/admin/events/${eventId}/participants`);
      setParticipants(res.data.registrations || []);
      setSelectedEvent(events.find(e => e._id === eventId));
    } catch (err) {
      console.error("Failed to fetch participants", err);
    }
  };

  const downloadCSV = (eventId) => {
    window.open(`${axios.defaults.baseURL}/admin/events/${eventId}/download/csv`, '_blank');
  };

  const downloadPDF = (eventId) => {
    window.open(`${axios.defaults.baseURL}/admin/events/${eventId}/download/pdf`, '_blank');
  };

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      <div className="cards">
        <div className="card card-blue">
          <h3>My Events</h3>
          <p>{stats.totalEvents}</p>
        </div>
        <div className="card card-green">
          <h3>Total Participants</h3>
          <p>{stats.totalRegistrations}</p>
        </div>
        <div className="card card-purple">
          <h3>Sub-Admins</h3>
          <p>{stats.totalSubAdmins}</p>
        </div>
      </div>

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

      <div className="tabs">
        <button className={activeTab === "events" ? "active" : ""} onClick={() => setActiveTab("events")}>
          Events
        </button>
        <button className={activeTab === "subadmins" ? "active" : ""} onClick={() => setActiveTab("subadmins")}>
          Sub-Admins
        </button>
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
                <th>Team Event</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan="6">No events found</td></tr>
              ) : (
                events.map((e) => (
                  <tr key={e._id}>
                    <td>{e.title}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>{e.category}</td>
                    <td>{e.isTeamEvent ? "Yes" : "No"}</td>
                    <td>{e.participantCount || 0}</td>
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

      {activeTab === "subadmins" && (
        <div className="table-box">
          <div className="table-header">
            <h2>Sub-Admins</h2>
            <button className="btn btn-primary" onClick={() => openSubAdminModal()}>+ Add Sub-Admin</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned Events</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subAdmins.length === 0 ? (
                <tr><td colSpan="4">No sub-admins found</td></tr>
              ) : (
                subAdmins.map((sa) => (
                  <tr key={sa._id}>
                    <td>{sa.name}</td>
                    <td>{sa.email}</td>
                    <td>{sa.assignedEvents?.map(e => e.title).join(", ") || "None"}</td>
                    <td>
                      <button className="btn btn-edit" onClick={() => openSubAdminModal(sa)}>Edit</button>
                      <button className="btn btn-delete" onClick={() => handleDeleteSubAdmin(sa._id)}>Delete</button>
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
            <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>Close</button>
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
                    <td>{p.isTeamRegistration ? p.teamName || 'Team' : '-'}</td>
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
          <input type="text" value={eventForm.venue} onChange={(e) => setEventForm({...eventForm, venue: e.target.value})} />

          <label>Category</label>
          <select value={eventForm.category} onChange={(e) => setEventForm({...eventForm, category: e.target.value})}>
            <option value="TECH">Tech</option>
            <option value="NON_TECH">Non-Tech</option>
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

      <Modal show={showSubAdminModal} onClose={() => setShowSubAdminModal(false)}>
        <h2>{editingSubAdmin ? "Edit Sub-Admin" : "Add Sub-Admin"}</h2>
        <form onSubmit={handleSubAdminSubmit} className="modal-form">
          <label>Name</label>
          <input type="text" value={subAdminForm.name} onChange={(e) => setSubAdminForm({...subAdminForm, name: e.target.value})} required />

          <label>Email</label>
          <input type="email" value={subAdminForm.email} onChange={(e) => setSubAdminForm({...subAdminForm, email: e.target.value})} required />

          {!editingSubAdmin && (
            <>
              <label>Password</label>
              <input type="password" value={subAdminForm.password} onChange={(e) => setSubAdminForm({...subAdminForm, password: e.target.value})} required />
            </>
          )}

          <label>Assign Events</label>
          <select multiple value={subAdminForm.assignedEvents} onChange={(e) => setSubAdminForm({...subAdminForm, assignedEvents: Array.from(e.target.selectedOptions, o => o.value)})}>
            {events.map(evt => (
              <option key={evt._id} value={evt._id}>{evt.title}</option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary">{editingSubAdmin ? "Update" : "Create"}</button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
