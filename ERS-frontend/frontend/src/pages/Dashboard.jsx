// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("admins");
  const [admins, setAdmins] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const itemsPerPage = 5;

  const token = Cookies.get("token");

  // Check user role and redirect if necessary
  useEffect(() => {
    const checkUserRole = async () => {
      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      try {
        const res = await axios.get("/admin/profile");
        const role = res.data.user.role;
        setUserRole(role);
        
        // Redirect SuperAdmin to their dashboard
        if (role === "SuperAdmin") {
          window.location.href = "/superadmin/dashboard";
          return;
        }
        
        // Only Admin role can access this dashboard
        if (role !== "Admin") {
          window.location.href = "/admin/login";
          return;
        }
      } catch (err) {
        console.error("Auth error:", err);
        window.location.href = "/admin/login";
        return;
      }
    };

    checkUserRole();
  }, [token]);

  useEffect(() => {
    if (userRole === "Admin") {
      fetchAdmins();
      fetchEvents();
      fetchRegistrations();
    }
  }, [userRole]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/admins");
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/registrations");
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredData = (data) =>
    data.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // Pagination logic
  const paginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData(data).slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = (data) =>
    Math.ceil(filteredData(data).length / itemsPerPage);

  // Show loading while checking auth
  if (!userRole) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p className="role-badge">Role: {userRole}</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={activeTab === "admins" ? "active" : ""}
            onClick={() => {
              setActiveTab("admins");
              setSearch("");
              setCurrentPage(1);
            }}
          >
            Admins
          </button>
          <button
            className={activeTab === "events" ? "active" : ""}
            onClick={() => {
              setActiveTab("events");
              setSearch("");
              setCurrentPage(1);
            }}
          >
            Events
          </button>
          <button
            className={activeTab === "registrations" ? "active" : ""}
            onClick={() => {
              setActiveTab("registrations");
              setSearch("");
              setCurrentPage(1);
            }}
          >
            Registrations
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-box"
        />

        {/* Table */}
        <div className="table-container">
          {activeTab === "admins" && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData(admins).map((admin, idx) => (
                    <tr key={idx}>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>{admin.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData(admins).length === 0 && (
                <p className="no-data">No admins found</p>
              )}
            </>
          )}

          {activeTab === "events" && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData(events).map((event, idx) => (
                    <tr key={idx}>
                      <td>{event.title}</td>
                      <td>{new Date(event.date).toLocaleDateString()}</td>
                      <td>{event.venue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData(events).length === 0 && (
                <p className="no-data">No events found</p>
              )}
            </>
          )}

          {activeTab === "registrations" && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Event</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData(registrations).map((reg, idx) => (
                    <tr key={idx}>
                      <td>{reg.userId?.name}</td>
                      <td>{reg.userId?.email}</td>
                      <td>{reg.eventId?.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData(registrations).length === 0 && (
                <p className="no-data">No registrations found</p>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of{" "}
            {totalPages(
              activeTab === "admins"
                ? admins
                : activeTab === "events"
                ? events
                : registrations
            )}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={
              currentPage ===
              totalPages(
                activeTab === "admins"
                  ? admins
                  : activeTab === "events"
                  ? events
                  : registrations
              )
            }
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
