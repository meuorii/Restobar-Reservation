import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const storedCode = localStorage.getItem("admin_2fa_code");

    if (code === storedCode) {
      toast.success("2FA verified! Logging you in...");
      setTimeout(() => {
        localStorage.setItem("admin_authenticated", "true");
        navigate("/admin/dashboard");
      }, 1500);
    } else {
      toast.error("Invalid code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full space-y-4"
      >
        <h2 className="text-2xl font-bold text-yellow-400 text-center">2FA Verification</h2>

        <p className="text-gray-300 text-sm text-center">
          Enter the 6-digit code sent to your admin email.
        </p>

        <input
          type="text"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="w-full p-3 rounded-md bg-gray-700 text-white text-center text-lg tracking-widest"
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded-full transition"
        >
          Verify Code
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default VerifyCode;
