import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import ReCAPTCHA from "react-google-recaptcha";
import emailjs from "@emailjs/browser";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const generate2FACode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recaptchaToken = recaptchaRef.current.getValue();
      if (!recaptchaToken) {
        toast.error("Please complete the reCAPTCHA.");
        setLoading(false);
        return;
      }

      // ✅ Step 1: Firebase Auth Login
      await signInWithEmailAndPassword(auth, formData.email, formData.password);

      // ✅ Step 2: Firestore Admin Check (after auth)
      const adminDocRef = doc(db, "admins", formData.email);
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists()) {
        toast.error("Unauthorized email. Access denied.");
        setLoading(false);
        recaptchaRef.current.reset();
        return;
      }

      // ✅ Step 3: 2FA Code Generation & Email
      const adminName = formData.email.split("@")[0];
      const code = generate2FACode();

      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY_ADMIN_VERIFICATION;
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID_ADMIN_VERIFICATION;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ADMIN_VERIFICATION;

      if (!publicKey || !serviceId || !templateId) {
        toast.error("EmailJS config is missing in .env. Please check your keys.");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_2fa_code", code);
      localStorage.setItem("admin_email", formData.email);

      await emailjs.send(
        serviceId,
        templateId,
        {
          admin_name: adminName,
          code: code,
          to_email: formData.email,
        },
        publicKey
      );

      toast.success("2FA code sent to your email.");
      navigate("/admin/verify-code");

    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
      recaptchaRef.current.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full space-y-4"
      >
        <h2 className="text-2xl font-bold text-yellow-400 text-center">Admin Login</h2>

        <input
          type="email"
          name="email"
          required
          placeholder="Admin Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-gray-700 text-white"
        />

        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-gray-700 text-white"
        />

        <div className="flex justify-center bg-gray-700 rounded-md p-2">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            theme="dark"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2 rounded-full transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default AdminLogin;
