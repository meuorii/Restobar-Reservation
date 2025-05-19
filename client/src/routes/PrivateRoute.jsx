import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const PrivateRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) return setIsAdmin(false);

      const adminRef = doc(db, "admins", user.email);
      const adminSnap = await getDoc(adminRef);
      setIsAdmin(adminSnap.exists());
    };

    checkAdmin();
  }, []);

  if (isAdmin === null) return <div className="text-white p-4">Checking access...</div>;

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
