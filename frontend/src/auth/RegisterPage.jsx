// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import NavBar from "../ui/NavBar";
// import Footer from "../ui/Footer";
// import { motion } from 'framer-motion';
// import axiosInstance from "../instances/Axiosinstances";
// import logoicon from "../assets/embed_logo_1.png"



// function RegisterPage() {
//   const [formData, setFormData] = useState({ username: "", email: "", password: "" });
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   // OTP state
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [otpLoading, setOtpLoading] = useState(false);
//   const [otpError, setOtpError] = useState("");
//   const [resendCooldown, setResendCooldown] = useState(0);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const otpInputsRef = useRef([]);

//   const navigate = useNavigate();

//   // Countdown timer for resend
//   useEffect(() => {
//     if (resendCooldown === 0) return;
//     const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
//     return () => clearTimeout(timer);
//   }, [resendCooldown]);

//   const validateForm = () => {
//     const errs = {};
//     if (!formData.username) errs.username = "Username is required";
//     if (!formData.email) errs.email = "Email is required";
//     if (!formData.password) errs.password = "Password is required";
//     return errs;
//   };

//   // ── Step 1: Submit form → send OTP ──────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationErrors = validateForm();
//     setErrors(validationErrors);

//     if (confirmPassword !== formData.password) {
//       setErrors({ password: "Passwords do not match" });
//       return;
//     }
//     if (Object.keys(validationErrors).length > 0) return;

//     setLoading(true);
//     try {
//        const response = await axiosInstance.post('/blog/author/verify-otp', {
//         authorname: formData.username,
//         email: formData.email,
//         password: formData.password,
//       });
//       setShowOTPModal(true);
//       setResendCooldown(30); // 30s before they can resend
//     } catch (error) {
//       console.log("register error", error.message)
//       setErrors({ apiError: error.response?.data?.message || "Failed to send OTP" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Step 2: Verify OTP → create account ─────────────────────────────────────
//   const handleOTPVerify = async () => {
//     if (!otp || otp.length !== 6) {
//       setOtpError("Please enter the 6-digit OTP");
//       return;
//     }
//     setOtpLoading(true);
//     setOtpError("");
//     try {
//       const response = await axiosInstance.post("/blog/author", {
//         authorname: formData.username,
//         email: formData.email,
//         password: formData.password,
//         otp,
//       });
//       if (response.status === 201) {
//         setSuccess("Registration successful!");
//         localStorage.setItem("username", formData.username);
//         localStorage.setItem("email", formData.email);
//         navigate("/home");
//       }
//     } catch (error) {
//       setOtpError(error.response?.data?.message || "Verification failed");
//     } finally {
//       setOtpLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (resendCooldown > 0) return;
//     try {
//       await axiosInstance.post("/blog/author/verify-otp", {
//         authorname: formData.username,
//         email: formData.email,
//         password: formData.password,
//       });
//       setResendCooldown(30);
//       setOtpError("");
//     } catch (error) {
//       setOtpError("Failed to resend OTP");
//     }
//   };

//   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

//   const focusOtpInput = (index) => {
//     otpInputsRef.current[index]?.focus();
//   };

//   const handleOtpChange = (e, index) => {
//     const digit = e.target.value.replace(/\D/g, "").slice(0, 1);
//     if (!digit && e.target.value === "") {
//       const otpArray = otp.split("").slice(0, 6);
//       otpArray[index] = "";
//       setOtp(otpArray.join(""));
//       return;
//     }
//     const otpArray = otp.split("");
//     while (otpArray.length < 6) otpArray.push("");
//     otpArray[index] = digit;
//     const nextOtp = otpArray.join("");
//     setOtp(nextOtp);
//     if (digit && index < 5) {
//       focusOtpInput(index + 1);
//     }
//   };

//   const handleOtpKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
//       focusOtpInput(index - 1);
//     }
//   };

//   const handleOtpPaste = (e) => {
//     e.preventDefault();
//     const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
//     if (!paste) return;
//     setOtp(paste.padEnd(6, "").slice(0, 6));
//     const nextIndex = Math.min(paste.length, 5);
//     focusOtpInput(nextIndex);
//   };

//   return (

//     // <div className="min-h-screen h-screen w-screen bg-gradient-to-r from-[#071820] via-[#081f31] to-[#0d325a] flex items-center justify-center px-4 py-8">
     
