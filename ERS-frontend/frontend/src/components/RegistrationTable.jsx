// src/components/RegistrationTable.jsx
import React from "react";

const RegistrationTable = ({ data }) => (
  <div className="overflow-x-auto bg-white shadow rounded">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">College</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Event</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((reg) => (
          <tr key={reg._id}>
            <td className="px-6 py-4">{reg.name}</td>
            <td className="px-6 py-4">{reg.email}</td>
            <td className="px-6 py-4">{reg.college}</td>
            <td className="px-6 py-4">{reg.eventName}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded text-white ${reg.status === "Approved" ? "bg-green-500" : "bg-yellow-500"}`}>
                {reg.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RegistrationTable;
