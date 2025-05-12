import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("admin_authenticated") === "true";

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
