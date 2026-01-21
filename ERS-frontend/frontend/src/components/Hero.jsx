import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = ({ user, onGetStarted, onViewEvents }) => {
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (user) {
      onViewEvents();
    } else {
      onGetStarted();
    }
  };

  const handleSecondaryAction = () => {
    if (user) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          {user ? (
            <>
              <h1>Welcome back, {user.name}! 🎉</h1>
              <p>Ready to discover more amazing events? We've got exciting things lined up just for you.</p>
              <div className="hero-buttons">
                <button className="btn btn-primary" onClick={handlePrimaryAction}>
                  Browse Events
                </button>
                <button className="btn btn-outline" onClick={handleSecondaryAction}>
                  View Profile
                </button>
              </div>
            </>
          ) : (
            <>
              <h1>Discover & Register for Amazing Events</h1>
              <p>Join thousands of attendees at conferences, workshops, seminars, and more. Your next adventure starts here.</p>
              <div className="hero-buttons">
                <button className="btn btn-primary" onClick={handlePrimaryAction}>
                  Get Started
                </button>
                <button className="btn btn-outline" onClick={handleSecondaryAction}>
                  Sign In
                </button>
              </div>
            </>
          )}
          
          {/* Trust indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">✅</span>
              <span>Secure Registration</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🎯</span>
              <span>Curated Events</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🚀</span>
              <span>Instant Access</span>
            </div>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="hero-image-container">
            <img 
              src={user ? "/images/hero-image.svg" : "/images/hero-image.svg"} 
              alt="Hero" 
              className="main-hero-image"
            />
            {/* Floating elements for visual appeal */}
            <div className="floating-element floating-1">🎉</div>
            <div className="floating-element floating-2">📅</div>
            <div className="floating-element floating-3">🎯</div>
            <div className="floating-element floating-4">🚀</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
