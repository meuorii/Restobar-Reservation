import { useEffect, useState } from "react";
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
import { ToastContainer } from "react-toastify";
import { sendConfirmationEmail } from "../utils/sendConfirmationEmail";
import "react-toastify/dist/ReactToastify.css";

// React Icons
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaBan } from "react-icons/fa";

// Format date to "Month Day, Year"
const formatDatePretty = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format 24h to 12h AM/PM
const formatTimeAMPM = (time24) => {
  if (!time24) return "-";
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
};

const ConfirmReservation = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const confirmReservation = async (code) => {
    try {
      const ref = query(
        collection(db, "reservations"),
        where("code", "==", code)
      );
      const snapshot = await getDocs(ref);

      if (snapshot.empty) {
        setStatus("invalid");
        setMessage("Invalid or expired confirmation link.");
        return;
      }

      const resDoc = snapshot.docs[0];
      const resRef = doc(db, "reservations", resDoc.id);
      const data = resDoc.data();

      if (data.status === "confirmed") {
        setStatus("already");
        setMessage("Reservation already confirmed.");
      } else if (data.status === "cancelled") {
        setStatus("error");
        setMessage("Reservation was already cancelled.");
      } else if (data.status === "done") {
        setStatus("error");
        setMessage("Reservation has already passed.");
      } else {
        await updateDoc(resRef, {
          status: "confirmed",
          confirmed_at: new Date(),
        });

        if (data.email) {
          const formattedData = {
            to_name: data.name || "Customer",
            to_email: data.email,
            date: formatDatePretty(data.date),
            start_time: formatTimeAMPM(data.startTime),
            end_time: formatTimeAMPM(data.endTime),
            table_id: data.table_id || "N/A",
          };

          console.log("📤 Email data:", formattedData);
          await sendConfirmationEmail(formattedData);
        }

        setStatus("success");
        setMessage("Reservation confirmed! Email sent.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      confirmReservation(code);
    } else {
      setStatus("invalid");
      setMessage("Missing or invalid confirmation code.");
      setLoading(false);
    }
  }, [searchParams]);

  const statusDetails = {
    success: {
      color: "text-green-400",
      icon: <FaCheckCircle className="text-5xl mb-4" />,
    },
    error: {
      color: "text-red-400",
      icon: <FaTimesCircle className="text-5xl mb-4" />,
    },
    already: {
      color: "text-yellow-400",
      icon: <FaExclamationTriangle className="text-5xl mb-4" />,
    },
    invalid: {
      color: "text-red-500",
      icon: <FaBan className="text-5xl mb-4" />,
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6 py-12">
      <div className="bg-gray-900 p-10 rounded-2xl shadow-2xl w-full max-w-lg text-center border border-gray-800 transition-all duration-300">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-wide">
          Confirm Reservation
        </h1>

        {loading ? (
          <p className="text-gray-300 animate-pulse text-base">Checking reservation...</p>
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

      <ToastContainer />
    </div>
  );
};

export default ConfirmReservation;
