import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../instances/Axiosinstances';
function ChangePassword() {
    const [errors, setErrors] = useState({});
    const email = localStorage.getItem("emailForOtp");
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
      }

      
  return (
    <div className="text-blue-600 text-md font-semibold w-full h-screen  bg-black flex justify-center items-center">
         <div className={' w-11/12 bg-gray-800 md:w-fit p-16 rounded-md'}>
                <h2 className="text-center text-white text-xl">Change Password</h2>
                <form className="md:w-96 w-full mx-auto md:p-4">
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
                   
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full px-3 py-2 md:text-base text-sm border bg-gray-700 text-white rounded mt-4"
                      placeholder="Enter OTP"
                      required
                    />
                  </div>
        
                  <div className={'m-4 w-full mx-auto'}>
                
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 md:text-base text-sm border bg-gray-700 text-white rounded my-4"
                      placeholder="Enter Password"
                      required
                    />
                  </div>
        
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    className='w-full bg-yellow-600 hover:bg-yellow-700 md:text-base text-sm transition-all duration-200 text-white font-bold py-1.5 md:py-2.5 px-4 rounded'
                  >
                    Change Password
                  </button>
                  
                </form>
        
              </div>

    </div>
  )
}

export default ChangePassword