import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatTimeAMPM = (time24) => {
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
};

const formatDatePretty = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ReservationManager = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const ref = query(
        collection(db, "reservations"),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(ref);
      const now = new Date();
      const updates = [];

      const data = snapshot.docs.map((docSnap) => {
        const res = { id: docSnap.id, ...docSnap.data() };
        const end = new Date(`${res.date}T${res.endTime}`);
        if (res.endTime < res.startTime) end.setDate(end.getDate() + 1);
        if (end < now && ["pending", "confirmed"].includes(res.status)) {
          updates.push(updateDoc(doc(db, "reservations", res.id), { status: "done" }));
          res.status = "done";
        }
        return res;
      });

      if (updates.length > 0) await Promise.all(updates);
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this reservation?")) {
      try {
        await deleteDoc(doc(db, "reservations", id));
        toast.success("🗑️ Reservation deleted successfully.");
        fetchReservations();
      } catch {
        toast.error("Failed to delete reservation.");
      }
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const statusColor = {
    confirmed: "bg-green-600",
    pending: "bg-yellow-500",
    cancelled: "bg-red-500",
    done: "bg-gray-500",
  };

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">Manage Reservations</h2>

      {loading ? (
        <p>Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <p>No reservations found.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="bg-gray-800 rounded-lg p-5 shadow-md border border-gray-700 flex flex-col lg:flex-row justify-between"
            >
              <div className="flex-1 space-y-1 text-sm text-gray-200 mb-4 lg:mb-0">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">{res.name}</h3>
                <p><span className="font-semibold">Email:</span> {res.email || "—"}</p>
                <p><span className="font-semibold">Guests:</span> {res.guests}</p>
                <p><span className="font-semibold">Table:</span> {res.table_id || "N/A"}</p>
                <p><span className="font-semibold">Date:</span> {formatDatePretty(res.date)}</p>
                <p><span className="font-semibold">Time:</span> {formatTimeAMPM(res.startTime)} – {formatTimeAMPM(res.endTime)}</p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${statusColor[res.status] || "bg-gray-500"}`}>
                    {res.status}
                  </span>
                </p>
                {res.confirmed_at && (
                  <p><span className="font-semibold">Confirmed At:</span>{" "}
                    {new Date(res.confirmed_at.toDate?.() || res.confirmed_at).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 lg:items-start justify-end">
                {res.status === "pending" && !res.confirmed_at && (
                  <p className="text-yellow-400 text-xs">Waiting for customer to confirm via email...</p>
                )}

                {res.status === "pending" && res.confirmed_at && (
                  <button
                    disabled
                    className="bg-gray-600 text-white text-xs px-4 py-2 rounded cursor-not-allowed"
                  >
                    Confirmed via Email
                  </button>
                )}

                {res.status !== "pending" && (
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white text-xs px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer position="top-right" autoClose={4000} hideProgressBar />
    </div>
  );
};

export default ReservationManager;
