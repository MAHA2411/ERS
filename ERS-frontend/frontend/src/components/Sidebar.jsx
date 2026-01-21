// src/components/Sidebar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Sidebar = () => {
  const navigate = useNavigate();
  const logout = () => {
    Cookies.remove("token");
    navigate("/admin/login");
  };

  return (
    <aside className="w-64 bg-blue-800 text-white min-h-screen p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-8">EventHub</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/superadmin/dashboard" className="hover:bg-blue-700 px-4 py-2 rounded">Dashboard</Link>
        <Link to="/superadmin/dashboard#events" className="hover:bg-blue-700 px-4 py-2 rounded">Events</Link>
        <Link to="/superadmin/dashboard#registrations" className="hover:bg-blue-700 px-4 py-2 rounded">Registrations</Link>
        <Link to="/superadmin/dashboard#admins" className="hover:bg-blue-700 px-4 py-2 rounded">Admins</Link>
        <Link to="/superadmin/dashboard#settings" className="hover:bg-blue-700 px-4 py-2 rounded">Settings</Link>
        <button onClick={logout} className="mt-auto bg-red-500 hover:bg-red-600 px-4 py-2 rounded">Logout</button>
      </nav>
    </aside>
  );
};

export default Sidebar;
