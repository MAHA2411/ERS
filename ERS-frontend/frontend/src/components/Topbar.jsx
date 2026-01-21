const Topbar = ({ user }) => {
  return (
    <header className="bg-white shadow p-4 flex justify-between">
      <h2 className="text-xl font-semibold">Dashboard Overview</h2>
      <div className="flex items-center gap-3">
        <span className="font-medium">{user?.email}</span>
        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">
          SA
        </div>
      </div>
    </header>
  );
};

export default Topbar;
