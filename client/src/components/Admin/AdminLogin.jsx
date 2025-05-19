import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import ReCAPTCHA from "react-google-recaptcha";
import emailjs from "@emailjs/browser";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generate2FACode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recaptchaToken = recaptchaRef.current.getValue();
      if (!recaptchaToken) {
        toast.error("⚠️ Please complete the reCAPTCHA.");
        setLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const adminRef = doc(db, "admins", user.email);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        toast.error("🚫 Access denied. This account is not an admin.");
        setLoading(false);
        recaptchaRef.current.reset();
        return;
      }

      const code = generate2FACode();
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY_ADMIN_VERIFICATION;
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID_ADMIN_VERIFICATION;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ADMIN_VERIFICATION;

      if (!publicKey || !serviceId || !templateId) {
        toast.error("⚠️ EmailJS configuration is missing.");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_2fa_code", code);
      localStorage.setItem("admin_email", user.email);

      await emailjs.send(serviceId, templateId, {
        admin_name: user.email.split("@")[0],
        code,
        to_email: user.email,
      }, publicKey);

      toast.success("✅ 2FA code sent to your email.");
      navigate("/admin/verify-code");

    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
      recaptchaRef.current.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full space-y-5 border border-gray-700"
      >
        <h2 className="text-3xl font-bold text-yellow-400 text-center mb-2">Admin Login</h2>

        <input
          type="email"
          name="email"
          required
          placeholder="Admin Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400"
            title={showPassword ? "Hide Password" : "Show Password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

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
          className={`w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-3 rounded-full transition duration-200 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={4000} hideProgressBar />
    </div>
  );
};

export default AdminLogin;
