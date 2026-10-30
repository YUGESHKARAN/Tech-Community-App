const nodemailer = require("nodemailer");

require("dotenv").config();
// Sends the one-time judging link to an external judge.
// Uses its own template, not sendOTPEmail.
//
// Uses the same transporter config as the existing OTP mailer.
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatExpiry = (date) =>
  new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }) + " IST";

/**
 * @param {object} args
 * @param {string} args.to             judge email
 * @param {string} [args.displayName]  judge name, if given
 * @param {string} args.eventTitle
 * @param {string} args.link           full judge link, token in the hash
 * @param {Date}   args.expiresAt      token expiry
 */
async function sendJudgeInviteEmail({ to, displayName, eventTitle, link, expiresAt }) {
  const greeting = displayName ? `Hi ${displayName},` : "Hello,";
  const expiry = formatExpiry(expiresAt);

  const text = [
    greeting,
    "",
    `You have been invited to judge submissions for ${eventTitle} on BytesBase.`,
    "",
    `Open this link to start scoring: ${link}`,
    "",
    `The link works once and expires on ${expiry}.`,
    "If you did not expect this invitation, you can ignore this email.",
  ].join("\n");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1b1c1a;line-height:1.6">
    <p>${escapeHtml(greeting)}</p>
    <p>You have been invited to judge submissions for <strong>${escapeHtml(eventTitle)}</strong> on BytesBase.</p>
    <p style="margin:28px 0">
      <a href="${escapeHtml(link)}"
         style="background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:600">
        Open judging
      </a>
    </p>
    <p style="font-size:13px;color:#62645e">
      The link works once and expires on ${escapeHtml(expiry)}.
      If the button does not work, copy this address into your browser:<br>
      <span style="word-break:break-all">${escapeHtml(link)}</span>
    </p>
    <p style="font-size:12px;color:#62645e">If you did not expect this invitation, you can ignore this email.</p>
  </div>`;

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: `You are invited to judge ${eventTitle}`,
    text,
    html,
  });
}

module.exports = { sendJudgeInviteEmail };