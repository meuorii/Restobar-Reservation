import { useEffect, useState } from "react";
import {
  collection, getDocs, updateDoc, doc, orderBy, query, where,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendConfirmationEmail } from "../../utils/sendConfirmationEmail";
import { sendRejectionEmail } from "../../utils/sendRejectionEmail";

const timeSlots = ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"];

const isOverlap = (start1, end1, start2, end2) => start1 < end2 && end1 > start2;

const getFilteredTables = async (guestCount) => {
  const snap = await getDocs(collection(db, "tables"));
  return snap.docs
    .map((doc) => doc.data())
    .filter((t) => {
      const c = t.capacity;
      return (
        (guestCount <= 2 && c === 2) ||
        (guestCount <= 4 && c === 4) ||
        (guestCount <= 6 && c === 6) ||
        (guestCount <= 10 && c === 10) ||
        (guestCount <= 15 && c === 15)
      );
    })
    .sort((a, b) => a.capacity - b.capacity);
};

const formatTimeAMPM = (time24) => {
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
};

const findAvailableTable = (tables, reservations, date, startTime, endTime) => {
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);
  if (endTime < startTime) end.setDate(end.getDate() + 1);

  for (const table of tables) {
    const conflict = reservations.some((r) => {
      if (r.table_id !== table.table_id || r.status === "cancelled") return false;
      const rStart = new Date(`${r.date}T${r.startTime}`);
      const rEnd = new Date(`${r.date}T${r.endTime}`);
      if (r.endTime < r.startTime) rEnd.setDate(rEnd.getDate() + 1);
      return isOverlap(start, end, rStart, rEnd);
    });
    if (!conflict) return table.table_id;
  }
  return null;
};

const WaitingList = () => {
  const [waitingReservations, setWaitingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualAssign, setManualAssign] = useState(null);

  const fetchWaitingList = async () => {
    try {
      const q = query(
        collection(db, "reservations"),
        where("status", "==", "waiting-list"),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWaitingReservations(data);
    } catch (error) {
      console.error("Error fetching waiting list:", error);
      toast.error("Failed to load waiting list.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (res) => {
    try {
      const guestCount = parseInt(res.guests);
      const date = res.date;
      const tables = await getFilteredTables(guestCount);

      const reservationSnap = await getDocs(
        query(collection(db, "reservations"), where("date", "==", date))
      );
      const allReservations = reservationSnap.docs.map((doc) => doc.data());

      let assignedTable = findAvailableTable(tables, allReservations, date, res.startTime, res.endTime);
      let startTime = res.startTime;
      let endTime = res.endTime;

      if (!assignedTable) {
        // Open modal for manual reassignment
        setManualAssign({ res, tables, allReservations });
        return;
      }

      await confirmReservation(res, assignedTable, startTime, endTime);
    } catch (error) {
      console.error("Confirm error:", error);
      toast.error("Failed to confirm reservation.");
    }
  };

  const confirmReservation = async (res, tableId, startTime, endTime) => {
    await updateDoc(doc(db, "reservations", res.id), {
      status: "confirmed",
      table_id: tableId,
      startTime,
      endTime,
    });

    if (res.email) {
      await sendConfirmationEmail({
        to_name: res.name,
        to_email: res.email,
        date: res.date,
        start_time: startTime,
        end_time: endTime,
        table_id: tableId,
      });
    }

    toast.success(`Confirmed ${res.name} from ${formatTimeAMPM(startTime)} to ${formatTimeAMPM(endTime)}.`);
    setManualAssign(null);
    fetchWaitingList();
  };

  const handleManualAssign = async () => {
    const { res, tables, allReservations } = manualAssign;
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;
    if (!start || !end) return toast.error("Select time first.");

    const assignedTable = findAvailableTable(tables, allReservations, res.date, start, end);
    if (!assignedTable) {
      return toast.error("No available table for selected time.");
    }

    await confirmReservation(res, assignedTable, start, end);
  };

  const handleCancel = async (id) => {
    try {
      await updateDoc(doc(db, "reservations", id), { status: "cancelled" });
      toast.success("Reservation cancelled.");
      fetchWaitingList();
    } catch {
      toast.error("Failed to cancel.");
    }
  };

  useEffect(() => {
    fetchWaitingList();
  }, []);

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6">Waiting List</h2>

      {loading ? (
        <p>Loading...</p>
      ) : waitingReservations.length === 0 ? (
        <p>No reservations on the waiting list.</p>
      ) : (
        <div className="space-y-4">
          {waitingReservations.map((res) => (
            <div
              key={res.id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">{res.name}</h3>
              <p>Email: {res.email || "—"}</p>
              <p>Guests: {res.guests}</p>
              <p>Date: {res.date}</p>
              <p>Time: {res.startTime} - {res.endTime}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => handleConfirm(res)}
                  className="bg-green-500 hover:bg-green-400 text-black px-3 py-1 rounded text-sm"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleCancel(res.id)}
                  className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual reassignment modal */}
      {manualAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md text-white">
            <h3 className="text-xl font-bold mb-4">No tables available</h3>
            <p className="text-sm text-gray-300 mb-2">
              Select a new time to assign for <strong>{manualAssign.res.name}</strong>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <select id="startTime" className="bg-gray-800 p-2 rounded">
                <option value="">Start Time</option>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>{formatTimeAMPM(t)}</option>
                ))}
              </select>
              <select id="endTime" className="bg-gray-800 p-2 rounded">
                <option value="">End Time</option>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>{formatTimeAMPM(t)}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button
  onClick={async () => {
    const res = manualAssign.res;
    setManualAssign(null);
    toast.info("No time reassigned. Reservation was not confirmed.");

    if (res.email) {
      await sendRejectionEmail({
        to_name: res.name,
        to_email: res.email,
        date: res.date,
        start_time: res.startTime,
        end_time: res.endTime,
      });
    }
  }}
  className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
>
  Close
</button>
              <button
                onClick={handleManualAssign}
                className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400 text-black"
              >
                Confirm Time
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={4000} hideProgressBar />
    </div>
  );
};

export default WaitingList;
