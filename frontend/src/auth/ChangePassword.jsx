import React,{useState} from 'react'
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

      const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        if(!formData.otp){
          return setErrors({ apiError: "OTP is required" });
        }

        if(!formData.newPassword){
          return setErrors({ apiError: "Password is required" });
        }

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
         <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8">
                <div className="text-center ">
                  <h2 className="text-2xl font-bold text-white tracking-wide">
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    OTP expires within 15 min.
                  </p>
                </div>

                <form className="w-full space-y-6 mx-auto md:p-4">
                  {success && <p className="text-green-500">{success}</p>}
                  {errors.apiError && <p className="text-red-500">{errors.apiError}</p>}
        
                  {/* <div className="m-4 w-full mx-auto">
                   
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 md:text-base text-sm border bg-gray-700 text-white rounded mt-4"
                      placeholder="Enter Email"
                      required
                    />
                  </div> */}
                  <div className={'m-4 w-full mx-auto'}>
                   <label className="block text-sm font-medium text-gray-300 mb-1">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      maxLength={6}
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="••••••"
                      required
                    />
                  </div>
        
                  <div className={'m-4 w-full mx-auto'}>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                      Enter Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="••••••••"
                      required
                    />
                  </div>
        
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    type="submit"
                    className='w-full p-1.5 md:py-2.5 bg-yellow-600 hover:bg-yellow-700 transition-all duration-200 text-white font-semibold rounded-lg'
                  >
                    {loading?'Changing...':'Change Password'}
                  </button>
                  
                </form>
        
              </div>

    </div>
  )
}

export default ChangePassword