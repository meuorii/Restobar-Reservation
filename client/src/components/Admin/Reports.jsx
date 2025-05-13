import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Reports = () => {
  const [reservations, setReservations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      const snap = await getDocs(collection(db, "reservations"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(data);
      setFiltered(data);
    };
    fetchReservations();
  }, []);

  const handleFilter = () => {
    let result = reservations;

    if (startDate) result = result.filter(r => r.date >= startDate);
    if (endDate) result = result.filter(r => r.date <= endDate);
    if (status !== "all") result = result.filter(r => r.status === status);

    setFiltered(result);
  };

  const handleBackup = () => {
    const dataStr = JSON.stringify(filtered, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `reservation-backup-${new Date().toISOString()}.json`;
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reservation Report", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Date", "Time", "Guests", "Status"]],
      body: filtered.map(r => [
        r.name || r.email || "Unknown",
        r.date,
        `${r.startTime} - ${r.endTime}`,
        r.guests || "-",
        r.status,
      ]),
    });
    doc.save("reservation-report.pdf");
  };

  const getStats = () => {
    const totalGuests = filtered.reduce((sum, r) => sum + (parseInt(r.guests) || 0), 0);

    const dateFrequency = {};
    const hourFrequency = {};
    const weekdayFrequency = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].reduce(
      (acc, day) => ({ ...acc, [day]: 0 }),
      {}
    );

    filtered.forEach(r => {
      // Date frequency
      dateFrequency[r.date] = (dateFrequency[r.date] || 0) + 1;

      // Hour frequency
      if (r.startTime) {
        const hour = r.startTime.split(":")[0];
        hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;
      }

      // Weekday frequency
      const day = new Date(`${r.date}T00:00:00`).toLocaleString("en-US", { weekday: "short" });
      weekdayFrequency[day] = (weekdayFrequency[day] || 0) + 1;
    });

    const mostActiveDate = Object.entries(dateFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    const hourlyData = Object.entries(hourFrequency).map(([hour, count]) => ({
      name: `${hour}:00`,
      count,
    }));

    const weekdayData = Object.entries(weekdayFrequency).map(([day, count]) => ({
      name: day,
      count,
    }));

    return { totalGuests, mostActiveDate, hourlyData, weekdayData };
  };

  const { totalGuests, mostActiveDate, hourlyData, weekdayData } = getStats();

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Reservation Reports</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-400">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
          >
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={handleFilter}
            className="w-full bg-yellow-500 text-black font-semibold p-2 rounded hover:bg-yellow-400"
          >
            Filter
          </button>
          <button
            onClick={handleBackup}
            className="w-full bg-green-500 text-black font-semibold p-2 rounded hover:bg-green-400"
          >
            Backup
          </button>
          <button
            onClick={handleExportPDF}
            className="w-full bg-blue-500 text-white font-semibold p-2 rounded hover:bg-blue-400"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400">Total Guests</h3>
          <p className="text-xl font-bold">{totalGuests}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400">Most Active Date</h3>
          <p className="text-xl font-bold">{mostActiveDate}</p>
        </div>
      </div>

      {/* Mini Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-700">
          <h3 className="text-sm text-gray-300 mb-2">Reservations by Hour</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="count" fill="#60A5FA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-700">
          <h3 className="text-sm text-gray-300 mb-2">Reservations by Weekday</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weekdayData}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="count" fill="#34D399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((r) => (
            <div
              key={r.id}
              className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold mb-1 text-white">
                {r.name || r.email || "Unknown"}
              </h3>
              <p className="text-sm text-gray-300">
                <span className="text-gray-400">Date:</span> {r.date}
              </p>
              <p className="text-sm text-gray-300">
                <span className="text-gray-400">Time:</span> {r.startTime} - {r.endTime}
              </p>
              <p className="text-sm text-gray-300">
                <span className="text-gray-400">Guests:</span> {r.guests || "-"}
              </p>
              <p className="text-sm mt-1">
                <span className="text-gray-400">Status:</span>{" "}
                <span className="capitalize text-yellow-400">{r.status}</span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 col-span-full">No reservations found.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
