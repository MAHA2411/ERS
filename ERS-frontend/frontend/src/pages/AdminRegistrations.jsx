import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const AdminRegistrations = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("/admin/registrations").then((res) => setData(res.data));
  }, []);

  return (
    <table>
      <tbody>
        {data.map((r) => (
          <tr key={r._id}>
            <td>{r.user?.name}</td>
            <td>{r.eventId?.title}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminRegistrations;
