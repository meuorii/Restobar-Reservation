import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const tableTypes = ["All", "Small Table", "Medium Table", "Large Table", "Party Table", "VIP Table"];
const timeOptions = ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"];

const formatTime = (time) => {
  const hour = parseInt(time.split(":")[0]);
  const suffix = hour >= 12 && hour < 24 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${suffix}`;
};

const TableStatus = () => {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // ✅ Default to today
  });
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const isPastDateTime = () => {
    if (!selectedDate || !selectedTime) return false;
    const now = new Date();
    const selected = new Date(`${selectedDate}T${selectedTime}`);
    return selected < now;
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tables"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTables(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedTime) return;

    const resQuery = query(
      collection(db, "reservations"),
      where("date", "==", selectedDate),
      where("status", "in", ["confirmed", "pending"])
    );

    const unsubscribe = onSnapshot(resQuery, (snapshot) => {
      const resData = snapshot.docs.map((doc) => doc.data());
      setReservations(resData);
    });

    return () => unsubscribe();
  }, [selectedDate, selectedTime]);

  const isTableReserved = (tableId) => {
    const current = new Date(`${selectedDate}T${selectedTime}`);
    return reservations.some((res) => {
      if (res.table_id !== tableId) return false;
      const resStart = new Date(`${res.date}T${res.startTime}`);
      const resEnd = new Date(`${res.date}T${res.endTime}`);
      if (res.endTime < res.startTime) resEnd.setDate(resEnd.getDate() + 1);
      return current >= resStart && current < resEnd;
    });
  };

  const getReservationByTable = (tableId) => {
    const current = new Date(`${selectedDate}T${selectedTime}`);
    return reservations.find((res) => {
      if (res.table_id !== tableId) return false;
      const resStart = new Date(`${res.date}T${res.startTime}`);
      const resEnd = new Date(`${res.date}T${res.endTime}`);
      if (res.endTime < res.startTime) resEnd.setDate(resEnd.getDate() + 1);
      return current >= resStart && current < resEnd;
    });
  };

  const filteredTables =
    selectedType === "All"
      ? tables
      : tables.filter((table) => table.type === selectedType);

  const totalCapacity = filteredTables
    .filter(
      (table) =>
        table.status !== "under repair" &&
        !isPastDateTime() &&
        !isTableReserved(table.table_id)
    )
    .reduce((acc, t) => acc + t.capacity, 0);

  const tableStats = {
    total: filteredTables.length,
    reserved: filteredTables.filter((t) => isTableReserved(t.table_id)).length,
    available: filteredTables.filter(
      (t) =>
        t.status !== "under repair" &&
        !isPastDateTime() &&
        !isTableReserved(t.table_id)
    ).length,
  };

  return (
    <div className="mt-2 bg-[#111] p-4 rounded-xl">
      <h2 className="text-lg font-bold text-yellow-400 mb-4">Table Status</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full sm:w-1/3 p-2 rounded-md bg-gray-800 text-white text-sm"
        />

        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          disabled={!selectedDate}
          className="w-full sm:w-1/3 p-2 rounded-md bg-gray-800 text-white text-sm"
        >
          <option value="">-- Select Time --</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {formatTime(time)}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full sm:w-1/3 p-2 rounded-md bg-gray-800 text-white text-sm"
        >
          {tableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Legend and summary */}
      {selectedDate && selectedTime && (
        <div className="text-white text-sm mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="bg-green-500 px-2 py-1 rounded text-xs">Available</span>
            <span className="bg-red-500 px-2 py-1 rounded text-xs">Reserved</span>
            <span className="bg-gray-500 px-2 py-1 rounded text-xs">Under Repair / Unavailable</span>
          </div>
          <div className="text-gray-300">
            {`Total: ${tableStats.total} | Available: ${tableStats.available} | Reserved: ${tableStats.reserved} | Guest Capacity: ${totalCapacity}`}
          </div>
        </div>
      )}

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredTables.map((table) => {
          const reserved = isTableReserved(table.table_id);
          const repair = table.status === "under repair";
          const past = isPastDateTime();
          const resInfo = getReservationByTable(table.table_id);

          const badgeColor = repair
            ? "bg-gray-500"
            : past
            ? "bg-gray-500"
            : reserved
            ? "bg-red-500"
            : "bg-green-500";

          const badgeLabel = repair
            ? "Under Repair"
            : past
            ? "Unavailable"
            : reserved
            ? "Reserved"
            : "Available";

          return (
            <div
              key={table.table_id}
              className="bg-gray-800 rounded-lg p-3 text-sm text-white flex flex-col items-start"
              title={
                repair
                  ? "Currently under repair"
                  : reserved
                  ? `Reserved by ${resInfo?.name || "Unknown"}`
                  : past
                  ? "This time slot has passed"
                  : "Available for reservation"
              }
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="font-semibold text-sm">Table {table.table_id}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full min-w-[75px] text-center ${badgeColor}`}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {badgeLabel}
                </span>
              </div>
              <div className="text-gray-300 text-xs">
                <p>{table.type}</p>
                <p>{table.capacity} Guests</p>
                {reserved && resInfo?.endTime && (
                  <p className="text-yellow-400 mt-1">
                    Until {formatTime(resInfo.endTime)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableStatus;
