import React,{useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../instances/Axiosinstances';
import logoicon from "../assets/embed_logo_1.png";

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
    <div className="min-h-screen md:bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-[32px] p-8 md:shadow-[0_32px_120px_-48px_rgba(14,165,233,0.8)] backdrop-blur-xl sm:p-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="md:text-center space-y-4">
             <p className="mt-8 text-xs md:text-sm flex md:justify-center items-center  gap-3 uppercase tracking-[0.36em] text-slate-400">  <img src={logoicon} alt="Bytes Base" className="h-12 w-12 rounded-2xl bg-white/10 p-2 shadow-lg shadow-black/20" /> Bytes Base access</p>
            
            <h1 className="mt-3 md:text-3xl text-2xl font-semibold text-white">Change Password</h1>
            <p className="md:text-sm text-xs font-semibold mt-2 uppercase tracking-[0.3em] text-emerald-400/90">Secure Reset</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Enter the OTP sent to your email and choose a secure new password.</p>
          </div>

          <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
            {success && <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div>}
            {errors.apiError && <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{errors.apiError}</div>}

            <div>
              <label className="text-sm font-medium text-slate-300">Enter OTP</label>
              <div className="mt-3 grid grid-cols-6 gap-3">
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
                    className="mx-auto md:h-12 md:w-12 w-10 h-10 rounded-lg md:rounded-xl border border-slate-700 bg-slate-900 text-center text-xl font-semibold text-white outline-none ring-1 ring-slate-700 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">New Password</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-3 md:py-4 text-sm text-white placeholder:text-slate-500 shadow-sm shadow-black/20 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-[20px] bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword


