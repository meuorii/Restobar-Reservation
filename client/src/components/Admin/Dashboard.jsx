import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AdminHomeOverview from "./AdminHomeOverview";
import ReservationManager from "./ReservationManager";
import ManageTables from "./ManageTables";
import WaitingList from "./WaitingList";
import Reports from "./Reports";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Admin Dashboard - Restobar";
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_2fa_code");
    localStorage.removeItem("admin_email");
    navigate("/admin/login");
  };

  const renderContent = () => {
    switch (location.pathname) {
      case "/admin/reservations":
        return <ReservationManager />;
      case "/admin/tables":
        return <ManageTables />;
      case "/admin/waitinglist":
        return <WaitingList />;
      case "/admin/reports":
        return <Reports />;
      case "/admin/dashboard":
      default:
        return <AdminHomeOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar remains fixed and does not scroll */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Scrollable main content */}
      <main className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
