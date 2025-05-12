import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Reservation from "./pages/Reservation";

import AdminLogin from "./components/Admin/AdminLogin";
import VerifyCode from "./components/Admin/VerifyCode";
import Dashboard from "./components/Admin/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/reservation" element={<Reservation />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/verify-code" element={<VerifyCode />} />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
         <Route
          path="/admin/reservations"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/waitinglist"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
