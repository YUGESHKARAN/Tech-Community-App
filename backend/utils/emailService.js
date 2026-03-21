const nodemailer = require("nodemailer");
require('dotenv').config()
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER,
   auth: {
     user: process.env.EMAIL_USER, // Replace with your email
     pass: process.env.EMAIL_PASS, // Replace with your email password
   },
});

const sendOTPEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `<${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Your Registration OTP",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto">
        <h2>Email Verification</h2>
        <p>Use the OTP below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#16a34a;padding:16px 0">
          ${otp}
        </div>
        <p style="color:#888;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };