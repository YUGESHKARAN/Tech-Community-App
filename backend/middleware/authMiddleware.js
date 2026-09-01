// require("dotenv").config();

// const jwt = require("jsonwebtoken");

// const authencateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (token == null)
//     return res.status(401).json({ error: "TOKEN_EXPIRED",
//       message: "Token expired", });

//   jwt.verify(token, process.env.JWT_TOKEN_ACCESS_KEY, (err, decoded) => {
    
//     if (err)
//       return res.status(401).json({  error: "INVALID_TOKEN",
//     message: "Invalid token", });

//     // decoded is the token payload (claims). Attach for downstream handlers.
//     // console.log("decoded",decoded)
//     req.user = decoded;
//     req.token = token;   // ✅ store token for later use

//     next();
//   });
// };

// module.exports = authencateToken;

require("dotenv").config();

const jwt         = require("jsonwebtoken");
const redisClient = require("./redis"); // your existing Redis client

const authencateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token      = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error:   "TOKEN_EXPIRED",
      message: "Token expired",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_TOKEN_ACCESS_KEY);
  } catch (err) {
    return res.status(401).json({
      error:   "INVALID_TOKEN",
      message: "Invalid token",
    });
  }

  // ── impersonation blacklist check ─────────────────────────────────────────
  // Only runs when decoded.impersonation === true (director impersonation tokens).
  // Normal user tokens never carry this field — zero Redis overhead on standard
  // traffic. The check verifies the token hasn't been revoked before expiry.
  if (decoded.impersonation === true) {
    if (!decoded.jti) {
      return res.status(401).json({ message: "Invalid impersonation token" });
    }

    try {
      const blacklisted = await redisClient.get(
        `impersonate:blacklist:${decoded.jti}`
      );
      if (blacklisted) {
        return res.status(401).json({
          error:   "TOKEN_REVOKED",
          message: "Impersonation token has been revoked",
        });
      }
    } catch (redisErr) {
      // Redis failure must never block legitimate requests.
      // Log and continue — the token is still cryptographically valid.
      console.error("Redis blacklist check failed:", redisErr.message);
    }

    // attach impersonation context for downstream controllers
    req.isImpersonation  = true;
    req.impersonatedBy   = decoded.impersonatedBy;
    req.impersonationJti = decoded.jti;
  }

  req.user  = decoded;
  req.token = token;
  next();
};

module.exports = authencateToken;