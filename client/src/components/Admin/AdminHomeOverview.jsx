import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#10B981", "#F59E0B", "#6366F1", "#EF4444"]; // Pie + Bar chart colors

const AdminHomeOverview = () => {
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    done: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snapshot = await getDocs(collection(db, "reservations"));
        const all = snapshot.docs.map(doc => doc.data());

        const totals = {
          total: all.length,
          confirmed: all.filter(r => r.status === "confirmed").length,
          pending: all.filter(r => r.status === "pending").length,
          cancelled: all.filter(r => r.status === "cancelled").length,
          done: all.filter(r => r.status === "done").length,
        };

        setStats(totals);
      } catch (err) {
        console.error("Error fetching reservation stats", err);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: "Confirmed", value: stats.confirmed },
    { name: "Pending", value: stats.pending },
    { name: "Done", value: stats.done },
    { name: "Cancelled", value: stats.cancelled },
  ];

  const percentage = (val) =>
    stats.total > 0 ? Math.round((val / stats.total) * 100) : 0;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-semibold mb-6 text-yellow-400">Dashboard Overview</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        <StatCard label="Total Reservations" value={stats.total} noProgress />
        <StatCard label="Confirmed" value={stats.confirmed} percent={percentage(stats.confirmed)} />
        <StatCard label="Pending" value={stats.pending} percent={percentage(stats.pending)} />
        <StatCard label="Done" value={stats.done} percent={percentage(stats.done)} />
        <StatCard label="Cancelled" value={stats.cancelled} percent={percentage(stats.cancelled)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 shadow-sm">
          <h2 className="text-lg font-medium mb-4 text-white">Pie Chart: Reservation Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 shadow-sm">
          <h2 className="text-lg font-medium mb-4 text-white">Bar Chart: Reservation Count</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Optional: assign subtle progress bar colors by label
const getBarColor = (label) => {
  switch (label) {
    case "Confirmed": return "bg-emerald-400";
    case "Pending": return "bg-amber-400";
    case "Done": return "bg-sky-400";
    case "Cancelled": return "bg-rose-400";
    default: return "bg-gray-400";
  }
};

const StatCard = ({ label, value, percent = 0, noProgress }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-sm hover:shadow-md transition">
    <p className="text-sm text-gray-400 mb-1 tracking-wide">{label}</p>
    <h2 className="text-3xl font-semibold text-white">{value}</h2>
    {!noProgress && (
      <div className="mt-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getBarColor(label)}`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 text-right mt-1">{percent}%</p>
      </div>
    )}
  </div>
);

export default AdminHomeOverview;
