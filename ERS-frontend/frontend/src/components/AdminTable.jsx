// src/components/AdminTable.jsx
import React from "react";

const AdminTable = ({ data }) => (
  <div className="overflow-x-auto bg-white shadow rounded">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Role</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((admin) => (
          <tr key={admin._id}>
            <td className="px-6 py-4">{admin.name}</td>
            <td className="px-6 py-4">{admin.email}</td>
            <td className="px-6 py-4">{admin.role}</td>
            <td className="px-6 py-4 flex gap-2">
              <button className="bg-blue-500 px-2 py-1 rounded text-white hover:bg-blue-600">Edit</button>
              <button className="bg-red-500 px-2 py-1 rounded text-white hover:bg-red-600">Deactivate</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminTable;
