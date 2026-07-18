require("dotenv").config();

const jwt = require("jsonwebtoken");

const authencateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(401).json({ error: "TOKEN_EXPIRED",
      message: "Token expired", });

  jwt.verify(token, process.env.JWT_TOKEN_ACCESS_KEY, (err, decoded) => {
    
    if (err)
      return res.status(401).json({  error: "INVALID_TOKEN",
    message: "Invalid token", });

    // decoded is the token payload (claims). Attach for downstream handlers.
    // console.log("decoded",decoded)
    req.user = decoded;
    req.token = token;   // ✅ store token for later use

    next();
  });
};

module.exports = authencateToken;