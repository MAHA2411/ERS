import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import { toast } from "react-toastify";

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all events
        const eventsRes = await axios.get("/events");
        setEvents(eventsRes.data);

        // If user logged in, fetch their registered events
        const token = Cookies.get("token");
        if (token) {
          try {
            const regRes = await axios.get("/register-event/mine", {
              headers: { Authorization: `Bearer ${token}` },
            });

            // Store only the event IDs the user registered for
            const registeredIds = regRes.data.map(
              (r) => r.eventId?._id || r.eventId
            );
            setRegisteredEventIds(registeredIds);
          } catch (regErr) {
            console.error("Failed to fetch registrations:", regErr);
          }
        }
      } catch (err) {
        console.error("Failed to load events or registrations:", err);
        toast.error("Failed to load events or registrations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Navbar />;

  return (
    <>
      <Navbar />
      <div className="container" style={{ marginTop: 110 }}>
        <h2>Available Events</h2>
        <div className="events-grid">
          {events.map((event) => {
            const isRegistered = registeredEventIds.includes(event._id);
            return (
              <EventCard
                key={event._id}
                event={event}
                isRegistered={isRegistered}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BrowseEvents;
