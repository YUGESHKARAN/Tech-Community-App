import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";
import logoicon from "../assets/embed_logo_1.png"



function RegisterPage() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateForm = () => {
    const errs = {};
    if (!formData.username) errs.username = "Username is required";
    if (!formData.email) errs.email = "Email is required";
    if (!formData.password) errs.password = "Password is required";
    return errs;
  };

  // ── Step 1: Submit form → send OTP ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (confirmPassword !== formData.password) {
      setErrors({ password: "Passwords do not match" });
      return;
    }
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
       const response = await axiosInstance.post('/blog/author/verify-otp', {
        authorname: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setShowOTPModal(true);
      setResendCooldown(30); // 30s before they can resend
    } catch (error) {
      console.log("register error", error.message)
      setErrors({ apiError: error.response?.data?.message || "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP → create account ─────────────────────────────────────
  const handleOTPVerify = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const response = await axiosInstance.post("/blog/author", {
        authorname: formData.username,
        email: formData.email,
        password: formData.password,
        otp,
      });
      if (response.status === 201) {
        setSuccess("Registration successful!");
        localStorage.setItem("username", formData.username);
        localStorage.setItem("email", formData.email);
        navigate("/home");
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || "Verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    try {
      await axiosInstance.post("/blog/author/verify-otp", {
        authorname: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setResendCooldown(30);
      setOtpError("");
    } catch (error) {
      setOtpError("Failed to resend OTP");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8">

        {/* ── OTP Modal ── */}
        {showOTPModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
              <h3 className="text-white font-bold text-lg text-center mb-1">Check Your Email</h3>
              <p className="text-green-400 text-sm text-center ">
                6-digit OTP sent to <br /> <span className="text-gray-400 text-xs">{formData.email}</span>
              </p>

               {otpError && (
                <p className=" text-red-500 my-3 text-center">
                  {otpError}
                </p>
              )}
              <div className="space-y-2 mt-4 md:mt-7">
                 {/* OTP input */}
              <input
                type="password"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-2.5 mb-2 md:mb-4 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
              />

             

              <button
                onClick={handleOTPVerify}
                disabled={otpLoading}
                className="w-full p-1.5 md:py-2.5 mb-4 bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-lg"
              >
                {otpLoading ? "Verifying..." : "Verify & Register"}
              </button>

              <div className="flex justify-between items-center text-sm">
                <button
                  onClick={() => { setShowOTPModal(false); setOtp(""); setOtpError(""); }}
                  className="text-gray-400 hover:text-white transition"
                >
                  ← Go back
                </button>
                <button
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0}
                  className={`transition ${resendCooldown > 0 ? "text-gray-600 cursor-not-allowed" : "text-green-500 hover:underline"}`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>

              </div>

             
            </div>
          </div>
        )}

        {/* ── Register Form ── */}
        <div className="text-center relative mb-6">
           <img src={logoicon} className="md:w-12 md:h-12 w-9 h-9 object-cover bg-white rounded-full absolute top-1 left-0" alt="" />
          <h2 className="md:text-2xl text-xl font-bold text-white tracking-wide">Register</h2>
          <p className="md:text-sm text-xs text-gray-400 ">Create your account to get started</p>
        </div>

        <form className="w-full space-y-6 md:space-y-6" onSubmit={handleSubmit}>
          {success && <p className="text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-md">{success}</p>}
          {errors.apiError && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">{errors.apiError}</p>}

          <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">User Name</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange}
              placeholder="Enter Name" required
              className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="University Email" required
              className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="••••••••" required
              className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
          </div>
                    </div>

          <button type="submit" disabled={loading}
            className="w-full py-1.5 md:py-2.5 bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-lg">
            {loading ? "Sending OTP..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-[13px] md:text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-green-500 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;