//     // </div>
//      <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.55, ease: "easeOut" }}
//         className={`relative w-full  min-h-screen overflow-hidden  border border-white/10 bg-[#070a16] shadow-[0_45px_120px_-60px_rgba(0,0,0,0.8)]`}
//       >
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.18),_transparent_24%)] pointer-events-none" />

//         {/* OTP Modal (keeps original behavior) */}
//         {showOTPModal && (
//           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.98 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.32, ease: 'easeOut' }}
//               className="w-full max-w-md"
//             >
//               <div className="bg-gray-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
//                 <div className="flex flex-col items-center text-center">
//                   <h3 className="text-white font-semibold text-lg md:text-xl mb-1">Check your email</h3>
//                   <p className="text-slate-300 text-sm">6‑digit OTP sent to</p>
//                   <p className="text-slate-400 text-xs mt-1 truncate">{formData.email}</p>
//                 </div>

//                 {otpError && (
//                   <p className="text-red-400 my-3 text-center text-sm">{otpError}</p>
//                 )}

//                 <div className="mt-5 flex flex-col items-center gap-4">
//                   <div className="grid grid-cols-6 gap-3 w-full">
//                     {Array.from({ length: 6 }).map((_, index) => (
//                       <input
//                         key={index}
//                         ref={(el) => (otpInputsRef.current[index] = el)}
//                         type="text"
//                         inputMode="numeric"
//                         pattern="[0-9]*"
//                         maxLength={1}
//                         value={otp[index] || ""}
//                         onChange={(e) => handleOtpChange(e, index)}
//                         onKeyDown={(e) => handleOtpKeyDown(e, index)}
//                         onPaste={handleOtpPaste}
//                         className="mx-auto w-12 h-12 md:w-14 md:h-14 text-center text-lg font-semibold bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
//                       />
//                     ))}
//                   </div>

//                   <button
//                     onClick={handleOTPVerify}
//                     disabled={otpLoading}
//                     className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-70"
//                   >
//                     {otpLoading ? "Verifying..." : "Verify & Register"}
//                   </button>

//                   <div className="flex justify-between items-center w-full text-sm text-slate-300">
//                     <button
//                       onClick={() => { setShowOTPModal(false); setOtp(""); setOtpError(""); }}
//                       className="text-slate-400 hover:text-slate-200 transition-all duration-200"
//                     >
//                       ← Go back
//                     </button>
//                     <button
//                       onClick={handleResendOTP}
//                       disabled={resendCooldown > 0}
//                       className={`transition-all duration-200 ${resendCooldown > 0 ? "text-gray-600 cursor-not-allowed" : "text-emerald-400 hover:underline"}`}
//                     >
//                       {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}

//         <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

//            <div className="relative hidden lg:flex flex-col justify-center gap-8 bg-gradient-to-br from-[#091520] via-[#0a3560] to-[#0e69a2] p-10 lg:p-12">
//                       <div>
                       
//                         <p className="mt-8 text-sm flex items-center gap-3 uppercase tracking-[0.36em] text-slate-400">  <img src={logoicon} alt="Bytes Base" className="h-12 w-12 rounded-2xl bg-white/10 p-2 shadow-lg shadow-black/20" /> Bytes Base access</p>
//                         <h1 className="mt-4 text-4xl font-semibold leading-tight text-white"> One Place to Connect <span className="bg-gradient-to-r from-green-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg truncate  tracking-tight"> Developer minds.</span></h1>
//                         <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                         
//                           Secure workspace sign in
//                         </p>
//                       </div>
          
                  
//                     </div>
       
          

//           <div className="relative h-fit mt-10 md:mt-0 md:h-full flex flex-col justify-center px-8  sm:px-12  s lg:px-14 py-7">
//             <div className="relative z-10 mx-auto w-full max-w-md">
//               <div className="mb-8 block lg:flex space-y-6 items-center justify-between gap-4">
//                  <p className="md:mt-8 text-xs md:text-sm lg:hidden flex items-center  gap-3 uppercase tracking-[0.36em] text-slate-400">  <img src={logoicon} alt="Bytes Base" className="h-12 w-12 rounded-2xl bg-white/10 p-2 shadow-lg shadow-black/20" /> Bytes Base access</p>
//                 <div>
//                   <p className="mt-3 md:text-3xl text-2xl font-semibold text-white">Register</p>
//                   <h2 className="md:text-sm text-xs font-semibold mt-2 uppercase tracking-[0.3em] text-emerald-400/90">Author Portal</h2>
//                 </div>
//               </div>



