import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Manage Tables", path: "/admin/tables" },
    { label: "Reservations", path: "/admin/reservations" },
    { label: "Waiting List", path: "/admin/waitinglist" },
    { label: "Reports", path: "/admin/reports" },
  ];

  return (
    <>
      {/* Mobile Top Nav */}
      <div className="md:hidden flex justify-between items-center bg-gray-900 p-4 fixed top-0 left-0 right-0 z-50">
        <h2 className="text-xl font-bold text-yellow-400">Restobar Admin</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl focus:outline-none"
        >
          {isOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Sidebar for mobile (fixed) and desktop (sticky) */}
      <aside
        className={`
          bg-gray-900 border-r border-gray-800 p-6 z-40
          transition-transform duration-300 ease-in-out
          h-full w-64
          fixed top-0 left-0 transform md:static md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:block md:sticky md:top-0
        `}
      >
        <h2 className="text-xl font-semibold text-yellow-400 mb-8 hidden md:block">
          Restobar Admin
        </h2>

        <nav className="flex flex-col space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
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
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-md text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
