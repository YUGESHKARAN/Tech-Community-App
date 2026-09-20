// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../AuthContext";
// import { CirclesWithBar } from "react-loader-spinner";
// import { motion } from "framer-motion";
// import axiosInstance from "../instances/Axiosinstances";
// import Cookies from "js-cookie";
// import { removeItem, storeItem } from "../utils/encode";
// import logoicon from "../assets/embed_logo_1.png";
// function LoginPage() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [title, setTitle] = useState("Login ");
//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState("");
//   const [forgotPassword, setForgotPassword] = useState(false);
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [passwordLabel, setPasswordLabel] = useState("Password");
//   const [loader, setLoader] = useState(false);
//   const [loader2, setLoader2] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();

//   //   if (!formData.email && !formData.password) {
//   //     return setErrors({ apiError: "Email and Password are required" });
//   //   }

//   //   if (!formData.email) {
//   //     return setErrors({ apiError: "Email is required" });
//   //   }

//   //   if (!formData.password) {
//   //     return setErrors({ apiError: "Password is required" });
//   //   }

//   //   setLoader2(true);

//   //   try {
//   //     // Send a POST request to the updated API endpoint
//   //     const response = await axiosInstance.post("/blog/login", formData);
//   //     // const response = await axiosInstance.post("http://localhost:3000/blog/login", formData);
//   //     console.log("response", response.data.message);
//   //     if (response.status === 200) {
//   //       setSuccess("Login successful!");

//   //       // await Cookies.set('token', response.data.token, { expires: 1, sameSite: 'lax' });
//   //       // await Cookies.set('token', response.data.token,  { expires: 10 / 86400, sameSite: "lax" });
//   //       login(response.data.token);
//   //       // console.log("token",response.data.token)