//               <form className="space-y-6" onSubmit={handleSubmit}>
//                 {success && <p className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-base text-emerald-200">{success}</p>}
//                 {errors.apiError && <p className="rounded-[28px] border border-red-500/20 bg-red-500/10 px-5 py-3 text-base text-red-200">{errors.apiError}</p>}

//                 <div className="space-y-2 md:space-y-4">
//                   <label className="text-sm font-medium text-slate-300">User Name</label>
//                   <input type="text" name="username" value={formData.username} onChange={handleChange}
//                     placeholder="Enter Name" required
//                     className="w-full rounded-3xl border border-white/20  bg-slate-950/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20" />
//                   {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
//                 </div>

//                 <div className="space-y-2 md:space-y-4">
//                   <label className="text-sm font-medium text-slate-300">Email Address</label>
//                   <input type="email" name="email" value={formData.email} onChange={handleChange}
//                     placeholder="University Email" required
//                     className="w-full rounded-3xl border border-white/20  bg-slate-950/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20" />
//                   {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
//                 </div>

//                 <div className="space-y-2 md:space-y-4">
//                   <div className="flex items-center justify-between">
//                     <label className="text-sm font-medium text-slate-300">Password</label>
//                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[10px] md:text-xs font-semibold text-emerald-500 md:text-emerald-300 text-emerald-300 md:hover:text-emerald-200">{showPassword ? 'Hide' : 'Show'}</button>
//                   </div>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Enter secure password"
//                     required
//                     className="w-full rounded-3xl border border-white/20  bg-slate-950/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
//                   />
//                   {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
//                 </div>

//                 <div className="space-y-2 md:space-y-4">
//                   <div className="flex items-center justify-between">
//                     <label className="text-sm font-medium text-slate-300">Confirm Password</label>
//                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-[10px] md:text-xs font-semibold text-emerald-300 text-emerald-500 md:text-emerald-300 md:hover:text-emerald-200">{showConfirmPassword ? 'Hide' : 'Show'}</button>
//                   </div>
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     placeholder="Confirm secure password"
//                     required
//                     className="w-full rounded-3xl border border-white/20  bg-slate-950/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
//                   />
//                 </div>

//                 <button type="submit" disabled={loading}
//                   className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
//                   {loading ? "Sending OTP..." : "Register"}
//                 </button>
//               </form>

//               <p className="mt-6 text-sm text-slate-400 pb-2 text-center">
//                 Already have an account?{' '}
//                 <Link to="/" className="text-emerald-400 hover:text-emerald-200">Login here</Link>
//               </p>
//                <p className="text-xs text-center text-slate-400">
//                        To know more checkout{" "}
//                         <a href="https://www.bytesbase.me/"
//                         className="text-emerald-400 hover:text-emerald-200"
//                         >
//                           BytesBase.me
//                         </a>
                       
//                       </p>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//   );
// }

// export default RegisterPage;

// //  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
// //       <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8">

// //         {/* ── OTP Modal ── */}
// //         {showOTPModal && (
// //           <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
// //             <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
// //               <h3 className="text-white font-bold text-lg text-center mb-1">Check Your Email</h3>
// //               <p className="text-green-400 text-sm text-center ">
// //                 6-digit OTP sent to <br /> <span className="text-gray-400 text-xs">{formData.email}</span>
// //               </p>

// //                {otpError && (
// //                 <p className=" text-red-500 my-3 text-center">
// //                   {otpError}
// //                 </p>
// //               )}
// //               <div className="space-y-2 mt-4 md:mt-7">
// //                  {/* OTP input */}
// //               <input
// //                 type="password"
// //                 maxLength={6}
// //                 value={otp}
// //                 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
// //                 placeholder="Enter 6-digit OTP"
// //                 className="w-full px-4 py-2.5 mb-2 md:mb-4 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
// //               />

             

// //               <button
// //                 onClick={handleOTPVerify}
// //                 disabled={otpLoading}
// //                 className="w-full p-1.5 md:py-2.5 mb-4 bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-lg"
// //               >
// //                 {otpLoading ? "Verifying..." : "Verify & Register"}
// //               </button>

