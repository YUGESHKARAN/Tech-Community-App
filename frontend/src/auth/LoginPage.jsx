import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {CirclesWithBar} from 'react-loader-spinner'
import axiosInstance from "../instances/Axiosinstances";
import Cookies from 'js-cookie'
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
  const [loader2, setLoader2] = useState(false)
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

        localStorage.setItem("username", response.data.author.authorname);
        localStorage.setItem("email", response.data.author.email);
        // localStorage.setItem("message",response.data.message); 
        localStorage.setItem("role",response.data.author.role); 
        localStorage.setItem("profile",response.data.author.profile); 
        setLoader(true);
         // Delay navigation by 2 seconds
        setTimeout(() => {
          navigate("/home"); // Redirect to the homepage
        }, 2000);
      }
    } catch (error) {
      setErrors({ apiError: error.response?.data?.message || "Login failed" });
      console.log(error.message)
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
    <div className="text-md font-semibold w-full h-screen  bg-black flex justify-center items-center">
      <div className={`${loader?'hidden':'bg-gray-800 w-11/12 max-w-md p-8 rounded-md'}`}>
        <h2 className="text-center mb-6  text-white text-xl">{title}</h2>

        <form className={`md:w-96 w-full ${forgotPassword?'space-y-3':'space-y-8'} mx-auto md:p-4`}>
          {success && <p className="text-green-500">{success}</p>}
          {errors.apiError && <p className="text-red-500">{errors.apiError}</p>}

          <div className="mb-4">
            {/* <label htmlFor="email" className="block text-gray-700">
              Email
            </label> */}
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 md:text-base text-sm border bg-gray-700 text-white rounded"
              placeholder="Enter Email"
              required
            />
          </div>

          <div className={`${forgotPassword ? "hidden" : "mb-4"}`}>
            {/* <label htmlFor="password" className="block text-gray-700">
              {passwordLabel}
            </label> */}
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 md:text-base text-sm border bg-gray-700 text-white rounded"
              placeholder="Enter Password"
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            type="submit"
            disabled={loader2}
            className={`${
              forgotPassword
                ? "hidden"
                : "w-full bg-red-600 hover:bg-red-700 md:text-base text-sm transition-all duration-200 text-white font-bold py-2 px-4 rounded"
            }`}
          >
            {loader2?'Logging in...':'Login'}
          </button>

          <button
            onClick={(e) => sendOtp(e, formData.email)}
            type="submit"
            disabled={loader2}
            className={`${
              forgotPassword
                ? "w-full bg-red-600 hover:bg-red-700 md:text-base text-sm transition-all duration-200 text-white font-bold py-2 px-4 rounded"
                : "hidden"
            }`}
          >
            {loader2?'Sending OTP...':'Send OTP'}
          </button>
        </form>

        <p
        className={`${forgotPassword?'mt-4 flex px-4 justify-start md:text-base text-xs gap-2 text-gray-400 cursor-pointer':'hidden'}`}
        >
        Go to Login?{" "}
         <span
          onClick={() => {
            setForgotPassword(false);
            setPasswordLabel("Password");
            setTitle("Login ");
          }}
         className="text-green-500 md:text-base text-xs hover:underline"
         >
          Login here
         </span>
        </p>

        <p
          onClick={() => {
            setForgotPassword(true);
            setPasswordLabel("New Password");
            setTitle("Forgot Password");
          }}
          className={`${forgotPassword?'hidden':'mt-4 flex px-4 justify-start md:text-base text-xs gap-2 text-gray-400 cursor-pointer'}`}
        >
          Forgot Password? <span className="text-green-500 md:text-base text-xs hover:underline">Click here</span>
        </p>

        <p className={`${forgotPassword?'hidden':'mt-4 px-4 md:text-base text-xs text-gray-400'}`}>
          Don't have an account?{" "}
          <Link to="/register" className="text-green-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    {
      loader &&   <CirclesWithBar
      height="100"
      width="100"
      color="#4fa94d"
      outerCircleColor="#4fa94d"
      innerCircleColor="#4fa94d"
      barColor="#4fa94d"
      ariaLabel="circles-with-bar-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
      />
    }
    </div>
  );
}

export default LoginPage;
