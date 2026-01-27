import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  // =======================
  // Check if user already registered
  // =======================
  useEffect(() => {
    const checkRegistration = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const res = await axios.get(`/events/${event._id}/is-registered`);
        setRegistered(res.data.registered);
      } catch (err) {
        console.error("Check registration error:", err);
        // toast.error("Failed to check registration status"); // Silent fail is better here
      }
    };

    checkRegistration();
  }, [event._id]);

  const handleRegister = () => {
    if (registered) return;
    navigate(`/register/${event._id}`);
  };

  return (
    <div className="event-card">
      <div className="event-image">
        <img src={event.bannerUrl || "/images/img-event.jpg"} alt={event.title} />
      </div>
      <div className="event-details">
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>₹{event.price || 0}</strong>
          <button
            className={`btn-gradient ${registered ? "registered" : ""}`}
            disabled={registered}
            onClick={handleRegister}
          >
            {registered ? "✅ Registered" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
