// src/components/Table.jsx
import React from "react";

const Table = ({
  activeTab,
  admins,
  events,
  registrations,
  search,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}) => {
  // =============================
  // Filter function
  // =============================
  const filteredData = (data) =>
    data.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  // =============================
  // Pagination
  // =============================
  const paginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData(data).slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = (data) => Math.ceil(filteredData(data).length / itemsPerPage);

  const currentData =
    activeTab === "admins"
      ? paginatedData(admins)
      : activeTab === "events"
      ? paginatedData(events)
      : paginatedData(registrations);

  // =============================
  // Render table rows
  // =============================
  const renderRows = () => {
    if (activeTab === "admins") {
      return currentData.map((admin, idx) => (
        <tr key={idx}>
          <td>{admin.name}</td>
          <td>{admin.email}</td>
          <td>{admin.role}</td>
        </tr>
      ));
    }

    if (activeTab === "events") {
      return currentData.map((event, idx) => (
        <tr key={idx}>
          <td>{event.title}</td>
          <td>{new Date(event.date).toLocaleDateString()}</td>
          <td>{event.location}</td>
        </tr>
      ));
    }

    if (activeTab === "registrations") {
      return currentData.map((reg, idx) => (
        <tr key={idx}>
          <td>{reg.user?.name}</td>
          <td>{reg.user?.email}</td>
          <td>{reg.eventId?.title}</td>
        </tr>
      ));
    }
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {activeTab === "admins" && (
              <>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </>
            )}
            {activeTab === "events" && (
              <>
                <th>Title</th>
                <th>Date</th>
                <th>Venue</th>
              </>
            )}
            {activeTab === "registrations" && (
              <>
                <th>User</th>
                <th>Email</th>
                <th>Event</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>

      {filteredData(
        activeTab === "admins"
          ? admins
          : activeTab === "events"
          ? events
          : registrations
      ).length === 0 && <p className="no-data">No data found</p>}

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of{" "}
          {totalPages(
            activeTab === "admins"
              ? admins
              : activeTab === "events"
              ? events
              : registrations
          )}
        </span>
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={
            currentPage ===
            totalPages(
              activeTab === "admins"
                ? admins
                : activeTab === "events"
                ? events
                : registrations
            )
          }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Table;
