import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {CirclesWithBar} from 'react-loader-spinner'
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

    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
  {!loader && (
    <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8">
      
      {/* Header */}
      <div className="text-center relative mb-6">
        <img src={logoicon} className="md:w-12 md:h-12 w-9 h-9 object-cover bg-white rounded-full absolute top-1 left-0" alt="" />
        <h2 className="md:text-2xl text-xl font-bold text-white tracking-wide">
          {title}
        </h2>
        <p className="md:text-sm text-xs text-gray-400 mt-0">
          Secure access to your account
        </p>
      </div>

      {/* Form */}
      <form
        className={`w-full ${
          forgotPassword ? "space-y-4 " : "space-y-6 "
        }`}
      >
        {success && !isError && (
          <p className="text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-md">
            {success}
          </p>
        )}

        {errors.apiError && isError &&(
          <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
            {errors.apiError}
          </p>
        )}

        {/* Email */}
        <div>
        <div className="md:mb-4 mb-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">
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
            placeholder="University Email"
            className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
 

        {/* Password */}
        {!forgotPassword && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {passwordLabel}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                autoComplete="current-password"
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-12 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 md:hover:text-gray-400 transition-all duration-400 outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 1.657-.672 3.157-1.757 4.243A6 6 0 0121 12a6 6 0 00-4.757-5.814m-2.956 5.814a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

               </div>

        {/* Buttons */}
        {!forgotPassword && (
          <button
            onClick={handleSubmit}
            type="submit"
            disabled={loader2}
            className="w-full p-1.5 md:py-2.5 bg-red-600 hover:bg-red-700 transition text-white font-semibold mt-2 rounded-lg"
          >
            {loader2 ? "Logging in..." : "Login"}
          </button>
        )}

        {forgotPassword && (
          <button
            onClick={(e) => sendOtp(e, formData.email)}
            type="submit"
            disabled={loader2}
            className="w-full py-1.5 md:py-2.5 bg-red-600 hover:bg-red-700 transition text-white font-semibold rounded-lg"
          >
            {loader2 ? "Sending OTP..." : "Send OTP"}
          </button>
        )}
      </form>

      {/* Footer Links */}
      {forgotPassword && (
        <p className="mt-5 text-[13px] md:text-sm text-gray-400">
          Go to Login?{" "}
          <span
            onClick={() => {
              setForgotPassword(false);
              setPasswordLabel("Password");
              setTitle("Login");
            }}
            className="text-green-500 cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>
      )}

      {!forgotPassword && (
        <>
          <p
            onClick={() => {
              setForgotPassword(true);
              setPasswordLabel("New Password");
              setTitle("Forgot Password");
            }}
            className="mt-5 text-[13px] md:text-sm text-gray-400 cursor-pointer"
          >
            Forgot Password?{" "}
            <span className="text-green-500 hover:underline">
              Click here
            </span>
          </p>

          <p className="mt-0.5 md:mt-1.5 text-[13px] md:text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-green-500 hover:underline">
              Register here
            </Link>
          </p>
        </>
      )}
    </div>
  )}

  {/* Loader */}
  {loader && (
    <div className="flex justify-center items-center">
      <CirclesWithBar
        height="100"
        width="100"
        color="#4fa94d"
        outerCircleColor="#4fa94d"
        innerCircleColor="#4fa94d"
        barColor="#4fa94d"
        ariaLabel="circles-with-bar-loading"
        visible={true}
      />
    </div>
  )}
</div>

  );
}

export default LoginPage;


//  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
//   {!loader && (
//     <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8">
      
//       {/* Header */}
//       <div className="text-center relative mb-6">
//         <img src={logoicon} className="md:w-12 md:h-12 w-9 h-9 object-cover bg-white rounded-full absolute top-1 left-0" alt="" />
//         <h2 className="md:text-2xl text-xl font-bold text-white tracking-wide">
//           {title}
//         </h2>
//         <p className="md:text-sm text-xs text-gray-400 mt-0">
//           Secure access to your account
//         </p>
//       </div>

//       {/* Form */}
//       <form
//         className={`w-full ${
//           forgotPassword ? "space-y-4 " : "space-y-6 "
//         }`}
//       >
//         {success && !isError && (
//           <p className="text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-md">
//             {success}
//           </p>
//         )}

//         {errors.apiError && isError &&(
//           <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
//             {errors.apiError}
//           </p>
//         )}

//         {/* Email */}
//         <div>
//         <div className="md:mb-4 mb-2">
//           <label className="block text-sm font-medium text-gray-300 mb-1">
//             Email address
//           </label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             autoComplete="user email"
//             required
//             placeholder="University Email"
//             className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
//           />
//         </div>
 

//         {/* Password */}
//         {!forgotPassword && (
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">
//               {passwordLabel}
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               autoComplete="current-password"
//               onChange={handleChange}
//               required
//               placeholder="••••••••"
//               className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
//             />
//           </div>
//         )}

//                </div>

//         {/* Buttons */}
//         {!forgotPassword && (
//           <button
//             onClick={handleSubmit}
//             type="submit"
//             disabled={loader2}
//             className="w-full p-1.5 md:py-2.5 bg-red-600 hover:bg-red-700 transition text-white font-semibold mt-2 rounded-lg"
//           >
//             {loader2 ? "Logging in..." : "Login"}
//           </button>
//         )}

//         {forgotPassword && (
//           <button
//             onClick={(e) => sendOtp(e, formData.email)}
//             type="submit"
//             disabled={loader2}
//             className="w-full py-1.5 md:py-2.5 bg-red-600 hover:bg-red-700 transition text-white font-semibold rounded-lg"
//           >
//             {loader2 ? "Sending OTP..." : "Send OTP"}
//           </button>
//         )}
//       </form>

//       {/* Footer Links */}
//       {forgotPassword && (
//         <p className="mt-5 text-[13px] md:text-sm text-gray-400">
//           Go to Login?{" "}
//           <span
//             onClick={() => {
//               setForgotPassword(false);
//               setPasswordLabel("Password");
//               setTitle("Login");
//             }}
//             className="text-green-500 cursor-pointer hover:underline"
//           >
//             Login here
//           </span>
//         </p>
//       )}

//       {!forgotPassword && (
//         <>
//           <p
//             onClick={() => {
//               setForgotPassword(true);
//               setPasswordLabel("New Password");
//               setTitle("Forgot Password");
//             }}
//             className="mt-5 text-[13px] md:text-sm text-gray-400 cursor-pointer"
//           >
//             Forgot Password?{" "}
//             <span className="text-green-500 hover:underline">
//               Click here
//             </span>
//           </p>

//           <p className="mt-0.5 md:mt-1.5 text-[13px] md:text-sm text-gray-400">
//             Don&apos;t have an account?{" "}
//             <Link to="/register" className="text-green-500 hover:underline">
//               Register here
//             </Link>
//           </p>
//         </>
//       )}
//     </div>
//   )}

//   {/* Loader */}
//   {loader && (
//     <div className="flex justify-center items-center">
//       <CirclesWithBar
//         height="100"
//         width="100"
//         color="#4fa94d"
//         outerCircleColor="#4fa94d"
//         innerCircleColor="#4fa94d"
//         barColor="#4fa94d"
//         ariaLabel="circles-with-bar-loading"
//         visible={true}
//       />
//     </div>
//   )}
// </div>