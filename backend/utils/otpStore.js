const redisClient = require("../middleware/redis");

const saveOTP = async (email, otp) => {
  // Store OTP with 10-minute expiry (600 seconds)
  // Redis EX option auto-deletes the key after expiry — no manual cleanup needed
  await redisClient.set(`otp:${email}`, otp, { EX: 600 });
};

const verifyOTP = async (email, inputOtp) => {
  const storedOtp = await redisClient.get(`otp:${email}`);

  if (!storedOtp) return { valid: false, reason: "OTP not found or expired" };
  if (storedOtp !== inputOtp) return { valid: false, reason: "Invalid OTP" };

  // console.log("redis storedOtp", storedOtp)

  await redisClient.del(`otp:${email}`); // one-time use
  return { valid: true };
};

module.exports = { saveOTP, verifyOTP };