// //               <div className="flex justify-between items-center text-sm">
// //                 <button
// //                   onClick={() => { setShowOTPModal(false); setOtp(""); setOtpError(""); }}
// //                   className="text-gray-400 hover:text-white transition"
// //                 >
// //                   ← Go back
// //                 </button>
// //                 <button
// //                   onClick={handleResendOTP}
// //                   disabled={resendCooldown > 0}
// //                   className={`transition ${resendCooldown > 0 ? "text-gray-600 cursor-not-allowed" : "text-green-500 hover:underline"}`}
// //                 >
// //                   {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
// //                 </button>
// //               </div>

// //               </div>

             
// //             </div>
// //           </div>
// //         )}

// //         {/* ── Register Form ── */}
// //         <div className="text-center relative mb-6">
// //            <img src={logoicon} className="md:w-12 md:h-12 w-9 h-9 object-cover bg-white rounded-full absolute top-1 left-0" alt="" />
// //           <h2 className="md:text-2xl text-xl font-bold text-white tracking-wide">Register</h2>
// //           <p className="md:text-sm text-xs text-gray-400 ">Create your account to get started</p>
// //         </div>

// //         <form className="w-full space-y-6 md:space-y-6" onSubmit={handleSubmit}>
// //           {success && <p className="text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-md">{success}</p>}
// //           {errors.apiError && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">{errors.apiError}</p>}

// //           <div className="space-y-3 md:space-y-4">
// //           <div>
// //             <label className="block text-sm font-medium text-gray-300 mb-1">User Name</label>
// //             <input type="text" name="username" value={formData.username} onChange={handleChange}
// //               placeholder="Enter Name" required
// //               className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
// //             {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
// //           </div>


// //           <div>
// //             <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
// //             <input type="email" name="email" value={formData.email} onChange={handleChange}
// //               placeholder="University Email" required
// //               className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
// //             {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
// //           </div>

// //           <div>
// //             <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
// //             <input type="password" name="password" value={formData.password} onChange={handleChange}
// //               placeholder="••••••••" required
// //               className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
// //             {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
// //           </div>

// //           <div>
// //             <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
// //             <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
// //               placeholder="••••••••" required
// //               className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500" />
// //           </div>
// //                     </div>

// //           <button type="submit" disabled={loading}
// //             className="w-full py-1.5 md:py-2.5 bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-lg">
// //             {loading ? "Sending OTP..." : "Register"}
// //           </button>
// //         </form>

// //         <p className="mt-6 text-[13px] md:text-sm text-gray-400 text-center">
// //           Already have an account?{" "}
// //           <Link to="/" className="text-green-500 hover:underline">Login here</Link>
// //         </p>
// //       </div>
// //     </div>

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import { MotionConfig, motion } from "framer-motion";
import axiosInstance from "../instances/Axiosinstances";
import logoicon from "../assets/embed_logo_1.png";

/* -------------------------------------------------------------------------- */
/*  Shared class strings (dark only — same tokens as LoginPage)                */
/* -------------------------------------------------------------------------- */
// The autofill overrides stop Chrome/Edge from painting saved-credential
// fields pale blue/white, which is what breaks dark forms.
const inputBase =
  "block h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] text-sm text-slate-100 caret-emerald-400 placeholder:text-slate-500 outline-none transition [color-scheme:dark] hover:border-white/20 focus:border-emerald-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/15 aria-[invalid=true]:border-red-400/60 [&:-webkit-autofill]:[-webkit-text-fill-color:#f1f5f9] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#101623_inset] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

const otpInput =
  "mx-auto h-12 w-full max-w-[3.5rem] min-w-0 rounded-lg border border-white/10 bg-white/[0.04] text-center text-lg font-semibold text-white caret-emerald-400 outline-none transition [color-scheme:dark] hover:border-white/20 focus:border-emerald-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/15 md:h-14";

const primaryBtn =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(52,211,153,0.35),0_10px_28px_-10px_rgba(16,185,129,0.65)] transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60";

const linkCls =
  "rounded font-normal text-emerald-400 underline-offset-4 transition hover:text-emerald-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40";

const labelCls = "text-sm font-medium text-slate-300";
const fieldErrorCls = "mt-1.5 text-sm text-red-400";

