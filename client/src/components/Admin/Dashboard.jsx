// Dashboard.jsx
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
    <div className="flex bg-gray-900 text-white min-h-screen">
  <Sidebar onLogout={handleLogout} />
  <main className="flex-1 p-4 pt-16 md:pt-8 overflow-y-auto">
    {renderContent()}
  </main>
</div>
  );
};

export default Dashboard;
