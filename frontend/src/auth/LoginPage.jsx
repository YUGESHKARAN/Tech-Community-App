import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { CirclesWithBar } from 'react-loader-spinner'
import { motion } from "framer-motion";
import axiosInstance from "../instances/Axiosinstances";
import Cookies from 'js-cookie'
import { storeItem } from "../utils/encode";
import logoicon from "../assets/embed_logo_1.png"
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
  const[loader,setLoader] = useState(false)
  const [loader2, setLoader2] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!formData.email && !formData.password){
      return setErrors({ apiError: "Email and Password are required" });
    }

    if(!formData.email){
       return setErrors({ apiError: "Email is required" });
    }

    if(!formData.password){
      return setErrors({ apiError: "Password is required" });
    }

    
     setLoader2(true)

    try {
      // Send a POST request to the updated API endpoint
      const response = await axiosInstance.post("/blog/login", formData);
      // const response = await axiosInstance.post("http://localhost:3000/blog/login", formData);
      console.log("response",response.data.message)
      if (response.status === 200) {
        setSuccess("Login successful!");
         
        // await Cookies.set('token', response.data.token, { expires: 1, sameSite: 'lax' });
        // await Cookies.set('token', response.data.token,  { expires: 10 / 86400, sameSite: "lax" });
        login(response.data.token);
        // console.log("token",response.data.token)  

        // localStorage.setItem("username", response.data.author.authorname);
        storeItem("username", response.data.author.authorname);
        // localStorage.setItem("email", response.data.author.email);
        storeItem("email", response.data.author.email);
        // localStorage.setItem("message",response.data.message); 
        // localStorage.setItem("role",response.data.author.role); 
        storeItem("role",response.data.author.role);
        localStorage.setItem("profile",response.data.author.profile); 
        setLoader(true);
         // Delay navigation by 2 seconds
        setTimeout(() => {
         if(response.data.author.role==="admin"){
           navigate("/dashboard"); // Redirect to the dashboard
         }
         else{
           navigate("/home"); // Redirect to the homepage
         }
        }, 2000);
      }
    } catch (error) {
      setErrors({ apiError: error.response?.data?.message || "Login failed" });
      setIsError(true);
      console.log(error)
    }
    finally{
      setLoader2(false)
    }
  
  };

  const sendOtp = async (e, email) => {
    e.preventDefault();
    setLoader2(true)
  // console.log("otp email", email)
  localStorage.setItem("emailForOtp", email);
    try {
      const response = await axiosInstance.post('/blog/author/send-otp', {
        email
      });

      if (response.status === 200) {
       navigate("/changePassword");
      }
    } catch (err) {
      console.log("Error", err);
    }
    finally{
      setLoader2(false)
    }
  
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (

    // <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4 py-8">
      

     
    // </div>

    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className={`relative w-full min-h-screen  overflow-y-hidden rounded-[32px] border border-white/10 bg-[#070a16] shadow-[0_45px_120px_-60px_rgba(0,0,0,0.8)] `}
      >
       {!loader && <>
        <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.18),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.14),_transparent_30%)] pointer-events-none" />

        <div className="grid grid-cols-1 min-h-screen lg:grid-cols-2">
          <div className="relative hidden lg:flex flex-col justify-center gap-8 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0b1230] p-10 lg:p-12">
            <div>
             
              <p className="mt-8 text-sm flex items-center gap-3 uppercase tracking-[0.36em] text-slate-400">  <img src={logoicon} alt="Bytes Base" className="h-12 w-12 rounded-2xl bg-white/10 p-2 shadow-lg shadow-black/20" /> Bytes Base access</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white"> One Place to Connect <span className="bg-gradient-to-r from-green-400 via-blue-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg truncate  tracking-tight"> Developer minds.</span></h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
               
                Secure workspace sign in
              </p>
            </div>

        
          </div>

          <div className="relative flex flex-col justify-center px-8 py-10 sm:px-12  sm:py-14 lg:px-14 lg:py-16">
            <div className="relative z-10 mx-auto w-full max-w-md">
              
              <div className="mb-8 block lg:flex space-y-6 items-center justify-between gap-4">
                
                 <p className="mt-8 text-xs md:text-sm lg:hidden flex items-center  gap-3 uppercase tracking-[0.36em] text-slate-400">  <img src={logoicon} alt="Bytes Base" className="h-12 w-12 rounded-2xl bg-white/10 p-2 shadow-lg shadow-black/20" /> Bytes Base access</p>
                <div>
                  
                 <h2 className="mt-3 md:text-3xl text-2xl font-semibold text-white">{title}</h2>
                   <p className="md:text-sm text-xs font-semibold mt-2 uppercase tracking-[0.3em] text-emerald-400/90">Author Portal</p>
                </div>
             
              </div>

              <form className="space-y-6 ">
                {success && !isError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                  >
                    {success}
                  </motion.p>
                )}

                {errors.apiError && isError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  >
                    {errors.apiError}
                  </motion.p>
                )}

                <div className="space-y-4">
                  <label htmlFor="email" className="text-sm font-medium text-slate-300">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="user email"
                    required
                    placeholder="you@university.edu"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  />
                </div>

                {!forgotPassword && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <label htmlFor="password" className="text-sm font-medium text-slate-300">
                        {passwordLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        autoComplete="current-password"
                        onChange={handleChange}
                        required
                        placeholder="Enter your secure password"
                        className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                      />
                    </div>
                  </div>
                )}

                {!forgotPassword && (
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    disabled={loader2}
                    className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loader2 ? "Logging in..." : "Login"}
                  </button>
                )}

                {forgotPassword && (
                  <button
                    onClick={(e) => sendOtp(e, formData.email)}
                    type="submit"
                    disabled={loader2}
                    className="inline-flex w-full items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loader2 ? "Sending OTP..." : "Send OTP"}
                  </button>
                )}
              </form>

              <div className="mt-6 space-y-3 text-sm text-slate-400">
                {forgotPassword ? (
                  <p className="leading-6">
                    Remembered your password?{' '}
                    <span
                      onClick={() => {
                        setForgotPassword(false);
                        setPasswordLabel("Password");
                        setTitle("Login");
                      }}
                      className="cursor-pointer text-emerald-400 hover:text-emerald-200"
                    >
                      Sign in
                    </span>
                  </p>
                ) : (
                  <>
                    <p
                      onClick={() => {
                        setForgotPassword(true);
                        setPasswordLabel("New Password");
                        setTitle("Forgot Password");
                      }}
                      className="cursor-pointer text-emerald-400 hover:text-emerald-200"
                    >
                      Forgot Password?
                    </p>
                    <p>
                      Don&apos;t have an account?{' '}
                      <Link to="/register" className="text-emerald-400 hover:text-emerald-200">
                        Register here
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        </>}

        {loader && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
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

  );
}

export default LoginPage;


