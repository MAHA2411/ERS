const DataTable = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Latest Registrations</h3>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>Name</th>
            <th>Email</th>
            <th>Event</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r._id} className="border-b hover:bg-gray-50">
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.eventId?.name}</td>
              <td>₹{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