/* -------------------------------------------------------------------------- */
/*  Icons (inline, no extra dependency)                                        */
/* -------------------------------------------------------------------------- */
const Svg = ({ children, className = "h-4 w-4", ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
  </Svg>
);
const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);
const LockIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Svg>
);
const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
const EyeOffIcon = (p) => (
  <Svg {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Svg>
);
const ShieldCheckIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);
const UsersIcon = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14c2 .6 3 2.3 3 5" />
  </Svg>
);
const BuildingIcon = (p) => (
  <Svg {...p}>
    <path d="M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3" />
  </Svg>
);
const AlertIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.01" />
  </Svg>
);
const CheckCircleIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </Svg>
);
const Spinner = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={`${className} animate-spin`} aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Presentational pieces                                                      */
/* -------------------------------------------------------------------------- */
const TRUST_ITEMS = [
  {
    icon: ShieldCheckIcon,
    title: "Encrypted connections",
    body: "Credentials and sessions travel over HTTPS only.",
  },
  {
    icon: UsersIcon,
    title: "Role based access",
    body: "You only see what your role and workspace allow.",
  },
  {
    icon: BuildingIcon,
    title: "Audit logged activity",
    body: "Administrative actions are recorded and reviewable.",
  },
];

function BrandLockup({ logo }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logo}
        alt=""
        className="h-10 w-10 rounded-xl bg-white/10 p-1.5 ring-1 ring-white/10"
      />
      <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400 md:text-sm">
        Bytes Base Access
      </span>
    </div>
  );
}