//   //       // localStorage.setItem("username", response.data.author.authorname);
//   //       storeItem("username", response.data.author.authorname);
//   //       // localStorage.setItem("email", response.data.author.email);
//   //       storeItem("email", response.data.author.email);
//   //       // localStorage.setItem("message",response.data.message);
//   //       // localStorage.setItem("role",response.data.author.role);
//   //       storeItem("role", response.data?.author?.role);
//   //       storeItem("authorId", response.data?.author?.authorId);
//   //       localStorage.setItem("profile", response.data?.author?.profile);
//   //       setLoader(true);
//   //       // Delay navigation by 2 seconds
//   //       setTimeout(() => {
//   //         if (response.data.author.role === "admin") {
//   //           navigate("/dashboard"); // Redirect to the dashboard
//   //         } else {
//   //           navigate("/home"); // Redirect to the homepage
//   //         }
//   //       }, 2000);
//   //     }
//   //   } catch (error) {
//   //     setErrors({ apiError: error.response?.data?.message || "Login failed" });
//   //     setIsError(true);
//   //     console.log(error);
//   //   } finally {
//   //     setLoader2(false);
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!formData.email && !formData.password) {
//     return setErrors({ apiError: "Email and Password are required" });
//   }
//   if (!formData.email) {
//     return setErrors({ apiError: "Email is required" });
//   }
//   if (!formData.password) {
//     return setErrors({ apiError: "Password is required" });
//   }

//   setLoader2(true);

//   try {
//     const response = await axiosInstance.post("/blog/login", formData);

//     if (response.status === 200) {
//       setSuccess("Login successful!");

//       const { token, author } = response.data;
//       const role = author?.role;

//       // ── store session ──────────────────────────────────────────────────────
//       login(token);
//       storeItem("username", author.authorname || author.name);
//       storeItem("email",    author.email);
//       storeItem("role",     role);
//       storeItem("authorId", author.authorId || author.directorId);
//       localStorage.setItem("profile", author?.profile);

//       // store isDirector flag so components can distinguish director sessions
//       if (author.isDirector) {
//         storeItem("isDirector", "true");
//       } else {
//         removeItem("isDirector");
//       }

//       setLoader(true);

//       // ── navigate by role ───────────────────────────────────────────────────
//       setTimeout(() => {
//         switch (role) {
//           case "super_director":
//           case "director":
//           case "readonly_director":
//             navigate("/director");        // director console
//             break;

//           case "admin":
//             navigate("/dashboard");       // tenant admin dashboard
//             break;

//           case "coordinator":
//           case "student":
//           default:
//             navigate("/home");            // regular platform home
//             break;
//         }
//       }, 2000);
//     }
//   } catch (error) {
//     setErrors({ apiError: error.response?.data?.message || "Login failed" });
//     setIsError(true);
//     console.log(error);
//   } finally {
//     setLoader2(false);
//   }
// };

//   const sendOtp = async (e, email) => {
//     e.preventDefault();
//     setLoader2(true);
//     // console.log("otp email", email)
//     localStorage.setItem("emailForOtp", email);
//     try {
//       const response = await axiosInstance.post("/blog/author/send-otp", {
//         email,
//       });

//       if (response.status === 200) {
//         navigate("/changePassword");
//       }
//     } catch (err) {
//       console.log("Error", err);
//     } finally {
//       setLoader2(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   return (
//     // <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4 py-8">

//     // </div>

//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.55, ease: "easeOut" }}
//       className={`relative w-full min-h-screen  overflow-y-hidden border border-white/10 bg-[#070a16] shadow-[0_45px_120px_-60px_rgba(0,0,0,0.8)] `}
//     >
//       {
//         <>
//           <div
//             className={` ${loader && "opacity-60"} absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.18),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.14),_transparent_30%)] pointer-events-none`}
//           />

//           <div
//             className={`grid grid-cols-1  min-h-screen lg:grid-cols-2 ${loader && "opacity-60"}`}
//           >
//             <div className="relative hidden lg:flex flex-col justify-center gap-8 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0b1230] p-10 lg:p-12">
//               <div>
//                 <p className="md:mt-8 text-sm flex items-center gap-3 uppercase tracking-[0.36em] text-slate-400">
//                   {" "}
//                   <img
//                     src={logoicon}
//                     alt="Bytes Base"
//                     className="h-12 w-12 rounded-2xl bg-white/10 p-2 shadow-lg shadow-black/20"
//                   />{" "}
//                   Bytes Base access
//                 </p>
//                 <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
//                   {" "}
//                   One Place to Connect{" "}
//                   <span className="bg-gradient-to-r from-green-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg truncate  tracking-tight">
//                     {" "}
//                     Developer minds.
//                   </span>
//                 </h1>
//                 <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
//                   Secure workspace sign in
//                 </p>
//               </div>
//             </div>

//             <div className="relative h-fit mt-20 md:mt-0 md:h-full flex flex-col justify-center px-8 py-7 sm:px-7  sm:py-14 lg:px-14 lg:py-16">
//               <div className="relative z-10 mx-auto w-full max-w-md">
//                 <div className="mb-8 block lg:flex space-y-6 items-center justify-between gap-4">
//                   <p className="mt-8 text-xs md:text-sm lg:hidden flex items-center  gap-3 uppercase tracking-[0.36em] text-slate-400">
//                     {" "}
//                     <img
//                       src={logoicon}
//                       alt="Bytes Base"
//                       className="h-12 w-12 rounded-2xl bg-white/10 p-2 shadow-lg shadow-black/20"
//                     />{" "}
//                     Bytes Base access
//                   </p>
//                   <div>
//                     <h2 className="mt-3 md:text-3xl text-2xl font-semibold text-white">
//                       {title}
//                     </h2>
//                     <p className="md:text-sm text-xs font-semibold mt-2 uppercase tracking-[0.3em] text-emerald-400/90">
//                       Author Portal
//                     </p>
//                   </div>
//                 </div>

//                 <form className="space-y-6 ">
//                   {success && !isError && (
//                     <motion.p
//                       initial={{ opacity: 0, y: -10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
//                     >
//                       {success}
//                     </motion.p>
//                   )}

//                   {errors.apiError && isError && (
//                     <motion.p
//                       initial={{ opacity: 0, y: -10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
//                     >
//                       {errors.apiError}
//                     </motion.p>
//                   )}

//                   <div className="space-y-2 md:space-y-4">
//                     <label
//                       htmlFor="email"
//                       className="text-sm font-medium text-slate-300"
//                     >
//                       Email address
//                     </label>
//                     <input
//                       type="email"
//                       id="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       autoComplete="user email"
//                       required
//                       placeholder="you@university.edu"
//                       className="w-full rounded-3xl border border-white/20  bg-slate-950/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
//                     />
//                   </div>

//                   {!forgotPassword && (
//                     <div className="space-y-2 md:space-y-4">
//                       <div className="flex items-center justify-between gap-4">
//                         <label
//                           htmlFor="password"
//                           className="text-sm font-medium text-slate-300"
//                         >
//                           {passwordLabel}
//                         </label>
//                         <button
//                           type="button"
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="md:text-xs text-[10px] font-medium text-emerald-500 md:text-emerald-300 md:hover:text-emerald-200"
//                         >
//                           {showPassword ? "Hide" : "Show"}
//                         </button>
//                       </div>
//                       <div className="relative">
//                         <input
//                           type={showPassword ? "text" : "password"}
//                           id="password"
//                           name="password"
//                           value={formData.password}
//                           autoComplete="current-password"
//                           onChange={handleChange}
//                           required
//                           placeholder="Enter your secure password"
//                           className="w-full rounded-3xl border border-white/20  bg-slate-950/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
//                         />
//                       </div>
//                     </div>
//                   )}

//                   {!forgotPassword && (
//                     <button
//                       onClick={handleSubmit}
//                       type="submit"
//                       disabled={loader2}
//                       className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
//                     >
//                       {loader2 ? "Logging in..." : "Login"}
//                     </button>
//                   )}

//                   {forgotPassword && (
//                     <button
//                       onClick={(e) => sendOtp(e, formData.email)}
//                       type="submit"
//                       disabled={loader2}
//                       className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
//                     >
//                       {loader2 ? "Sending OTP..." : "Send OTP"}
//                     </button>
//                   )}
//                 </form>

//                 <div className="mt-6 space-y-3 text-sm text-slate-400">
//                   {forgotPassword ? (
//                     <p className="leading-6">
//                       Remembered your password?{" "}
//                       <span
//                         onClick={() => {
//                           setForgotPassword(false);
//                           setPasswordLabel("Password");
//                           setTitle("Login");
//                         }}
//                         className="cursor-pointer text-emerald-400 hover:text-emerald-200"
//                       >
//                         Sign in
//                       </span>
//                     </p>
//                   ) : (
//                     <>
//                       <p
//                         onClick={() => {
//                           setForgotPassword(true);
//                           setPasswordLabel("New Password");
//                           setTitle("Forgot Password");
//                         }}
//                         className="cursor-pointer text-emerald-400 hover:text-emerald-200"
//                       >
//                         Forgot Password?
//                       </p>
//                       <p className="pb-5">
//                         Don&apos;t have an account?{" "}
//                         <Link
//                           to="/register"
//                           className="text-emerald-400 hover:text-emerald-200"
//                         >
//                           Register here
//                         </Link>
//                       </p>
//                       <p className="text-xs ">
//                        To know more checkout{" "}
//                         <a href="https://www.bytesbase.me/"
//                         className="text-emerald-400 hover:text-emerald-200"
//                         >
//                           BytesBase.me
//                         </a>
                       
//                       </p>
//                     </>
//                   )}
//                 </div>
                
//               </div>
//             </div>
//           </div>
//         </>
//       }

//       {loader && (
//         <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
//           <CirclesWithBar
//             height="100"
//             width="100"
//             color="#22c55e"
//             outerCircleColor="#22c55e"
//             innerCircleColor="#22c55e"
//             barColor="#22c55e"
//             ariaLabel="circles-with-bar-loading"
//             visible={true}
//           />
//         </div>
//       )}
//     </motion.div>
//   );
// }

// export default LoginPage;


import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { CirclesWithBar } from "react-loader-spinner";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import axiosInstance from "../instances/Axiosinstances";
import Cookies from "js-cookie";
import { removeItem, storeItem } from "../utils/encode";
import logoicon from "../assets/embed_logo_1.png";

/* -------------------------------------------------------------------------- */
/*  Tenant lookup (email domain -> tenant)                                     */
/* -------------------------------------------------------------------------- */
// Expected response: { tenant: { name, slug, logoUrl? } }  (or 404 / tenant: null)
// Any failure is treated as "no workspace found" and never blocks login.


const EMAIL_DOMAIN_RE = /^[^\s@]+@([^\s@]+\.[^\s@]{2,})$/;

/* -------------------------------------------------------------------------- */
/*  Shared class strings (dark only — no Tailwind `dark:` config required)     */
/* -------------------------------------------------------------------------- */
// The autofill overrides stop Chrome/Edge from painting saved-credential
// fields pale blue/white, which is what breaks dark forms.
const inputBase =
  "block h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] text-sm text-slate-100 caret-emerald-400 placeholder:text-slate-500 outline-none transition [color-scheme:dark] hover:border-white/20 focus:border-emerald-400/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/15 [&:-webkit-autofill]:[-webkit-text-fill-color:#f1f5f9] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#101623_inset] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

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
    title: "Dedicated ecosystem",
    body: "Unified platform for students, faculty and alumni",
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
      <span className="text-xs md:text-sm font-semibold  uppercase tracking-[0.26em] text-slate-400">Bytes Base Access</span>
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

/* -------------------------------------------------------------------------- */
/*  Login page                                                                 */
/* -------------------------------------------------------------------------- */
function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [title, setTitle] = useState("Login ");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [passwordLabel, setPasswordLabel] = useState("Password");
  const [loader, setLoader] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);




  /* ---- EXISTING logic (unchanged) --------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email && !formData.password) {
      return setErrors({ apiError: "Email and Password are required" });
    }
    if (!formData.email) {
      return setErrors({ apiError: "Email is required" });
    }
    if (!formData.password) {
      return setErrors({ apiError: "Password is required" });
    }

    setLoader2(true);

    try {
      const response = await axiosInstance.post("/blog/login", formData);

      if (response.status === 200) {
        setSuccess("Login successful!");

        const { token, author } = response.data;
        const role = author?.role;

        // ── store session ──────────────────────────────────────────────────────
        login(token);
        storeItem("username", author.authorname || author.name);
        storeItem("email", author.email);
        storeItem("role", role);
        storeItem("authorId", author.authorId || author.directorId);
        localStorage.setItem("profile", author?.profile);

        // store isDirector flag so components can distinguish director sessions
        if (author.isDirector) {
          storeItem("isDirector", "true");
        } else {
          removeItem("isDirector");
        }

        setLoader(true);

        // ── navigate by role ───────────────────────────────────────────────────
        setTimeout(() => {
          switch (role) {
            case "super_director":
            case "director":
            case "readonly_director":
              navigate("/director"); // director console
              break;

            case "admin":
              navigate("/dashboard"); // tenant admin dashboard
              break;

            case "coordinator":
            case "student":
            default:
              navigate("/home"); // regular platform home
              break;
          }
        }, 2000);
      }
    } catch (error) {
      setErrors({ apiError: error.response?.data?.message || "Login failed" });
      setIsError(true);
      console.log(error);
    } finally {
      setLoader2(false);
    }
  };

  const sendOtp = async (e, email) => {
    e.preventDefault();
    setLoader2(true);
    localStorage.setItem("emailForOtp", email);
    try {
      const response = await axiosInstance.post("/blog/author/send-otp", {
        email,
      });

      if (response.status === 200) {
        navigate("/changePassword");
      }
    } catch (err) {
      console.log("Error", err);
    } finally {
      setLoader2(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Same state changes the old "Forgot Password?" / "Sign in" links made
  const openForgot = () => {
    setForgotPassword(true);
    setPasswordLabel("New Password");
    setTitle("Forgot Password");
  };
  const closeForgot = () => {
    setForgotPassword(false);
    setPasswordLabel("Password");
    setTitle("Login");
  };

  /* ---- UI (dark only) --------------------------------------------------- */
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative min-h-screen w-full bg-[#080b14] text-slate-100 [color-scheme:dark]"
      >
        <div
          className="grid min-h-screen grid-cols-1 inset-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(30,197,94,0.30),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.14),_transparent_30%)]  lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
          aria-busy={loader}
        >
          {/* ------------------------ Left: workspace + trust ------------------------ */}
          <aside className="relative hidden flex-col justify-center  overflow-hidden border-r border-white/[0.08] bg-[#0f1625] p-12 lg:flex">
           
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
                WebkitMaskImage:
                  "radial-gradient(ellipse at 70% 40%, black 15%, transparent 72%)",
                maskImage: "radial-gradient(ellipse at 70% 40%, black 15%, transparent 72%)",
              }}
            />

            <div className="relative">
              <BrandLockup logo={logoicon} />
            </div>

            <div className="relative">
          
                              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
                   {" "}
                   One Place to Connect{" "}
                   <span className="bg-gradient-to-r from-green-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg truncate  tracking-tight">
                     {" "}
                     Developer minds.
                   </span>
                 </h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Use your university email and we'll take you to your community's workspace.
              </p>
        
            </div>

            <ul className="relative max-w-lg mt-12  divide-y divide-white/[0.08] border-t border-white/[0.08]">
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
          <main className="relative  flex flex-col">
           

            <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
              
              <div className="w-full max-w-[400px]">
                  <div className="mb-6 lg:hidden">
              <BrandLockup logo={logoicon} />
            </div>
                <header>
                 
                  <h2 className="text-2xl font-semibold tracking-tight  text-white">{title}</h2>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.26em] text-emerald-400">
                    {forgotPassword
                      ? "We'll email you a verification code to reset your password."
                      : "Author portal"}
                  </p>
                </header>

                <form className="mt-8 space-y-5">
                  {success && !isError && <Alert tone="success">{success}</Alert>}
                  {errors.apiError && isError && <Alert tone="error">{errors.apiError}</Alert>}

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
                        required
                        placeholder="you@university.edu"
                        className={`${inputBase} pl-10 pr-3.5`}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  {!forgotPassword && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-4">
                        <label htmlFor="password" className={labelCls}>
                          {passwordLabel}
                        </label>
                        <button type="button" onClick={openForgot} className={`${linkCls} text-sm`}>
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="current-password"
                          required
                          placeholder="Enter your password"
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
                  )}

                  {/* Primary action */}
                  {!forgotPassword ? (
                    <button
                      onClick={handleSubmit}
                      type="submit"
                      disabled={loader2}
                      className={primaryBtn}
                    >
                      {loader2 && <Spinner />}
                      {loader2 ? "Signing in…" : "Sign in"}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => sendOtp(e, formData.email)}
                      type="submit"
                      disabled={loader2}
                      className={primaryBtn}
                    >
                      {loader2 && <Spinner />}
                      {loader2 ? "Sending code…" : "Send verification code"}
                    </button>
                  )}
                </form>

                <div className="mt-8 border-t border-white/[0.08] pt-6 text-sm text-slate-400">
                  {forgotPassword ? (
                    <p>
                      Remembered your password?{" "}
                      <button type="button" onClick={closeForgot} className={linkCls}>
                        Sign in
                      </button>
                    </p>
                  ) : (
                    <p className="font-normal">
                      New to BytesBase?{" "}
                      <Link to="/register" className={linkCls}>
                        Create an account
                      </Link>
                    </p>
                  )}
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

        {/* Loading overlay (shown during the post-login redirect delay) */}
        {loader && (
          <div
            role="status"
            aria-label="Loading"
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#080b14]/85 backdrop-blur-sm"
          >
            <CirclesWithBar
              height="100"
              width="100"
              color="#22c55e"
              outerCircleColor="#22c55e"
              innerCircleColor="#22c55e"
              barColor="#22c55e"
              ariaLabel="circles-with-bar-loading"
              visible={true}
            />
          </div>
        )}
      </motion.div>
    </MotionConfig>
  );
}

export default LoginPage;