import React,{useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../instances/Axiosinstances';
function ChangePassword() {
    const [errors, setErrors] = useState({});
    const email = localStorage.getItem("emailForOtp");
    const [loading, setLoading] = useState(false)
      const [success, setSuccess] = useState("");
      const navigate = useNavigate();
     const [formData, setFormData] = useState({
        email: email,
        newPassword: "",
        otp: "",
      });
      const [showPassword, setShowPassword] = useState(false);
      const otpInputsRef = useRef([]);

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
       
        if(!formData.otp){
          return setErrors({ apiError: "OTP is required" });
        }

        if(!formData.newPassword){
          return setErrors({ apiError: "Password is required" });
        }

         setLoading(true)

        try {
          const response = await axiosInstance.post("/blog/author/reset-password", formData);
          if (response.status === 200) {
            setSuccess("Password updated successfully!");
            localStorage.removeItem("emailForOtp");
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        } catch (error) {
          setErrors({ apiError: error.response?.data?.message || "Password update failed" });
        }
        finally{
          setLoading(false)
        }
      }

      
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
         <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-[320px] md:max-w-sm p-7 md:p-8">
                <div className="text-center ">
                  <h2 className="md:text-2xl text-xl font-bold text-white tracking-wide">
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    OTP expires within 15 min.
                  </p>
                </div>

                <form className="w-full  mx-auto md:p-4">
                  {success && <p className="text-green-500 pt-4 md:pt-0">{success}</p>}
                  {errors.apiError && <p className="text-red-500 pt-4 md:pt-0">{errors.apiError}</p>}
        
        
                  <div className={'m-4 w-full mb-6 mx-auto'}>
                   <label className="block w-full  text-sm font-medium text-gray-300 mb-2">
                      Enter OTP
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputsRef.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={formData.otp[index] || ""}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onPaste={handleOtpPaste}
                          className="w-7 h-7 md:w-10  md:h-10 text-center text-sm md:text-lg font-semibold bg-gray-800 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ))}
                    </div>
                  </div>
        
                  <div className={'m-4 w-full mx-auto'}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                      Enter Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 pr-12 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200"
                        placeholder="••••••••"
                        required
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
        
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    type="submit"
                    className='w-full p-1.5 md:py-2.5 bg-red-600 hover:bg-red-700 transition text-white font-semibold mt-1 rounded-lg'
                  >
                    {loading?'Updating...':'Update Password'}
                  </button>
                  
                </form>
        
              </div>

    </div>
  )
}

export default ChangePassword


//  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
//          <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8">
//                 <div className="text-center ">
//                   <h2 className="text-2xl font-bold text-white tracking-wide">
//                     Change Password
//                   </h2>
//                   <p className="text-sm text-gray-400 mt-1">
//                     OTP expires within 15 min.
//                   </p>
//                 </div>

//                 <form className="w-full space-y-6 mx-auto md:p-4">
//                   {success && <p className="text-green-500">{success}</p>}
//                   {errors.apiError && <p className="text-red-500">{errors.apiError}</p>}
        
//                   {/* <div className="m-4 w-full mx-auto">
                   
//                     <input
//                       type="email"
//                       id="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       className="w-full px-3 py-2 md:text-base text-sm border bg-gray-700 text-white rounded mt-4"
//                       placeholder="Enter Email"
//                       required
//                     />
//                   </div> */}
//                   <div className={'m-4 w-full mx-auto'}>
//                    <label className="block text-sm font-medium text-gray-300 mb-1">
//                       Enter OTP
//                     </label>
//                     <input
//                       type="text"
//                       id="otp"
//                       name="otp"
//                       maxLength={6}
//                       value={formData.otp}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
//                       placeholder="••••••"
//                       required
//                     />
//                   </div>
        
//                   <div className={'m-4 w-full mx-auto'}>
//                       <label className="block text-sm font-medium text-gray-300 mb-1">
//                       Enter Password
//                     </label>
//                     <input
//                       type="password"
//                       id="newPassword"
//                       name="newPassword"
//                       value={formData.newPassword}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
//                       placeholder="••••••••"
//                       required
//                     />
//                   </div>
        
//                   <button
//                     onClick={handleSubmit}
//                     disabled={loading}
//                     type="submit"
//                     className='w-full p-1.5 md:py-2.5 bg-red-600 hover:bg-red-700 transition text-white font-semibold rounded-lg'
//                   >
//                     {loading?'Updating...':'Update Password'}
//                   </button>
                  
//                 </form>
        
//               </div>

//     </div>