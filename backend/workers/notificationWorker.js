const express = require("express");
const cors = require("cors");
const connectToDatabase = require("../db");
const { startNotificationWorker } = require("../services/notificationQueue");

const app = express();


// Middleware setup

const corsOptions = {
  origin: [
    "https://www.bytesbase.tech",
    "https://blog-frontend-teal-ten.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000" // Add if you test locally
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200 // ✅ For legacy browser support
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// ✅ Handle preflight requests explicitly
app.options("*", cors(corsOptions));

(async () => {
  try {
    console.log("Starting notification worker...");
    await connectToDatabase();
    await startNotificationWorker();
    console.log("Notification worker is running");
  } catch (err) {
    console.error("Notification worker failed to start:", err.message);
    process.exit(1);
  }
})();


app.get("/", (req, res) => {
    res.send("Notification worker running");
});

const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
