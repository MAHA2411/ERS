import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("/admin/events").then((res) => setEvents(res.data));
  }, []);

  return (
    <div>
      <h2>My Events</h2>
      {events.map((e) => (
        <div key={e._id}>{e.title}</div>
      ))}
    </div>
  );
};

export default AdminDashboard;
