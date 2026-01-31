require("dotenv").config();

const jwt = require("jsonwebtoken");

const authencateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(401).json({ message: "Token not available" });

  jwt.verify(token, process.env.JWT_TOKEN_ACCESS_KEY, (err, decoded) => {
    
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });

    // decoded is the token payload (claims). Attach for downstream handlers.
    req.user = decoded;
    next();
  });
};

module.exports = authencateToken;