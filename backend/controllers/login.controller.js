const { Author } = require("../models/blogAuthorSchema");
const { DeletionLog } = require("../models/deletionLogSchema");
const bcrypt = require("bcrypt");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const { resolveTenantFromEmail } = require("../utils/resolveTenant");

const verifyUser = async (req, res) => {
  // console.log("verify user called");
  try {
    const { email, password } = req.body;

    const user = await Author.findOne({ email: { $eq: email } })
      .select('password authorname email role profile tenantId');

    if (!user) {
      // fix: check deletion log before returning generic "Invalid Email"
      const deletionRecord = await DeletionLog.findOne({
        'snapshot.author.email': { $eq: email },
        status: 'deleted',
      }).select('_id deletionType').lean();

      // console.log("deletionRecord:", deletionRecord);

      if (deletionRecord) {
       let message = "This account has been deleted. Contact admin to restore your account";

        if(deletionRecord.deletionType === "admin_action"){
          message = "This account has been deleted by admin. Contact admin to restore your account."
        }
        else{
          message = "This account has been self deleted. Contact admin to restore your account."
        }

      return res.status(403).json({
          message: message,
          canRestore: true,
          deletionType: deletionRecord.deletionType,
        });
      }

      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const payload = {
      authorname: user.authorname,
      authorId:        user._id,
      email:      user.email,
      role:       user.role,
      profile:    user.profile,
      tenantId:   user.tenantId,
    };

    const token = jwt.sign(payload, process.env.JWT_TOKEN_ACCESS_KEY, { expiresIn: "1d" });

    res.status(200).json({ message: "Login Successfull", token, author: payload });
  } catch (err) {
    console.error("verifyUser error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// const verifyUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Author email and password required" });
//     }

//     // ── 1. Resolve and validate tenant ──────────────────────────────────────
//     let tenant;
//     try {
//       tenant = await resolveTenantFromEmail(email);
//     } catch (err) {
//       return res.status(400).json({
//         message: "Your institution is not registered on BytesBase.",
//       });
//     }

//     // resolveTenantFromEmail already checks active:true — but be explicit here
//     // in case that filter is ever relaxed upstream
//     if (!tenant.active) {
//       return res.status(403).json({
//         message:
//           "Your institution's access to BytesBase has been suspended. Contact your administrator.",
//       });
//     }

//     // ── 2. Find author ───────────────────────────────────────────────────────
//     const user = await Author.findOne({
//       email: { $eq: email },
//       tenantId: tenant.tenantId,
//     }).select("password authorname email role profile tenantId");

//     if (!user) {
//       // check deletion log before returning generic "Invalid Email"
//       const deletionRecord = await DeletionLog.findOne(
//         { "snapshot.author.email": { $eq: email }, status: "deleted" },
//         "_id deletionType",
//       ).lean();

//       if (deletionRecord) {
//         const message =
//           deletionRecord.deletionType === "admin_action"
//             ? "This account has been deleted by admin. Contact admin to restore your account."
//             : "This account has been self deleted. Contact admin to restore your account.";

//         return res.status(403).json({
//           message,
//           canRestore: true,
//           deletionType: deletionRecord.deletionType,
//         });
//       }

//       return res.status(400).json({ message: "Invalid Email" });
//     }

//     // ── 3. Tenant integrity check ────────────────────────────────────────────
//     // Prevents a user whose DB tenantId drifted from logging into the wrong
//     // tenant context. Also catches users created before tenantId was enforced.
//     if (user.tenantId && user.tenantId !== tenant.tenantId) {
//       console.error(
//         `Tenant mismatch: user ${email} has tenantId=${user.tenantId} but email domain resolves to ${tenant.tenantId}`,
//       );
//       return res.status(403).json({
//         message: "Account configuration error. Contact your administrator.",
//       });
//     }

//     // backfill tenantId if missing — forward-compatible for pre-migration authors
//     if (!user.tenantId) {
//       await Author.updateOne(
//         { _id: user._id },
//         { $set: { tenantId: tenant.tenantId } },
//       );
//       user.tenantId = tenant.tenantId;
//     }

//     // ── 4. Password check ────────────────────────────────────────────────────
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid Password" });
//     }

//     // ── 5. Issue token ───────────────────────────────────────────────────────
//     const payload = {
//       authorname: user.authorname,
//       authorId: user._id,
//       email: user.email,
//       role: user.role,
//       profile: user.profile,
//       tenantId: user.tenantId,
//     };

//     const token = jwt.sign(payload, process.env.JWT_TOKEN_ACCESS_KEY, {
//       expiresIn: "1d",
//     });

//     return res.status(200).json({
//       message: "Login Successful",
//       token,
//       author: payload,
//     });
//   } catch (err) {
//     console.error("verifyUser error:", err.message);
//     res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };
module.exports = { verifyUser };
