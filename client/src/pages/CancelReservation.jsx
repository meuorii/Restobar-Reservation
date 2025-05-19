import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import { sendCancelEmail } from "../utils/sendCancelEmail";

// React Icons
import { FaBan, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

// Format date
const formatDatePretty = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format time
const formatTimeAMPM = (time24) => {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
};

const CancelReservation = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const hasRun = useRef(false); // ✅ Prevents duplicate runs

  const cancelReservation = async (code) => {
    try {
      const ref = query(collection(db, "reservations"), where("code", "==", code));
      const snapshot = await getDocs(ref);

      if (snapshot.empty) {
        setStatus("invalid");
        setMessage("Invalid or expired cancellation link.");
        return;
      }

      const resDoc = snapshot.docs[0];
      const resRef = doc(db, "reservations", resDoc.id);
      const data = resDoc.data();

      if (data.status === "cancelled") {
        setStatus("already");
        setMessage("Reservation already cancelled.");
      } else if (data.status === "done") {
        setStatus("error");
        setMessage("This reservation is already completed.");
      } else {
        await updateDoc(resRef, {
          status: "cancelled",
          cancelled_at: new Date(),
          cancelled_reason: "Cancelled by user via email",
        });

        if (data.email) {
          console.log("📧 Sending cancellation email to", data.email);
          await sendCancelEmail({
            to_name: data.name || "Customer",
            to_email: data.email,
            date: formatDatePretty(data.date),
            start_time: formatTimeAMPM(data.startTime),
            end_time: formatTimeAMPM(data.endTime),
            table_id: data.table_id || "N/A",
            guests: data.guests || "—",
          });
        }

        setStatus("cancelled");
        setMessage("❌ Reservation has been cancelled. A confirmation email has been sent.");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get("code");

    // ✅ Prevent double execution in Strict Mode
    if (!hasRun.current) {
      hasRun.current = true;

      if (code) {
        cancelReservation(code);
      } else {
        setStatus("invalid");
        setMessage("Missing or invalid cancellation code.");
        setLoading(false);
      }
    }
  }, [searchParams]);

  const statusDetails = {
    cancelled: {
      color: "text-red-400",
      icon: <FaBan className="text-5xl mb-4" />,
    },
    error: {
      color: "text-red-500",
      icon: <FaTimesCircle className="text-5xl mb-4" />,
    },
    already: {
      color: "text-yellow-400",
      icon: <FaInfoCircle className="text-5xl mb-4" />,
    },
    invalid: {
      color: "text-red-500",
      icon: <FaExclamationTriangle className="text-5xl mb-4" />,
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6 py-12">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-2xl w-full max-w-lg text-center border border-gray-800 transition-all duration-300">
        <h1 className="text-3xl font-bold text-red-400 mb-8 tracking-wide">
          Cancel Reservation
        </h1>

        {loading ? (
          <p className="text-gray-300 animate-pulse text-base">Processing cancellation...</p>
        ) : (
          <div className={`text-lg font-medium ${statusDetails[status]?.color || "text-white"}`}>
            <div className="flex justify-center">{statusDetails[status]?.icon}</div>
            <p>{message}</p>
          </div>
        )}

        <a
          href="/"
          className="inline-block mt-8 text-sm text-yellow-400 hover:text-yellow-300 transition"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
};

export default CancelReservation;
