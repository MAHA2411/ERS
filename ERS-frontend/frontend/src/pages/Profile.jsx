import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const [userRes, registrationsRes] = await Promise.all([
          axios.get("/auth/profile"),
          axios.get("/user/registrations")
        ]);

        setUser(userRes.data.user);
        setRegistrations(registrationsRes.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          Cookies.remove("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <h2>User not found</h2>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="profile-info">
              <h1>{user.name || "User"}</h1>
              <p className="profile-email">{user.email}</p>
              <p className="profile-join-date">
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="profile-actions">
              <button className="btn btn-outline" onClick={() => navigate("/events")}>
                Browse Events
              </button>
              <button className="btn btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-number">{registrations.length}</div>
              <div className="stat-label">Events Registered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user.eventsCreated || 0}</div>
              <div className="stat-label">Events Created</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{user.favoriteCategories?.length || 0}</div>
              <div className="stat-label">Favorite Categories</div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="profile-section">
            <h2>Recent Event Registrations</h2>
            {registrations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <h3>No registrations yet</h3>
                <p>Start exploring events and register for ones that interest you!</p>
                <button className="btn btn-primary" onClick={() => navigate("/events")}>
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="registrations-grid">
                {registrations.slice(0, 6).map((registration) => (
                  <div key={registration._id} className="registration-card">
                    <div className="event-image">
                      <img 
                        src={registration.eventId?.bannerUrl || "/images/event1.svg"} 
                        alt={registration.eventId?.title || "Event"} 
                      />
                    </div>
                    <div className="event-details">
                      <h3>{registration.eventId?.title || "Event Title"}</h3>
                      <p className="event-date">
                        📅 {new Date(registration.eventId?.date || Date.now()).toLocaleDateString()}
                      </p>
                      <p className="event-venue">
                        📍 {registration.eventId?.venue || "Venue TBD"}
                      </p>
                      <div className="registration-status">
                        <span className="status-badge">Registered</span>
                        <span className="registration-date">
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="profile-section">
            <h2>Account Settings</h2>
            <div className="settings-grid">
              <div className="setting-card">
                <h3>Personal Information</h3>
                <p>Update your name, email, and other personal details</p>
                <button className="btn btn-outline">Edit Profile</button>
              </div>
              <div className="setting-card">
                <h3>Preferences</h3>
                <p>Manage your event preferences and notifications</p>
                <button className="btn btn-outline">Manage Preferences</button>
              </div>
              <div className="setting-card">
                <h3>Security</h3>
                <p>Change your password and security settings</p>
                <button className="btn btn-outline">Security Settings</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
