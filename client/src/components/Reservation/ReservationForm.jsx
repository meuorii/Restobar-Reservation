import { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { sendReservationEmail } from "../../utils/emailService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const timeSlots = ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"];

const formatTimeAMPM = (time24) => {
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 && hour < 24 ? "PM" : "AM";
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

const getAllowedEndTimes = (startTime) => {
  if (!startTime) return timeSlots;
  const index = timeSlots.indexOf(startTime);
  return timeSlots.slice(index + 1);
};

const ReservationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
    guests: "1",
    requests: "",
    table_id: "",
  });

  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchAvailableTables = async () => {
      if (!formData.date || !formData.startTime || !formData.endTime) return;

      const tablesSnap = await getDocs(collection(db, "tables"));
      const reservationsSnap = await getDocs(
        query(collection(db, "reservations"), where("date", "==", formData.date))
      );

      const filteredTables = tablesSnap.docs.map((doc) => doc.data());
      const reservations = reservationsSnap.docs.map((doc) => doc.data());

      const isOverlap = (start1, end1, start2, end2) =>
        start1 < end2 && end1 > start2;

      const selectedStart = new Date(`${formData.date}T${formData.startTime}`);
      const selectedEnd = new Date(`${formData.date}T${formData.endTime}`);
      if (formData.endTime < formData.startTime) {
        selectedEnd.setDate(selectedEnd.getDate() + 1);
      }

      const reservedTableIds = new Set();
      reservations.forEach((res) => {
        const resStart = new Date(`${res.date}T${res.startTime}`);
        const resEnd = new Date(`${res.date}T${res.endTime}`);
        if (res.endTime < res.startTime) {
          resEnd.setDate(resEnd.getDate() + 1);
        }

        if (
          isOverlap(selectedStart, selectedEnd, resStart, resEnd) &&
          ["confirmed", "pending"].includes(res.status)
        ) {
          reservedTableIds.add(res.table_id);
        }
      });

      const available = filteredTables.filter(
        (table) =>
          !reservedTableIds.has(table.table_id) &&
          table.status !== "under repair" &&
          table.status !== "unavailable"
      );

      setAvailableTables(available);
    };

    fetchAvailableTables();
  }, [formData.date, formData.startTime, formData.endTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requiredFields = ["name", "contact", "email", "date", "startTime", "endTime", "table_id"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error("❌ Please complete all required fields.");
        setLoading(false);
        return;
      }
    }

    try {
      const recaptchaToken = recaptchaRef.current?.getValue();
      if (!recaptchaToken) {
        toast.error("❌ Please verify you're not a robot.");
        setLoading(false);
        return;
      }

      const { startTime, endTime, date } = formData;
      const selectedStart = new Date(`${date}T${startTime}`);
      const selectedEnd = new Date(`${date}T${endTime}`);
      if (endTime < startTime) selectedEnd.setDate(selectedEnd.getDate() + 1);

      if (selectedEnd <= selectedStart) {
        toast.error("❌ End time must be after start time.");
        setLoading(false);
        return;
      }

      const reservationRef = collection(db, "reservations");
      const snapshot = await getDocs(query(reservationRef, where("date", "==", date)));
      const reservations = snapshot.docs.map((doc) => doc.data());

      const isOverlap = (start1, end1, start2, end2) =>
        start1 < end2 && end1 > start2;

      const conflict = reservations.find((res) => {
        const resStart = new Date(`${res.date}T${res.startTime}`);
        const resEnd = new Date(`${res.date}T${res.endTime}`);
        if (res.endTime < res.startTime) resEnd.setDate(resEnd.getDate() + 1);

        return (
          res.table_id === formData.table_id &&
          ["confirmed", "pending"].includes(res.status) &&
          isOverlap(selectedStart, selectedEnd, resStart, resEnd)
        );
      });

      if (conflict) {
        toast.error("❌ This table is already reserved at that time.");
        setLoading(false);
        return;
      }

      const filteredAvailableTables = availableTables.filter((table) => {
        const guests = parseInt(formData.guests);
        if (guests <= 2) return table.capacity === 2;
        if (guests <= 4) return table.capacity === 4;
        if (guests <= 6) return table.capacity === 6;
        if (guests <= 10) return table.capacity === 10;
        if (guests <= 15) return table.capacity === 15;
        return false;
      });

      const isWaitingList = filteredAvailableTables.length === 0;
      const reservationCode = `RES-${Date.now().toString().slice(-6)}`;
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 30);

      const newReservation = {
        ...formData,
        status: isWaitingList ? "waiting-list" : "pending",
        code: reservationCode,
        timestamp: serverTimestamp(),
        confirmation_expiry: expirationTime,
      };

      await addDoc(reservationRef, newReservation);

      if (formData.email) {
        await sendReservationEmail({
          to_name: formData.name,
          to_email: formData.email,
          date: formatDatePretty(formData.date),
          start_time: formatTimeAMPM(formData.startTime),
          end_time: formatTimeAMPM(formData.endTime),
          table_id: isWaitingList ? "N/A" : formData.table_id,
          guests: formData.guests,
          code: reservationCode,
        });
      }

      toast.success(
        isWaitingList
          ? "Added to waiting list. We'll notify you if a table opens."
          : "Reservation submitted!"
      );

      setFormData({
        name: "",
        contact: "",
        email: "",
        date: "",
        startTime: "",
        endTime: "",
        guests: "1",
        requests: "",
        table_id: "",
      });

      setAvailableTables([]);
      recaptchaRef.current.reset();
    } catch (error) {
      console.error("🔥 Reservation error:", error);
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-xl space-y-4 shadow-lg"
      >
        <h2 className="text-2xl text-yellow-500 font-bold mb-4">
          Reservation Form
        </h2>

        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-md bg-gray-800 text-white" />
        <input type="tel" name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleChange} className="w-full p-3 rounded-md bg-gray-800 text-white" />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-md bg-gray-800 text-white" />

        <div className="grid md:grid-cols-2 gap-4">
          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-3 rounded-md bg-gray-800 text-white" min={new Date().toISOString().split("T")[0]} />

          <div className="grid grid-cols-2 gap-2">
            <select name="startTime" value={formData.startTime} onChange={(e) => { handleChange(e); setFormData((prev) => ({ ...prev, endTime: "" })); }} className="w-full p-3 rounded-md bg-gray-800 text-white">
              <option value="">Start Time</option>
              {timeSlots.filter((time) => time !== "01:00").map((time) => (
                <option key={time} value={time}>{formatTimeAMPM(time)}</option>
              ))}
            </select>

            <select name="endTime" value={formData.endTime} onChange={handleChange} disabled={!formData.startTime} className="w-full p-3 rounded-md bg-gray-800 text-white">
              <option value="">End Time</option>
              {getAllowedEndTimes(formData.startTime).map((time) => (
                <option key={time} value={time}>{formatTimeAMPM(time)}</option>
              ))}
            </select>
          </div>
        </div>

        <select name="guests" value={formData.guests} onChange={handleChange} className="w-full p-3 rounded-md bg-gray-800 text-white">
          {[...Array(15).keys()].map((n) => (
            <option key={n + 1} value={n + 1}>{n + 1} Guest{n > 0 ? "s" : ""}</option>
          ))}
        </select>

        <select name="table_id" value={formData.table_id} onChange={handleChange} className="w-full p-3 rounded-md bg-gray-800 text-white" disabled={!formData.date || !formData.startTime || !formData.endTime || availableTables.length === 0}>
          {!formData.date || !formData.startTime || !formData.endTime ? (
            <option value="">Select date & time first</option>
          ) : availableTables.length === 0 ? (
            <option value="">No available tables</option>
          ) : (
            <>
              <option value="">-- Select a Table --</option>
              {availableTables.filter((table) => {
                const guests = parseInt(formData.guests);
                if (guests <= 2) return table.capacity === 2;
                if (guests <= 4) return table.capacity === 4;
                if (guests <= 6) return table.capacity === 6;
                if (guests <= 10) return table.capacity === 10;
                if (guests <= 15) return table.capacity === 15;
                return false;
              }).map((table) => (
                <option key={table.table_id} value={table.table_id}>
                  Table {table.table_id} – {table.type} (Seats {table.capacity})
                </option>
              ))}
            </>
          )}
        </select>

        <textarea name="requests" rows="3" placeholder="Special Requests (optional)" value={formData.requests} onChange={handleChange} className="w-full p-3 rounded-md bg-gray-800 text-white" />

        <div className="flex justify-center my-2">
          <div className="bg-gray-800 p-2 rounded-md">
            <ReCAPTCHA ref={recaptchaRef} sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} theme="dark" />
          </div>
        </div>

        <button type="submit" disabled={loading} className={`w-full bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full hover:bg-yellow-400 transition ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
          {loading ? "Submitting..." : "Submit Reservation"}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={4000} hideProgressBar />
    </>
  );
};

export default ReservationForm;
