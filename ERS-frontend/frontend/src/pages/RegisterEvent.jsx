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
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventRes = await axios.get(`/events/${eventId}`);
        setEvent(eventRes.data);

        if (eventRes.data.isTeamEvent) {
          const minMembers = (eventRes.data.minTeamSize || 2) - 1;
          setTeamMembers(Array(minMembers).fill({ name: "", email: "", phone: "", college: "" }));
        }

        const token = Cookies.get("token");
        if (token) {
          try {
            const regRes = await axios.get(`/events/${eventId}/is-registered`);
            setRegistered(regRes.data.registered);
          } catch (err) {
            console.error("Check registration error:", err);
            if (err.response && err.response.status === 401) {
              Cookies.remove("token");
            }
            setRegistered(false);
          }
        }
      } catch (err) {
        console.error("Load event error:", err);
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTeamMemberChange = (index, field, value) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const addTeamMember = () => {
    if (teamMembers.length < (event?.maxTeamSize || 5) - 1) {
      setTeamMembers([...teamMembers, { name: "", email: "", phone: "", college: "" }]);
    }
  };

  const removeTeamMember = (index) => {
    if (teamMembers.length > (event?.minTeamSize || 2) - 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
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
      const payload = { eventId, ...form };

      if (event?.isTeamEvent) {
        payload.teamName = teamName;
        payload.teamMembers = teamMembers.filter(m => m.name && m.email);

        if (payload.teamMembers.length < (event.minTeamSize - 1)) {
          toast.error(`Team must have at least ${event.minTeamSize} members (including you)`);
          return;
        }
      }

      const res = await axios.post(
        "/register-event",
        payload
      );

      toast.success("Registered successfully! Check your email for confirmation.");
      setRegistered(true);

      if (res.data.registrationId) {
        navigate("/events");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response && err.response.status === 401) {
        toast.error("Session expired. Please login again.");
        Cookies.remove("token");
        navigate("/login");
        return;
      }
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };

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
            {event?.isTeamEvent && (
              <p className="team-info">
                Team Event - {event.minTeamSize} to {event.maxTeamSize} members required
              </p>
            )}
          </div>

          {registered ? (
            <button className="signup-button" disabled>
              Registered
            </button>
          ) : (
            <form className="signup-form" onSubmit={handleSubmit}>
              <h3>Your Details (Team Leader)</h3>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  className="signup-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
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
                <label>Phone *</label>
                <input
                  className="signup-input"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>College *</label>
                <input
                  className="signup-input"
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  required
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

              {event?.isTeamEvent && (
                <>
                  <hr />
                  <h3>Team Details</h3>

                  <div className="form-group">
                    <label>Team Name *</label>
                    <input
                      className="signup-input"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  </div>

                  <h4>Team Members ({teamMembers.length} of {event.maxTeamSize - 1} max)</h4>

                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="team-member-card">
                      <h5>Member {idx + 1}</h5>

                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          className="signup-input"
                          value={member.name}
                          onChange={(e) => handleTeamMemberChange(idx, "name", e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          className="signup-input"
                          type="email"
                          value={member.email}
                          onChange={(e) => handleTeamMemberChange(idx, "email", e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          className="signup-input"
                          value={member.phone}
                          onChange={(e) => handleTeamMemberChange(idx, "phone", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>College</label>
                        <input
                          className="signup-input"
                          value={member.college}
                          onChange={(e) => handleTeamMemberChange(idx, "college", e.target.value)}
                        />
                      </div>

                      {teamMembers.length > event.minTeamSize - 1 && (
                        <button
                          type="button"
                          className="btn-remove-member"
                          onClick={() => removeTeamMember(idx)}
                        >
                          Remove Member
                        </button>
                      )}
                    </div>
                  ))}

                  {teamMembers.length < event.maxTeamSize - 1 && (
                    <button
                      type="button"
                      className="btn-add-member"
                      onClick={addTeamMember}
                    >
                      + Add Team Member
                    </button>
                  )}
                </>
              )}

              <button type="submit" className="signup-button">
                {event?.isTeamEvent ? "Register Team" : "Confirm Registration"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default RegisterEvent;
