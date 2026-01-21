import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "User") {
          setUser({ name: decoded.name, email: decoded.email });
        } else {
          setUser(null);
        }
      } catch (err) {
        Cookies.remove("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]); // Only run when location changes

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    navigate("/");
  };

  // Don't show navbar on admin pages
  if (location.pathname.includes("/admin") || location.pathname.includes("/superadmin")) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo"><Link to="/">EventHub</Link></div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          {user && <Link to="/profile">Profile</Link>}
        </div>
        <div className="auth-buttons">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">Hi, {user.name || "User"}!</span>
              <button className="btn btn-outline" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary" style={{ textDecoration: "none" }}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary" style={{ textDecoration: "none" }}>
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
