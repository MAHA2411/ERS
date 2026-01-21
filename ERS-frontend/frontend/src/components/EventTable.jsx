// src/components/EventTable.jsx
import React from "react";

const EventTable = ({ data }) => (
  <div className="overflow-x-auto bg-white shadow rounded">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Event Name</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Venue</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Participants</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((event) => (
          <tr key={event._id}>
            <td className="px-6 py-4">{event.name}</td>
            <td className="px-6 py-4">{new Date(event.date).toLocaleDateString()}</td>
            <td className="px-6 py-4">{event.venue}</td>
            <td className="px-6 py-4">{event.participants?.length || 0}</td>
            <td className="px-6 py-4 flex gap-2">
              <button className="bg-green-500 px-2 py-1 rounded text-white hover:bg-green-600">Edit</button>
              <button className="bg-red-500 px-2 py-1 rounded text-white hover:bg-red-600">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EventTable;