function Alert({ tone, children }) {
  const isError = tone === "error";
  const styles = isError
    ? "border-red-500/25 bg-red-500/10 text-red-200"
    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  return (
    <motion.div
      role={isError ? "alert" : "status"}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${styles}`}
    >
      {isError ? (
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </motion.div>
  );
}

/** Password input with leading lock icon and an in-field show/hide toggle. */
function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  error,
}) {
  return (
    <div>
      <label htmlFor={id} className={`${labelCls} mb-1.5 block`}>
        {label}
      </label>
      <div className="relative">
        <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type={visible ? "text" : "password"}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          placeholder={placeholder}
          required
          aria-invalid={error ? "true" : undefined}
          className={`${inputBase} pl-10 pr-11`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className={fieldErrorCls}>{error}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Register page                                                              */
/* -------------------------------------------------------------------------- */
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const otpInputsRef = useRef([]);

  const navigate = useNavigate();

  /* ---- EXISTING logic (unchanged) --------------------------------------- */

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
      const response = await axiosInstance.post("/blog/author/verify-otp", {
        authorname: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setShowOTPModal(true);
      setResendCooldown(30); // 30s before they can resend
    } catch (error) {
      console.log("register error", error.message);
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

  const focusOtpInput = (index) => {
    otpInputsRef.current[index]?.focus();
  };

  const handleOtpChange = (e, index) => {
    const digit = e.target.value.replace(/\D/g, "").slice(0, 1);
    if (!digit && e.target.value === "") {
      const otpArray = otp.split("").slice(0, 6);
      otpArray[index] = "";
      setOtp(otpArray.join(""));
      return;
    }
    const otpArray = otp.split("");
    while (otpArray.length < 6) otpArray.push("");
    otpArray[index] = digit;
    const nextOtp = otpArray.join("");
    setOtp(nextOtp);
    if (digit && index < 5) {
      focusOtpInput(index + 1);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      focusOtpInput(index - 1);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    setOtp(paste.padEnd(6, "").slice(0, 6));
    const nextIndex = Math.min(paste.length, 5);
    focusOtpInput(nextIndex);
  };

  /* ---- UI (dark only, matches LoginPage) -------------------------------- */
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative min-h-screen w-full bg-[#080b14] text-slate-100 [color-scheme:dark]"
      >
        {/* ------------------------------ OTP modal ------------------------------ */}
        {showOTPModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080b14]/80 px-4 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="otp-title"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="w-full max-w-md"
            >
              <div className="rounded-2xl border border-white/10 bg-[#0f1625] p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20">
                    <MailIcon className="h-5 w-5" />
                  </span>
                  <h3 id="otp-title" className="text-lg font-semibold text-white md:text-xl">
                    Check your email
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">We sent a 6-digit code to</p>
                  <p className="mt-0.5 max-w-full truncate text-sm font-medium text-slate-200">
                    {formData.email}
                  </p>
                </div>

                {otpError && (
                  <p role="alert" className="mt-4 text-center text-sm text-red-400">
                    {otpError}
                  </p>
                )}

                <div className="mt-6 flex flex-col items-center gap-5">
                  <div className="grid w-full grid-cols-6 gap-2 sm:gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputsRef.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        autoFocus={index === 0}
                        aria-label={`Digit ${index + 1} of 6`}
                        value={otp[index] || ""}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        onPaste={handleOtpPaste}
                        className={otpInput}
                      />
                    ))}
                  </div>

                  <button onClick={handleOTPVerify} disabled={otpLoading} className={primaryBtn}>
                    {otpLoading && <Spinner />}
                    {otpLoading ? "Verifying…" : "Verify & Register"}
                  </button>

                  <div className="flex w-full items-center justify-between text-sm">
                    <button
                      onClick={() => {
                        setShowOTPModal(false);
                        setOtp("");
                        setOtpError("");
                      }}
                      className="rounded text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                    >
                      ← Go back
                    </button>
                    <button
                      onClick={handleResendOTP}
                      disabled={resendCooldown > 0}
                      className={`${linkCls} ${
                        resendCooldown > 0
                          ? "cursor-not-allowed !text-slate-500 hover:!no-underline"
                          : ""
                      }`}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid min-h-screen grid-cols-1 overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(30,197,94,0.30),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.14),_transparent_30%)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* ------------------------ Left: brand + trust ------------------------ */}
          <aside className="relative hidden flex-col justify-center overflow-hidden border-r border-white/[0.08] bg-[#0f1625] p-12 lg:flex">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(640px circle at 15% 0%, rgba(16,185,129,0.14), transparent 60%)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 text-emerald-500/[0.2]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, black 15%, transparent 72%)",
                maskImage: "radial-gradient(ellipse at 70% 40%, black 15%, transparent 72%)",
              }}
            />

            <div className="relative">
              <BrandLockup logo={logoicon} />
            </div>

            <div className="relative">
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
                One Place to Connect{" "}
                <span className="truncate bg-gradient-to-r from-green-400 via-blue-400 to-pink-400 bg-clip-text tracking-tight text-transparent drop-shadow-lg">
                  Developer minds.
                </span>
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Create your author account with your university email.
              </p>
            </div>

            <ul className="relative mt-12 max-w-lg divide-y divide-white/[0.08] border-t border-white/[0.08]">
              {TRUST_ITEMS.map(({ icon: Icon, title: itemTitle, body }) => (
                <li key={itemTitle} className="flex items-start gap-3.5 py-4">
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-emerald-400 ring-1 ring-white/10">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{itemTitle}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* ----------------------------- Right: form ----------------------------- */}
          <main className="relative flex flex-col">
            <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
              <div className="w-full max-w-[400px]">
                <div className="mb-6 lg:hidden">
                  <BrandLockup logo={logoicon} />
                </div>

                <header>
                  <h2 className="text-2xl font-semibold tracking-tight text-white">Register</h2>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.26em] text-emerald-400">
                    Author portal
                  </p>
                </header>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  {success && <Alert tone="success">{success}</Alert>}
                  {errors.apiError && <Alert tone="error">{errors.apiError}</Alert>}

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className={`${labelCls} mb-1.5 block`}>
                      Username
                    </label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="name"
                        placeholder="Your full name"
                        required
                        aria-invalid={errors.username ? "true" : undefined}
                        className={`${inputBase} pl-10 pr-3.5`}
                      />
                    </div>
                    {errors.username && <p className={fieldErrorCls}>{errors.username}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className={`${labelCls} mb-1.5 block`}>
                      Email address
                    </label>
                    <div className="relative">
                      <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        placeholder="you@university.edu"
                        required
                        aria-invalid={errors.email ? "true" : undefined}
                        className={`${inputBase} pl-10 pr-3.5`}
                      />
                    </div>
                    {errors.email && <p className={fieldErrorCls}>{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <PasswordField
                    id="password"
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    visible={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                    error={errors.password}
                  />

                  {/* Confirm password */}
                  <PasswordField
                    id="confirmPassword"
                    label="Confirm password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  />

                  <button type="submit" disabled={loading} className={primaryBtn}>
                    {loading && <Spinner />}
                    {loading ? "Sending OTP…" : "Register"}
                  </button>
                </form>

                <div className="mt-8 border-t border-white/[0.08] pt-6 text-sm text-slate-400">
                  <p>
                    Already have an account?{" "}
                    <Link to="/" className={linkCls}>
                      Sign in
                    </Link>
                  </p>
                </div>

                <p className="md:mt-3.5 mt-2.5 text-xs text-slate-500">
                  Learn more at{" "}
                  <a
                    href="https://www.bytesbase.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkCls}
                  >
                    BytesBase.me
                  </a>
                </p>
              </div>
            </div>
          </main>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

export default RegisterPage;