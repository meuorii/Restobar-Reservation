import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { format } from "date-fns";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

const timeSlots = [
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00",
];

const convertTo12Hour = (time) => {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m);
  return format(date, "hh:mm a");
};

const ManageTables = () => {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    table_id: "",
    type: "",
    capacity: "",
    status: "available",
  });
  const [editTableId, setEditTableId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tables"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTables(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      const q = query(collection(db, "reservations"), where("date", "==", selectedDate));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReservations(data);
    };
    fetchReservations();
  }, [selectedDate]);

  const getReservationForTable = (tableId) => {
    const [h, m] = selectedTime.split(":").map(Number);
    const checkTime = new Date(`${selectedDate}T${selectedTime}`);
    checkTime.setHours(h, m, 0);

    for (let res of reservations) {
      if (
        res.table_id === tableId &&
        res.status === "confirmed" &&
        res.date === selectedDate &&
        res.startTime &&
        res.endTime
      ) {
        const start = new Date(`${res.date}T${res.startTime}`);
        const end = new Date(`${res.date}T${res.endTime}`);
        if (res.endTime < res.startTime) end.setDate(end.getDate() + 1);
        if (checkTime >= start && checkTime < end) return res;
      }
    }
    return null;
  };

  const openModal = (table = null) => {
    if (table) {
      setFormData({
        table_id: table.table_id,
        type: table.type,
        capacity: table.capacity,
        status: table.status || "available",
      });
      setIsEditing(true);
      setEditTableId(table.id);
    } else {
      setFormData({
        table_id: "",
        type: "",
        capacity: "",
        status: "available",
      });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({ table_id: "", type: "", capacity: "", status: "available" });
    setIsEditing(false);
    setEditTableId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.table_id || !formData.type || !formData.capacity) return;

    try {
      if (isEditing) {
        const ref = doc(db, "tables", editTableId);
        await updateDoc(ref, formData);
      } else {
        await addDoc(collection(db, "tables"), formData);
      }
      closeModal();
    } catch (err) {
      console.error("Error saving table:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      await deleteDoc(doc(db, "tables", id));
    }
  };

  return (
    <div className="p-6 text-white">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
          Manage Tables
          <button
            onClick={() => openModal()}
            className="ml-2 p-2 rounded-full bg-green-600 hover:bg-green-700 text-white"
            title="Create Table"
          >
            <FiPlus />
          </button>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div>
            <label className="text-sm font-semibold mr-2">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 rounded bg-gray-800 border border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm font-semibold mr-2">Time:</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="p-2 rounded bg-gray-800 border border-gray-600 text-white"
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {convertTo12Hour(slot)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {tables.map((table) => {
          const res = getReservationForTable(table.table_id);
          const reserved = Boolean(res);

          const bgColor =
            table.status === "under repair"
              ? "bg-gray-700/80"
              : reserved
              ? "bg-red-800/80"
              : "bg-green-800/70";

          return (
            <div
              key={table.id}
              className={`rounded-lg p-4 relative shadow-md transition duration-300 ${bgColor}`}
            >
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => openModal(table)}
                  className="p-1 text-yellow-300 hover:text-yellow-500"
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="p-1 text-red-300 hover:text-red-500"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
              <h3 className="text-xl font-bold mb-2">Table {table.table_id}</h3>
              <p className="text-sm text-gray-200 mb-1">
                <strong>Type:</strong> {table.type}
              </p>
              <p className="text-sm text-gray-200 mb-1">
                <strong>Capacity:</strong> {table.capacity}
              </p>
              <p className="text-sm text-gray-200 mb-1">
                <strong>Status:</strong>{" "}
                <span className="font-semibold capitalize">
                  {table.status || "available"}
                </span>
              </p>
              {reserved && (
                <p className="text-sm text-yellow-300 mt-2">
                  <strong>Reserved By:</strong> {res.name || res.email || "Unknown"}
                </p>
              )}
            </div>
          );
        })}

        {tables.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-6">
            No tables found.
          </p>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Table" : "Create Table"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Table ID</label>
                <input
                  type="text"
                  value={formData.table_id}
                  onChange={(e) =>
                    setFormData({ ...formData, table_id: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                  required
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Type</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                >
                  <option value="available">Available</option>
                  <option value="under repair">Under Repair</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTables;
