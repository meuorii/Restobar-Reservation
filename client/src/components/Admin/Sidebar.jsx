import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Manage Tables", path: "/admin/tables" },
    { label: "Reservations", path: "/admin/reservations" },
    { label: "Waiting List", path: "/admin/waitinglist" },
    { label: "Reports", path: "/admin/reports" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 p-6">
      <h2 className="text-xl font-semibold text-white mb-8">Restobar Admin</h2>

      <nav className="flex flex-col space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${
              location.pathname === item.path
                ? "bg-yellow-500 text-black"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-12">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-md text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
