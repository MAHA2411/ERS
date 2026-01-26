import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/SuperAdminDashboard.css";

const SubAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/subadmin/my-events");
      const fetchedEvents = res.data.events || [];
      setEvents(fetchedEvents);

      // Calculate stats locally
      const totalEvents = fetchedEvents.length;
      const totalRegistrations = fetchedEvents.reduce((acc, curr) => acc + (curr.participantCount || 0), 0);

      setStats({
        totalEvents,
        totalRegistrations
      });
      setLoading(false);
    } catch (err) {
      console.error("Dashboard load failed", err);
      setLoading(false);
    }
  };

  const viewParticipants = async (eventId) => {
    try {
      const res = await axios.get(`/subadmin/events/${eventId}/participants`);
      setParticipants(res.data.registrations || []);
      setSelectedEvent(events.find(e => e._id === eventId));
    } catch (err) {
      console.error("Failed to fetch participants", err);
    }
  };

  const downloadCSV = async (eventId) => {
    try {
      const response = await axios.get(`/subadmin/events/${eventId}/download/csv`, {
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
      const response = await axios.get(`/subadmin/events/${eventId}/download/pdf`, {
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

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <h1>Sub-Admin Dashboard</h1>

      <div className="cards">
        <div className="card card-blue">
          <h3>Assigned Events</h3>
          <p>{stats?.totalEvents || 0}</p>
        </div>
        <div className="card card-green">
          <h3>Total Participants</h3>
          <p>{stats?.totalRegistrations || 0}</p>
        </div>
      </div>

      <div className="table-box">
        <h2>My Assigned Events</h2>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Category</th>
              <th>Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan="5">No events assigned</td></tr>
            ) : (
              events.map((e) => (
                <tr key={e._id}>
                  <td>{e.title}</td>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>{e.category}</td>
                  <td>{e.participantCount || 0}</td>
                  <td>
                    <button className="btn btn-view" onClick={() => viewParticipants(e._id)}>
                      View
                    </button>
                    <button className="btn btn-download" onClick={() => downloadCSV(e._id)}>
                      CSV
                    </button>
                    <button className="btn btn-download" onClick={() => downloadPDF(e._id)}>
                      PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
                      ) : '-'}
                    </td>
                    <td>{p.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubAdminDashboard;
