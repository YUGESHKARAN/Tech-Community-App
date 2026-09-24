// import React,{useState, useRef} from 'react'
// import { useNavigate } from 'react-router-dom'
// import axiosInstance from '../instances/Axiosinstances';
// import logoicon from "../assets/embed_logo_1.png";

// function ChangePassword() {
//     const [errors, setErrors] = useState({});
//     const email = localStorage.getItem("emailForOtp");
//     const [loading, setLoading] = useState(false)
//       const [success, setSuccess] = useState("");
//       const navigate = useNavigate();
//      const [formData, setFormData] = useState({
//         email: email,
//         newPassword: "",
//         otp: "",
//       });
//       const [showPassword, setShowPassword] = useState(false);
//       const otpInputsRef = useRef([]);

//       const handleChange = (e) => {
//         setFormData({
//           ...formData,
//           [e.target.name]: e.target.value,
//         });
//       };

//       const focusOtpInput = (index) => {
//         otpInputsRef.current[index]?.focus();
//       };

//       const handleOtpChange = (e, index) => {
//         const digit = e.target.value.replace(/\D/g, "").slice(0, 1);
//         if (!digit && e.target.value === "") {
//           const otpArray = formData.otp.split("").slice(0, 6);
//           otpArray[index] = "";
//           setFormData({ ...formData, otp: otpArray.join("") });
//           return;
//         }
//         const otpArray = formData.otp.split("");
//         while (otpArray.length < 6) otpArray.push("");
//         otpArray[index] = digit;
//         const nextOtp = otpArray.join("");
//         setFormData({ ...formData, otp: nextOtp });
//         if (digit && index < 5) {
//           focusOtpInput(index + 1);
//         }
//       };

//       const handleOtpKeyDown = (e, index) => {
//         if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
//           focusOtpInput(index - 1);
//         }
//       };

//       const handleOtpPaste = (e) => {
//         e.preventDefault();
//         const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
//         if (!paste) return;
//         setFormData({ ...formData, otp: paste.padEnd(6, "").slice(0, 6) });
//         const nextIndex = Math.min(paste.length, 5);
//         focusOtpInput(nextIndex);
//       };

//       const handleSubmit = async (e) => {
//         e.preventDefault();
       
//         if(!formData.otp){
//           return setErrors({ apiError: "OTP is required" });
//         }

//         if(!formData.newPassword){
//           return setErrors({ apiError: "Password is required" });
//         }

//          setLoading(true)

//         try {
//           const response = await axiosInstance.post("/blog/author/reset-password", formData);
//           if (response.status === 200) {
//             setSuccess("Password updated successfully!");
//             localStorage.removeItem("emailForOtp");
//             setTimeout(() => {
//               navigate("/");
//             }, 2000);
//           }
//         } catch (error) {
//           setErrors({ apiError: error.response?.data?.message || "Password update failed" });
//         }
//         finally{
//           setLoading(false)
//         }
//       }

      
//   return (
//     <div className="min-h-screen md:bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-lg pt-0 md:pt-10 p-8 md:shadow-[0_32px_120px_-48px_rgba(14,165,233,0.8)] backdrop-blur-xl sm:p-10">
//         <div className="mx-auto w-full max-w-sm">
//           <div className="md:text-center space-y-4">
//              <p className="md:mt-8 text-xs md:text-sm flex md:justify-center items-center  gap-3 uppercase tracking-[0.36em] text-slate-400">  <img src={logoicon} alt="Bytes Base" className="h-12 w-12 rounded-2xl bg-white/10 p-2 shadow-lg shadow-black/20" /> Bytes Base access</p>
            
//             <h1 className="mt-3 md:text-3xl text-2xl font-semibold text-white">Change Password</h1>
//             <p className="md:text-sm text-xs font-semibold mt-2 uppercase tracking-[0.3em] text-emerald-400/90">Secure Reset</p>
//             <p className="mt-2 text-sm leading-6 text-slate-300">Enter the OTP sent to your email and choose a secure new password.</p>
//           </div>

//           <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
//             {success && <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div>}
//             {errors.apiError && <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{errors.apiError}</div>}

//             <div>
//               <label className="text-sm font-medium text-slate-300">Enter OTP</label>
//               <div className="mt-3 grid grid-cols-6 gap-3">
//                 {Array.from({ length: 6 }).map((_, index) => (
//                   <input
//                     key={index}
//                     ref={(el) => (otpInputsRef.current[index] = el)}
//                     type="text"
//                     inputMode="numeric"
//                     pattern="[0-9]*"
//                     maxLength={1}
//                     value={formData.otp[index] || ""}
//                     onChange={(e) => handleOtpChange(e, index)}
//                     onKeyDown={(e) => handleOtpKeyDown(e, index)}
//                     onPaste={handleOtpPaste}
//                     className="mx-auto md:h-12 md:w-12 w-10 h-10 rounded-lg md:rounded-xl border border-slate-700 bg-slate-900 text-center text-xl font-semibold text-white outline-none ring-1 ring-slate-700 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40"
//                   />
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="text-sm font-medium text-slate-300">New Password</label>
//               <div className="relative mt-2">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="newPassword"
//                   name="newPassword"
//                   value={formData.newPassword}
//                   onChange={handleChange}
//                   className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-3 md:py-4 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? (
//                     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                     </svg>
//                   ) : (
//                     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="flex w-full items-center justify-center rounded-[20px] bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
//             >
//               {loading ? 'Updating...' : 'Update Password'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ChangePassword



