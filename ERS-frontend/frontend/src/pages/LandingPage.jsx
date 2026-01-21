import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          // Check if token is valid by making a request
          const response = await fetch("http://localhost:5000/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid tokens
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkUserAuth();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/events");
    } else {
      navigate("/signup");
    }
  };

  const handleViewEvents = () => {
    navigate("/events");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <Hero user={user} onGetStarted={handleGetStarted} onViewEvents={handleViewEvents} />
      
      {/* Welcome Section for Logged-in Users */}
      {user && (
        <section className="welcome-section">
          <div className="container">
            <div className="welcome-card">
              <div className="welcome-header">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="welcome-text">
                  <h2>Welcome back, {user.name || "User"}! 👋</h2>
                  <p>Ready to discover amazing events? Check out what's happening around you.</p>
                </div>
              </div>
              <div className="welcome-actions">
                <button className="btn btn-primary" onClick={handleViewEvents}>
                  Browse Events
                </button>
                <button className="btn btn-outline" onClick={() => navigate("/profile")}>
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Events Section */}
      <section className="featured-events">
        <div className="container">
          <div className="section-header">
            <h2>Featured Events</h2>
            <p>Discover our most popular upcoming events</p>
          </div>
          
          {/* Event Cards Grid */}
          <div className="events-grid">
            <div className="event-card">
              <div className="event-image">
                <img src="/images/event1.svg" alt="Tech Conference" />
                <div className="event-badge">Featured</div>
              </div>
              <div className="event-details">
                <h3>Tech Innovation Summit 2024</h3>
                <p>Join industry leaders for insights on the latest technology trends and innovations.</p>
                <div className="event-meta">
                  <span>📅 March 15, 2024</span>
                  <span>📍 San Francisco, CA</span>
                </div>
                <button className="btn btn-primary event-btn">Learn More</button>
              </div>
            </div>

            <div className="event-card">
              <div className="event-image">
                <img src="/images/event2.svg" alt="Music Festival" />
                <div className="event-badge">Popular</div>
              </div>
              <div className="event-details">
                <h3>Summer Music Festival</h3>
                <p>Experience the best of live music with top artists and amazing performances.</p>
                <div className="event-meta">
                  <span>📅 July 20, 2024</span>
                  <span>📍 Los Angeles, CA</span>
                </div>
                <button className="btn btn-primary event-btn">Learn More</button>
              </div>
            </div>

            <div className="event-card">
              <div className="event-image">
                <img src="/images/event3.svg" alt="Business Workshop" />
                <div className="event-badge">New</div>
              </div>
              <div className="event-details">
                <h3>Business Strategy Workshop</h3>
                <p>Learn proven strategies to grow your business and achieve success.</p>
                <div className="event-meta">
                  <span>📅 April 10, 2024</span>
                  <span>📍 New York, NY</span>
                </div>
                <button className="btn btn-primary event-btn">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join Amazing Events?</h2>
            <p>Start your journey today and discover events that match your interests.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={handleGetStarted}>
                {user ? "Browse Events" : "Get Started"}
              </button>
              {!user && (
                <button className="btn btn-outline" onClick={() => navigate("/login")}>
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LandingPage;
