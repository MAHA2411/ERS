import React, { useState } from "react";
import axios from "../api/axios";

const AdminAddEvent = () => {
  const [title, setTitle] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    await axios.post("/admin/events", { title });
    alert("Event created");
  };

  return (
    <form onSubmit={submit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button>Create</button>
    </form>
  );
};

export default AdminAddEvent;
