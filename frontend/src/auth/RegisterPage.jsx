import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "../ui/NavBar";
import Footer from "../ui/Footer";
import axiosInstance from "../instances/Axiosinstances";

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,setLoading] = useState(false)
  const navigate = useNavigate();

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.username) validationErrors.username = "Username is required";
    if (!formData.email) validationErrors.email = "Email is required";
    if (!formData.password) validationErrors.password = "Password is required";
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    setLoading(true)

    if(confirmPassword!==formData.password){
      setErrors({ password: "password not matching" });
      setLoading(false)
      return;
    }

    if (Object.keys(validationErrors).length === 0) {
      try {
        // Send a POST request to the API using axios
        const response = await axiosInstance.post(
          "/blog/author",
          {
            authorname: formData.username,
            email: formData.email,
            password: formData.password,
          }
        );

        if (response.status === 201) {
          setSuccess("Registration successful!");
          localStorage.setItem("username", formData.username); // Assuming the username is returned in the response
          localStorage.setItem("email", formData.email);

          setFormData({
            username: "",
            email: "",
            password: "",
          });

          navigate("/home");
        }
      } catch (error) {
        if (error.response) {
          setErrors({
            apiError: error.response.data.message || "Registration failed",
          });
        } else {
          setErrors({ apiError: "Error connecting to the server" });
        }
      }
      finally{
        setLoading(false)
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // console.log("confirm password", confirmPassword)

  return (
    // <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex justify-center items-center">
    
 
    //   <div className="bg-gray-900  w-11/12 max-w-md p-8 rounded">
    //     <h2 className="text-center text-white font-semibold text-xl">Register</h2>
    //     <form className="md:w-96 w-full mx-auto md:p-4" onSubmit={handleSubmit}>
    //       {success && <p className="text-green-500">{success}</p>}
    //       {errors.apiError && <p className="text-red-500">{errors.apiError}</p>}
    //       {errors.pawword && <p className="text-red-500">{errors.pawword}</p>}
    //       <div>
    //         <label htmlFor="username" className="block text-sm font-medium text-gray-300">
    //           Username
    //         </label>
    //         <input
    //           type="text"
    //           id="username"
    //           name="username"
    //           value={formData.username}
    //           onChange={handleChange}
    //           className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
    //           placeholder="Enter your username"
    //           required
    //         />
    //         {errors.username && <p className="text-red-500">{errors.username}</p>}
    //       </div>
    //       <div className="mt-4">
    //         <label htmlFor="email" className="block text-sm font-medium text-gray-300">
    //           Email
    //         </label>
    //         <input
    //           type="email"
    //           id="email"
    //           name="email"
    //           value={formData.email}
    //           onChange={handleChange}
    //           className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
    //           placeholder="Enter your email"
    //           required
    //         />
    //         {errors.email && <p className="text-red-500">{errors.email}</p>}
    //       </div>
    //       <div className="mt-4">
    //         <label htmlFor="password" className="block text-sm font-medium text-gray-300">
    //           Password
    //         </label>
    //         <input
    //           type="password"
    //           id="password"
    //           name="password"
    //           value={formData.password}
    //           onChange={handleChange}
    //           className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
    //           placeholder="Enter your password"
    //           required
    //         />
    //         {errors.password && <p className="text-red-500">{errors.password}</p>}
    //       </div>
    //       <div className="mt-4">
    //         <label htmlFor="confirm password" className="block text-sm font-medium text-gray-300">
    //            Confirm Password
    //         </label>
    //         <input
    //           type="password"
    //           id="password"
    //           name="password"
    //           value={confirmPassword}
    //           onChange={(e)=>{setConfirmPassword(e.target.value)}}
    //           className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
    //           placeholder="Enter your password"
    //           required
    //         />
    //         {errors.password && <p className="text-red-500">{errors.password}</p>}
    //       </div>
    //       <div className="mt-6">
    //         <button
    //           type="submit"
    //           className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition duration-200"
    //           disabled={loading}
    //         >
    //           {loading?'Setting up':'Register'}
    //         </button>
    //       </div>
    //     </form>
    //     <p className="mt-4 md:text-base text-xs text-gray-300">
    //       Already have an account?{" "}
    //       <Link to="/" className="text-green-500 font-semibold hover:underline">
    //         Login here
    //       </Link>
    //     </p>
    //   </div>
 
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
  <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8">
    
    {/* Header */}
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-white tracking-wide">
        Register
      </h2>
      <p className="text-sm text-gray-400 mt-1">
        Create your account to get started
      </p>
    </div>

    {/* Form */}
    <form
      className="w-full space-y-5"
      onSubmit={handleSubmit}
    >
      {success && (
        <p className="text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-md">
          {success}
        </p>
      )}

      {errors.apiError && (
        <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
          {errors.apiError}
        </p>
      )}

      {errors.pawword && (
        <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
          {errors.pawword}
        </p>
      )}

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
          required
          className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        {errors.username && (
          <p className="text-xs text-red-500 mt-1">
            {errors.username}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirm-password"
          name="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-lg"
      >
        {loading ? "Setting up..." : "Register"}
      </button>
    </form>

    {/* Footer */}
    <p className="mt-6 text-sm text-gray-400 text-center">
      Already have an account?{" "}
      <Link
        to="/"
        className="text-green-500 font-semibold hover:underline"
      >
        Login here
      </Link>
    </p>
  </div>
</div>

  );
}

export default RegisterPage;