import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MotionConfig, motion } from "framer-motion";
import axiosInstance from "../instances/Axiosinstances";
import logoicon from "../assets/embed_logo_1.png";

/* -------------------------------------------------------------------------- */
/*  Shared class strings (dark only — same tokens as Login / Register)         */
/* -------------------------------------------------------------------------- */
// The autofill overrides stop Chrome/Edge from painting saved-credential
// fields pale blue/white, which is what breaks dark forms.
const inputBase =
  "block h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] text-sm text-slate-100 caret-emerald-400 placeholder:text-slate-500 outline-none transition [color-scheme:dark] hover:border-white/20 focus:border-emerald-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/15 [&:-webkit-autofill]:[-webkit-text-fill-color:#f1f5f9] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#101623_inset] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

const otpInput =
  "mx-auto h-12 w-full max-w-[3.5rem] min-w-0 rounded-lg border border-white/10 bg-white/[0.04] text-center text-lg font-semibold text-white caret-emerald-400 outline-none transition [color-scheme:dark] hover:border-white/20 focus:border-emerald-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/15 md:h-14";

const primaryBtn =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(52,211,153,0.35),0_10px_28px_-10px_rgba(16,185,129,0.65)] transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60";

const linkCls =
  "rounded font-normal text-emerald-400 underline-offset-4 transition hover:text-emerald-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40";

const labelCls = "text-sm font-medium text-slate-300";

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
  const styles = {
    error: "border-red-500/25 bg-red-500/10 text-red-200",
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-200",
  }[tone];
  const isSuccess = tone === "success";
  return (
    <motion.div
      role={isSuccess ? "status" : "alert"}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${styles}`}
    >
      {isSuccess ? (
        <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Change password page                                                       */
/* -------------------------------------------------------------------------- */
function ChangePassword() {
  const [errors, setErrors] = useState({});
  const email = sessionStorage.getItem("emailForOtp");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: email,
    newPassword: "",
    otp: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const otpInputsRef = useRef([]);

  /* ---- EXISTING logic (unchanged) --------------------------------------- */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const focusOtpInput = (index) => {
    otpInputsRef.current[index]?.focus();
  };

  const handleOtpChange = (e, index) => {
    const digit = e.target.value.replace(/\D/g, "").slice(0, 1);
    if (!digit && e.target.value === "") {
      const otpArray = formData.otp.split("").slice(0, 6);
      otpArray[index] = "";
      setFormData({ ...formData, otp: otpArray.join("") });
      return;
    }
    const otpArray = formData.otp.split("");
    while (otpArray.length < 6) otpArray.push("");
    otpArray[index] = digit;
    const nextOtp = otpArray.join("");
    setFormData({ ...formData, otp: nextOtp });
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
    setFormData({ ...formData, otp: paste.padEnd(6, "").slice(0, 6) });
    const nextIndex = Math.min(paste.length, 5);
    focusOtpInput(nextIndex);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otp) {
      return setErrors({ apiError: "OTP is required" });
    }

    if (!formData.newPassword) {
      return setErrors({ apiError: "Password is required" });
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/blog/author/reset-password", formData);
      if (response.status === 200) {
        setSuccess("Password updated successfully!");
        sessionStorage.removeItem("emailForOtp");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      setErrors({ apiError: error.response?.data?.message || "Password update failed" });
    } finally {
      setLoading(false);
    }
  };

  /* ---- UI (dark only, matches Login / Register) ------------------------- */
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative min-h-screen w-full bg-[#080b14] text-slate-100 [color-scheme:dark]"
      >
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
                Verify the code we emailed you, then choose a new password for your account.
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
                  <h1 className="text-2xl font-semibold tracking-tight text-white">
                    Change password
                  </h1>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.26em] text-emerald-400">
                    Secure reset
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {email ? (
                      <>
                        We sent a 6-digit code to{" "}
                        <span className="font-medium text-slate-200">{email}</span>. Enter it below
                        and choose a secure new password.
                      </>
                    ) : (
                      "Enter the OTP sent to your email and choose a secure new password."
                    )}
                  </p>
                </header>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  {/* {!email && (
                    <Alert tone="warning">
                      <>
                        We couldn't find a reset request on this device.{" "}
                        <Link to="/" className={linkCls}>
                          Go back to sign in
                        </Link>{" "}
                        and choose "Forgot password" to get a new code.
                      </>
                    </Alert>
                  )} */}
                  {success && <Alert tone="success">{success}</Alert>}
                  {errors.apiError && <Alert tone="error">{errors.apiError}</Alert>}

                  {/* OTP */}
                  <div>
                    <span id="otp-label" className={`${labelCls} mb-2 block`}>
                      Verification code
                    </span>
                    <div
                      role="group"
                      aria-labelledby="otp-label"
                      className="grid grid-cols-6 gap-2 sm:gap-3"
                    >
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
                          value={formData.otp[index] || ""}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onPaste={handleOtpPaste}
                          className={otpInput}
                        />
                      ))}
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label htmlFor="newPassword" className={`${labelCls} mb-1.5 block`}>
                      New password
                    </label>
                    <div className="relative">
                      <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="Enter a new password"
                        required
                        className={`${inputBase} pl-10 pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || Boolean(success)}
                    className={primaryBtn}
                  >
                    {loading && <Spinner />}
                    {loading ? "Updating…" : "Update password"}
                  </button>
                </form>

                <div className="mt-8 border-t border-white/[0.08] pt-6 text-sm text-slate-400">
                  <p>
                    Remembered it?{" "}
                    <Link to="/" className={linkCls}>
                      Back to sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

export default ChangePassword;