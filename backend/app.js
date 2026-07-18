
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const connectToDatabase = require("./db");
const bodyParser = require("body-parser");
const { addSseClient } = require("./services/notificationQueue");
require("dotenv").config();

const dns = require("dns");

if (process.env.NODE_ENV === "development") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Trust proxy (must be before routes)
app.set("trust proxy", 1);

//  DB connection middleware — connects per request, reuses if warm
// fix: connect once using singleton — safe for both serverless and long-running servers
// connectToDatabase() checks mongoose.connection.readyState internally
// so repeated calls on warm containers are instant no-ops
connectToDatabase().catch(err => {
  console.error("Initial DB connection failed:", err.message);
});

// Routes
const loginRouter = require("./routes/login.Route");
const authorRouter = require("./routes/authorDetail.Route");
const postRouter = require("./routes/postDetail.Route");
const tutorPlaylist = require("./routes/tutorPlayList.Route");
const appAnalysisRouter = require("./routes/appAnalysis.Route");
const adminRouter = require("./routes/admin.Route");
const directorRouter = require("./routes/director.Route");
const searchRouter = require("./routes/search.Route");

const techCommunityRouter = require("./routes/techCommunity.Route")

app.use("/blog/login", loginRouter);
app.use("/blog/author", authorRouter);
app.use("/blog/posts", postRouter);
app.use("/blog/playlist", tutorPlaylist);
app.use("/blog/analytics", appAnalysisRouter);
app.use("/blog/admin", adminRouter);
app.use("/blog/director", directorRouter);
app.use("/blog/search", searchRouter);
app.use("/blog/techCommunity",techCommunityRouter)

app.get("/blog/notifications/stream/:email", async (req, res) => {
  try {
    await addSseClient(req.params.email, res);
  } catch (err) {
    console.error("SSE connection error:", err.message);
    res.status(500).end();
  }
});

app.get("/blog/notifications/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start the server
// app.listen(3000, () => {
//   console.log(`Server running on port ${3000}`);
// });


module.exports = app;
module.exports.handler = serverless(app);

