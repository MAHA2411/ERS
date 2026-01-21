import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "../styles/register.css";

const RegisterEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    year: "",
  });

  // =======================
  // Load Event & Registration Status
  // =======================
  useEffect(() => {
    const loadEvent = async () => {
      try {
        // Fetch event details
        const eventRes = await axios.get(`/events/${eventId}`);
        setEvent(eventRes.data);

        // Fetch registration status if logged in
        const token = Cookies.get("token");
        if (token) {
          try {
            const regRes = await axios.get(
              `/events/${eventId}/is-registered`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setRegistered(regRes.data.registered);
          } catch (err) {
            console.error("Check registration error:", err);
            setRegistered(false);
          }
        }
      } catch (err) {
        console.error("Load event error:", err);
        toast.error("Failed to load event or registrations");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  // =======================
  // Form Handlers
  // =======================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("token");
    if (!token) {
      toast.warning("Please login to register");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "/register-event",
        { eventId, ...form },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Registered successfully!");
      setRegistered(true);
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };

  // =======================
  // Loading state
  // =======================
  if (loading) return (
    <>
      <Navbar />
      <div style={{ padding: 40 }}>Loading event...</div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h2>Register for {event?.title}</h2>
            <p>{event?.description}</p>
          </div>

          {registered ? (
            <button className="signup-button" disabled>
              ✅ Registered
            </button>
          ) : (
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="signup-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  className="signup-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  className="signup-input"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>College</label>
                <input
                  className="signup-input"
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  className="signup-input"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input
                  className="signup-input"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="signup-button">
                Confirm Registration
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default RegisterEvent;
