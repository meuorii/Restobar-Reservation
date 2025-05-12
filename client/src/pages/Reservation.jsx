// src/pages/Reservation.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import ReservationHero from "../components/Reservation/ReservationHero";
import ReservationForm from "../components/Reservation/ReservationForm";
import TableStatus from "../components/Reservation/TableStatus";

const Reservation = () => {
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <ReservationHero />
      <div className="max-w-7xl mx-auto px-4 py-12">
  <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-stretch">
    {/* Reservation Form (left) */}
    <div className="w-full lg:w-1/2">
      <div className="h-full bg-gray-900 rounded-xl shadow-md p-6">
        <ReservationForm onDateChange={setSelectedDate} />
      </div>
    </div>

    {/* Table Status (right) */}
    <div className="w-full lg:w-1/2">
      <div className="h-full bg-[#111] rounded-xl shadow-md p-6">
        <TableStatus selectedDate={selectedDate} />
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default Reservation;
